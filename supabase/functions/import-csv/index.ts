import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== "") {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
        if (char === "\r") i++;
      } else if (char !== "\r") {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.length > 1 || currentRow[0] !== "") {
      rows.push(currentRow);
    }
  }

  return rows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { table, csvData, action } = await req.json();

    if (!table) {
      return new Response(
        JSON.stringify({ error: "Missing table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle clear action
    if (action === "clear") {
      const validTables = ["lovable_prompts", "lovable_entities", "lovable_domains"];
      if (!validTables.includes(table)) {
        return new Response(
          JSON.stringify({ error: `Unknown table: ${table}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete in correct order due to foreign keys
      if (table === "lovable_prompts") {
        await supabase.from("lovable_domains").delete().neq("prompt_hash", "");
        await supabase.from("lovable_entities").delete().neq("prompt_hash", "");
      }
      
      // Use correct primary key column per table
      let deleteResult;
      if (table === "lovable_prompts") {
        deleteResult = await supabase.from(table).delete().neq("prompt_hash", "");
      } else {
        deleteResult = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }
      const { error } = deleteResult;
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: `Cleared ${table}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: "Missing csvData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rows = parseCSV(csvData);
    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ error: "CSV must have header and at least one data row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    let inserted = 0;
    let skippedMissingPrompt = 0;
    const errors: string[] = [];
    const batchSize = 500;

    console.log(`Processing ${dataRows.length} rows for table: ${table}`);

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const rawBatch = dataRows.slice(i, i + batchSize).map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          const val = row[idx] ?? "";
          if (h === "citation_count") {
            obj[h] = parseInt(val, 10) || 0;
          } else {
            obj[h] = val || null;
          }
        });
        return obj;
      });

      // For lovable_prompts: dedupe by prompt_hash within the batch (keep last occurrence)
      // This prevents "ON CONFLICT DO UPDATE command cannot affect row a second time" errors
      let batch = rawBatch;
      if (table === "lovable_prompts") {
        const seen = new Map<string, Record<string, unknown>>();
        for (const row of rawBatch) {
          const h = (row["prompt_hash"] as string | null) ?? "";
          if (h) {
            seen.set(h, row);
          }
        }
        batch = Array.from(seen.values());
      }

      // For tables that reference lovable_prompts(prompt_hash), skip rows whose prompt_hash doesn't exist.
      // This avoids entire-batch failure due to FK constraints.
      if (table === "lovable_entities" || table === "lovable_domains") {
        const hashes = Array.from(
          new Set(
            rawBatch
              .map((r) => (r["prompt_hash"] as string | null) ?? "")
              .filter((h) => typeof h === "string" && h.length > 0)
          )
        );

        if (hashes.length > 0) {
          const { data: existing, error: existingErr } = await supabase
            .from("lovable_prompts")
            .select("prompt_hash")
            .in("prompt_hash", hashes);

          if (existingErr) {
            console.error(`FK precheck error (batch ${i / batchSize + 1}):`, existingErr.message);
            errors.push(`FK precheck batch ${i / batchSize + 1}: ${existingErr.message}`);
            // Fall back to attempting the insert; it may still work.
          } else {
            const existingSet = new Set((existing ?? []).map((r) => r.prompt_hash));
            const filtered = rawBatch.filter((r) => {
              const h = (r["prompt_hash"] as string | null) ?? "";
              return existingSet.has(h);
            });
            skippedMissingPrompt += rawBatch.length - filtered.length;
            batch = filtered;
          }
        }

        if (batch.length === 0) {
          continue;
        }
      }

      let result;
      if (table === "lovable_prompts") {
        result = await supabase
          .from("lovable_prompts")
          .upsert(batch, { onConflict: "prompt_hash" });
      } else if (table === "lovable_entities") {
        result = await supabase.from("lovable_entities").insert(batch);
      } else if (table === "lovable_domains") {
        result = await supabase.from("lovable_domains").insert(batch);
      } else {
        return new Response(
          JSON.stringify({ error: `Unknown table: ${table}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (result.error) {
        console.error(`Batch ${i / batchSize + 1} error:`, result.error.message);
        errors.push(`Batch ${i / batchSize + 1}: ${result.error.message}`);
      } else {
        inserted += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}, total: ${inserted}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        table,
        totalRows: dataRows.length,
        inserted,
        skippedMissingPrompt: skippedMissingPrompt > 0 ? skippedMissingPrompt : undefined,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Import error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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
    const errors: string[] = [];
    const batchSize = 500;

    console.log(`Processing ${dataRows.length} rows for table: ${table}`);

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize).map((row) => {
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

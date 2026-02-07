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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ============= AUTHENTICATION CHECK =============
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user ${userId} performing import operation`);

    // Use service role client for actual database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ============= ADMIN ROLE CHECK =============
    const { data: adminRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminRole) {
      console.warn(`User ${userId} attempted import without admin role`);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin user ${userId} authorized for import operation`);

    const { table, csvData, action } = await req.json();

    if (!table) {
      return new Response(
        JSON.stringify({ error: "Missing table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= INPUT VALIDATION =============
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_ROWS = 100000;

    // Handle clear action
    if (action === "clear") {
      const validTables = ["lovable_prompts", "lovable_entities", "lovable_domains", "visibility_records"];
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

    // Validate file size
    if (csvData.length > MAX_FILE_SIZE) {
      console.warn(`CSV data too large: ${csvData.length} bytes (max ${MAX_FILE_SIZE})`);
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size is 50MB, received ${Math.round(csvData.length / 1024 / 1024)}MB` }),
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

    // Validate row count
    if (rows.length - 1 > MAX_ROWS) {
      console.warn(`CSV has too many rows: ${rows.length - 1} (max ${MAX_ROWS})`);
      return new Response(
        JSON.stringify({ error: `Too many rows. Maximum is ${MAX_ROWS.toLocaleString()}, received ${(rows.length - 1).toLocaleString()}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = rows[0];
    
    // Validate CSV headers match expected schema
    const expectedHeaders: Record<string, string[]> = {
      "lovable_prompts": ["prompt_hash", "prompt", "model", "market", "primary_market", "submarket", "property_type", "broker_role", "citation_count", "geo_level"],
      "lovable_entities": ["prompt_hash", "name", "entity_type", "brokerage", "market"],
      "lovable_domains": ["prompt_hash", "domain"],
      "visibility_records": ["entity_key", "entity_type", "name", "market", "property_type", "broker_role", "prompt"],
    };
    
    const validTables = Object.keys(expectedHeaders);
    if (!validTables.includes(table)) {
      return new Response(
        JSON.stringify({ error: `Unknown table: ${table}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const requiredHeaders = expectedHeaders[table];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      console.warn(`CSV missing required headers for ${table}: ${missingHeaders.join(", ")}`);
      // Just log warning, don't fail - allow partial schemas
    }
    const dataRows = rows.slice(1);
    let inserted = 0;
    let skippedMissingPrompt = 0;
    const errors: string[] = [];
    const batchSize = 500;

    console.log(`Processing ${dataRows.length} rows for table: ${table}`);

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const rawBatch = dataRows.slice(i, i + batchSize).map((row, rowIndex) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          const val = row[idx] ?? "";
          if (h === "citation_count") {
            obj[h] = parseInt(val, 10) || 0;
          } else {
            obj[h] = val || null;
          }
        });
        
        // Auto-generate entity_key for visibility_records if missing
        if (table === "visibility_records" && !obj["entity_key"]) {
          const name = (obj["name"] as string) || "";
          const market = (obj["market"] as string) || "";
          const entityType = (obj["entity_type"] as string) || "";
          // Create a unique key from name + market + entity_type + row index
          obj["entity_key"] = `${name.toLowerCase().replace(/\s+/g, "_")}_${market.toLowerCase().replace(/\s+/g, "_")}_${entityType}_${i + rowIndex}`;
        }
        
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
      // We check in smaller sub-batches to avoid URL length limits on the .in() query.
      if (table === "lovable_entities" || table === "lovable_domains") {
        const hashes = Array.from(
          new Set(
            rawBatch
              .map((r) => (r["prompt_hash"] as string | null) ?? "")
              .filter((h) => typeof h === "string" && h.length > 0)
          )
        );

        if (hashes.length > 0) {
          const existingSet = new Set<string>();
          const hashCheckBatchSize = 50; // smaller batches to avoid URL length limits

          for (let j = 0; j < hashes.length; j += hashCheckBatchSize) {
            const hashChunk = hashes.slice(j, j + hashCheckBatchSize);
            const { data: existing, error: existingErr } = await supabase
              .from("lovable_prompts")
              .select("prompt_hash")
              .in("prompt_hash", hashChunk);

            if (existingErr) {
              console.error(`FK precheck error (batch ${i / batchSize + 1}, chunk ${j / hashCheckBatchSize + 1}):`, existingErr.message);
              errors.push(`FK precheck batch ${i / batchSize + 1}: ${existingErr.message}`);
            } else {
              (existing ?? []).forEach((r) => existingSet.add(r.prompt_hash));
            }
          }

          const filtered = rawBatch.filter((r) => {
            const h = (r["prompt_hash"] as string | null) ?? "";
            return existingSet.has(h);
          });
          skippedMissingPrompt += rawBatch.length - filtered.length;
          batch = filtered;
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
      } else if (table === "visibility_records") {
        result = await supabase.from("visibility_records").insert(batch);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEDGER_KEYS = [
  { key: "brokerage_name", label: "Brokerage Name" },
  { key: "headquarters", label: "Headquarters" },
  { key: "markets_served", label: "Markets Served" },
  { key: "property_types", label: "Property Types" },
  { key: "services", label: "Services Offered" },
  { key: "notable_deals", label: "Notable Deals / Transactions" },
  { key: "team_size", label: "Team Size" },
  { key: "specializations", label: "Specializations" },
  { key: "year_founded", label: "Year Founded" },
  { key: "website_description", label: "Website Description / Tagline" },
  { key: "certifications", label: "Certifications / Affiliations" },
  { key: "target_clients", label: "Target Clients" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a commercial real estate brokerage analyst. Given a brokerage website URL, extract key facts about the firm.

URL: ${url}

Extract these fields from your knowledge of this brokerage (use "Not found" if unknown):
${LEDGER_KEYS.map(k => `- ${k.label} (key: ${k.key})`).join("\n")}

Return a JSON object with this exact structure:
{
  "brokerage_name": "Name of the brokerage",
  "website_url": "${url}",
  "results": [
    { "key": "brokerage_name", "label": "Brokerage Name", "answer": "..." },
    ...one entry per field above...
  ]
}

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant that returns only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gemini-lookup error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

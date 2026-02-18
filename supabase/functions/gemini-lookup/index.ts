import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LEDGER_KEYS = [
  { key: "brokerage_name", label: "Brokerage Name" },
  { key: "aliases", label: "Aliases / DBAs" },
  { key: "legal_suffix", label: "Legal Suffix" },
  { key: "markets_served", label: "Markets Served" },
  { key: "property_types", label: "Property Types" },
  { key: "services", label: "Services Offered" },
  { key: "social_instagram", label: "Instagram" },
  { key: "social_facebook", label: "Facebook" },
  { key: "social_youtube", label: "YouTube" },
  { key: "social_linkedin", label: "LinkedIn" },
  { key: "social_gbp", label: "Google Business Profile" },
  { key: "headquarters", label: "Headquarters" },
  { key: "year_founded", label: "Year Founded" },
  { key: "team_size", label: "Team Size" },
  { key: "website_description", label: "Website Description / Tagline" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a commercial real estate research analyst with access to web search. Given a brokerage website URL, search the web to find real, current, accurate information about this company.

URL: ${url}

Use the URL as a starting point to identify the canonical entity (the real legal/brand name of the brokerage). Then search the web thoroughly to gather the following information. For social media profiles, find the actual profile URLs (not just "yes they have one").

Extract these fields (use "Not found" if you cannot verify the information):
${LEDGER_KEYS.map(k => `- ${k.label} (key: ${k.key})`).join("\n")}

Field-specific guidance:
- brokerage_name: The canonical/official brand name of the brokerage
- aliases: Other names they operate under, DBAs, former names (comma-separated)
- legal_suffix: The legal entity suffix (Inc., LLC, LP, Ltd., etc.)
- markets_served: Geographic markets/cities/regions they operate in (comma-separated)
- property_types: CRE property types they handle (Office, Industrial, Retail, Multifamily, etc.)
- services: Services offered (Leasing, Sales, Property Management, Investment Sales, etc.)
- social_instagram: Full Instagram profile URL (e.g. https://instagram.com/companyname)
- social_facebook: Full Facebook page URL
- social_youtube: Full YouTube channel URL
- social_linkedin: Full LinkedIn company page URL
- social_gbp: Google Business Profile URL if available
- headquarters: City, State of HQ
- year_founded: Year the company was founded
- team_size: Approximate number of employees/agents
- website_description: Their tagline or meta description from their website

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
          { role: "system", content: "You are a helpful research assistant with web search capabilities. Search the web to find real, verified information. Return only valid JSON." },
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

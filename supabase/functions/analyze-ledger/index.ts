import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { brokerage_name, website_url, results } = await req.json();
    if (!brokerage_name || !results) throw new Error("brokerage_name and results are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const ledgerSummary = results.map((r: any) => `${r.label}: ${r.answer}`).join("\n");

    const prompt = `You are an AI visibility analyst for commercial real estate brokerages. Analyze this brokerage's digital presence and produce a comprehensive SALT framework analysis.

Brokerage: ${brokerage_name}
Website: ${website_url}

Extracted Data:
${ledgerSummary}

Produce a JSON analysis with this EXACT structure (return ONLY valid JSON):
{
  "overall_score": <number 0-100>,
  "salt_scores": [
    {
      "pillar": "Semantic",
      "score": <number 0-100>,
      "summary": "<one sentence>",
      "details": ["<detail 1>", "<detail 2>", "<detail 3>"]
    },
    { "pillar": "Authority", "score": <number>, "summary": "...", "details": ["..."] },
    { "pillar": "Location", "score": <number>, "summary": "...", "details": ["..."] },
    { "pillar": "Trust", "score": <number>, "summary": "...", "details": ["..."] }
  ],
  "recommended_actions": [
    {
      "id": "action_1",
      "title": "<action title>",
      "pillar": "Semantic|Authority|Location|Trust",
      "priority": "high|medium|low",
      "affected_urls": ["<url>"],
      "issue": "<what's wrong>",
      "why_it_matters": "<impact explanation>",
      "what_to_do": ["<step 1>", "<step 2>"],
      "how_to_know_done": ["<verification 1>"]
    }
  ],
  "intent_coverage": [
    {
      "intent_id": "intent_1",
      "intent_name": "<search intent name>",
      "status": "Eligible|Needs Work|Not Yet Eligible",
      "prompts": ["<example user query>"],
      "solution_fixes": [{ "fix_name": "<fix>", "description": "<how>" }]
    }
  ],
  "hyperspecific_instructions": [
    {
      "id": "inst_1",
      "title": "<instruction title>",
      "deliverable": "<what to create>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "salt_points": <number>,
      "target_intent": "<search intent>",
      "target_url": "<target page URL>",
      "suggested_title": "<page title>",
      "action_items": ["<step>"],
      "avoid": ["<pitfall>"],
      "good_example": "<optional example>",
      "effect": "<expected outcome>",
      "dependency": "<optional dependency>"
    }
  ],
  "prompt_coverage": {
    "supported": ["<prompt where brokerage would appear>"],
    "missing": ["<prompt with gaps>"],
    "blocked": ["<prompt not yet eligible>"]
  },
  "market_opportunity": {
    "submarket": "<target submarket>",
    "suggested_title": "<page title>",
    "headings_description": "<content structure>",
    "required_content": ["<content item>"],
    "avoid": ["<thing to avoid>"]
  },
  "summary": {
    "blocking_issues": ["<critical issue>"],
    "key_unlocks": ["<quick win>"]
  },
  "analysis_summary": {
    "visibility_snapshot": ["<current state observation>"],
    "fix_categories": ["<category of fixes needed>"],
    "conclusion": "<one paragraph conclusion>"
  }
}

Provide at least 3 recommended_actions, 3 intent_coverage items, 3 hyperspecific_instructions, and meaningful content for all sections. Be specific to ${brokerage_name} and CRE industry. Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert AI visibility analyst. Return only valid JSON." },
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

    if (typeof parsed.overall_score !== "number") {
      throw new Error("Invalid analysis response - missing overall_score");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-ledger error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

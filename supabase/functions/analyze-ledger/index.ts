import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function clamp(x: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, x)); }

function buildFactBlock(signals: Record<string, unknown>): string {
  return [
    "=== MEASURED SITE SIGNALS (ground truth — do not contradict these) ===",
    `URL: ${signals.final_url ?? signals.url}`,
    `HTTP Status: ${signals.status_code}`,
    `Page Title: "${signals.title}"`,
    `Meta Description: "${signals.meta_description || "(none)"}"`,
    `Language: ${signals.lang || "(not set)"}`,
    "",
    "── Content Depth ──",
    `Word Count (main content): ${signals.word_count_mc}`,
    `Heading Count (h1/h2/h3): ${signals.heading_count}`,
    `Filler Language Hits: ${signals.filler_hits}`,
    `Repetition Score: ${signals.repeated_text_score} (0=unique, 1=fully repeated)`,
    "",
    "── Trust & E-E-A-T ──",
    `Has Author Signal: ${signals.has_author}`,
    `Has Date/Update Signal: ${signals.has_date}`,
    `Has Schema.org / Structured Data: ${signals.has_schema_org}`,
    `Has About/Company Link: ${signals.has_about_link}`,
    `Has Contact Link: ${signals.has_contact_link}`,
    `Has Policy Links (privacy/terms): ${signals.has_policy_links}`,
    "",
    "── Ads & UX ──",
    `Ad/Monetization Hint Count: ${signals.ad_hint_count}`,
    `Interstitial/Overlay Hints: ${signals.interstitial_hint}`,
    "",
    "── Link Structure ──",
    `Total Links: ${signals.total_link_count}  |  Outbound: ${signals.outbound_link_count}`,
    `Link-to-Text Ratio: ${signals.link_to_text_ratio} (>0.12 = thin/spammy)`,
    "",
    "── Risk Flags ──",
    `YMYL Risk: ${signals.ymyl_risk}  |  Categories: ${(signals.ymyl_categories as string[])?.join(", ") || "none"}`,
    `Spam Patterns: ${(signals.spam_patterns_found as string[])?.length === 0 ? "none" : (signals.spam_patterns_found as string[])?.join(", ")}`,
    "",
    "── Page Quality Score (deterministic, no AI) ──",
    `PQ Score: ${signals.pq_score} / 100  |  Bucket: ${signals.pq_bucket}`,
    "",
    "── Measured Red Flags ──",
    ...((signals.red_flags as string[]) || []).map((f: string) => `  ✗ ${f}`),
    "",
    "── Measured Positives ──",
    ...((signals.positives as string[]) || []).map((p: string) => `  ✓ ${p}`),
    "",
    "── Content Excerpt (first 2000 chars) ──",
    String(signals.mc_excerpt || "(none)"),
    "",
    "=== END MEASURED SIGNALS ===",
  ].join("\n");
}

function computeSaltAnchor(signals: Record<string, unknown>) {
  const wc = Number(signals.word_count_mc) || 0;
  const hasAuthor = Boolean(signals.has_author);
  const hasDate = Boolean(signals.has_date);
  const hasSchema = Boolean(signals.has_schema_org);
  const hasAbout = Boolean(signals.has_about_link);
  const hasContact = Boolean(signals.has_contact_link);
  const hasPolicy = Boolean(signals.has_policy_links);
  const repScore = Number(signals.repeated_text_score) || 0;
  const headings = Number(signals.heading_count) || 0;

  let semantic = 50;
  if (wc >= 1200) semantic += 20; else if (wc >= 500) semantic += 10; else if (wc < 200) semantic -= 20;
  if (headings >= 4) semantic += 10;
  if (repScore > 0.35) semantic -= 15;
  semantic = clamp(semantic, 0, 100);

  let authority = 30;
  if (hasAuthor) authority += 25;
  if (hasDate) authority += 20;
  if (hasSchema) authority += 15;
  if (wc >= 800) authority += 10;
  authority = clamp(authority, 0, 100);

  const location = 50; // AI adjusts from content excerpt

  let trust = 20;
  if (hasContact) trust += 25;
  if (hasAbout) trust += 20;
  if (hasPolicy) trust += 15;
  if (hasSchema) trust += 10;
  if (hasAuthor) trust += 10;
  trust = clamp(trust, 0, 100);

  return { overall: Math.round((semantic + authority + location + trust) / 4), semantic, authority, location, trust };
}

function buildAnalysisPrompt(
  brokerageName: string,
  websiteUrl: string,
  ledgerResults: Array<{ label: string; answer: string }>,
  signals: Record<string, unknown>,
  saltAnchor: ReturnType<typeof computeSaltAnchor>
): string {
  return `You are an AI visibility analyst specializing in commercial real estate (CRE) brokerages.

Your task: analyze how likely an AI assistant (ChatGPT, Perplexity, Gemini, Claude) is to recommend "${brokerageName}" when a prospect asks for a CRE broker.

─────────────────────────────────────────────────────
RULES — FOLLOW EXACTLY
─────────────────────────────────────────────────────

1. GROUNDING: Every finding must cite a specific measured signal. If unsupported, use "insufficient_data" as confidence.
   ✓ GOOD: "word_count_mc is 180 — below the 500 threshold for extractable expertise signals."
   ✗ BAD: "Your content lacks depth and specificity."

2. ANCHORS: Start from these scores (adjust ±15 max, explain any deviation in details[]):
   Overall=${saltAnchor.overall} | Semantic=${saltAnchor.semantic} | Authority=${saltAnchor.authority} | Location=${saltAnchor.location} | Trust=${saltAnchor.trust}

3. NO GENERIC ADVICE: Every recommendation must be specific to ${brokerageName}. If it could apply to any brokerage, rewrite it.

4. SCOPE: Only analyze what the signals + excerpt show. Do not speculate about social media or deal history unless the excerpt contains direct evidence.

─────────────────────────────────────────────────────
BROKERAGE: ${brokerageName}  |  SITE: ${websiteUrl}
─────────────────────────────────────────────────────

${buildFactBlock(signals)}

LEDGER (user-supplied context):
${ledgerResults.map((r: { label: string; answer: string }) => `${r.label}: ${r.answer}`).join("\n")}

─────────────────────────────────────────────────────
OUTPUT: valid JSON only — no markdown, no preamble
─────────────────────────────────────────────────────

{
  "overall_score": <anchor ± justified>,
  "salt_scores": [
    { "pillar": "Semantic", "score": <n>, "confidence": "high|medium|low|insufficient_data", "summary": "<cite a signal>", "details": ["<signal: value — impact>"] },
    { "pillar": "Authority", "score": <n>, "confidence": "...", "summary": "...", "details": ["..."] },
    { "pillar": "Location",  "score": <n>, "confidence": "...", "summary": "...", "details": ["..."] },
    { "pillar": "Trust",     "score": <n>, "confidence": "...", "summary": "...", "details": ["..."] }
  ],
  "recommended_actions": [
    {
      "title": "<specific to ${brokerageName}>",
      "pillar": "Semantic|Authority|Location|Trust",
      "priority": "high|medium|low",
      "evidence_quote": "<exact signal, e.g. 'has_author: false, word_count_mc: 180'>",
      "affected_urls": ["<url if known>"],
      "issue": "<what the signal reveals>",
      "why_it_matters": "<CRE-specific impact on AI visibility>",
      "what_to_do": ["<step 1>", "<step 2>"],
      "how_to_know_done": ["<measurable check>"]
    }
  ],
  "intent_coverage": [
    {
      "intent_name": "<specific CRE query>",
      "status": "Eligible|Needs Work|Not Yet Eligible",
      "why": "<grounded in signals>",
      "prompts": ["<example query>"],
      "solution_fixes": [{ "fix_name": "<fix>", "description": "<how>" }]
    }
  ],
  "hyperspecific_instructions": [
    {
      "title": "<specific to ${brokerageName}>",
      "deliverable": "<what to create>",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "salt_points": <estimated score delta>,
      "target_intent": "<search intent>",
      "target_url": "<url>",
      "suggested_title": "<page title>",
      "action_items": ["<step>"],
      "avoid": ["<pitfall>"],
      "effect": "<outcome — name the signal this fixes>"
    }
  ],
  "prompt_coverage": {
    "supported": ["<prompt backed by signals>"],
    "missing": ["<prompt blocked by measured gaps>"],
    "blocked": ["<prompt with hard blockers>"]
  },
  "analysis_summary": {
    "visibility_snapshot": "<2-3 sentences citing at least 2 signal values>",
    "top_blockers": ["<cite signal>"],
    "quick_wins": ["<name the signal this fixes>"],
    "conclusion": "<one paragraph, specific to ${brokerageName}, zero generic statements>"
  }
}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { brokerage_name, website_url, results, site_signals } = body;
    if (!brokerage_name || !results) throw new Error("brokerage_name and results are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const signals: Record<string, unknown> = site_signals || {
      url: website_url, final_url: website_url, status_code: "unknown",
      title: "unknown", meta_description: "", lang: "",
      word_count_mc: "unknown", heading_count: "unknown",
      link_to_text_ratio: "unknown", repeated_text_score: "unknown", filler_hits: "unknown",
      spam_patterns_found: [], has_schema_org: "unknown", has_author: "unknown",
      has_date: "unknown", has_about_link: "unknown", has_contact_link: "unknown",
      has_policy_links: "unknown", ad_hint_count: "unknown", interstitial_hint: "unknown",
      ymyl_risk: "unknown", ymyl_categories: [], pq_score: "unknown", pq_bucket: "unknown",
      outbound_link_count: "unknown", total_link_count: "unknown",
      red_flags: ["site_signals not provided — grounding is reduced"], positives: [], mc_excerpt: "",
    };

    const saltAnchor = site_signals
      ? computeSaltAnchor(signals)
      : { overall: 50, semantic: 50, authority: 50, location: 50, trust: 50 };

    const prompt = buildAnalysisPrompt(brokerage_name, website_url, results, signals, saltAnchor);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert AI visibility analyst. Return only valid JSON. Never contradict measured signals. Cite signal values in every finding." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(content);
    if (typeof parsed.overall_score !== "number") throw new Error("Invalid analysis — missing overall_score");

    parsed._measured_signals = {
      pq_score: signals.pq_score, pq_bucket: signals.pq_bucket,
      word_count_mc: signals.word_count_mc, has_author: signals.has_author,
      has_schema_org: signals.has_schema_org, salt_anchor: saltAnchor,
    };

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("analyze-ledger error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

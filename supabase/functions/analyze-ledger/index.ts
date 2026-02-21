import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
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
  if (wc >= 1200) semantic += 20;
  else if (wc >= 500) semantic += 10;
  else if (wc < 200) semantic -= 20;
  if (headings >= 4) semantic += 10;
  if (repScore > 0.35) semantic -= 15;
  semantic = clamp(semantic, 0, 100);

  let authority = 30;
  if (hasAuthor) authority += 25;
  if (hasDate) authority += 20;
  if (hasSchema) authority += 15;
  if (wc >= 800) authority += 10;
  authority = clamp(authority, 0, 100);

  const location = 50;

  let trust = 20;
  if (hasContact) trust += 25;
  if (hasAbout) trust += 20;
  if (hasPolicy) trust += 15;
  if (hasSchema) trust += 10;
  if (hasAuthor) trust += 10;
  trust = clamp(trust, 0, 100);

  return {
    overall: Math.round((semantic + authority + location + trust) / 4),
    semantic, authority, location, trust,
  };
}

function buildFactBlock(signals: Record<string, unknown>): string {
  const wc = Number(signals.word_count_mc) || 0;
  const headings = Number(signals.heading_count) || 0;
  const rep = Number(signals.repeated_text_score) || 0;

  const wcInterpretation =
    wc < 200 ? "CRITICAL: Almost no content — AI cannot determine what this firm does" :
    wc < 500 ? "WARNING: Very little content — AI struggles to identify specialty or market" :
    wc < 800 ? "MODERATE: Some content but likely missing specifics" :
    "GOOD: Enough content for AI to extract signals";

  const headingInterpretation =
    headings < 2 ? "No visible structure — AI cannot scan for key topics" :
    headings < 4 ? "Minimal structure" : "Good structure";

  return [
    "=== MEASURED WEBSITE SIGNALS ===",
    "(Use these as your only factual source. Cite them in broker-friendly language — never use the field names.)",
    "",
    `Content Volume: ${wc} words — ${wcInterpretation}`,
    `Page Structure: ${headings} headings — ${headingInterpretation}`,
    `Content Repetition: ${rep} (${rep > 0.35 ? "HIGH — looks templated" : "Normal"})`,
    "",
    `Has Named Author/Broker: ${signals.has_author} ${!signals.has_author ? "— AI cannot attribute expertise to a person" : ""}`,
    `Has Dates/Recent Activity: ${signals.has_date} ${!signals.has_date ? "— AI cannot tell if this firm is active" : ""}`,
    `Has Structured Data Tags: ${signals.has_schema_org} ${!signals.has_schema_org ? "— makes it harder for AI to extract firm details" : ""}`,
    `Has About/Team Page Link: ${signals.has_about_link} ${!signals.has_about_link ? "— AI cannot verify who runs this firm" : ""}`,
    `Has Contact Information: ${signals.has_contact_link} ${!signals.has_contact_link ? "— reduces trust signals for AI" : ""}`,
    `Has Legal/Policy Pages: ${signals.has_policy_links}`,
    "",
    `Ad/Distraction Count: ${signals.ad_hint_count} ${Number(signals.ad_hint_count) >= 4 ? "— high, may signal lower-quality site to AI" : ""}`,
    `Spam Signals Found: ${(signals.spam_patterns_found as string[]).length === 0 ? "none" : (signals.spam_patterns_found as string[]).join(", ")}`,
    "",
    `Overall Quality Score: ${signals.pq_score}/100 (${signals.pq_bucket})`,
    "",
    "Specific Problems Found (use these to ground your recommendations):",
    ...(signals.red_flags as string[]).map((f: string) => `  • ${f}`),
    "",
    "Things Working Well:",
    ...(signals.positives as string[]).map((p: string) => `  ✓ ${p}`),
    "",
    "=== WEBSITE CONTENT SAMPLE (first 2000 chars) ===",
    String(signals.mc_excerpt || "(no content extracted)"),
    "=== END SIGNALS ===",
  ].join("\n");
}

function buildPrompt(
  brokerageName: string,
  websiteUrl: string,
  ledgerResults: Array<{ label: string; answer: string }>,
  signals: Record<string, unknown>,
  saltAnchor: ReturnType<typeof computeSaltAnchor>
): string {
  const ledgerSummary = ledgerResults.map((r) => `${r.label}: ${r.answer}`).join("\n");
  const factBlock = buildFactBlock(signals);

  return `You are a commercial real estate business advisor analyzing how well a CRE brokerage shows up when prospects use AI tools (ChatGPT, Perplexity, Gemini, Claude) to find brokers.

YOUR AUDIENCE: The broker or brokerage owner reading this report. They are experienced real estate professionals — they understand markets, deals, clients, and competition. They do NOT understand web technology, SEO, or AI systems. Write everything as if explaining it to a senior broker colleague over lunch.

ABSOLUTE RULES:
1. NEVER use these terms: schema.org, E-E-A-T, YMYL, link ratio, PQ score, metadata, structured data, canonical, JSON-LD, crawl, index, anchor text, backlinks. Translate everything into business outcomes.
2. EVERY finding must answer: "What specific business am I losing because of this?"
3. EVERY fix must include: what to do, who does it, how long it takes, and what changes as a result.
4. Ground all findings in the measured signals. If the content sample shows the brokerage operates in specific markets, use those markets. Do not invent details.
5. Be direct and specific. Vague encouragement ("consider improving your online presence") is useless. Name the exact query type they are losing, and name the exact fix.

PRE-COMPUTED SALT SCORES (your starting anchors — adjust ±15 max with explanation):
  Specialty Clarity (Semantic): ${saltAnchor.semantic}
  Proof of Expertise (Authority): ${saltAnchor.authority}
  Market Specificity (Location): ${saltAnchor.location}
  Credibility Signals (Trust): ${saltAnchor.trust}
  Overall: ${saltAnchor.overall}

─────────────────────────────────────────────────────
BROKERAGE: ${brokerageName}
WEBSITE: ${websiteUrl}
─────────────────────────────────────────────────────

${factBlock}

ADDITIONAL INFO (from brokerage profile):
${ledgerSummary}

─────────────────────────────────────────────────────
OUTPUT: Return ONLY valid JSON. No markdown. No preamble.
─────────────────────────────────────────────────────

{
  "plain_english_summary": "<3 sentences max. Written like a trusted colleague explaining the situation. What is the core problem, what is it costing them in business terms, and what is the single most important thing to fix. Zero technical language.>",

  "visibility_grade": "<A | B | C | D | F>",
  "visibility_grade_reason": "<One sentence explaining the grade in deal terms. Example: 'AI can find you for generic searches but not for the specific property types and markets where you do your best work.'>",

  "what_ai_thinks_you_do": "<What an AI assistant currently concludes about this firm based on their website. Be honest — if the site is vague, say so. Example: 'General commercial real estate services in an unspecified market.'>",

  "what_you_actually_do": "<Inferred from the content sample and ledger data — their actual specialty and markets>",

  "the_gap": "<One sentence explaining the mismatch between what AI thinks and what they actually do, and why that costs them leads>",

  "deals_you_are_losing": [
    {
      "scenario": "<Specific query a real prospect would type, e.g. 'industrial tenant rep Dallas Fort Worth'>",
      "why_you_lose": "<Specific reason tied to a measured signal, in plain English>",
      "who_wins_instead": "<Description of the type of firm that wins this query — do not name specific competitors>"
    }
  ],

  "salt_scores": [
    {
      "pillar": "Specialty Clarity",
      "internal_pillar": "Semantic",
      "score": <number from anchor ± 15>,
      "headline": "<One line: what this score means for their business, not their website>",
      "what_it_means": "<2-3 sentences in plain broker language. What does AI currently understand (or not understand) about what they specialize in?>",
      "evidence": "<Quote or cite something specific from the content sample or signals>"
    },
    {
      "pillar": "Proof of Expertise",
      "internal_pillar": "Authority",
      "score": <number>,
      "headline": "<One line in broker language>",
      "what_it_means": "<plain language explanation>",
      "evidence": "<specific from signals>"
    },
    {
      "pillar": "Market Specificity",
      "internal_pillar": "Location",
      "score": <number>,
      "headline": "<One line in broker language>",
      "what_it_means": "<plain language explanation>",
      "evidence": "<specific from signals or content sample>"
    },
    {
      "pillar": "Credibility Signals",
      "internal_pillar": "Trust",
      "score": <number>,
      "headline": "<One line in broker language>",
      "what_it_means": "<plain language explanation>",
      "evidence": "<specific from signals>"
    }
  ],

  "top_fixes": [
    {
      "fix_title": "<Short, action-oriented title>",
      "the_problem": "<What is wrong, in one sentence, cited from the signals>",
      "the_fix": "<Exactly what to do — specific enough that they could hand this to an assistant>",
      "example": "<If helpful, show a before/after or give a concrete example of what good looks like>",
      "who_does_this": "You personally | Your admin/assistant | Needs a web developer",
      "time_to_complete": "<30 minutes | Half a day | 1-2 days | 1 week>",
      "cost_estimate": "Free | Under $500 | $500–2000 | Custom",
      "what_changes": "<What specifically improves for AI visibility when this is done>",
      "priority": "Do this week | Do this month | Nice to have"
    }
  ],

  "quick_wins": [
    "<Specific action they can do TODAY in under an hour, written as a clear instruction>"
  ],

  "what_is_working": [
    "<Specific thing that is already helping their AI visibility, in plain language>"
  ],

  "competitor_context": {
    "what_winning_firms_do_differently": [
      "<Specific practice that firms who rank well in AI results typically have — grounded in what this firm is missing>"
    ],
    "your_advantage": "<One thing specific to this brokerage that, if communicated clearly, would help them stand out to AI systems>"
  },

  "ai_recommends_you_for": [
    "<Type of query or client situation where AI would currently include this firm>"
  ],

  "ai_does_not_recommend_you_for": [
    "<Type of query or client situation where AI currently overlooks this firm, and why in one short phrase>"
  ],

  "30_day_action_plan": [
    {
      "week": 1,
      "actions": ["<Specific action>"],
      "expected_result": "<What changes after this week>"
    },
    {
      "week": 2,
      "actions": ["<Specific action>"],
      "expected_result": "<What changes after this week>"
    },
    {
      "week": 3,
      "actions": ["<Specific action>"],
      "expected_result": "<What changes after this week>"
    },
    {
      "week": 4,
      "actions": ["<Specific action>"],
      "expected_result": "<What changes after this week>"
    }
  ],

  "platform_scores": [
    {
      "platform": "ChatGPT",
      "score": <0-100 estimated visibility score>,
      "reason": "<One sentence explaining the score. ChatGPT weighs content depth, authority signals, and named expertise heavily.>"
    },
    {
      "platform": "Gemini",
      "score": <0-100 estimated visibility score>,
      "reason": "<One sentence. Gemini weighs web presence breadth, structured data, and content freshness.>"
    },
    {
      "platform": "Google AI Overviews",
      "score": <0-100 estimated visibility score>,
      "reason": "<One sentence. Google AI Overviews weighs traditional quality signals, credibility markers, and market specificity.>"
    }
  ]
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
      word_count_mc: 0, heading_count: 0,
      link_to_text_ratio: 0, repeated_text_score: 0, filler_hits: 0,
      spam_patterns_found: [], has_schema_org: false, has_author: false,
      has_date: false, has_about_link: false, has_contact_link: false,
      has_policy_links: false, ad_hint_count: 0, interstitial_hint: false,
      ymyl_risk: "unknown", ymyl_categories: [], pq_score: 0, pq_bucket: "unknown",
      outbound_link_count: 0, total_link_count: 0,
      red_flags: ["Website signals could not be measured — analysis grounding is reduced."],
      positives: [], mc_excerpt: "",
    };

    const saltAnchor = site_signals
      ? computeSaltAnchor(signals)
      : { overall: 50, semantic: 50, authority: 50, location: 50, trust: 50 };

    const prompt = buildPrompt(brokerage_name, website_url, results, signals, saltAnchor);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a commercial real estate business advisor. Write for experienced brokers, not developers. Return only valid JSON. Never use technical jargon. Every finding must connect to a business outcome — a deal won or lost.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(content);

    if (!parsed.plain_english_summary) throw new Error("Invalid analysis response");

    parsed._measured_signals = {
      pq_score: signals.pq_score,
      pq_bucket: signals.pq_bucket,
      word_count_mc: signals.word_count_mc,
      has_author: signals.has_author,
      has_schema_org: signals.has_schema_org,
      has_contact_link: signals.has_contact_link,
      has_about_link: signals.has_about_link,
      salt_anchor: saltAnchor,
    };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("analyze-ledger error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

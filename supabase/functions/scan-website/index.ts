import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const YMYL_KEYWORDS: Record<string, string[]> = {
  health_safety: ["symptoms","diagnosis","treatment","medication","prescription","emergency","mental health","suicide","addiction","therapy"],
  finance: ["invest","portfolio","stock","crypto","loan","mortgage","credit","insurance","tax","retirement","financial advice"],
  legal_civics: ["lawyer","attorney","legal advice","lawsuit","contract","immigration","vote","election","government benefits"],
};

const SPAM_PATTERNS = [
  /as an ai language model/i, /knowledge cutoff/i, /lorem ipsum/i,
  /casino.*bonus/i, /viagra|cialis/i,
];
const AD_HINTS = ["sponsored","advertisement","adserv","doubleclick","googlesyndication","affiliate","utm_","taboola","outbrain"];
const FILLER_HINTS = ["in conclusion","overall,","to sum up","as mentioned above","we hope this helps","this article will discuss"];
const ABOUT_HINTS = ["about","about-us","company","team","leadership"];
const CONTACT_HINTS = ["contact","contact-us","support","help","customer service"];
const POLICY_HINTS = ["privacy","terms","refund","returns","shipping","policies"];

function tokenize(text: string): string[] {
  return (text.match(/[A-Za-z0-9']+/g) || []).map((t: string) => t.toLowerCase());
}
function normalizeWhitespace(s: string): string { return s.replace(/\s+/g, " ").trim(); }

function repetitionScore(text: string): number {
  const tokens = tokenize(text);
  if (tokens.length < 200) return 0.0;
  const n = 5;
  const freq: Record<string, number> = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(" ");
    freq[gram] = (freq[gram] || 0) + 1;
  }
  const repeated = Object.values(freq).filter((c: number) => c >= 3).reduce((a: number, b: number) => a + b, 0);
  return Math.min(1.0, repeated / Math.max(1, tokens.length - n));
}

function ymylAssessment(text: string): { risk: string; categories: string[] } {
  const t = text.toLowerCase();
  const cats: string[] = [];
  let hits = 0;
  for (const [cat, kws] of Object.entries(YMYL_KEYWORDS)) {
    const catHits = kws.filter((k: string) => t.includes(k)).length;
    if (catHits > 0) { cats.push(cat); hits += catHits; }
  }
  if (hits >= 6) return { risk: "high", categories: cats };
  if (hits >= 2) return { risk: "medium", categories: cats };
  return { risk: "low", categories: cats };
}

function guessPurpose(title: string, text: string, url: string): string {
  const t = (title + " " + text.slice(0, 1200)).toLowerCase();
  if (/buy|pricing|add to cart|checkout|shop|order now/.test(t)) return "commerce / selling a product or service";
  if (/contact|book|schedule|call us|get a quote|request a demo/.test(t)) return "lead-gen / service inquiry";
  if (/news|breaking|report|press release/.test(t)) return "news / announcement";
  if (/how to|guide|tutorial|what is|explained/.test(t)) return "informational / educational";
  if (url.toLowerCase().includes("blog")) return "blog / informational";
  return "mixed / unclear";
}

async function extractSignals(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36" },
    redirect: "follow",
  });
  const html = await response.text();
  const finalUrl = response.url;
  const statusCode = response.status;

  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) throw new Error("Failed to parse HTML");

  const title = normalizeWhitespace(doc.querySelector("title")?.textContent || "");
  const metaDescTag = doc.querySelector('meta[name="description"]');
  const metaDescription = normalizeWhitespace(metaDescTag?.getAttribute("content") || "");
  const canonicalTag = doc.querySelector('link[rel="canonical"]');
  const canonical = canonicalTag?.getAttribute("href")?.trim() || "";
  const lang = doc.querySelector("html")?.getAttribute("lang")?.trim() || "";

  ["script","style","noscript","nav","footer","aside"].forEach((tag: string) => {
    doc.querySelectorAll(tag).forEach((el: any) => el.remove?.());
  });

  const mainEl = doc.querySelector("main") || doc.querySelector("article") || doc.querySelector("body");
  const mcText = normalizeWhitespace(mainEl?.textContent || "");
  const wordCountMc = tokenize(mcText).length;
  const headingCount = ["h1","h2","h3"].reduce((sum: number, h: string) => sum + doc.querySelectorAll(h).length, 0);

  const allLinks = Array.from(doc.querySelectorAll("a[href]"));
  const totalLinkCount = allLinks.length;
  let outboundLinkCount = 0;
  try {
    const baseHost = new URL(finalUrl).hostname.toLowerCase();
    for (const a of allLinks) {
      const href = a.getAttribute("href") || "";
      try {
        const abs = new URL(href, finalUrl);
        if (abs.hostname && abs.hostname !== baseHost) outboundLinkCount++;
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  const linkToTextRatio = totalLinkCount / Math.max(1, wordCountMc);

  const hasSchemaOrg = html.toLowerCase().includes("schema.org") || (html.includes('"@type"') && html.includes('"@context"'));
  let hasAuthor = !!(doc.querySelector('[rel="author"]') || doc.querySelector('meta[name="author"]'));
  if (!hasAuthor && /\bby\s+[A-Z][a-z]+(\s+[A-Z][a-z]+){0,3}\b/.test(mcText.slice(0, 2000))) hasAuthor = true;
  let hasDate = !!doc.querySelector("time");
  if (!hasDate && /\b(20\d{2}|19\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/.test(mcText)) hasDate = true;
  if (!hasDate && /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+(19|20)\d{2}\b/.test(mcText)) hasDate = true;

  const anchorBlobs = allLinks.map((a) =>
    `${a.getAttribute("href") || ""} ${a.textContent || ""}`.toLowerCase()
  );
  const hasAboutLink = anchorBlobs.some((b: string) => ABOUT_HINTS.some((h: string) => b.includes(h)));
  const hasContactLink = anchorBlobs.some((b: string) => CONTACT_HINTS.some((h: string) => b.includes(h)));
  const hasPolicyLinks = anchorBlobs.some((b: string) => POLICY_HINTS.some((h: string) => b.includes(h)));

  const htmlLower = html.toLowerCase();
  const adHintCount = AD_HINTS.filter((k: string) => htmlLower.includes(k)).length;
  const interstitialHint = ["subscribe to continue","disable your ad blocker","accept cookies","modal","overlay","interstitial"].some((p: string) => htmlLower.includes(p));
  const repeatedTextScore = repetitionScore(mcText);
  const spamPatternsFound = SPAM_PATTERNS.filter((p: RegExp) => p.test(htmlLower)).map((p: RegExp) => p.toString());
  const fillerHits = FILLER_HINTS.filter((k: string) => mcText.toLowerCase().includes(k)).length;
  const { risk: ymylRisk, categories: ymylCategories } = ymylAssessment(title + " " + mcText);
  const purposeGuess = guessPurpose(title, mcText, finalUrl);

  // PQ Score (deterministic — no AI)
  let pqScore = 0;
  const redFlags: string[] = [];
  const positives: string[] = [];

  if (title.length >= 8) { pqScore += 5; positives.push("Has a descriptive title."); }
  if (metaDescription.length >= 40) { pqScore += 5; positives.push("Has a meta description."); }
  if (wordCountMc >= 1200) { pqScore += 12; positives.push("Substantial content depth."); }
  else if (wordCountMc >= 500) { pqScore += 8; positives.push("Moderate content depth."); }
  else if (wordCountMc >= 200) { pqScore += 4; }
  else { redFlags.push("Very thin main content."); }
  if (headingCount >= 6) { pqScore += 6; positives.push("Good heading structure."); }
  else if (headingCount >= 2) { pqScore += 3; }
  if (linkToTextRatio > 0.12) { pqScore -= 6; redFlags.push("High link-to-text ratio."); }
  else if (linkToTextRatio < 0.04) { pqScore += 2; }
  if (repeatedTextScore > 0.35) { pqScore -= 8; redFlags.push("High repetition (templated content risk)."); }
  if (fillerHits >= 3) { pqScore -= 4; redFlags.push("High filler language density."); }
  if (hasSchemaOrg) { pqScore += 4; positives.push("Structured data (schema.org) present."); }
  if (hasAuthor) { pqScore += 6; positives.push("Author signals detected."); }
  else { redFlags.push("No author signals detected."); }
  if (hasDate) { pqScore += 4; positives.push("Date signals detected."); }
  if (ymylRisk !== "low") {
    if (!hasAuthor) { pqScore -= 6; redFlags.push("YMYL content with missing author signals."); }
    if (!hasDate) { pqScore -= 4; redFlags.push("YMYL content with missing date signals."); }
  }
  if (hasAboutLink) { pqScore += 4; positives.push("About/Company link detected."); }
  else { redFlags.push("No About/Company link detected."); }
  if (hasContactLink) { pqScore += 6; positives.push("Contact/Support link detected."); }
  else { redFlags.push("No Contact/Support link detected."); }
  if (hasPolicyLinks) { pqScore += 2; positives.push("Policy links detected."); }
  let adsScore = 10;
  if (adHintCount >= 6) { adsScore -= 5; redFlags.push("Many ad/monetization hints detected."); }
  else if (adHintCount >= 2) { adsScore -= 2; }
  if (interstitialHint) { adsScore -= 4; redFlags.push("Interstitial/overlay hints detected."); }
  pqScore += Math.max(0, adsScore);
  let spamPenalty = 0;
  for (const _pat of spamPatternsFound) { spamPenalty += 10; redFlags.push(`Spam pattern detected`); }
  if (wordCountMc < 250 && repeatedTextScore > 0.25) { spamPenalty += 8; redFlags.push("Thin + repetitive content."); }
  pqScore += (20 - Math.min(20, spamPenalty));
  if (wordCountMc < 80) { pqScore = Math.min(pqScore, 25); redFlags.push("Very little usable content — PQ capped."); }
  pqScore = Math.max(0, Math.min(100, pqScore));

  const pqBucket = pqScore < 20 ? "Lowest" : pqScore < 40 ? "Low" : pqScore < 60 ? "Medium" : pqScore < 80 ? "High" : "Highest";

  return {
    url, final_url: finalUrl, status_code: statusCode,
    title, meta_description: metaDescription, canonical, lang,
    word_count_mc: wordCountMc, heading_count: headingCount,
    outbound_link_count: outboundLinkCount, total_link_count: totalLinkCount,
    link_to_text_ratio: parseFloat(linkToTextRatio.toFixed(4)),
    repeated_text_score: parseFloat(repeatedTextScore.toFixed(4)),
    filler_hits: fillerHits, spam_patterns_found: spamPatternsFound,
    has_schema_org: hasSchemaOrg, has_author: hasAuthor, has_date: hasDate,
    has_about_link: hasAboutLink, has_contact_link: hasContactLink, has_policy_links: hasPolicyLinks,
    ad_hint_count: adHintCount, interstitial_hint: interstitialHint,
    ymyl_risk: ymylRisk, ymyl_categories: ymylCategories,
    purpose_guess: purposeGuess,
    pq_score: parseFloat(pqScore.toFixed(2)), pq_bucket: pqBucket,
    red_flags: redFlags, positives,
    mc_excerpt: mcText.slice(0, 2000),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url) throw new Error("url is required");
    const signals = await extractSignals(url);
    return new Response(JSON.stringify(signals), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("scan-website error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

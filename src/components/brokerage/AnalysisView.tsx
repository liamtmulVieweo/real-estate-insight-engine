import type { AnalysisResult, MeasuredSignals } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, DollarSign,
  User, TrendingUp, TrendingDown, Zap, Calendar, ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface AnalysisViewProps {
  analysis: AnalysisResult;
}

function scoreColor(score: number) {
  return score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-500";
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, score)}%` }} />
    </div>
  );
}

function MiniScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className={`text-xs font-bold w-6 text-right ${scoreColor(score)}`}>{score}</span>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(100, score)}%` }} />
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "Do this week") return <Badge variant="destructive">🔥 Do this week</Badge>;
  if (priority === "Do this month") return <Badge variant="secondary">📅 This month</Badge>;
  return <Badge variant="outline">When you have time</Badge>;
}

function WhoIcon({ who }: { who: string }) {
  if (who.toLowerCase().includes("you personally")) return <span className="flex items-center gap-1 text-sm text-muted-foreground"><User className="h-3.5 w-3.5" /> You</span>;
  if (who.toLowerCase().includes("admin") || who.toLowerCase().includes("assistant")) return <span className="flex items-center gap-1 text-sm text-muted-foreground"><User className="h-3.5 w-3.5" /> Your assistant</span>;
  return <span className="flex items-center gap-1 text-sm text-muted-foreground"><User className="h-3.5 w-3.5" /> Web developer</span>;
}

function SignalDiagnostics({ signals }: { signals: MeasuredSignals }) {
  const items = [
    {
      label: "Does AI understand what you do?",
      ok: Number(signals.word_count_mc) >= 500,
      detail: Number(signals.word_count_mc) < 500 ? "Your site doesn't say enough" : "Enough content detected",
    },
    {
      label: "Can AI tell who runs this firm?",
      ok: Boolean(signals.has_author),
      detail: !signals.has_author ? "No named person found on site" : "Named broker found",
    },
    {
      label: "Does your site look credible to AI?",
      ok: Boolean(signals.has_contact_link) && Boolean(signals.has_about_link),
      detail: (!signals.has_contact_link || !signals.has_about_link) ? "Missing contact or about page" : "Contact and about page found",
    },
    {
      label: "Is AI getting clean signals from your site?",
      ok: Boolean(signals.has_schema_org),
      detail: !signals.has_schema_org ? "No structured business data found" : "Business data tags found",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Website Health Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5">
              {item.ok
                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                : <XCircle className="h-5 w-5 text-red-500" />}
            </div>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  const [saltDetailsOpen, setSaltDetailsOpen] = useState(false);

  if (!analysis?.plain_english_summary) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Analysis data is incomplete. Please try running the analysis again.</p>
      </div>
    );
  }

  const saltAnchor = analysis._measured_signals?.salt_anchor;
  const overallScore = saltAnchor?.overall;

  return (
    <div className="space-y-8">
      {/* 1. The Verdict */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* SALT Score + Pillar Breakdown */}
            {overallScore != null && (
              <div className="flex flex-col items-center gap-3 min-w-[180px]">
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-border px-6 py-4 bg-muted/30 w-full">
                  <span className={`text-5xl font-bold ${scoreColor(overallScore)}`}>
                    {Math.round(overallScore)}
                  </span>
                  <span className="text-xs font-medium mt-1 text-muted-foreground">SALT Score</span>
                </div>
                {/* Pillar mini-bars */}
                <div className="w-full space-y-1.5">
                  <MiniScoreBar label="Semantic" score={saltAnchor.semantic ?? 0} />
                  <MiniScoreBar label="Authority" score={saltAnchor.authority ?? 0} />
                  <MiniScoreBar label="Location" score={saltAnchor.location ?? 0} />
                  <MiniScoreBar label="Trust" score={saltAnchor.trust ?? 0} />
                </div>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <p className="text-base leading-relaxed">{analysis.plain_english_summary}</p>
              <p className="text-sm text-muted-foreground">{analysis.visibility_grade_reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Visibility Scores */}
      {analysis.platform_scores?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibility by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.platform_scores.map((ps) => (
                <div key={ps.platform} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{ps.platform}</span>
                    <span className={`text-lg font-bold ${scoreColor(ps.score)}`}>{ps.score}</span>
                  </div>
                  <ScoreBar score={ps.score} />
                  <p className="text-xs text-muted-foreground">{ps.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SALT Pillar Details (collapsible) */}
      {(analysis.salt_scores || []).length > 0 && (
        <Collapsible open={saltDetailsOpen} onOpenChange={setSaltDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:underline cursor-pointer w-full">
            <ChevronDown className={`h-4 w-4 transition-transform ${saltDetailsOpen ? "rotate-180" : ""}`} />
            SALT Score Details
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysis.salt_scores || []).map((s) => (
                <Card key={s.internal_pillar}>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.pillar}</span>
                      <span className={`text-lg font-bold ${scoreColor(s.score)}`}>{s.score}</span>
                    </div>
                    <ScoreBar score={s.score} />
                    <p className="text-sm font-medium">{s.headline}</p>
                    <p className="text-xs text-muted-foreground">{s.what_it_means}</p>
                    {s.evidence && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-3">{s.evidence}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 2. The Gap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            The Core Problem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">What AI thinks you do</p>
              <p className="text-sm">{analysis.what_ai_thinks_you_do}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">What you actually do</p>
              <p className="text-sm">{analysis.what_you_actually_do}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-orange-700 dark:text-orange-400">{analysis.the_gap}</p>
        </CardContent>
      </Card>

      {/* 3. Deals Being Lost */}
      {analysis.deals_you_are_losing?.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Leads Going to Competitors Right Now
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">These are real queries your prospects type. You're not showing up.</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.deals_you_are_losing.map((deal, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">"{deal.scenario}"</span>
                </div>
                <p className="text-sm text-muted-foreground"><span className="font-medium">Why you lose:</span> {deal.why_you_lose}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium">Who wins instead:</span> {deal.who_wins_instead}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. Quick Wins */}
      {analysis.quick_wins?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Do These Today (Under 1 Hour Each)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.quick_wins.map((win, i) => (
              <div key={i} className="flex items-start gap-2 py-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <p className="text-sm">{win}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 5. Top Fixes */}
      {analysis.top_fixes?.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Your Fix List</h2>
            <p className="text-sm text-muted-foreground">Sorted by impact. Each fix tells you exactly what to do and how long it takes.</p>
          </div>
          <div className="space-y-4">
            {analysis.top_fixes.map((fix, i) => (
              <Card key={i}>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold">{fix.fix_title}</h3>
                    <PriorityBadge priority={fix.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground">{fix.the_problem}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">What to do</p>
                    <p className="text-sm">{fix.the_fix}</p>
                    {fix.example && (
                      <div className="mt-2 rounded bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">{fix.example}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <WhoIcon who={fix.who_does_this} />
                    <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {fix.time_to_complete}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3.5 w-3.5" /> {fix.cost_estimate}</span>
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    <span className="font-medium">Result:</span> {fix.what_changes}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI Recommends / Skips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" /> AI Recommends You For
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(analysis.ai_recommends_you_for || []).map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" /> AI Skips You For
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(analysis.ai_does_not_recommend_you_for || []).map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 7. Competitor Context */}
      {analysis.competitor_context && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How You Compare to Firms AI Recommends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">What firms AI recommends typically do differently</p>
              <div className="space-y-1.5">
                {analysis.competitor_context.what_winning_firms_do_differently.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {analysis.competitor_context.your_advantage && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Your Potential Advantage</p>
                <p className="text-sm">{analysis.competitor_context.your_advantage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8. 30-Day Action Plan */}
      {analysis["30_day_action_plan"]?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your 30-Day Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysis["30_day_action_plan"].map((week) => (
                <div key={week.week} className="space-y-2">
                  <h4 className="text-sm font-semibold">Week {week.week}</h4>
                  <div className="space-y-1 pl-4">
                    {week.actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic pl-4">{week.expected_result}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 9. What's Working */}
      {analysis.what_is_working?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What's Already Working</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.what_is_working.map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 10. Website Health Check */}
      {analysis._measured_signals && (
        <SignalDiagnostics signals={analysis._measured_signals} />
      )}
    </div>
  );
}

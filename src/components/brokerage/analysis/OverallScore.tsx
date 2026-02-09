import type { SALTPillarScore } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Globe, Award, MapPin, Shield } from "lucide-react";

interface OverallScoreProps {
  score: number;
  saltScores: SALTPillarScore[];
}

function scoreColor(score: number) {
  if (score >= 70) return "text-status-success";
  if (score >= 50) return "text-status-warning";
  return "text-status-danger";
}

function scoreBorderColor(score: number) {
  if (score >= 70) return "border-l-status-success";
  if (score >= 50) return "border-l-status-warning";
  return "border-l-status-danger";
}

function pillarIcon(pillar: string) {
  const iconClass = "h-4 w-4";
  switch (pillar) {
    case "Semantic": return <Globe className={iconClass} />;
    case "Authority": return <Award className={iconClass} />;
    case "Location": return <MapPin className={iconClass} />;
    case "Trust": return <Shield className={iconClass} />;
    default: return null;
  }
}

function pillarDescription(pillar: string) {
  switch (pillar) {
    case "Semantic": return "How clearly your firm's focus is communicated";
    case "Authority": return "Evidence of expertise through deals and results";
    case "Location": return "Geographic clarity for markets you serve";
    case "Trust": return "Credibility signals for AI recommendations";
    default: return "";
  }
}

export function OverallScore({ score, saltScores }: OverallScoreProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-muted-foreground">AI Visibility Score</h2>
        <p className={`text-6xl font-bold ${scoreColor(score)}`}>{score}</p>
        <p className="text-sm text-muted-foreground">out of 100</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SALT Framework</CardTitle>
          <p className="text-sm text-muted-foreground">
            How AI assistants evaluate your brokerage
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {saltScores.map((s) => (
            <Collapsible key={s.pillar}>
              <CollapsibleTrigger className="w-full">
                <div className={`flex items-center justify-between p-3 rounded-md border-l-4 ${scoreBorderColor(s.score)} bg-muted/30 hover:bg-muted/50 transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {pillarIcon(s.pillar)}
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-sm">{s.pillar}</span>
                      <p className="text-xs text-muted-foreground">{pillarDescription(s.pillar)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${scoreColor(s.score)}`}>{s.score}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-sm text-muted-foreground">{s.summary}</p>
                  <div className="space-y-1">
                    {s.details.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

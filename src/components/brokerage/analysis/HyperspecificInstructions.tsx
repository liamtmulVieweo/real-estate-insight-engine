import { useState } from "react";
import type { HyperspecificInstruction } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Zap, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface HyperspecificInstructionsProps {
  instructions: HyperspecificInstruction[];
}

function impactBadge(impact: string) {
  switch (impact) {
    case "high":
      return <Badge variant="destructive">High Impact</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
}

function effortBadge(effort: string) {
  switch (effort) {
    case "low":
      return <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" />Quick</Badge>;
    case "medium":
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Medium</Badge>;
    default:
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Longer</Badge>;
  }
}

function UrlLink({ url }: { url: string }) {
  const isValidUrl = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");

  if (!isValidUrl) {
    return <span className="text-sm text-muted-foreground">{url}</span>;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
      {url}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function HyperspecificInstructions({ instructions }: HyperspecificInstructionsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedItems(newSet);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Implementation Playbook</CardTitle>
        <p className="text-sm text-muted-foreground">
          Step-by-step instructions your team can follow to improve visibility
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {(instructions || []).map((inst) => {
          const isExpanded = expandedItems.has(inst.title);

          return (
            <div key={inst.title} className="border rounded-lg">
              <button onClick={() => toggle(inst.title)} className="w-full text-left p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{inst.title}</p>
                    <p className="text-xs text-muted-foreground">{inst.deliverable}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-primary">+{inst.salt_points} points</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {impactBadge(inst.impact)}
                  {inst.effort && effortBadge(inst.effort)}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Target Search Intent</p>
                      <p className="text-sm italic">"{inst.target_intent}"</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Target Page</p>
                      <UrlLink url={inst.target_url} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Suggested Page Title</p>
                    <p className="text-sm font-medium">{inst.suggested_title}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">What To Do</p>
                    <div className="space-y-1">
                      {(inst.action_items || []).map((a, i) => (
                        <p key={i} className="text-sm">{a}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Avoid</p>
                    <div className="space-y-1">
                      {(inst.avoid || []).map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-red-500">✕</span>
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {inst.good_example && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Good Example</p>
                      <p className="text-sm">{inst.good_example}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Expected Result:</span> {inst.effect}
                    </p>
                    {inst.dependency && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Depends On:</span> {inst.dependency}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

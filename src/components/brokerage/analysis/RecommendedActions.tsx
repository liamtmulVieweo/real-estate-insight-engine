import { useState } from "react";
import type { RecommendedAction } from "@/types/brokerage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, Award, MapPin, Shield, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface RecommendedActionsProps {
  actions: RecommendedAction[];
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High Priority</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Lower</Badge>;
  }
}

function pillarIcon(pillar: string) {
  const iconClass = "h-3.5 w-3.5";
  switch (pillar) {
    case "Semantic": return <Globe className={iconClass} />;
    case "Authority": return <Award className={iconClass} />;
    case "Location": return <MapPin className={iconClass} />;
    case "Trust": return <Shield className={iconClass} />;
    default: return null;
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

export function RecommendedActions({ actions }: RecommendedActionsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedItems(newSet);
  };

  const sortedActions = [...(actions || [])].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Priority Fixes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Actionable recommendations sorted by impact on AI visibility
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedActions.map((a) => {
          const isExpanded = expandedItems.has(a.title);

          return (
            <div key={a.title} className="border rounded-lg">
              <button onClick={() => toggle(a.title)} className="w-full text-left p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.issue}</p>
                  </div>
                  <div className="shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {pillarIcon(a.pillar)}
                    {a.pillar}
                  </span>
                  {priorityBadge(a.priority)}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t pt-4">
                  {a.affected_urls && a.affected_urls.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Affected Pages</p>
                      <div className="space-y-1">
                        {a.affected_urls.map((url, i) => (
                          <div key={i}><UrlLink url={url} /></div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Why This Matters</p>
                    <p className="text-sm">{a.why_it_matters}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">What To Do</p>
                    <div className="space-y-1">
                      {(a.what_to_do || []).map((step, i) => (
                        <p key={i} className="text-sm">{step}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">How You Know It's Done</p>
                    <div className="space-y-1">
                      {(a.how_to_know_done || []).map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-status-success">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
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

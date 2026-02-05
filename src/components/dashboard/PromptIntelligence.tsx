import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import type { PromptIntelligence as PromptData } from "@/types/dashboard";

interface PromptIntelligenceProps {
  prompts: PromptData[];
  isLoading: boolean;
}

export function PromptIntelligence({ prompts, isLoading }: PromptIntelligenceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Prompt Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Prompt Intelligence</CardTitle>
        <CardDescription>Real user prompts where your brokerage appears</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {prompts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No prompts found for this brokerage
            </p>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.prompt_hash}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === prompt.prompt_hash ? null : prompt.prompt_hash)
                  }
                  className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        "{prompt.prompt}"
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {prompt.model}
                        </Badge>
                        <span>•</span>
                        <span>{prompt.citation_count} citations</span>
                      </div>
                    </div>
                    {expandedId === prompt.prompt_hash ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expandedId === prompt.prompt_hash && (
                  <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
                    <div className="grid grid-cols-3 gap-4 pt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Market</span>
                        <p className="font-medium">{prompt.market || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Property Type</span>
                        <p className="font-medium">{prompt.property_type || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Role</span>
                        <p className="font-medium">{prompt.broker_role || "N/A"}</p>
                      </div>
                    </div>
                    {prompt.source_domains && prompt.source_domains.length > 0 && (
                      <div className="mt-3">
                        <span className="text-muted-foreground text-xs">Sources</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prompt.source_domains.slice(0, 5).map((domain) => (
                            <Badge key={domain} variant="outline" className="text-xs">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

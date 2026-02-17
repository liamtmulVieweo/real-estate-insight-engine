import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export interface CoMentionedBrokerage {
  brokerage: string;
  co_mentions: number;
}

interface CompetitorsListProps {
  data: CoMentionedBrokerage[];
  isLoading: boolean;
  selectedBrokerage?: string;
}

export function CompetitorsList({ data, isLoading, selectedBrokerage }: CompetitorsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Competitors</CardTitle>
            <CardDescription>
              Brokerages co-mentioned in the same prompts as {selectedBrokerage || "you"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 bg-muted animate-pulse rounded" />
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No co-mentioned brokerages found
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Brokerage</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Shared Prompts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.brokerage} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium">{item.brokerage}</td>
                    <td className="py-2 px-2 text-right">
                      <Badge variant="secondary" className="text-xs">
                        {item.co_mentions.toLocaleString()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

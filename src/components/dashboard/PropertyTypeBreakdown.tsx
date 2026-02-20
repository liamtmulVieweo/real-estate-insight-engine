import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PropertyTypeBreakdown as PropertyTypeData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

interface PropertyTypeBreakdownProps {
  data: PropertyTypeData[];
  isLoading: boolean;
  selectedMarket?: string;
}

export function PropertyTypeBreakdown({ data, isLoading, selectedMarket }: PropertyTypeBreakdownProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Property Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const totalMentions = data.reduce((sum, item) => sum + item.mentions, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Property Types</CardTitle>
          {selectedMarket && (
            <Badge variant="secondary" className="text-xs">
              {selectedMarket}
            </Badge>
          )}
        </div>
        <CardDescription>
          Top property types by mention count
          {!selectedMarket && " (All Markets)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Property Type</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Mentions</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Composition</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Rank</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.property_type} className="border-b border-border/50 hover:bg-muted/30">
                  {isMobile ? (
                    <td colSpan={4} className="py-3 px-2">
                      <div className="grid grid-cols-2 gap-y-1">
                        <span className="font-medium text-foreground text-[13px]">{item.property_type}</span>
                        <span className="text-right text-[13px]">
                          <span className="text-muted-foreground text-[11px]">Mentions: </span>
                          {item.mentions.toLocaleString()}
                        </span>
                        <span className="text-[13px]">
                          <span className="text-muted-foreground text-[11px]">Comp: </span>
                          {totalMentions > 0 ? ((item.mentions / totalMentions) * 100).toFixed(1) : 0}%
                        </span>
                        <span className="text-right text-[13px]">
                          <span className="font-semibold">#{item.rank}</span>
                          <span className="text-muted-foreground text-[11px] ml-1">of {item.total_brokerages}</span>
                        </span>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-2 font-medium">{item.property_type}</td>
                      <td className="py-3 px-2 text-right">{item.mentions.toLocaleString()}</td>
                      <td className="py-3 px-2 text-right">
                        {totalMentions > 0 ? ((item.mentions / totalMentions) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-semibold">#{item.rank}</span>
                        <span className="text-muted-foreground text-xs ml-1">of {item.total_brokerages}</span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

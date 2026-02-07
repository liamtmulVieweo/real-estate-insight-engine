import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyTypeBreakdown as PropertyTypeData } from "@/types/dashboard";

interface PropertyTypeBreakdownProps {
  data: PropertyTypeData[];
  isLoading: boolean;
}

export function PropertyTypeBreakdown({ data, isLoading }: PropertyTypeBreakdownProps) {
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
        <CardTitle>Property Types</CardTitle>
        <CardDescription>Top property types by mention count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Property Type</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Mentions</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.property_type} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{item.property_type}</td>
                  <td className="py-3 px-2 text-right">{item.mentions.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    {totalMentions > 0 ? ((item.mentions / totalMentions) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

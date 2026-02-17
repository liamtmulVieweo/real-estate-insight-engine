import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketData } from "@/types/dashboard";

const STATE_ABBR: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
};

function abbreviateMarket(name: string): string {
  if (STATE_ABBR[name]) return STATE_ABBR[name];
  // Try replacing state suffix: "Dallas, Texas" -> "Dallas, TX"
  for (const [state, abbr] of Object.entries(STATE_ABBR)) {
    if (name.endsWith(`, ${state}`)) {
      return name.replace(`, ${state}`, `, ${abbr}`);
    }
  }
  return name;
}

interface MarketVisibilityProps {
  data: MarketData[];
  isLoading: boolean;
}

export function MarketVisibility({ data, isLoading }: MarketVisibilityProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Market Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const topMarkets = data.slice(0, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Market Visibility</CardTitle>
        <CardDescription>Where your brokerage appears most frequently</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Market</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Mentions</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Share of Mentions</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Rank</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Percentile</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-[220px] overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {topMarkets.map((item) => (
                  <tr key={item.market} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium" title={item.market}>
                      {abbreviateMarket(item.market)}
                    </td>
                    <td className="py-3 px-2 text-right">{item.mentions.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">{item.marketSharePct.toFixed(1)}%</td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-semibold">#{item.rank}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        of {item.totalBrokerages}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-xs font-medium">
                        {item.percentile >= 99 ? "99th" : `${Math.round(item.percentile)}th`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

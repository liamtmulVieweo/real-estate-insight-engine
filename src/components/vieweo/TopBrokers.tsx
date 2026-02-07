import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBrokersProps {
  data: Array<{
    name: string;
    brokerage: string;
    mentions: number;
    markets: string[];
    assetClasses: string[];
  }>;
  allData: Array<{
    name: string;
    brokerage: string;
    mentions: number;
    markets: string[];
    assetClasses: string[];
  }>;
  onRequestAudit?: () => void;
}

export function TopBrokers({ data, allData, onRequestAudit }: TopBrokersProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return allData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brokerage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, allData, searchQuery]);

  const colors = [
    'hsl(170 55% 40%)',
    'hsl(175 50% 45%)',
    'hsl(180 45% 50%)',
    'hsl(185 40% 55%)',
    'hsl(170 45% 50%)',
    'hsl(175 40% 55%)',
    'hsl(180 35% 55%)',
    'hsl(185 30% 55%)',
    'hsl(170 35% 55%)',
    'hsl(175 30% 55%)',
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-1 h-5 bg-secondary rounded-full" />
          Most Visible Brokers
        </h2>
        {onRequestAudit && (
          <Button variant="outline" size="sm" onClick={onRequestAudit} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Request Audit
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search brokers or brokerages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredData.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {searchQuery ? 'No brokers match your search' : 'No broker data available for selected filters'}
        </p>
      ) : (
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'hsl(215 15% 45%)' }}
                axisLine={{ stroke: 'hsl(210 20% 88%)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fontSize: 12, fill: 'hsl(215 25% 15%)' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground">{data.name}</p>
                        <p className="text-sm text-muted-foreground">{data.brokerage}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.mentions} mentions across {data.markets.length} markets
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                {filteredData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
        Shows individual brokers most frequently named by AI in response to discovery prompts
      </p>
    </div>
  );
}

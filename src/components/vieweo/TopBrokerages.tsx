import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TopBrokeragesProps {
  data: Array<{
    name: string;
    mentions: number;
    percentage: number;
  }>;
  allData: Array<{
    name: string;
    mentions: number;
    percentage: number;
  }>;
}

export function TopBrokerages({ data, allData }: TopBrokeragesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    // When searching, filter from ALL brokerages, not just top 15
    return allData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, allData, searchQuery]);

  const colors = [
    'hsl(205 75% 35%)',
    'hsl(195 65% 40%)',
    'hsl(185 55% 45%)',
    'hsl(175 50% 50%)',
    'hsl(205 60% 50%)',
    'hsl(195 55% 55%)',
    'hsl(185 45% 55%)',
    'hsl(175 40% 55%)',
    'hsl(205 50% 60%)',
    'hsl(195 45% 60%)',
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-secondary rounded-full" />
        Most Visible Brokerages
      </h2>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search brokerages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredData.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {searchQuery ? 'No brokerages match your search' : 'No brokerage data available for selected filters'}
        </p>
      ) : (
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              barCategoryGap="20%"
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
                        <p className="text-sm text-muted-foreground">
                          {data.mentions} mentions ({data.percentage.toFixed(1)}%)
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
        Shows which firms AI most frequently names in response to discovery prompts
      </p>
    </div>
  );
}

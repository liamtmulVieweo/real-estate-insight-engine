import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface RawDataTableProps {
  data: Array<{
    name: string;
    brokerage: string;
    entity_type: string;
    market: string;
    property_type: string;
    broker_role: string;
    prompt: string;
  }>;
}

export function RawDataTable({ data }: RawDataTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(row => {
    const searchLower = search.toLowerCase();
    return (
      row.name?.toLowerCase().includes(searchLower) ||
      row.brokerage?.toLowerCase().includes(searchLower) ||
      row.entity_type?.toLowerCase().includes(searchLower) ||
      row.market?.toLowerCase().includes(searchLower) ||
      row.property_type?.toLowerCase().includes(searchLower) ||
      row.broker_role?.toLowerCase().includes(searchLower) ||
      row.prompt?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Raw Data Inspector
        </h2>
        <Badge variant="outline">{filteredData.length} rows</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, brokerage, market, prompt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[120px]">Brokerage</TableHead>
              <TableHead className="min-w-[80px]">Entity Type</TableHead>
              <TableHead className="min-w-[100px]">Market</TableHead>
              <TableHead className="min-w-[100px]">Property Type</TableHead>
              <TableHead className="min-w-[100px]">Broker Role</TableHead>
              <TableHead className="min-w-[250px]">Prompt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.slice(0, 100).map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                <TableCell>{row.brokerage || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant={row.entity_type === 'broker' ? 'default' : row.entity_type === 'brokerage' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {row.entity_type}
                  </Badge>
                </TableCell>
                <TableCell>{row.market}</TableCell>
                <TableCell>{row.property_type}</TableCell>
                <TableCell>{row.broker_role}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate" title={row.prompt}>
                  {row.prompt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredData.length > 100 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Showing first 100 of {filteredData.length} rows. Use search to filter.
          </p>
        )}
      </div>
    </div>
  );
}

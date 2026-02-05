import { Building2, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Filters } from "@/types/dashboard";

interface DashboardHeaderProps {
  selectedBrokerage: string;
  brokerages: Array<{ brokerage: string; total_mentions: number }>;
  markets: string[];
  propertyTypes: string[];
  roles: string[];
  filters: Filters;
  onBrokerageChange: (brokerage: string) => void;
  onFilterChange: (key: keyof Filters, value: string) => void;
}

export function DashboardHeader({
  selectedBrokerage,
  brokerages,
  markets,
  propertyTypes,
  roles,
  filters,
  onBrokerageChange,
  onFilterChange,
}: DashboardHeaderProps) {
  const selectedBrokerageData = brokerages.find(
    (b) => b.brokerage === selectedBrokerage
  );

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brokerage Selector */}
          <Card className="p-4 flex items-center gap-4 bg-card shadow-sm">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedBrokerage} onValueChange={onBrokerageChange}>
                <SelectTrigger className="border-0 p-0 h-auto text-xl font-semibold bg-transparent focus:ring-0">
                  <SelectValue placeholder="Select a brokerage" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {brokerages.slice(0, 50).map((b) => (
                    <SelectItem key={b.brokerage} value={b.brokerage}>
                      {b.brokerage} ({b.total_mentions.toLocaleString()} mentions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBrokerageData && (
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedBrokerageData.total_mentions.toLocaleString()} total mentions
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Global Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select
              value={filters.market}
              onValueChange={(v) => onFilterChange("market", v)}
            >
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="All">All Markets</SelectItem>
                {markets.slice(0, 50).map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.propertyType}
              onValueChange={(v) => onFilterChange("propertyType", v)}
            >
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="All Property Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Property Types</SelectItem>
                {propertyTypes.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.role}
              onValueChange={(v) => onFilterChange("role", v)}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

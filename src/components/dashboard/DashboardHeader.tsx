import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Filter, Check, ChevronsUpDown, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
  originalNames?: string[];
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
  originalNames = [],
}: DashboardHeaderProps) {
  const [brokerageOpen, setBrokerageOpen] = useState(false);

  const selectedBrokerageData = brokerages.find(
    (b) => b.brokerage === selectedBrokerage
  );

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brokerage Selector with Search */}
          <Card className="p-4 flex items-center gap-4 bg-card shadow-sm">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-[280px]">
              <Popover open={brokerageOpen} onOpenChange={setBrokerageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={brokerageOpen}
                    className="w-full justify-between text-left font-semibold text-lg h-auto py-1 px-0 hover:bg-transparent"
                  >
                    <span className="truncate">
                      {selectedBrokerage || "Select a brokerage..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 z-50 bg-popover" align="start">
                  <Command>
                    <CommandInput placeholder="Search brokerages..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>No brokerage found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {brokerages.map((b) => (
                          <CommandItem
                            key={b.brokerage}
                            value={b.brokerage}
                            onSelect={(value) => {
                              onBrokerageChange(value);
                              setBrokerageOpen(false);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Check
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  selectedBrokerage === b.brokerage
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{b.brokerage}</span>
                            </div>
                            <Badge variant="secondary" className="ml-2 shrink-0 text-xs">
                              {b.total_mentions.toLocaleString()}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedBrokerageData && (
                <div className="flex gap-2 mt-1 flex-wrap">
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
              <SelectTrigger className="w-[160px] h-9 text-sm bg-background">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] z-50 bg-popover">
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
              <SelectTrigger className="w-[160px] h-9 text-sm bg-background">
                <SelectValue placeholder="All Property Types" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
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
              <SelectTrigger className="w-[140px] h-9 text-sm bg-background">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="All">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Link to="/ai-visibility">
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Eye className="h-4 w-4" />
                AI Visibility
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

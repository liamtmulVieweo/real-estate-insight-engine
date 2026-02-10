import { VieweoFilters } from '@/hooks/useVieweoData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface GlobalFiltersProps {
  filters: VieweoFilters;
  setFilters: (filters: VieweoFilters) => void;
  markets: string[];
  propertyTypes: string[];
  brokerRoles: string[];
  entityTypes: string[];
}

export function GlobalFilters({
  filters,
  setFilters,
  markets,
  propertyTypes,
  brokerRoles,
  entityTypes,
}: GlobalFiltersProps) {

  const updateFilter = (key: keyof VieweoFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const formatEntityType = (type: string) => {
    if (type === 'NONE') return 'No Entity Named';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Market</label>
          <Select value={filters.market} onValueChange={(v) => updateFilter('market', v)}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {markets.map(market => (
                <SelectItem key={market} value={market}>{market}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Property Type</label>
          <Select value={filters.propertyType} onValueChange={(v) => updateFilter('propertyType', v)}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Broker Role</label>
          <Select value={filters.brokerRole} onValueChange={(v) => updateFilter('brokerRole', v)}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {brokerRoles.map(role => (
                <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Entity Type</label>
          <Select value={filters.entityType} onValueChange={(v) => updateFilter('entityType', v)}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map(type => (
                <SelectItem key={type} value={type}>{formatEntityType(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { VieweoFilters } from '@/hooks/useVieweoData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPromptDialog } from './AuthPromptDialog';

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
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const updateFilter = (key: keyof VieweoFilters, value: string) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setFilters({ ...filters, [key]: value });
  };

  const handleFilterClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthDialog(true);
    }
  };

  const formatEntityType = (type: string) => {
    if (type === 'NONE') return 'No Entity Named';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const FilterWrapper = ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {label}
        {!user && <Lock className="h-3 w-3 text-muted-foreground/50" />}
      </label>
      <div 
        onClick={handleFilterClick}
        className={!user ? 'cursor-pointer' : ''}
      >
        {children}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {!user && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Sign in to filter
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterWrapper label="Market">
            <Select 
              value={filters.market} 
              onValueChange={(v) => updateFilter('market', v)}
              disabled={!user}
            >
              <SelectTrigger className={`h-9 bg-background ${!user ? 'opacity-60' : ''}`}>
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterWrapper>

          <FilterWrapper label="Property Type">
            <Select 
              value={filters.propertyType} 
              onValueChange={(v) => updateFilter('propertyType', v)}
              disabled={!user}
            >
              <SelectTrigger className={`h-9 bg-background ${!user ? 'opacity-60' : ''}`}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterWrapper>

          <FilterWrapper label="Broker Role">
            <Select 
              value={filters.brokerRole} 
              onValueChange={(v) => updateFilter('brokerRole', v)}
              disabled={!user}
            >
              <SelectTrigger className={`h-9 bg-background ${!user ? 'opacity-60' : ''}`}>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {brokerRoles.map(role => (
                  <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterWrapper>

          <FilterWrapper label="Entity Type">
            <Select 
              value={filters.entityType} 
              onValueChange={(v) => updateFilter('entityType', v)}
              disabled={!user}
            >
              <SelectTrigger className={`h-9 bg-background ${!user ? 'opacity-60' : ''}`}>
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>{formatEntityType(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterWrapper>
        </div>
      </div>

      <AuthPromptDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}

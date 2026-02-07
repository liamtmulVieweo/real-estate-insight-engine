import { StatCard } from './StatCard';
import { FileText, Users, Building2, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MarketSummaryProps {
  stats: {
    totalPrompts: number;
    uniqueBrokers: number;
    uniqueBrokerages: number;
  };
}

export function MarketSummary({ stats }: MarketSummaryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        Market AI Coverage Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={
            <span className="inline-flex items-center gap-1">
              Prompts Evaluated
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs text-sm" side="top">
                  <p className="mb-2">
                    Prompts are real-world discovery questions asked of AI systems (e.g., ChatGPT), such as "Who should I contact to sell a $10–$25M multifamily property in Chicago?"
                  </p>
                  <p>
                    Each prompt represents a distinct buyer or seller intent. Vieweo evaluates how AI responds to these prompts and which brokers or brokerages are named.
                  </p>
                </PopoverContent>
              </Popover>
            </span>
          }
          value={stats.totalPrompts}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Unique Brokers Named"
          value={stats.uniqueBrokers}
          icon={<Users className="h-5 w-5" />}
          variant="accent"
        />
        <StatCard
          label="Unique Brokerages Named"
          value={stats.uniqueBrokerages}
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: ReactNode;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'warning' | 'accent';
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'default'
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg border border-border p-4 shadow-sm",
      variant === 'warning' && "border-warning/30 bg-warning/5",
      variant === 'accent' && "border-secondary/30 bg-secondary/5"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className={cn(
            "text-2xl font-bold",
            variant === 'warning' && "text-warning",
            variant === 'accent' && "text-secondary"
          )}>
            {typeof value === 'number' && value % 1 !== 0
              ? value.toFixed(1) + '%'
              : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === 'default' && "bg-primary/10 text-primary",
            variant === 'warning' && "bg-warning/15 text-warning",
            variant === 'accent' && "bg-secondary/15 text-secondary"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

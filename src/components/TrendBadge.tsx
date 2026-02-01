import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TrendBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'up' | 'down';
  children: React.ReactNode;
}

const trendStyles = {
  up: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-400',
  down:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400',
};

function TrendBadge({ direction, children, className, ...props }: TrendBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', trendStyles[direction], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

export { TrendBadge };

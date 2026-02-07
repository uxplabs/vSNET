'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkline, type SparklineDataPoint } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

/* SVG trend arrows matching Tailwind UI stats pattern */
function TrendArrow({ direction }: { direction: 'up' | 'down' }) {
  return direction === 'up' ? (
    <svg className="size-4 shrink-0 self-center text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="size-4 shrink-0 self-center text-rose-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );
}

export interface StatCardProps {
  /** Stat label / name */
  name: string;
  /** Main metric value */
  value: React.ReactNode;
  /** Change amount (e.g. "12%", "3") */
  change?: string;
  /** Direction of the change */
  changeDirection?: 'up' | 'down';
  /** Additional context (e.g. "from last month") */
  changeLabel?: string;
  /** Optional icon in the header */
  icon?: React.ReactNode;
  /** Sparkline data points */
  sparkline?: SparklineDataPoint[];
  /** Sparkline color */
  sparklineColor?: string;
  /** Additional class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * StatCard – Tailwind UI "with trending" stats pattern
 * using semantic <dl>/<dt>/<dd> elements within a Shadcn Card.
 *
 * @see https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/stats
 */
function StatCard({
  name,
  value,
  change,
  changeDirection,
  changeLabel,
  icon,
  sparkline,
  sparklineColor,
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        onClick && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <dl>
          <dt className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-muted-foreground">
              {name}
            </span>
            {icon && (
              <span className="text-muted-foreground shrink-0" aria-hidden>
                {icon}
              </span>
            )}
          </dt>
          <dd className="mt-2 flex items-end justify-between gap-4">
            <div>
              <span className="text-2xl font-semibold tracking-tight">
                {value}
              </span>
              {change && (
                <p className="mt-1 flex items-baseline gap-1 text-sm whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-baseline gap-0.5 font-medium',
                      changeDirection === 'up'
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-rose-600 dark:text-rose-500'
                    )}
                  >
                    <TrendArrow direction={changeDirection ?? 'up'} />
                    {change}
                  </span>
                  {changeLabel && (
                    <span className="text-muted-foreground">{changeLabel}</span>
                  )}
                </p>
              )}
            </div>
            {sparkline && sparkline.length > 0 && (
              <Sparkline data={sparkline} color={sparklineColor} />
            )}
          </dd>
        </dl>
      </CardContent>
    </Card>
  );
}

export { StatCard, TrendArrow };

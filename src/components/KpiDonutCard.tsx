'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KpiDonutCardSegment {
  name: string;
  value: number;
  /** Optional legend label (e.g. "180 GB Free"). If omitted, uses name. */
  legendLabel?: string;
  /** If true, shown in legend only (not in donut). Use for "Total" rows. */
  legendOnly?: boolean;
}

export interface KpiDonutCardProps {
  title: string;
  kpiValue: React.ReactNode;
  /** Percentage label shown beside kpiValue (e.g. "54% used") */
  kpiPercentage?: React.ReactNode;
  /** Donut segments */
  donutData: KpiDonutCardSegment[];
  className?: string;
}

const SEGMENT_COLORS = [
  'var(--primary)',
  'var(--success)',
  'var(--warning)',
  'var(--muted)',
  'var(--destructive)',
];

/**
 * KpiDonutCard – Storage/capacity card with a donut chart and legend.
 * Uses pure SVG donut (no recharts dependency).
 */
function KpiDonutCard({
  title,
  kpiValue,
  kpiPercentage,
  donutData,
  className,
}: KpiDonutCardProps) {
  const pieData = React.useMemo(() => donutData.filter((d) => !d.legendOnly), [donutData]);
  const total = React.useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);

  // SVG donut parameters
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build arc segments
  let cumulativeOffset = 0;
  const arcs = pieData.map((seg, i) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dashLength = fraction * circumference;
    const gap = circumference - dashLength;
    const offset = -cumulativeOffset + circumference * 0.25; // start from top
    cumulativeOffset += dashLength;
    return {
      ...seg,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      dasharray: `${dashLength} ${gap}`,
      dashoffset: offset,
    };
  });

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div className="shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--muted)"
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
              {/* Segments */}
              {arcs.map((arc) => (
                <circle
                  key={arc.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={arc.dasharray}
                  strokeDashoffset={arc.dashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))}
            </svg>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-muted-foreground">{title}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">
                {kpiValue}
              </span>
              {kpiPercentage != null && (
                <span className="text-sm text-muted-foreground">{kpiPercentage}</span>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {donutData.map((entry, index) => {
                const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
                return (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-muted-foreground">
                      {entry.legendLabel ?? entry.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiDonutCard };

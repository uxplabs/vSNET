'use client';

import * as React from 'react';
import { Line, LineChart, Tooltip, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

export interface SparklineDataPoint {
  value: number;
  [key: string]: string | number;
}

export interface SparklineProps {
  /** Data points for the sparkline */
  data: SparklineDataPoint[];
  /** Data key to use for the line (default: "value") */
  dataKey?: string;
  /** Height of the sparkline */
  height?: number;
  /** Line color (CSS color value) */
  color?: string;
  /** Line stroke width */
  strokeWidth?: number;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Additional class name for the container */
  className?: string;
}

/**
 * Sparkline – Inline trend chart powered by recharts.
 * Uses a percentage-based width with fixed height (no ResponsiveContainer)
 * to avoid zero-height rendering issues in flex layouts.
 */
function Sparkline({
  data,
  dataKey = 'value',
  height = 32,
  color = 'var(--primary)',
  strokeWidth = 1.5,
  showTooltip = false,
  className,
}: SparklineProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.round(entry.contentRect.width));
      }
    });

    observer.observe(el);
    setWidth(Math.round(el.clientWidth));

    return () => observer.disconnect();
  }, []);

  if (!data || data.length < 2) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn('shrink-0', className)}
      style={{ width: '40%', height }}
      aria-hidden
    >
      {width > 0 && (
        <LineChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <YAxis hide domain={['dataMin', 'dataMax']} />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--popover)',
                color: 'var(--popover-foreground)',
              }}
              formatter={(value: number) => [value.toLocaleString(), undefined]}
              labelFormatter={() => ''}
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={showTooltip ? { r: 3, strokeWidth: 0, fill: color } : false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </div>
  );
}

export { Sparkline };

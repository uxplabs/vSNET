'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export interface ChartCardDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartCardProps {
  title: string;
  /** Optional intro text shown below the title. */
  introText?: string;
  description?: string;
  /** When set, show only a KPI value (no chart). */
  kpiValue?: React.ReactNode;
  /** Optional large icon shown to the left of the KPI value. */
  kpiIcon?: React.ReactNode;
  /** Optional percentage or label shown to the right of the KPI value. */
  kpiPercentage?: React.ReactNode;
  /** Badge or label shown on the top line, aligned right (e.g. trend). */
  trendBadge?: React.ReactNode;
  /** Spark line data; when set with kpiValue, shows a small chart right-aligned with the KPI. */
  sparkLineData?: ChartCardDataPoint[];
  /** Data key for spark line (default: "value"). */
  sparkLineDataKey?: string;
  /** Chart data; required when not using kpiValue. */
  data?: ChartCardDataPoint[];
  /** Data key for the area value (e.g. "value", "total"). Must match a key in config. */
  dataKey?: string;
  /** Chart config for tooltip/legend. Keys must match data keys. */
  config?: ChartConfig;
  className?: string;
  /** Optional chart container class (e.g. for height) */
  chartClassName?: string;
}

const defaultConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1, 214 95% 50%))',
  },
};

/**
 * Chart card component based on [shadcn/ui Area Charts](https://ui.shadcn.com/charts/area).
 * Wraps an area chart in a Card with optional title and description.
 */
function ChartCard({
  title,
  introText,
  description,
  kpiValue,
  kpiIcon,
  kpiPercentage,
  trendBadge,
  sparkLineData,
  sparkLineDataKey = 'value',
  data = [],
  dataKey = 'value',
  config = defaultConfig,
  className,
  chartClassName,
}: ChartCardProps) {
  const chartConfig = React.useMemo(() => {
    const merged = { ...defaultConfig, ...config };
    if (!(dataKey in merged)) {
      merged[dataKey] = {
        label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
        color: 'hsl(var(--chart-1, 214 95% 50%))',
      };
    }
    return merged;
  }, [config, dataKey]);

  const isKpiOnly = kpiValue !== undefined;

  return (
    <Card className={cn('overflow-hidden transition-colors duration-200', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="mb-0 font-bold">{title}</CardTitle>
          {trendBadge != null ? (
            <span className="shrink-0">{trendBadge}</span>
          ) : null}
        </div>
        {introText && (
          <p className="text-sm text-muted-foreground">{introText}</p>
        )}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isKpiOnly ? (
          <div className="flex items-center gap-4 min-w-0">
            {kpiIcon != null && (
              <div className="flex shrink-0 items-center justify-center" aria-hidden>
                {kpiIcon}
              </div>
            )}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums text-foreground leading-none">
                  {kpiValue}
                </span>
                {kpiPercentage != null && (
                  <span className="text-lg font-medium tabular-nums text-muted-foreground">
                    {kpiPercentage}
                  </span>
                )}
              </div>
              {sparkLineData != null && sparkLineData.length > 0 && (
                <div className="w-24 h-10 shrink-0" aria-hidden>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={sparkLineData} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={false}
                        width={0}
                        domain={['dataMin', 'dataMax']}
                      />
                      <Line
                        type="monotone"
                        dataKey={sparkLineDataKey}
                        stroke="hsl(var(--chart-1, 214 95% 50%))"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className={cn('w-full', chartClassName)}>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={`var(--color-${dataKey})`}
                fill={`var(--color-${dataKey})`}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export { ChartCard };

'use client';

import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export interface KpiDonutCardSegment {
  name: string;
  value: number;
}

export interface KpiDonutCardProps {
  title: string;
  kpiValue: React.ReactNode;
  /** Donut segments: [{ name: 'A', value: 40 }, { name: 'B', value: 60 }] */
  donutData: KpiDonutCardSegment[];
  /** Optional trend badge in header. */
  trendBadge?: React.ReactNode;
  /** Chart config keys must match segment `name`. Each key gets a color. */
  config?: ChartConfig;
  className?: string;
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1, 214 95% 50%))',
  'hsl(var(--chart-2, 173 58% 39%))',
  'hsl(var(--chart-3, 197 37% 24%))',
  'hsl(var(--chart-4, 43 74% 66%))',
  'hsl(var(--chart-5, 27 87% 67%))',
];

function KpiDonutCard({
  title,
  kpiValue,
  donutData,
  trendBadge,
  config: configProp,
  className,
}: KpiDonutCardProps) {
  const config = React.useMemo(() => {
    const base: ChartConfig = {};
    donutData.forEach((seg, i) => {
      base[seg.name] = {
        label: seg.name,
        color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      };
    });
    return { ...base, ...configProp };
  }, [donutData, configProp]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="mb-0 font-bold">{title}</CardTitle>
          {trendBadge != null ? (
            <span className="shrink-0">{trendBadge}</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-3xl font-semibold tabular-nums text-foreground">
          {kpiValue}
        </div>
        <div className="flex items-center gap-4">
          <ChartContainer
            config={config}
            className="h-[160px] w-[160px] shrink-0 [&_.recharts-pie]:outline-none"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel indicator="line" />}
              />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={64}
                strokeWidth={0}
                paddingAngle={1}
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      config[entry.name]?.color ??
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-col gap-2 text-sm">
            {donutData.map((entry, index) => {
              const color =
                config[entry.name]?.color ??
                DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 [&_svg]:h-3 [&_svg]:w-3 [&_svg]:text-muted-foreground"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-muted-foreground">
                    {config[entry.name]?.label ?? entry.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { KpiDonutCard };

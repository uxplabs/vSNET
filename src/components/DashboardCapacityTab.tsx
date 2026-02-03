'use client';

import * as React from 'react';
import { Icon } from './Icon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { KpiDonutCard } from './KpiDonutCard';

interface CapacityOverview {
  devices: {
    total: number;
    connected: number;
    disconnected: number;
    kpiSyncErrors: number;
  };
  radio: {
    total: number;
    connected: number;
    disconnected: number;
    connectedFree: number;
    connectedUsed: number;
    disconnectedFree: number;
    disconnectedUsed: number;
  };
  alarms: {
    critical: number;
    major: number;
    minor: number;
  };
}

export interface DashboardCapacityTabProps {
  overviewData: CapacityOverview;
}

const STORAGE_DATA = [
  { title: 'Log files storage', used: 138, total: 256 },
  { title: 'PM files storage', used: 182, total: 320 },
  { title: 'vSNET database', used: 420, total: 512 },
  { title: 'KPI database', used: 268, total: 384 },
] as const;

const REGISTERED_DEVICE_CAPACITY = 650;

export function DashboardCapacityTab({ overviewData }: DashboardCapacityTabProps) {
  const registeredDevices = overviewData.devices.total;
  const offlineDevices = overviewData.devices.disconnected;
  const registeredPercent = Math.min(registeredDevices / REGISTERED_DEVICE_CAPACITY, 1) * 100;
  const offlinePercent =
    overviewData.devices.total > 0
      ? (offlineDevices / overviewData.devices.total) * 100
      : 0;

  const renderMetricCard = (
    title: string,
    iconName: string,
    numerator: number,
    denominator: number,
    percent: number
  ) => (
    <Card key={title}>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>
        <div className="flex items-baseline gap-2">
          <Icon
            name={iconName}
            size={24}
            className="text-muted-foreground shrink-0"
            aria-hidden
          />
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {numerator.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-lg tabular-nums">
              / {denominator.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">
          {percent.toFixed(1)}% of capacity
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {renderMetricCard(
            'Registered devices',
            'inventory_2',
            registeredDevices,
            REGISTERED_DEVICE_CAPACITY,
            registeredPercent
          )}
          {renderMetricCard(
            'Offline devices',
            'power_off',
            offlineDevices,
            overviewData.devices.total,
            offlinePercent
          )}
        </div>
      </section>

      <section>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {STORAGE_DATA.map((metric) => {
            const free = metric.total - metric.used;
            const percentUsed = Math.round((metric.used / metric.total) * 100);
            return (
              <KpiDonutCard
                key={metric.title}
                title={metric.title}
                kpiValue={`${metric.used} GB`}
                kpiPercentage={`${percentUsed}% used`}
                donutData={[
                  {
                    name: 'Free',
                    value: free,
                    legendLabel: `${free} GB Free`,
                  },
                  {
                    name: 'Used',
                    value: metric.used,
                    legendLabel: `${metric.used} GB Used`,
                  },
                  {
                    name: 'Total',
                    value: metric.total,
                    legendLabel: `${metric.total} GB Total`,
                    legendOnly: true,
                  },
                ]}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

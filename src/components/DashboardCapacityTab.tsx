'use client';

import * as React from 'react';
import { Icon } from './Icon';
import { StatCard } from './ui/stat-card';
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
  { title: 'AMS database', used: 420, total: 512 },
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

  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <StatCard
            name="Registered devices"
            value={`${registeredDevices.toLocaleString()} / ${REGISTERED_DEVICE_CAPACITY.toLocaleString()}`}
            icon={<Icon name="inventory_2" size={16} />}
            change={`${registeredPercent.toFixed(1)}%`}
            changeDirection="up"
            changeLabel="of capacity"
            sparkline={[
              { value: Math.round(registeredDevices * 0.88) },
              { value: Math.round(registeredDevices * 0.91) },
              { value: Math.round(registeredDevices * 0.94) },
              { value: Math.round(registeredDevices * 0.97) },
              { value: registeredDevices },
            ]}
          />
          <StatCard
            name="Offline devices"
            value={`${offlineDevices.toLocaleString()} / ${overviewData.devices.total.toLocaleString()}`}
            icon={<Icon name="power_off" size={16} />}
            change={`${offlinePercent.toFixed(1)}%`}
            changeDirection="down"
            changeLabel="of total"
            sparkline={[
              { value: offlineDevices + 2 },
              { value: offlineDevices + 5 },
              { value: offlineDevices + 1 },
              { value: offlineDevices + 3 },
              { value: offlineDevices },
            ]}
            sparklineColor="var(--destructive)"
          />
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

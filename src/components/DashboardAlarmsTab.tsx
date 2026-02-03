'use client';

import * as React from 'react';
import { Icon } from './Icon';
import { ChartCard } from './ChartCard';
import { DisconnectedDevicesCard } from './disconnected-devices-card';
import { DisconnectedRadioNodesCard } from './disconnected-radio-nodes-card';
import { TopOffendersCard } from './top-offenders-card';
import { AlarmsTableCard } from './alarms-table-card';
import { TrendBadge } from './TrendBadge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const EventsDataTable = React.lazy(() =>
  import('./events-data-table').then((m) => ({ default: m.EventsDataTable }))
);

export interface DashboardAlarmsTabProps {
  overviewData: {
    alarms: { critical: number; major: number; minor: number };
  };
  alarmsSeverityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  region?: string;
  alarmsTableRef: React.RefObject<HTMLDivElement | null>;
  scrollToAlarmsAndFilter: (severity: string) => void;
}

export function DashboardAlarmsTab({
  overviewData,
  alarmsSeverityFilter,
  onSeverityFilterChange,
  region,
  alarmsTableRef,
  scrollToAlarmsAndFilter,
}: DashboardAlarmsTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => scrollToAlarmsAndFilter('Critical')}
            onKeyDown={(e) => e.key === 'Enter' && scrollToAlarmsAndFilter('Critical')}
            className="cursor-pointer rounded-lg transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChartCard
              title="Critical"
              kpiValue={overviewData.alarms.critical}
              kpiIcon={<Icon name="error" size={48} className="text-destructive" />}
              trendBadge={<TrendBadge direction="up">↑ 1</TrendBadge>}
              sparkLineData={[
                { name: '1', value: overviewData.alarms.critical + 1 },
                { name: '2', value: Math.max(0, overviewData.alarms.critical - 1) },
                { name: '3', value: overviewData.alarms.critical + 2 },
                { name: '4', value: Math.max(0, overviewData.alarms.critical - 2) },
                { name: '5', value: overviewData.alarms.critical },
              ]}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => scrollToAlarmsAndFilter('Major')}
            onKeyDown={(e) => e.key === 'Enter' && scrollToAlarmsAndFilter('Major')}
            className="cursor-pointer rounded-lg transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChartCard
              title="Major"
              kpiValue={overviewData.alarms.major}
              kpiIcon={<Icon name="error_outline" size={48} className="text-amber-600 dark:text-amber-500" />}
              trendBadge={<TrendBadge direction="down">↓ 2</TrendBadge>}
              sparkLineData={[
                { name: '1', value: overviewData.alarms.major + 2 },
                { name: '2', value: overviewData.alarms.major + 4 },
                { name: '3', value: overviewData.alarms.major - 1 },
                { name: '4', value: overviewData.alarms.major + 3 },
                { name: '5', value: overviewData.alarms.major },
              ]}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => scrollToAlarmsAndFilter('Minor')}
            onKeyDown={(e) => e.key === 'Enter' && scrollToAlarmsAndFilter('Minor')}
            className="cursor-pointer rounded-lg transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChartCard
              title="Minor"
              kpiValue={overviewData.alarms.minor}
              kpiIcon={<Icon name="warning" size={48} className="text-amber-600 dark:text-amber-500" />}
              trendBadge={<TrendBadge direction="up">↑ 5</TrendBadge>}
              sparkLineData={[
                { name: '1', value: overviewData.alarms.minor - 3 },
                { name: '2', value: overviewData.alarms.minor + 2 },
                { name: '3', value: overviewData.alarms.minor - 6 },
                { name: '4', value: overviewData.alarms.minor - 2 },
                { name: '5', value: overviewData.alarms.minor },
              ]}
            />
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisconnectedDevicesCard />
        <DisconnectedRadioNodesCard />
      </section>
      <section>
        <TopOffendersCard />
      </section>
      <section ref={alarmsTableRef}>
        <AlarmsTableCard
          severityFilter={alarmsSeverityFilter}
          onSeverityFilterChange={onSeverityFilterChange}
          regionFilter={region}
          pageSize={15}
        />
      </section>
      <section id="dashboard-events" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <React.Suspense fallback={<div className="rounded border bg-muted/30 p-8 text-center text-muted-foreground text-sm">Loading events…</div>}>
              <EventsDataTable pageSize={15} />
            </React.Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

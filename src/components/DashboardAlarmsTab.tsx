'use client';

import * as React from 'react';
import { Icon } from './Icon';
import { StatCard } from './ui/stat-card';
import { DisconnectedDevicesCard } from './disconnected-devices-card';
import { DisconnectedRadioNodesCard } from './disconnected-radio-nodes-card';
import { TopOffendersCard } from './top-offenders-card';
import { AlarmsTableCard } from './alarms-table-card';
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
  regions?: string[];
  alarmsTableRef: React.RefObject<HTMLDivElement | null>;
  scrollToAlarmsAndFilter: (severity: string) => void;
}

export function DashboardAlarmsTab({
  overviewData,
  alarmsSeverityFilter,
  onSeverityFilterChange,
  region,
  regions,
  alarmsTableRef,
  scrollToAlarmsAndFilter,
}: DashboardAlarmsTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            name="Critical"
            value={overviewData.alarms.critical}
            icon={<Icon name="error" size={16} className="text-destructive" />}
            change="1"
            changeDirection="up"
            changeLabel="past 24h"
            onClick={() => scrollToAlarmsAndFilter('Critical')}
            sparkline={[{ value: overviewData.alarms.critical + 1 }, { value: Math.max(0, overviewData.alarms.critical - 1) }, { value: overviewData.alarms.critical + 2 }, { value: Math.max(0, overviewData.alarms.critical - 2) }, { value: overviewData.alarms.critical }]}
            sparklineColor="var(--destructive)"
          />
          <StatCard
            name="Major"
            value={overviewData.alarms.major}
            icon={<Icon name="error_outline" size={16} className="text-warning" />}
            change="2"
            changeDirection="down"
            changeLabel="past 24h"
            onClick={() => scrollToAlarmsAndFilter('Major')}
            sparkline={[{ value: overviewData.alarms.major + 2 }, { value: overviewData.alarms.major + 4 }, { value: overviewData.alarms.major - 1 }, { value: overviewData.alarms.major + 3 }, { value: overviewData.alarms.major }]}
            sparklineColor="var(--warning)"
          />
          <StatCard
            name="Minor"
            value={overviewData.alarms.minor}
            icon={<Icon name="warning" size={16} className="text-warning" />}
            change="5"
            changeDirection="up"
            changeLabel="past 24h"
            onClick={() => scrollToAlarmsAndFilter('Minor')}
            sparkline={[{ value: overviewData.alarms.minor - 3 }, { value: overviewData.alarms.minor + 2 }, { value: overviewData.alarms.minor - 6 }, { value: overviewData.alarms.minor - 2 }, { value: overviewData.alarms.minor }]}
            sparklineColor="var(--warning)"
          />
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
          selectedRegions={regions}
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

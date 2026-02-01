import React from 'react';
import { Navbar01 } from './navbar-01';
import { Icon } from './Icon';
import { ChartCard } from './ChartCard';
import { DisconnectedDevicesCard } from './disconnected-devices-card';
import { DisconnectedRadioNodesCard } from './disconnected-radio-nodes-card';
import { CriticalAlarmsCard } from './critical-alarms-card';
import { MajorAlarmsCard } from './major-alarms-card';
import { RegionsDataTable } from './regions-table';
import { TopOffendersCard } from './top-offenders-card';
import { AlarmsTableCard } from './alarms-table-card';
import { KpiDonutCard } from './KpiDonutCard';
import { TrendBadge } from './TrendBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const DASHBOARD_TABS = [
  { value: 'network-overview', label: 'Network overview' },
  { value: 'alarms', label: 'Alarms' },
  { value: 'kpi-thresholds', label: 'KPI thresholds' },
  { value: 'special-events', label: 'Special events' },
  { value: 'capacity', label: 'Capacity' },
] as const;

export interface DashboardPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string) => void;
  region?: string;
  onRegionChange?: (region: string) => void;
}

function DashboardPage({ appName = 'vSNET', onSignOut, onNavigate, region, onRegionChange }: DashboardPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar01 appName={appName} onSignOut={onSignOut} onNavigate={onNavigate} currentSection="dashboard" region={region} onRegionChange={onRegionChange} />
      <main id="dashboard" className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          {region && (
            <p className="text-sm text-muted-foreground mt-1">
              Region: {region}
            </p>
          )}
        </div>
        <Tabs defaultValue={DASHBOARD_TABS[0].value} className="w-full">
          <TabsList className="inline-flex flex-wrap h-auto gap-1 bg-muted p-1">
            {DASHBOARD_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DASHBOARD_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {tab.value === 'network-overview' ? (
                <div className="space-y-8">
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="smartphone" size={20} className="text-muted-foreground" />
                      Devices
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <ChartCard
                        title="Total"
                        kpiValue={500}
                        trendBadge={<TrendBadge direction="up">↑ 12%</TrendBadge>}
                      />
                      <ChartCard
                        title="Connected"
                        kpiValue={342}
                        trendBadge={<TrendBadge direction="up">↑ 8%</TrendBadge>}
                      />
                      <ChartCard
                        title="Disconnected"
                        kpiValue={12}
                        trendBadge={<TrendBadge direction="down">↓ 3%</TrendBadge>}
                      />
                      <ChartCard
                        title="Ungrouped"
                        kpiValue={146}
                        trendBadge={<TrendBadge direction="up">↑ 2%</TrendBadge>}
                      />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="router" size={20} className="text-muted-foreground" />
                      Radio nodes
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <KpiDonutCard
                        title="Total"
                        kpiValue={248}
                        trendBadge={<TrendBadge direction="up">↑ 5%</TrendBadge>}
                        donutData={[
                          { name: 'Active', value: 180 },
                          { name: 'Standby', value: 48 },
                          { name: 'Offline', value: 20 },
                        ]}
                      />
                      <KpiDonutCard
                        title="Connected"
                        kpiValue={228}
                        trendBadge={<TrendBadge direction="up">↑ 2%</TrendBadge>}
                        donutData={[
                          { name: 'Sub-6', value: 140 },
                          { name: 'mmWave', value: 68 },
                          { name: 'Other', value: 20 },
                        ]}
                      />
                      <KpiDonutCard
                        title="Disconnected"
                        kpiValue={20}
                        trendBadge={<TrendBadge direction="down">↓ 1%</TrendBadge>}
                        donutData={[
                          { name: 'Maintenance', value: 12 },
                          { name: 'Fault', value: 5 },
                          { name: 'Unknown', value: 3 },
                        ]}
                      />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="error" size={20} className="text-muted-foreground" />
                      Alarms
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <ChartCard
                        title="Critical"
                        kpiValue={3}
                        kpiIcon={<Icon name="error" size={48} className="text-destructive" />}
                        trendBadge={<TrendBadge direction="up">↑ 1</TrendBadge>}
                      />
                      <ChartCard
                        title="Major"
                        kpiValue={12}
                        kpiIcon={<Icon name="error_outline" size={48} className="text-amber-600 dark:text-amber-500" />}
                        trendBadge={<TrendBadge direction="down">↓ 2</TrendBadge>}
                      />
                      <ChartCard
                        title="Minor"
                        kpiValue={28}
                        kpiIcon={<Icon name="warning" size={48} className="text-amber-600 dark:text-amber-500" />}
                        trendBadge={<TrendBadge direction="up">↑ 5</TrendBadge>}
                      />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="public" size={20} className="text-muted-foreground" />
                      Regions
                    </h2>
                    <RegionsDataTable />
                  </section>
                </div>
              ) : tab.value === 'alarms' ? (
                <div className="space-y-8">
                  <section>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <ChartCard
                        title="Critical"
                        kpiValue={3}
                        kpiIcon={<Icon name="error" size={48} className="text-destructive" />}
                        trendBadge={<TrendBadge direction="up">↑ 1</TrendBadge>}
                      />
                      <ChartCard
                        title="Major"
                        kpiValue={12}
                        kpiIcon={<Icon name="error_outline" size={48} className="text-amber-600 dark:text-amber-500" />}
                        trendBadge={<TrendBadge direction="down">↓ 2</TrendBadge>}
                      />
                      <ChartCard
                        title="Minor"
                        kpiValue={28}
                        kpiIcon={<Icon name="warning" size={48} className="text-amber-600 dark:text-amber-500" />}
                        trendBadge={<TrendBadge direction="up">↑ 5</TrendBadge>}
                      />
                    </div>
                  </section>
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DisconnectedDevicesCard />
                    <DisconnectedRadioNodesCard />
                  </section>
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CriticalAlarmsCard />
                    <MajorAlarmsCard />
                  </section>
                  <section>
                    <TopOffendersCard />
                  </section>
                  <section>
                    <AlarmsTableCard />
                  </section>
                </div>
              ) : (
                <div className="rounded-lg border bg-card p-6 text-card-foreground">
                  <p className="text-muted-foreground">{tab.label} content.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

export default DashboardPage;

import React, { useState, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { Navbar01 } from './navbar-01';
import { Icon } from './Icon';
import { ChartCard } from './ChartCard';
import { RegionsDataTable, getRegionRow, getAggregatedRegionData } from './regions-table';

const RegionsMap = lazy(() => import('./regions-map').then((m) => ({ default: m.RegionsMap })));
const DashboardAlarmsTab = lazy(() => import('./DashboardAlarmsTab').then((m) => ({ default: m.DashboardAlarmsTab })));
const DashboardCapacityTab = lazy(() => import('./DashboardCapacityTab').then((m) => ({ default: m.DashboardCapacityTab })));
import { TrendBadge } from './TrendBadge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';

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
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

const ALL_DEVICES = { total: 500, connected: 342, disconnected: 12, kpiSyncErrors: 8 };
const ALL_RADIO = { total: 248, connected: 228, disconnected: 20, connectedFree: 140, connectedUsed: 88, disconnectedFree: 12, disconnectedUsed: 8 };
const ALL_ALARMS = { critical: 11, major: 14, minor: 10 };

function DashboardPage({ appName = 'vSNET', onSignOut, onNavigate, region, regions, onRegionChange, onRegionsChange, fixedRegion }: DashboardPageProps) {
  const alarmsTableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(DASHBOARD_TABS[0].value);
  const [alarmsSeverityFilter, setAlarmsSeverityFilter] = useState<string>('All');
  const [mapVisible, setMapVisible] = useState(true);

  const overviewData = useMemo(() => {
    const agg = getAggregatedRegionData();
    const regionRow = region && region !== 'All' ? getRegionRow(region) : null;
    if (!regionRow) {
      const ratio = 1;
      return {
        devices: ALL_DEVICES,
        radio: ALL_RADIO,
        alarms: ALL_ALARMS,
      };
    }
    const ratio = regionRow.totalDevices / agg.totalDevices;
    return {
      devices: {
        total: regionRow.totalDevices,
        connected: regionRow.connected,
        disconnected: regionRow.disconnected,
        kpiSyncErrors: regionRow.kpiSyncErrors,
      },
      radio: {
        total: Math.round(ALL_RADIO.total * ratio),
        connected: Math.round(ALL_RADIO.connected * ratio),
        disconnected: Math.round(ALL_RADIO.disconnected * ratio),
        connectedFree: Math.round(ALL_RADIO.connectedFree * ratio),
        connectedUsed: Math.round(ALL_RADIO.connectedUsed * ratio),
        disconnectedFree: Math.round(ALL_RADIO.disconnectedFree * ratio),
        disconnectedUsed: Math.round(ALL_RADIO.disconnectedUsed * ratio),
      },
      alarms: {
        critical: Math.max(0, Math.round(ALL_ALARMS.critical * ratio)),
        major: Math.max(0, Math.round(ALL_ALARMS.major * ratio)),
        minor: Math.max(0, Math.round(ALL_ALARMS.minor * ratio)),
      },
    };
  }, [region]);

  const scrollToAlarmsAndFilter = useCallback((severity: string) => {
    setAlarmsSeverityFilter(severity);
    setTimeout(() => {
      alarmsTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar01 appName={appName} onSignOut={onSignOut} onNavigate={onNavigate} currentSection="dashboard" region={region} regions={regions} onRegionChange={onRegionChange} onRegionsChange={onRegionsChange} fixedRegion={fixedRegion} />
      <main id="dashboard" className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-14 z-10 -mt-6 -mb-6 flex flex-wrap items-center gap-4 bg-background/80 backdrop-blur-sm pt-6 pb-6">
            <TabsList className="inline-flex flex-wrap h-auto gap-1 bg-muted p-1">
              {DASHBOARD_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="mt-8">
            {activeTab === 'network-overview' && (
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Icon name="smartphone" size={20} className="text-muted-foreground" />
                        Devices
                      </h2>
                      <Button
                        variant={mapVisible ? 'secondary' : 'outline'}
                        size="icon"
                        onClick={() => setMapVisible((v) => !v)}
                        title={mapVisible ? 'Hide map' : 'Show map'}
                        aria-pressed={mapVisible}
                      >
                        <Icon name="map" size={20} />
                      </Button>
                    </div>
                    {mapVisible && (
                      <div className="mb-6">
                        <Suspense fallback={<div className="rounded-lg border bg-card h-[400px] flex items-center justify-center bg-muted/30"><span className="text-muted-foreground text-sm">Loading map…</span></div>}>
                          <RegionsMap region={region} onRegionChange={onRegionChange} />
                        </Suspense>
                      </div>
                    )}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <ChartCard
                        title="Total"
                        kpiValue={overviewData.devices.total}
                        kpiIcon={<Icon name="devices" size={36} className="text-muted-foreground" />}
                        trendBadge={<TrendBadge direction="up">↑ 12%</TrendBadge>}
                        sparkLineData={[
                          { name: '1', value: Math.round(overviewData.devices.total * 0.93) },
                          { name: '2', value: Math.round(overviewData.devices.total * 0.9) },
                          { name: '3', value: Math.round(overviewData.devices.total * 0.96) },
                          { name: '4', value: Math.round(overviewData.devices.total * 0.92) },
                          { name: '5', value: overviewData.devices.total },
                        ]}
                      />
                      <ChartCard
                        title="Connected"
                        kpiValue={overviewData.devices.connected}
                        kpiIcon={<Icon name="link" size={36} className="text-emerald-600 dark:text-emerald-500" />}
                        trendBadge={<TrendBadge direction="up">↑ 8%</TrendBadge>}
                        sparkLineData={[
                          { name: '1', value: Math.round(overviewData.devices.connected * 0.96) },
                          { name: '2', value: Math.round(overviewData.devices.connected * 0.98) },
                          { name: '3', value: Math.round(overviewData.devices.connected * 0.93) },
                          { name: '4', value: Math.round(overviewData.devices.connected * 0.99) },
                          { name: '5', value: overviewData.devices.connected },
                        ]}
                      />
                      <ChartCard
                        title="Disconnected"
                        kpiValue={overviewData.devices.disconnected}
                        kpiIcon={<Icon name="link_off" size={36} className="text-destructive" />}
                        trendBadge={<TrendBadge direction="down">↓ 3%</TrendBadge>}
                        sparkLineData={[
                          { name: '1', value: overviewData.devices.disconnected + 3 },
                          { name: '2', value: overviewData.devices.disconnected + 6 },
                          { name: '3', value: overviewData.devices.disconnected + 2 },
                          { name: '4', value: overviewData.devices.disconnected + 4 },
                          { name: '5', value: overviewData.devices.disconnected },
                        ]}
                      />
                      <ChartCard
                        title="KPI sync error"
                        kpiValue={overviewData.devices.kpiSyncErrors}
                        kpiIcon={<Icon name="sync_problem" size={36} className="text-amber-600 dark:text-amber-500" />}
                        trendBadge={<TrendBadge direction="down">↓ 2</TrendBadge>}
                        sparkLineData={[
                          { name: '1', value: overviewData.devices.kpiSyncErrors + 4 },
                          { name: '2', value: overviewData.devices.kpiSyncErrors + 2 },
                          { name: '3', value: overviewData.devices.kpiSyncErrors + 6 },
                          { name: '4', value: overviewData.devices.kpiSyncErrors + 1 },
                          { name: '5', value: overviewData.devices.kpiSyncErrors },
                        ]}
                      />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="router" size={20} className="text-muted-foreground" />
                      Radio nodes
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <ChartCard
                        title="Total"
                        kpiValue={overviewData.radio.total}
                        kpiIcon={<Icon name="device_hub" size={36} className="text-muted-foreground" />}
                        sparkLineData={[
                          { name: '1', value: Math.round(overviewData.radio.total * 0.92) },
                          { name: '2', value: Math.round(overviewData.radio.total * 0.94) },
                          { name: '3', value: Math.round(overviewData.radio.total * 0.9) },
                          { name: '4', value: Math.round(overviewData.radio.total * 0.96) },
                          { name: '5', value: overviewData.radio.total },
                        ]}
                      />
                      <ChartCard
                        title="Connected"
                        kpiValue={overviewData.radio.connected}
                        kpiIcon={<Icon name="link" size={36} className="text-emerald-600 dark:text-emerald-500" />}
                        sparkLineData={[
                          { name: '1', value: Math.round(overviewData.radio.connected * 0.96) },
                          { name: '2', value: Math.round(overviewData.radio.connected * 0.98) },
                          { name: '3', value: Math.round(overviewData.radio.connected * 0.94) },
                          { name: '4', value: Math.round(overviewData.radio.connected * 0.99) },
                          { name: '5', value: overviewData.radio.connected },
                        ]}
                      />
                      <ChartCard
                        title="Disconnected"
                        kpiValue={overviewData.radio.disconnected}
                        kpiIcon={<Icon name="link_off" size={36} className="text-destructive" />}
                        sparkLineData={[
                          { name: '1', value: overviewData.radio.disconnected + 3 },
                          { name: '2', value: overviewData.radio.disconnected + 1 },
                          { name: '3', value: overviewData.radio.disconnected + 4 },
                          { name: '4', value: overviewData.radio.disconnected + 2 },
                          { name: '5', value: overviewData.radio.disconnected },
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
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="public" size={20} className="text-muted-foreground" />
                      Regions
                    </h2>
                    <RegionsDataTable regionFilter={region} />
                  </section>
                </div>
            )}
            {activeTab === 'alarms' && (
                <Suspense fallback={<div className="rounded-lg border bg-card p-8 flex items-center justify-center"><span className="text-muted-foreground">Loading alarms…</span></div>}>
                  <DashboardAlarmsTab
                    overviewData={overviewData}
                    alarmsSeverityFilter={alarmsSeverityFilter}
                    onSeverityFilterChange={setAlarmsSeverityFilter}
                    region={region}
                    alarmsTableRef={alarmsTableRef}
                    scrollToAlarmsAndFilter={scrollToAlarmsAndFilter}
                  />
                </Suspense>
            )}
            {activeTab === 'capacity' && (
                <Suspense fallback={<div className="rounded-lg border bg-card p-8 flex items-center justify-center"><span className="text-muted-foreground">Loading capacity…</span></div>}>
                  <DashboardCapacityTab overviewData={overviewData} />
                </Suspense>
            )}
            {activeTab !== 'network-overview' && activeTab !== 'alarms' && activeTab !== 'capacity' && (
              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <p className="text-muted-foreground">{DASHBOARD_TABS.find((t) => t.value === activeTab)?.label ?? activeTab} content.</p>
              </div>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
}

export default DashboardPage;

import React, { useState, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { Navbar01 } from './navbar-01';
import { Icon } from './Icon';
import { StatCard } from './ui/stat-card';
import { RegionsDataTable, getRegionRow, getAggregatedRegionData } from './regions-table';
import { DEVICES_DATA } from './devices-data-table';
import { ALARMS_DATA } from './alarms-data-table';

const RegionsMap = lazy(() => import('./regions-map').then((m) => ({ default: m.RegionsMap })));
const DashboardAlarmsTab = lazy(() => import('./DashboardAlarmsTab').then((m) => ({ default: m.DashboardAlarmsTab })));
const DashboardCapacityTab = lazy(() => import('./DashboardCapacityTab').then((m) => ({ default: m.DashboardCapacityTab })));
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
  onNavigate?: (page: string, tab?: string, filters?: { statusFilter?: string; configStatusFilter?: string }) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

const ALL_DEVICES = {
  total: DEVICES_DATA.length,
  connected: DEVICES_DATA.filter((d) => d.status === 'Connected').length,
  disconnected: DEVICES_DATA.filter((d) => d.status === 'Disconnected').length,
  kpiSyncErrors: DEVICES_DATA.filter((d) => d.configStatus === 'Out of sync').length,
};
const ALL_RADIO = {
  total: Math.round(DEVICES_DATA.length * 2.1),
  connected: Math.round(DEVICES_DATA.filter((d) => d.status === 'Connected').length * 2.1),
  disconnected: Math.round(DEVICES_DATA.filter((d) => d.status !== 'Connected').length * 1.4),
  connectedFree: Math.round(DEVICES_DATA.filter((d) => d.status === 'Connected').length * 1.3),
  connectedUsed: Math.round(DEVICES_DATA.filter((d) => d.status === 'Connected').length * 0.8),
  disconnectedFree: Math.round(DEVICES_DATA.filter((d) => d.status !== 'Connected').length * 0.6),
  disconnectedUsed: Math.round(DEVICES_DATA.filter((d) => d.status !== 'Connected').length * 0.8),
};
const ALL_ALARMS = {
  critical: ALARMS_DATA.filter((a) => a.severity === 'Critical').length,
  major: ALARMS_DATA.filter((a) => a.severity === 'Major').length,
  minor: ALARMS_DATA.filter((a) => a.severity === 'Minor').length,
};

function DashboardPage({ appName = 'AMS', onSignOut, onNavigate, region, regions, onRegionChange, onRegionsChange, fixedRegion }: DashboardPageProps) {
  const alarmsTableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>(DASHBOARD_TABS[0].value);
  const [alarmsSeverityFilter, setAlarmsSeverityFilter] = useState<string>('All');
  const [mapVisible, setMapVisible] = useState(true);

  const overviewData = useMemo(() => {
    const agg = getAggregatedRegionData();
    
    // Check if "All" is selected or no specific regions
    const isAll = !regions || regions.length === 0 || regions.includes('All');
    
    if (isAll) {
      return {
        devices: ALL_DEVICES,
        radio: ALL_RADIO,
        alarms: ALL_ALARMS,
      };
    }
    
    // Aggregate data from all selected regions
    const aggregatedDevices = { total: 0, connected: 0, disconnected: 0, kpiSyncErrors: 0 };
    
    regions.forEach((r) => {
      const regionRow = getRegionRow(r);
      if (regionRow) {
        aggregatedDevices.total += regionRow.totalDevices;
        aggregatedDevices.connected += regionRow.connected;
        aggregatedDevices.disconnected += regionRow.disconnected;
        aggregatedDevices.kpiSyncErrors += regionRow.kpiSyncErrors;
      }
    });
    
    // If no valid regions found, return all data
    if (aggregatedDevices.total === 0) {
      return {
        devices: ALL_DEVICES,
        radio: ALL_RADIO,
        alarms: ALL_ALARMS,
      };
    }
    
    const ratio = aggregatedDevices.total / agg.totalDevices;
    
    return {
      devices: aggregatedDevices,
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
  }, [regions]);

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
                          <RegionsMap region={region} regions={regions} onRegionChange={onRegionChange} />
                        </Suspense>
                      </div>
                    )}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard name="Total" value={overviewData.devices.total} icon={<Icon name="devices" size={16} />} change="12%" changeDirection="up" changeLabel="past 24h" onClick={() => onNavigate?.('devices', 'device')} sparkline={[{ value: Math.round(overviewData.devices.total * 0.93) }, { value: Math.round(overviewData.devices.total * 0.9) }, { value: Math.round(overviewData.devices.total * 0.96) }, { value: Math.round(overviewData.devices.total * 0.92) }, { value: overviewData.devices.total }]} />
                      <StatCard name="Connected" value={overviewData.devices.connected} icon={<Icon name="link" size={16} />} change="8%" changeDirection="up" changeLabel="past 24h" onClick={() => onNavigate?.('devices', 'device', { statusFilter: 'Connected' })} sparkline={[{ value: Math.round(overviewData.devices.connected * 0.96) }, { value: Math.round(overviewData.devices.connected * 0.98) }, { value: Math.round(overviewData.devices.connected * 0.93) }, { value: Math.round(overviewData.devices.connected * 0.99) }, { value: overviewData.devices.connected }]} sparklineColor="var(--success)" />
                      <StatCard name="Disconnected" value={overviewData.devices.disconnected} icon={<Icon name="link_off" size={16} />} change="3%" changeDirection="down" changeLabel="past 24h" onClick={() => onNavigate?.('devices', 'device', { statusFilter: 'Disconnected' })} sparkline={[{ value: overviewData.devices.disconnected + 3 }, { value: overviewData.devices.disconnected + 6 }, { value: overviewData.devices.disconnected + 2 }, { value: overviewData.devices.disconnected + 4 }, { value: overviewData.devices.disconnected }]} sparklineColor="var(--destructive)" />
                      <StatCard name="KPI sync error" value={overviewData.devices.kpiSyncErrors} icon={<Icon name="sync_problem" size={16} />} change="2" changeDirection="down" changeLabel="past 24h" onClick={() => onNavigate?.('devices', 'device', { configStatusFilter: 'Out of sync' })} sparkline={[{ value: overviewData.devices.kpiSyncErrors + 4 }, { value: overviewData.devices.kpiSyncErrors + 2 }, { value: overviewData.devices.kpiSyncErrors + 6 }, { value: overviewData.devices.kpiSyncErrors + 1 }, { value: overviewData.devices.kpiSyncErrors }]} sparklineColor="var(--warning)" />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="router" size={20} className="text-muted-foreground" />
                      Radio nodes
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <StatCard name="Total" value={overviewData.radio.total} icon={<Icon name="device_hub" size={16} />} change="5%" changeDirection="up" changeLabel="past 24h" sparkline={[{ value: Math.round(overviewData.radio.total * 0.92) }, { value: Math.round(overviewData.radio.total * 0.94) }, { value: Math.round(overviewData.radio.total * 0.9) }, { value: Math.round(overviewData.radio.total * 0.96) }, { value: overviewData.radio.total }]} />
                      <StatCard name="Connected" value={overviewData.radio.connected} icon={<Icon name="link" size={16} />} change="4%" changeDirection="up" changeLabel="past 24h" sparkline={[{ value: Math.round(overviewData.radio.connected * 0.96) }, { value: Math.round(overviewData.radio.connected * 0.98) }, { value: Math.round(overviewData.radio.connected * 0.94) }, { value: Math.round(overviewData.radio.connected * 0.99) }, { value: overviewData.radio.connected }]} sparklineColor="var(--success)" />
                      <StatCard name="Disconnected" value={overviewData.radio.disconnected} icon={<Icon name="link_off" size={16} />} change="1" changeDirection="down" changeLabel="past 24h" sparkline={[{ value: overviewData.radio.disconnected + 3 }, { value: overviewData.radio.disconnected + 1 }, { value: overviewData.radio.disconnected + 4 }, { value: overviewData.radio.disconnected + 2 }, { value: overviewData.radio.disconnected }]} sparklineColor="var(--destructive)" />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="error" size={20} className="text-muted-foreground" />
                      Alarms
                    </h2>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      <StatCard name="Critical" value={overviewData.alarms.critical} icon={<Icon name="error" size={16} className="text-destructive" />} change="1" changeDirection="up" changeLabel="past 24h" sparkline={[{ value: overviewData.alarms.critical + 1 }, { value: Math.max(0, overviewData.alarms.critical - 1) }, { value: overviewData.alarms.critical + 2 }, { value: Math.max(0, overviewData.alarms.critical - 2) }, { value: overviewData.alarms.critical }]} sparklineColor="var(--destructive)" />
                      <StatCard name="Major" value={overviewData.alarms.major} icon={<Icon name="error_outline" size={16} className="text-warning" />} change="2" changeDirection="down" changeLabel="past 24h" sparkline={[{ value: overviewData.alarms.major + 2 }, { value: overviewData.alarms.major + 4 }, { value: overviewData.alarms.major - 1 }, { value: overviewData.alarms.major + 3 }, { value: overviewData.alarms.major }]} sparklineColor="var(--warning)" />
                      <StatCard name="Minor" value={overviewData.alarms.minor} icon={<Icon name="warning" size={16} className="text-warning" />} change="5" changeDirection="up" changeLabel="past 24h" sparkline={[{ value: overviewData.alarms.minor - 3 }, { value: overviewData.alarms.minor + 2 }, { value: overviewData.alarms.minor - 6 }, { value: overviewData.alarms.minor - 2 }, { value: overviewData.alarms.minor }]} sparklineColor="var(--warning)" />
                    </div>
                  </section>
                  <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Icon name="public" size={20} className="text-muted-foreground" />
                      Regions
                    </h2>
                    <RegionsDataTable regionsFilter={regions} />
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
                    regions={regions}
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

import React, { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DevicesDataTable, DEVICES_DATA, getDeviceSidebarCounts } from './devices-data-table';
import { AlarmsDataTable } from './alarms-data-table';
import { EventsDataTable } from './events-data-table';
import { ScheduledTasksDataTable } from './scheduled-tasks-data-table';
import { SoftwareManagementDataTable } from './software-management-data-table';
import { SoftwareImagesTab } from './software-images-tab';
import { ActivityLogDataTable } from './activity-log-data-table';
import { ReportsDataTable } from './reports-data-table';
import { PerformanceDataTable } from './performance-data-table';
import { ThresholdCrossingAlertsDataTable } from './threshold-crossing-alerts-data-table';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

export interface DevicesPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  mainTab?: string;
  onMainTabChange?: (tab: string) => void;
  region?: string;
  onRegionChange?: (region: string) => void;
}

const STATUS_OPTIONS = ['Status', 'Connected', 'Disconnected', 'In maintenance', 'Offline'] as const;
const CONFIG_STATUS_OPTIONS = ['Config status', 'Synchronized', 'Out of sync', 'Pending'] as const;
const TYPE_OPTIONS = ['Type', 'SN-LTE'] as const;
const VERSION_OPTIONS = ['Version', 'v2.1', 'v2.2', 'v3.0', 'v3.1'] as const;
const ALARMS_OPTIONS = ['Alarms', 'Critical', 'Major', 'Minor', 'None'] as const;
const LABELS_OPTIONS = ['Labels', 'Production', 'Test', 'Staging', 'Legacy'] as const;
const EVENTS_TYPE_OPTIONS = ['Type', 'Configuration change', 'Connection', 'Performance', 'Security', 'System'] as const;
const EVENTS_SEVERITY_OPTIONS = ['Severity', 'Critical', 'Major', 'Minor', 'Info'] as const;
const EVENTS_SOURCE_OPTIONS = ['Source', 'All sources', 'eNB', 'RN'] as const;
const TASKS_TYPE_OPTIONS = ['Type', 'Backup', 'Sync', 'Report', 'Maintenance'] as const;
const TASKS_STATUS_OPTIONS = ['Status', 'Scheduled', 'Running', 'Completed', 'Failed'] as const;
const TASKS_DOMAIN_OPTIONS = ['Domain', 'All devices', ...NORTH_AMERICAN_REGIONS, 'Core network', 'Radio access', 'Edge devices'] as const;
const SOFTWARE_TYPE_OPTIONS = ['Type', 'SN-LTE'] as const;
const SOFTWARE_STATUS_OPTIONS = ['Status', 'Not transferred', 'Transfer complete', 'Updating', 'Error', 'Complete'] as const;
const SOFTWARE_VERSION_OPTIONS = ['Version', 'v2.1', 'v2.2', 'v3.0', 'v3.1'] as const;
const REPORT_TYPE_OPTIONS = ['Type', 'Daily', 'Weekly', 'Monthly', 'Custom'] as const;
const REPORT_TASK_OPTIONS = ['Task', 'Alarm report', 'Config backup', 'KPI sync', 'Inventory sync', 'Firmware check', 'Health check', 'Report generation'] as const;
const REPORT_CREATED_OPTIONS = ['Created', 'Today', 'This week', 'This month', 'All time'] as const;
const PERFORMANCE_LTE_OPTIONS = ['LTE', 'All', 'SN-LTE'] as const;
const PERFORMANCE_TIME_OPTIONS = ['Last hour', 'Last 15 min', 'Last 6 hours', 'Last 24 hours'] as const;
const THRESHOLD_ACT_SESS_OPTIONS = ['ACT_SESS', 'All', 'ACT_SESS_1', 'ACT_SESS_2', 'ACT_SESS_3'] as const;

const deviceCounts = getDeviceSidebarCounts(DEVICES_DATA);

type RegionOption = 'all' | 'disconnected' | 'kpiSyncErrors' | 'inMaintenance' | 'offline';
type DeviceGroupOption = 'Core network' | 'Radio access' | 'Edge devices' | 'Test environment';

function DevicesPage({ appName = 'vSNET', onSignOut, onNavigate, mainTab: mainTabProp, onMainTabChange, region, onRegionChange }: DevicesPageProps) {
  const [internalTab, setInternalTab] = useState('device');
  const mainTab = mainTabProp ?? internalTab;
  const handleMainTabChange = onMainTabChange ?? setInternalTab;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>('all');
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroupOption | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Status');
  const [configStatusFilter, setConfigStatusFilter] = useState<string>('Config status');
  const [typeFilter, setTypeFilter] = useState<string>('Type');
  const [versionFilter, setVersionFilter] = useState<string>('Version');
  const [alarmsFilter, setAlarmsFilter] = useState<string>('Alarms');
  const [labelsFilter, setLabelsFilter] = useState<string>('Labels');
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventsTypeFilter, setEventsTypeFilter] = useState<string>('Type');
  const [eventsSeverityFilter, setEventsSeverityFilter] = useState<string>('Severity');
  const [eventsSourceFilter, setEventsSourceFilter] = useState<string>('Source');
  const [tasksSearch, setTasksSearch] = useState('');
  const [tasksTypeFilter, setTasksTypeFilter] = useState<string>('Type');
  const [tasksStatusFilter, setTasksStatusFilter] = useState<string>('Status');
  const [tasksDomainFilter, setTasksDomainFilter] = useState<string>('Domain');
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [softwareTypeFilter, setSoftwareTypeFilter] = useState<string>('Type');
  const [softwareStatusFilter, setSoftwareStatusFilter] = useState<string>('Status');
  const [softwareVersionFilter, setSoftwareVersionFilter] = useState<string>('Version');
  const [reportsSearch, setReportsSearch] = useState('');
  const [reportsTypeFilter, setReportsTypeFilter] = useState<string>('Type');
  const [reportsTaskFilter, setReportsTaskFilter] = useState<string>('Task');
  const [reportsCreatedFilter, setReportsCreatedFilter] = useState<string>('Created');
  const [performanceSearch, setPerformanceSearch] = useState('');
  const [performanceLteFilter, setPerformanceLteFilter] = useState<string>('LTE');
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState<string>('Last hour');
  const [performanceStatusFilter, setPerformanceStatusFilter] = useState<'all' | 'good' | 'bad'>('all');
  const [thresholdActSessFilter, setThresholdActSessFilter] = useState<string>('ACT_SESS');
  const [softwareManagementTab, setSoftwareManagementTab] = useState('tasks');
  const [performanceTab, setPerformanceTab] = useState('activity');

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="devices"
        leftAdornment={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size={20} />
          </Button>
        }
        region={region}
        onRegionChange={onRegionChange}
      />
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar - fixed, does not scroll with main */}
        <aside
          className={`fixed top-14 left-0 bottom-0 z-30 transition-all duration-200 ease-in-out border-r overflow-hidden ${
            sidebarOpen ? 'w-64' : 'w-0'
          }`}
          style={{ backgroundColor: '#003D54', borderColor: '#005A7A' }}
        >
          <div className="h-full flex flex-col" style={{ color: '#F8FAFC' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: '#005A7A' }}>
              <h2 className="text-lg font-semibold truncate" title="Network topology">
                Network topology
              </h2>
            </div>
            <div className="flex-1 px-4 py-4 overflow-auto">
              {/* Region section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
                  {region ?? 'Pacific Northwest'}
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedRegion('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedRegion === 'all' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="devices" size={20} />
                      <span className="text-sm">All devices</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.region.all}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedRegion('disconnected')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedRegion === 'disconnected' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="link_off" size={20} />
                      <span className="text-sm">Disconnected</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.region.disconnected}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedRegion('kpiSyncErrors')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedRegion === 'kpiSyncErrors' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="sync_problem" size={20} />
                      <span className="text-sm">KPI sync errors</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.region.kpiSyncErrors}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedRegion('inMaintenance')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedRegion === 'inMaintenance' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="build" size={20} />
                      <span className="text-sm">In maintenance</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.region.inMaintenance}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedRegion('offline')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedRegion === 'offline' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="power_settings_new" size={20} />
                      <span className="text-sm">Offline</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.region.offline}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Device groups section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-70">
                  Device groups
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedGroup('Core network')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedGroup === 'Core network' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="folder" size={20} />
                      <span className="text-sm">Core network</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.groups['Core network']}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedGroup('Radio access')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedGroup === 'Radio access' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="folder" size={20} />
                      <span className="text-sm">Radio access</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.groups['Radio access']}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedGroup('Edge devices')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedGroup === 'Edge devices' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="folder" size={20} />
                      <span className="text-sm">Edge devices</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.groups['Edge devices']}
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedGroup('Test environment')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left ${selectedGroup === 'Test environment' ? 'bg-white/15' : 'hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="folder" size={20} />
                      <span className="text-sm">Test environment</span>
                    </div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {deviceCounts.groups['Test environment']}
                    </span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content - no scroll, table spans available space */}
        <main
          className={`flex-1 flex flex-col min-h-0 px-4 py-6 md:px-6 lg:px-8 overflow-hidden transition-[margin] duration-200 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full">
            <Tabs value={mainTab} onValueChange={handleMainTabChange} className="flex-1 flex flex-col min-h-0 w-full">
              <TabsList className="inline-flex w-full justify-start h-auto gap-0 bg-transparent border-b rounded-none p-0 shrink-0">
                <TabsTrigger
                  value="device"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Device
                </TabsTrigger>
                <TabsTrigger
                  value="alarms"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Alarms
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="conditions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Conditions
                </TabsTrigger>
                <TabsTrigger
                  value="inventory"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Inventory
                </TabsTrigger>
                <TabsTrigger
                  value="scheduled-tasks"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Scheduled tasks
                </TabsTrigger>
                <TabsTrigger
                  value="software-management"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Software management
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Reports
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="device" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search devices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={configStatusFilter} onValueChange={setConfigStatusFilter}>
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue placeholder="Config status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFIG_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={versionFilter} onValueChange={setVersionFilter}>
                      <SelectTrigger className="w-[100px] shrink-0">
                        <SelectValue placeholder="Version" />
                      </SelectTrigger>
                      <SelectContent>
                        {VERSION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={alarmsFilter} onValueChange={setAlarmsFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Alarms" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALARMS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={labelsFilter} onValueChange={setLabelsFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Labels" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABELS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <DevicesDataTable />
                </div>
              </TabsContent>
              <TabsContent value="alarms" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search devices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={configStatusFilter} onValueChange={setConfigStatusFilter}>
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue placeholder="Config status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFIG_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={versionFilter} onValueChange={setVersionFilter}>
                      <SelectTrigger className="w-[100px] shrink-0">
                        <SelectValue placeholder="Version" />
                      </SelectTrigger>
                      <SelectContent>
                        {VERSION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={alarmsFilter} onValueChange={setAlarmsFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Alarms" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALARMS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={labelsFilter} onValueChange={setLabelsFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Labels" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABELS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <AlarmsDataTable />
                </div>
              </TabsContent>
              <TabsContent value="events" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search events..."
                      value={eventsSearch}
                      onChange={(e) => setEventsSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={eventsTypeFilter} onValueChange={setEventsTypeFilter}>
                      <SelectTrigger className="w-[160px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENTS_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={eventsSeverityFilter} onValueChange={setEventsSeverityFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENTS_SEVERITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={eventsSourceFilter} onValueChange={setEventsSourceFilter}>
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENTS_SOURCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <EventsDataTable />
                </div>
              </TabsContent>
              <TabsContent value="conditions" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <p className="text-muted-foreground">Conditions content</p>
              </TabsContent>
              <TabsContent value="inventory" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <p className="text-muted-foreground">Inventory content</p>
              </TabsContent>
              <TabsContent value="scheduled-tasks" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search tasks..."
                      value={tasksSearch}
                      onChange={(e) => setTasksSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={tasksTypeFilter} onValueChange={setTasksTypeFilter}>
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASKS_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={tasksStatusFilter} onValueChange={setTasksStatusFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASKS_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={tasksDomainFilter} onValueChange={setTasksDomainFilter}>
                      <SelectTrigger className="w-[140px] shrink-0">
                        <SelectValue placeholder="Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASKS_DOMAIN_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ScheduledTasksDataTable />
                </div>
              </TabsContent>
              <TabsContent value="software-management" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <Tabs value={softwareManagementTab} onValueChange={setSoftwareManagementTab} className="flex-1 flex flex-col min-h-0 w-full">
                  <TabsList className="inline-flex h-9 w-fit shrink-0 self-start items-center justify-start gap-1 rounded-full bg-muted p-1 text-muted-foreground mb-6">
                    <TabsTrigger value="tasks" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="images" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="activity-log" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      Activity log
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="tasks" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search software..."
                      value={softwareSearch}
                      onChange={(e) => setSoftwareSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={softwareTypeFilter} onValueChange={setSoftwareTypeFilter}>
                      <SelectTrigger className="w-[130px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOFTWARE_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={softwareStatusFilter} onValueChange={setSoftwareStatusFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOFTWARE_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={softwareVersionFilter} onValueChange={setSoftwareVersionFilter}>
                      <SelectTrigger className="w-[100px] shrink-0">
                        <SelectValue placeholder="Version" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOFTWARE_VERSION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <SoftwareManagementDataTable />
                </div>
                  </TabsContent>
                  <TabsContent value="images" className="mt-0 flex-1 flex flex-col min-h-0 overflow-auto data-[state=inactive]:hidden">
                    <SoftwareImagesTab />
                  </TabsContent>
                  <TabsContent value="activity-log" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                    {/* Search and filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                        <Icon
                          name="search"
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          placeholder="Search software..."
                          value={softwareSearch}
                          onChange={(e) => setSoftwareSearch(e.target.value)}
                          className="pl-9 w-full"
                        />
                      </div>
                      <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                        <Select value={softwareTypeFilter} onValueChange={setSoftwareTypeFilter}>
                          <SelectTrigger className="w-[130px] shrink-0">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOFTWARE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={softwareStatusFilter} onValueChange={setSoftwareStatusFilter}>
                          <SelectTrigger className="w-[120px] shrink-0">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOFTWARE_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={softwareVersionFilter} onValueChange={setSoftwareVersionFilter}>
                          <SelectTrigger className="w-[100px] shrink-0">
                            <SelectValue placeholder="Version" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOFTWARE_VERSION_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <ActivityLogDataTable />
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="reports" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search reports..."
                      value={reportsSearch}
                      onChange={(e) => setReportsSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                    <Select value={reportsTypeFilter} onValueChange={setReportsTypeFilter}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={reportsTaskFilter} onValueChange={setReportsTaskFilter}>
                      <SelectTrigger className="w-[140px] shrink-0">
                        <SelectValue placeholder="Task" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TASK_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={reportsCreatedFilter} onValueChange={setReportsCreatedFilter}>
                      <SelectTrigger className="w-[120px] shrink-0">
                        <SelectValue placeholder="Created" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_CREATED_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ReportsDataTable />
                </div>
              </TabsContent>
              <TabsContent value="performance" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <Tabs value={performanceTab} onValueChange={setPerformanceTab} className="flex-1 flex flex-col min-h-0 w-full">
                  <TabsList className="inline-flex h-9 w-fit shrink-0 self-start items-center justify-start gap-1 rounded-full bg-muted p-1 text-muted-foreground mb-6">
                    <TabsTrigger value="activity" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="threshold-crossing-alerts" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      Threshold crossing alerts
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="activity" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                    {/* Search and filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                        <Icon
                          name="search"
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          placeholder="Search devices..."
                          value={performanceSearch}
                          onChange={(e) => setPerformanceSearch(e.target.value)}
                          className="pl-9 w-full"
                        />
                      </div>
                      <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                        <Select value={performanceLteFilter} onValueChange={setPerformanceLteFilter}>
                          <SelectTrigger className="w-[110px] shrink-0">
                            <SelectValue placeholder="LTE" />
                          </SelectTrigger>
                          <SelectContent>
                            {PERFORMANCE_LTE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={performanceTimeFilter} onValueChange={setPerformanceTimeFilter}>
                          <SelectTrigger className="w-[120px] shrink-0">
                            <SelectValue placeholder="Last hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {PERFORMANCE_TIME_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted p-1" role="group">
                          <Button
                            variant={performanceStatusFilter === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 rounded-full"
                            onClick={() => setPerformanceStatusFilter('all')}
                          >
                            All
                          </Button>
                          <Button
                            variant={performanceStatusFilter === 'good' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 rounded-full"
                            onClick={() => setPerformanceStatusFilter('good')}
                          >
                            Good
                          </Button>
                          <Button
                            variant={performanceStatusFilter === 'bad' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 rounded-full"
                            onClick={() => setPerformanceStatusFilter('bad')}
                          >
                            Bad
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <PerformanceDataTable />
                    </div>
                  </TabsContent>
                  <TabsContent value="threshold-crossing-alerts" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b mb-6 shrink-0">
                      <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
                        <Select value={thresholdActSessFilter} onValueChange={setThresholdActSessFilter}>
                          <SelectTrigger className="w-[140px] shrink-0">
                            <SelectValue placeholder="ACT_SESS" />
                          </SelectTrigger>
                          <SelectContent>
                            {THRESHOLD_ACT_SESS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <ThresholdCrossingAlertsDataTable />
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DevicesPage;

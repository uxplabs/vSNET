import React, { useState, useEffect } from 'react';
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
import { DevicesDataTable, DEVICES_DATA, getDeviceSidebarCounts, getFilteredDeviceCount } from './devices-data-table';
import { AlarmsDataTable, getFilteredAlarmsCount } from './alarms-data-table';
import { EventsDataTable, getFilteredEventCount } from './events-data-table';
import { ScheduledTasksDataTable, getFilteredTaskCount } from './scheduled-tasks-data-table';
import type { ScheduledTaskRow } from './scheduled-tasks-data-table';
import { ScheduledTaskDrawer } from './scheduled-task-drawer';
import { AddScheduledTaskDialog } from './add-scheduled-task-dialog';
import { SoftwareManagementDataTable, getFilteredSoftwareCount } from './software-management-data-table';
import { SoftwareImagesTab } from './software-images-tab';
import { ActivityLogDataTable } from './activity-log-data-table';
import { ReportsDataTable, getFilteredReportCount } from './reports-data-table';
import { PerformanceDataTable, getFilteredPerformanceCount } from './performance-data-table';
import { ThresholdCrossingAlertsDataTable, getFilteredThresholdCount } from './threshold-crossing-alerts-data-table';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

export interface DevicesPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  mainTab?: string;
  onMainTabChange?: (tab: string) => void;
  region?: string;
  onRegionChange?: (region: string) => void;
  onNavigateToDeviceDetail?: (device: any) => void;
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

function DevicesPage({ appName = 'vSNET', onSignOut, onNavigate, mainTab: mainTabProp, onMainTabChange, region, onRegionChange, onNavigateToDeviceDetail }: DevicesPageProps) {
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
  const [selectedTask, setSelectedTask] = useState<ScheduledTaskRow | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);

  const deviceFiltersActive = search !== '' || statusFilter !== 'Status' || configStatusFilter !== 'Config status' || typeFilter !== 'Type' || versionFilter !== 'Version' || alarmsFilter !== 'Alarms' || labelsFilter !== 'Labels';
  const clearDeviceFilters = () => {
    setSearch(''); setStatusFilter('Status'); setSelectedRegion('all'); setConfigStatusFilter('Config status'); setTypeFilter('Type'); setVersionFilter('Version'); setAlarmsFilter('Alarms'); setLabelsFilter('Labels');
  };
  const eventsFiltersActive = eventsSearch !== '' || eventsTypeFilter !== 'Type' || eventsSeverityFilter !== 'Severity' || eventsSourceFilter !== 'Source';
  const clearEventsFilters = () => {
    setEventsSearch(''); setEventsTypeFilter('Type'); setEventsSeverityFilter('Severity'); setEventsSourceFilter('Source');
  };
  const tasksFiltersActive = tasksSearch !== '' || tasksTypeFilter !== 'Type' || tasksStatusFilter !== 'Status' || tasksDomainFilter !== 'Domain';
  const clearTasksFilters = () => {
    setTasksSearch(''); setTasksTypeFilter('Type'); setTasksStatusFilter('Status'); setTasksDomainFilter('Domain');
  };
  const softwareFiltersActive = softwareSearch !== '' || softwareTypeFilter !== 'Type' || softwareStatusFilter !== 'Status' || softwareVersionFilter !== 'Version';
  const clearSoftwareFilters = () => {
    setSoftwareSearch(''); setSoftwareTypeFilter('Type'); setSoftwareStatusFilter('Status'); setSoftwareVersionFilter('Version');
  };
  const reportsFiltersActive = reportsSearch !== '' || reportsTypeFilter !== 'Type' || reportsTaskFilter !== 'Task' || reportsCreatedFilter !== 'Created';
  const clearReportsFilters = () => {
    setReportsSearch(''); setReportsTypeFilter('Type'); setReportsTaskFilter('Task'); setReportsCreatedFilter('Created');
  };
  const performanceFiltersActive = performanceSearch !== '' || performanceLteFilter !== 'LTE' || performanceTimeFilter !== 'Last hour' || performanceStatusFilter !== 'all';
  const clearPerformanceFilters = () => {
    setPerformanceSearch(''); setPerformanceLteFilter('LTE'); setPerformanceTimeFilter('Last hour'); setPerformanceStatusFilter('all');
  };
  const thresholdFiltersActive = thresholdActSessFilter !== 'ACT_SESS';
  const clearThresholdFilters = () => setThresholdActSessFilter('ACT_SESS');

  // Keep Status dropdown in sync with sidebar selection
  useEffect(() => {
    if (selectedRegion === 'disconnected') setStatusFilter('Disconnected');
    else if (selectedRegion === 'inMaintenance') setStatusFilter('In maintenance');
    else if (selectedRegion === 'offline') setStatusFilter('Offline');
    else if (selectedRegion === 'all' || selectedRegion === 'kpiSyncErrors') setStatusFilter('Status');
  }, [selectedRegion]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === 'Disconnected') setSelectedRegion('disconnected');
    else if (value === 'In maintenance') setSelectedRegion('inMaintenance');
    else if (value === 'Offline') setSelectedRegion('offline');
    else setSelectedRegion('all');
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="devices"
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search devices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
                {/* Active filters + result count */}
                {(() => {
                  const count = getFilteredDeviceCount({
                    sidebarRegion: selectedRegion,
                    statusFilter,
                    search,
                    configStatusFilter,
                    typeFilter,
                    versionFilter,
                    alarmsFilter,
                    labelsFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (statusFilter !== 'Status') activeFilters.push({ key: 'status', label: `Status: ${statusFilter}`, onClear: () => { setStatusFilter('Status'); setSelectedRegion('all'); } });
                  if (configStatusFilter !== 'Config status') activeFilters.push({ key: 'config', label: `Config: ${configStatusFilter}`, onClear: () => setConfigStatusFilter('Config status') });
                  if (typeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('Type') });
                  if (versionFilter !== 'Version') activeFilters.push({ key: 'version', label: `Version: ${versionFilter}`, onClear: () => setVersionFilter('Version') });
                  if (alarmsFilter !== 'Alarms') activeFilters.push({ key: 'alarms', label: `Alarms: ${alarmsFilter}`, onClear: () => setAlarmsFilter('Alarms') });
                  if (labelsFilter !== 'Labels') activeFilters.push({ key: 'labels', label: `Labels: ${labelsFilter}`, onClear: () => setLabelsFilter('Labels') });
                  if (search.trim()) activeFilters.push({ key: 'search', label: `Search: "${search.trim()}"`, onClear: () => setSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'result' : 'results'}
                      </span>
                      {activeFilters.map((f) => (
                        <span
                          key={f.key}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
                        >
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearDeviceFilters}>
                          Clear all
                        </Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <DevicesDataTable
                    sidebarRegion={selectedRegion}
                    statusFilter={statusFilter}
                    search={search}
                    configStatusFilter={configStatusFilter}
                    typeFilter={typeFilter}
                    versionFilter={versionFilter}
                    alarmsFilter={alarmsFilter}
                    labelsFilter={labelsFilter}
                    onNavigateToDeviceDetail={onNavigateToDeviceDetail}
                  />
                </div>
              </TabsContent>
              <TabsContent value="alarms" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search devices..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                {(() => {
                  const count = getFilteredAlarmsCount({ search, severityFilter: alarmsFilter });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (statusFilter !== 'Status') activeFilters.push({ key: 'status', label: `Status: ${statusFilter}`, onClear: () => setStatusFilter('Status') });
                  if (configStatusFilter !== 'Config status') activeFilters.push({ key: 'config', label: `Config: ${configStatusFilter}`, onClear: () => setConfigStatusFilter('Config status') });
                  if (typeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('Type') });
                  if (versionFilter !== 'Version') activeFilters.push({ key: 'version', label: `Version: ${versionFilter}`, onClear: () => setVersionFilter('Version') });
                  if (alarmsFilter !== 'Alarms') activeFilters.push({ key: 'alarms', label: `Alarms: ${alarmsFilter}`, onClear: () => setAlarmsFilter('Alarms') });
                  if (labelsFilter !== 'Labels') activeFilters.push({ key: 'labels', label: `Labels: ${labelsFilter}`, onClear: () => setLabelsFilter('Labels') });
                  if (search.trim()) activeFilters.push({ key: 'search', label: `Search: "${search.trim()}"`, onClear: () => setSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearDeviceFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <AlarmsDataTable search={search} severityFilter={alarmsFilter} />
                </div>
              </TabsContent>
              <TabsContent value="events" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search events..."
                      value={eventsSearch}
                      onChange={(e) => setEventsSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                {/* Active filters + result count */}
                {(() => {
                  const count = getFilteredEventCount({
                    search: eventsSearch,
                    typeFilter: eventsTypeFilter,
                    severityFilter: eventsSeverityFilter,
                    sourceFilter: eventsSourceFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (eventsTypeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${eventsTypeFilter}`, onClear: () => setEventsTypeFilter('Type') });
                  if (eventsSeverityFilter !== 'Severity') activeFilters.push({ key: 'severity', label: `Severity: ${eventsSeverityFilter}`, onClear: () => setEventsSeverityFilter('Severity') });
                  if (eventsSourceFilter !== 'Source') activeFilters.push({ key: 'source', label: `Source: ${eventsSourceFilter}`, onClear: () => setEventsSourceFilter('Source') });
                  if (eventsSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${eventsSearch.trim()}"`, onClear: () => setEventsSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearEventsFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <EventsDataTable
                    search={eventsSearch}
                    typeFilter={eventsTypeFilter}
                    severityFilter={eventsSeverityFilter}
                    sourceFilter={eventsSourceFilter}
                  />
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search tasks..."
                      value={tasksSearch}
                      onChange={(e) => setTasksSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                    <Button variant="outline" size="sm" className="shrink-0 gap-1 ml-auto" onClick={() => setAddTaskDialogOpen(true)}>
                      <Icon name="add" size={18} />
                      Add scheduled task
                    </Button>
                  </div>
                </div>
                <AddScheduledTaskDialog
                  open={addTaskDialogOpen}
                  onOpenChange={setAddTaskDialogOpen}
                  region={region}
                  onAdd={() => {}}
                />
                {(() => {
                  const count = getFilteredTaskCount({
                    search: tasksSearch,
                    typeFilter: tasksTypeFilter,
                    statusFilter: tasksStatusFilter,
                    domainFilter: tasksDomainFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (tasksTypeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${tasksTypeFilter}`, onClear: () => setTasksTypeFilter('Type') });
                  if (tasksStatusFilter !== 'Status') activeFilters.push({ key: 'status', label: `Status: ${tasksStatusFilter}`, onClear: () => setTasksStatusFilter('Status') });
                  if (tasksDomainFilter !== 'Domain') activeFilters.push({ key: 'domain', label: `Domain: ${tasksDomainFilter}`, onClear: () => setTasksDomainFilter('Domain') });
                  if (tasksSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${tasksSearch.trim()}"`, onClear: () => setTasksSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearTasksFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ScheduledTasksDataTable
                    search={tasksSearch}
                    typeFilter={tasksTypeFilter}
                    statusFilter={tasksStatusFilter}
                    domainFilter={tasksDomainFilter}
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setTaskDrawerOpen(true);
                    }}
                  />
                </div>
                <ScheduledTaskDrawer
                  task={selectedTask}
                  open={taskDrawerOpen}
                  onOpenChange={setTaskDrawerOpen}
                />
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search software..."
                      value={softwareSearch}
                      onChange={(e) => setSoftwareSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                {(() => {
                  const count = getFilteredSoftwareCount({
                    search: softwareSearch,
                    typeFilter: softwareTypeFilter,
                    statusFilter: softwareStatusFilter,
                    versionFilter: softwareVersionFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (softwareTypeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${softwareTypeFilter}`, onClear: () => setSoftwareTypeFilter('Type') });
                  if (softwareStatusFilter !== 'Status') activeFilters.push({ key: 'status', label: `Status: ${softwareStatusFilter}`, onClear: () => setSoftwareStatusFilter('Status') });
                  if (softwareVersionFilter !== 'Version') activeFilters.push({ key: 'version', label: `Version: ${softwareVersionFilter}`, onClear: () => setSoftwareVersionFilter('Version') });
                  if (softwareSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${softwareSearch.trim()}"`, onClear: () => setSoftwareSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearSoftwareFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <SoftwareManagementDataTable
                    search={softwareSearch}
                    typeFilter={softwareTypeFilter}
                    statusFilter={softwareStatusFilter}
                    versionFilter={softwareVersionFilter}
                  />
                </div>
                  </TabsContent>
                  <TabsContent value="images" className="mt-0 flex-1 flex flex-col min-h-0 overflow-auto data-[state=inactive]:hidden">
                    <SoftwareImagesTab />
                  </TabsContent>
                  <TabsContent value="activity-log" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                    {/* Search and filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                      <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                        <Icon
                          name="search"
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                          placeholder="Search software..."
                          value={softwareSearch}
                          onChange={(e) => setSoftwareSearch(e.target.value)}
                          className="pl-9 w-full min-w-0"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                    {(() => {
                      const count = getFilteredSoftwareCount({
                        search: softwareSearch,
                        typeFilter: softwareTypeFilter,
                        statusFilter: softwareStatusFilter,
                        versionFilter: softwareVersionFilter,
                      });
                      const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                      if (softwareTypeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${softwareTypeFilter}`, onClear: () => setSoftwareTypeFilter('Type') });
                      if (softwareStatusFilter !== 'Status') activeFilters.push({ key: 'status', label: `Status: ${softwareStatusFilter}`, onClear: () => setSoftwareStatusFilter('Status') });
                      if (softwareVersionFilter !== 'Version') activeFilters.push({ key: 'version', label: `Version: ${softwareVersionFilter}`, onClear: () => setSoftwareVersionFilter('Version') });
                      if (softwareSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${softwareSearch.trim()}"`, onClear: () => setSoftwareSearch('') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                              {f.label}
<button
                                type="button"
                                onClick={f.onClear}
                                className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={14} aria-hidden />
                              </button>
                            </span>
                          ))}
                          {hasActive && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearSoftwareFilters}>Clear all</Button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <ActivityLogDataTable />
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="reports" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <Input
                      placeholder="Search reports..."
                      value={reportsSearch}
                      onChange={(e) => setReportsSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                {(() => {
                  const count = getFilteredReportCount({
                    search: reportsSearch,
                    typeFilter: reportsTypeFilter,
                    taskFilter: reportsTaskFilter,
                    createdFilter: reportsCreatedFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (reportsTypeFilter !== 'Type') activeFilters.push({ key: 'type', label: `Type: ${reportsTypeFilter}`, onClear: () => setReportsTypeFilter('Type') });
                  if (reportsTaskFilter !== 'Task') activeFilters.push({ key: 'task', label: `Task: ${reportsTaskFilter}`, onClear: () => setReportsTaskFilter('Task') });
                  if (reportsCreatedFilter !== 'Created') activeFilters.push({ key: 'created', label: `Created: ${reportsCreatedFilter}`, onClear: () => setReportsCreatedFilter('Created') });
                  if (reportsSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${reportsSearch.trim()}"`, onClear: () => setReportsSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {f.label}
                          <button
                            type="button"
                            onClick={f.onClear}
                            className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={14} aria-hidden />
                          </button>
                        </span>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearReportsFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ReportsDataTable
                    search={reportsSearch}
                    typeFilter={reportsTypeFilter}
                    taskFilter={reportsTaskFilter}
                    createdFilter={reportsCreatedFilter}
                  />
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                      <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                        <Icon
                          name="search"
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                        <Input
                          placeholder="Search devices..."
                          value={performanceSearch}
                          onChange={(e) => setPerformanceSearch(e.target.value)}
                          className="pl-9 w-full min-w-0"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                    {(() => {
                      const count = getFilteredPerformanceCount({
                        search: performanceSearch,
                        lteFilter: performanceLteFilter,
                        timeFilter: performanceTimeFilter,
                        statusFilter: performanceStatusFilter,
                      });
                      const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                      if (performanceLteFilter !== 'LTE') activeFilters.push({ key: 'lte', label: `LTE: ${performanceLteFilter}`, onClear: () => setPerformanceLteFilter('LTE') });
                      if (performanceTimeFilter !== 'Last hour') activeFilters.push({ key: 'time', label: `Time: ${performanceTimeFilter}`, onClear: () => setPerformanceTimeFilter('Last hour') });
                      if (performanceStatusFilter !== 'all') activeFilters.push({ key: 'status', label: `Status: ${performanceStatusFilter}`, onClear: () => setPerformanceStatusFilter('all') });
                      if (performanceSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${performanceSearch.trim()}"`, onClear: () => setPerformanceSearch('') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                              {f.label}
<button
                                type="button"
                                onClick={f.onClear}
                                className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={14} aria-hidden />
                              </button>
                            </span>
                          ))}
                          {hasActive && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearPerformanceFilters}>Clear all</Button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <PerformanceDataTable
                        search={performanceSearch}
                        lteFilter={performanceLteFilter}
                        timeFilter={performanceTimeFilter}
                        statusFilter={performanceStatusFilter}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="threshold-crossing-alerts" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 mb-2 shrink-0 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
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
                    {(() => {
                      const count = getFilteredThresholdCount({ actSessFilter: thresholdActSessFilter });
                      const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                      if (thresholdActSessFilter !== 'ACT_SESS') activeFilters.push({ key: 'actSess', label: `ACT_SESS: ${thresholdActSessFilter}`, onClear: () => setThresholdActSessFilter('ACT_SESS') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <span key={f.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                              {f.label}
<button
                                type="button"
                                onClick={f.onClear}
                                className="rounded min-w-[44px] min-h-[44px] flex items-center justify-center -my-1 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={14} aria-hidden />
                              </button>
                            </span>
                          ))}
                          {hasActive && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearThresholdFilters}>Clear all</Button>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                      <ThresholdCrossingAlertsDataTable actSessFilter={thresholdActSessFilter} />
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

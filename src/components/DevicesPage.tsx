import React, { useState, useEffect, useMemo } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { DevicesDataTable, DEVICES_DATA, getDeviceSidebarCounts, getDeviceSidebarCountsByRegion, getFilteredDeviceCount } from './devices-data-table';
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
import { InventoryDataTable, getFilteredInventoryCount, INVENTORY_STATUS_OPTIONS, INVENTORY_TYPE_OPTIONS, INVENTORY_VERSION_OPTIONS, INVENTORY_ALARM_OPTIONS } from './inventory-data-table';
import { ChevronDown } from 'lucide-react';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';
import { ErrorBoundary } from './error-boundary';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface DevicesPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string, filters?: { statusFilter?: string; configStatusFilter?: string }) => void;
  mainTab?: string;
  onMainTabChange?: (tab: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
  onNavigateToDeviceDetail?: (device: any, options?: { openNotes?: boolean; initialSection?: string; createdTemplate?: string }) => void;
  initialStatusFilter?: string;
  initialConfigStatusFilter?: string;
}

const STATUS_OPTIONS = ['All', 'Connected', 'Disconnected', 'In maintenance', 'Offline'] as const;
const CONFIG_STATUS_OPTIONS = ['All', 'Synchronized', 'Out of sync', 'Pending'] as const;
const TYPE_OPTIONS = ['All', 'SN', 'CU', 'RCP', 'DAS'] as const;
const VERSION_OPTIONS = ['All', 'v2.1', 'v2.2', 'v3.0', 'v3.1'] as const;
const ALARMS_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'None'] as const;
const LABELS_OPTIONS = ['All', 'Production', 'Test', 'Staging', 'Legacy'] as const;
const EVENTS_TYPE_OPTIONS = ['All', 'Configuration change', 'Connection', 'Performance', 'Security', 'System'] as const;
const EVENTS_SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'Info'] as const;
const EVENTS_SOURCE_OPTIONS = ['All', 'eNB', 'RN'] as const;
const TASKS_TYPE_OPTIONS = ['All', 'Backup', 'Sync', 'Report', 'Maintenance'] as const;
const TASKS_STATUS_OPTIONS = ['All', 'Scheduled', 'Running', 'Completed', 'Failed'] as const;
const TASKS_DOMAIN_OPTIONS = ['All', ...NORTH_AMERICAN_REGIONS, 'Core network', 'Radio access', 'Edge devices'] as const;
const SOFTWARE_TYPE_OPTIONS = ['All', 'SN', 'CU', 'RCP', 'DAS'] as const;
const SOFTWARE_STATUS_OPTIONS = ['All', 'Not transferred', 'Transfer complete', 'Updating', 'Error', 'Complete'] as const;
const SOFTWARE_VERSION_OPTIONS = ['All', 'v2.1', 'v2.2', 'v3.0', 'v3.1'] as const;
const REPORT_TYPE_OPTIONS = ['All', 'Daily', 'Weekly', 'Monthly', 'Custom'] as const;
const REPORT_TASK_OPTIONS = ['All', 'Alarm report', 'Config backup', 'KPI sync', 'Inventory sync', 'Firmware check', 'Health check', 'Report generation'] as const;
const REPORT_CREATED_OPTIONS = ['All', 'Today', 'This week', 'This month', 'All time'] as const;
const PERFORMANCE_LTE_OPTIONS = ['All', 'SN'] as const;
const PERFORMANCE_TIME_OPTIONS = ['All', 'Last 15 min', 'Last 6 hours', 'Last 24 hours'] as const;
const THRESHOLD_ACT_SESS_OPTIONS = ['All', 'ACT_SESS_1', 'ACT_SESS_2', 'ACT_SESS_3'] as const;

const allDeviceCounts = getDeviceSidebarCounts(DEVICES_DATA);
const allDeviceCountsByRegion = getDeviceSidebarCountsByRegion(DEVICES_DATA);

type RegionOption = 'all' | 'disconnected' | 'kpiSyncErrors' | 'inMaintenance' | 'offline' | 'configMismatch';
type DeviceGroupOption = 'Core network' | 'Radio access' | 'Edge devices' | 'Test environment';


function DevicesPage({ appName = 'AMS', onSignOut, onNavigate, mainTab: mainTabProp, onMainTabChange, region, regions, onRegionChange, onRegionsChange, fixedRegion, onNavigateToDeviceDetail, initialStatusFilter, initialConfigStatusFilter }: DevicesPageProps) {
  const [internalTab, setInternalTab] = useState('device');
  const mainTab = (mainTabProp ?? internalTab) || 'device';
  const handleMainTabChange = onMainTabChange ?? setInternalTab;
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>('all');
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroupOption | null>(null);

  // When a fixed region is set (single-region account), lock sidebar to that region
  const effectiveRegions = fixedRegion ? [fixedRegion] : regions;

  // Determine whether we're showing all regions (global "All" or no selection) and build the sidebar region list
  const isAllRegions = !fixedRegion && (!effectiveRegions || effectiveRegions.length === 0 || (effectiveRegions.length === 1 && effectiveRegions[0] === 'All'));
  const sidebarRegionList = isAllRegions ? [...NORTH_AMERICAN_REGIONS] : effectiveRegions!;

  // Compute sidebar counts filtered by selected regions
  const deviceCounts = useMemo(() => {
    if (isAllRegions) return allDeviceCounts;
    const filtered = DEVICES_DATA.filter((d) => effectiveRegions!.includes(d.region));
    return getDeviceSidebarCounts(filtered);
  }, [isAllRegions, effectiveRegions]);

  const deviceCountsByRegion = useMemo(() => {
    if (isAllRegions) return allDeviceCountsByRegion;
    const result: typeof allDeviceCountsByRegion = {};
    for (const r of effectiveRegions!) {
      if (allDeviceCountsByRegion[r]) result[r] = allDeviceCountsByRegion[r];
    }
    return result;
  }, [isAllRegions, effectiveRegions]);

  const ungroupedCount = Math.max(0, deviceCounts.region.all - Object.values(deviceCounts.groups).reduce((a, b) => a + b, 0));
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter ?? 'All');
  const [configStatusFilter, setConfigStatusFilter] = useState<string>(initialConfigStatusFilter ?? 'All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [versionFilter, setVersionFilter] = useState<string>('All');
  const [alarmsFilter, setAlarmsFilter] = useState<string>('All');
  const [labelsFilter, setLabelsFilter] = useState<string>('All');
  const [eventsSearch, setEventsSearch] = useState('');
  const [eventsTypeFilter, setEventsTypeFilter] = useState<string>('All');
  const [eventsSeverityFilter, setEventsSeverityFilter] = useState<string>('All');
  const [eventsSourceFilter, setEventsSourceFilter] = useState<string>('All');
  const [tasksSearch, setTasksSearch] = useState('');
  const [tasksTypeFilter, setTasksTypeFilter] = useState<string>('All');
  const [tasksStatusFilter, setTasksStatusFilter] = useState<string>('All');
  const [tasksDomainFilter, setTasksDomainFilter] = useState<string>('All');
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [softwareTypeFilter, setSoftwareTypeFilter] = useState<string>('All');
  const [softwareStatusFilter, setSoftwareStatusFilter] = useState<string>('All');
  const [softwareVersionFilter, setSoftwareVersionFilter] = useState<string>('All');
  const [reportsSearch, setReportsSearch] = useState('');
  const [reportsTypeFilter, setReportsTypeFilter] = useState<string>('All');
  const [reportsTaskFilter, setReportsTaskFilter] = useState<string>('All');
  const [reportsCreatedFilter, setReportsCreatedFilter] = useState<string>('All');
  const [performanceSearch, setPerformanceSearch] = useState('');
  const [performanceLteFilter, setPerformanceLteFilter] = useState<string>('All');
  const [performanceTimeFilter, setPerformanceTimeFilter] = useState<string>('All');
  const [performanceStatusFilter, setPerformanceStatusFilter] = useState<'all' | 'degraded' | 'optimal'>('all');
  const [thresholdActSessFilter, setThresholdActSessFilter] = useState<string>('All');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryViewFilter, setInventoryViewFilter] = useState('radio-nodes');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>('All');
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState<string>('All');
  const [inventoryVersionFilter, setInventoryVersionFilter] = useState<string>('All');
  const [inventoryAlarmFilter, setInventoryAlarmFilter] = useState<string>('All');
  const [softwareManagementTab, setSoftwareManagementTab] = useState('tasks');
  const [performanceTab, setPerformanceTab] = useState('activity');
  const [selectedTask, setSelectedTask] = useState<ScheduledTaskRow | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [deviceSelectedCount, setDeviceSelectedCount] = useState(0);
  const [clearSelectionTrigger, setClearSelectionTrigger] = useState(0);
  const [alarmSelectedCount, setAlarmSelectedCount] = useState(0);
  const [alarmClearSelectionTrigger, setAlarmClearSelectionTrigger] = useState(0);
  const [eventSelectedCount, setEventSelectedCount] = useState(0);
  const [eventClearSelectionTrigger, setEventClearSelectionTrigger] = useState(0);
  const deviceFiltersActive = search !== '' || regionFilter !== 'All' || statusFilter !== 'All' || configStatusFilter !== 'All' || typeFilter !== 'All' || versionFilter !== 'All' || alarmsFilter !== 'All' || labelsFilter !== 'All';
  const clearDeviceFilters = () => {
    setSearch(''); setRegionFilter('All'); setStatusFilter('All'); setSelectedRegion('all'); setConfigStatusFilter('All'); setTypeFilter('All'); setVersionFilter('All'); setAlarmsFilter('All'); setLabelsFilter('All');
  };
  const eventsFiltersActive = eventsSearch !== '' || regionFilter !== 'All' || eventsTypeFilter !== 'All' || eventsSeverityFilter !== 'All' || eventsSourceFilter !== 'All';
  const clearEventsFilters = () => {
    setEventsSearch(''); setRegionFilter('All'); setEventsTypeFilter('All'); setEventsSeverityFilter('All'); setEventsSourceFilter('All');
  };
  const tasksFiltersActive = tasksSearch !== '' || tasksTypeFilter !== 'All' || tasksStatusFilter !== 'All' || tasksDomainFilter !== 'All';
  const clearTasksFilters = () => {
    setTasksSearch(''); setTasksTypeFilter('All'); setTasksStatusFilter('All'); setTasksDomainFilter('All');
  };
  const softwareFiltersActive = softwareSearch !== '' || softwareTypeFilter !== 'All' || softwareStatusFilter !== 'All' || softwareVersionFilter !== 'All';
  const clearSoftwareFilters = () => {
    setSoftwareSearch(''); setSoftwareTypeFilter('All'); setSoftwareStatusFilter('All'); setSoftwareVersionFilter('All');
  };
  const inventoryFiltersActive = inventorySearch !== '' || inventoryViewFilter !== 'radio-nodes' || inventoryStatusFilter !== 'All' || inventoryTypeFilter !== 'All' || inventoryVersionFilter !== 'All' || inventoryAlarmFilter !== 'All';
  const clearInventoryFilters = () => {
    setInventorySearch(''); setInventoryViewFilter('radio-nodes'); setInventoryStatusFilter('All'); setInventoryTypeFilter('All'); setInventoryVersionFilter('All'); setInventoryAlarmFilter('All');
  };
  const reportsFiltersActive = reportsSearch !== '' || reportsTypeFilter !== 'All' || reportsTaskFilter !== 'All' || reportsCreatedFilter !== 'All';
  const clearReportsFilters = () => {
    setReportsSearch(''); setReportsTypeFilter('All'); setReportsTaskFilter('All'); setReportsCreatedFilter('All');
  };
  const performanceFiltersActive = performanceSearch !== '' || performanceLteFilter !== 'All' || performanceTimeFilter !== 'All' || performanceStatusFilter !== 'all';
  const clearPerformanceFilters = () => {
    setPerformanceSearch(''); setPerformanceLteFilter('All'); setPerformanceTimeFilter('All'); setPerformanceStatusFilter('all');
  };
  const thresholdFiltersActive = thresholdActSessFilter !== 'All';
  const clearThresholdFilters = () => setThresholdActSessFilter('All');

  // Keep filter dropdowns in sync with sidebar selection
  useEffect(() => {
    if (selectedRegion === 'disconnected') {
      setStatusFilter('Disconnected');
      setConfigStatusFilter('All');
    } else if (selectedRegion === 'inMaintenance') {
      setStatusFilter('In maintenance');
      setConfigStatusFilter('All');
    } else if (selectedRegion === 'offline') {
      setStatusFilter('Offline');
      setConfigStatusFilter('All');
    } else if (selectedRegion === 'kpiSyncErrors') {
      setStatusFilter('All');
      setConfigStatusFilter('Out of sync');
    } else if (selectedRegion === 'all' || selectedRegion === 'configMismatch') {
      setStatusFilter('All');
      setConfigStatusFilter('All');
    }
  }, [selectedRegion]);

  // Sync external filter props (e.g. navigating from dashboard with a filter)
  useEffect(() => {
    if (initialStatusFilter && initialStatusFilter !== 'All') {
      setStatusFilter(initialStatusFilter);
      if (initialStatusFilter === 'Disconnected') setSelectedRegion('disconnected');
      else if (initialStatusFilter === 'In maintenance') setSelectedRegion('inMaintenance');
      else setSelectedRegion('all');
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialConfigStatusFilter && initialConfigStatusFilter !== 'All') {
      setConfigStatusFilter(initialConfigStatusFilter);
    }
  }, [initialConfigStatusFilter]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === 'Disconnected') setSelectedRegion('disconnected');
    else if (value === 'In maintenance') setSelectedRegion('inMaintenance');
    else if (value === 'Offline') setSelectedRegion('offline');
    else setSelectedRegion('all');
  };

  const handleConfigStatusFilterChange = (value: string) => {
    setConfigStatusFilter(value);
    if (value === 'Out of sync') setSelectedRegion('kpiSyncErrors');
    else if (selectedRegion === 'kpiSyncErrors') setSelectedRegion('all');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="devices"
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
      />
      <SidebarProvider className="flex-1 min-h-0 overflow-hidden">
        <Sidebar
          variant="inset"
          collapsible="offcanvas"
          style={{ top: '3.5rem', height: 'calc(100vh - 3.5rem)', width: 'var(--sidebar-width)' }}
        >
        <SidebarHeader className="border-b border-sidebar-border h-16 justify-center">
          <div className="px-1 flex items-center gap-2">
            <Icon name="account_tree" size={18} className="text-sidebar-foreground" />
            <span className="text-sm font-bold text-sidebar-foreground">Network topology</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Ungrouped – flat item with badge (dashboard-01 style) */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="cursor-default pointer-events-none">
                    <Icon name="list" size={18} />
                    <span>Ungrouped</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{ungroupedCount}</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Region – flat list (dashboard-01 style) */}
          <SidebarGroup>
            <SidebarGroupLabel>
              {fixedRegion ? (
                fixedRegion
              ) : isAllRegions ? (
                'All regions'
              ) : effectiveRegions && effectiveRegions.length > 1 ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">Multiregion ({effectiveRegions.length})</span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <ul className="list-disc list-inside space-y-0.5 text-left">
                        {effectiveRegions.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                (region ?? 'Pacific Northwest')
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'all'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('all')}>
                      <Icon name="devices" size={18} />
                      <span>All devices</span>
                      <SidebarMenuBadge>{deviceCounts.region.all}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'disconnected'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('disconnected')}>
                      <Icon name="link_off" size={18} />
                      <span>Disconnected</span>
                      <SidebarMenuBadge>{deviceCounts.region.disconnected}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'kpiSyncErrors'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('kpiSyncErrors')}>
                      <Icon name="sync_problem" size={18} />
                      <span>KPI sync errors</span>
                      <SidebarMenuBadge>{deviceCounts.region.kpiSyncErrors}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'inMaintenance'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('inMaintenance')}>
                      <Icon name="build" size={18} />
                      <span>In maintenance</span>
                      <SidebarMenuBadge>{deviceCounts.region.inMaintenance}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'offline'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('offline')}>
                      <Icon name="power_settings_new" size={18} />
                      <span>Offline</span>
                      <SidebarMenuBadge>{deviceCounts.region.offline}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={selectedRegion === 'configMismatch'}>
                    <button type="button" className="flex w-full items-center gap-2" onClick={() => setSelectedRegion('configMismatch')}>
                      <Icon name="compare_arrows" size={18} />
                      <span>Config mismatch</span>
                      <SidebarMenuBadge>{deviceCounts.region.configMismatch}</SidebarMenuBadge>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Device groups – collapsible flat list */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-full shrink-0 items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
                >
                  <span className="flex flex-1">Device groups</span>
                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  {isAllRegions || (effectiveRegions && effectiveRegions.length > 1) ? (
                    <>
                      {sidebarRegionList.map((reg) => {
                        const counts = deviceCountsByRegion[reg];
                        if (!counts) return null;
                        return (
                          <Collapsible key={reg} className="group/region-collapsible">
                            <SidebarGroup className="pt-1">
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="flex h-8 w-full shrink-0 items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
                                >
                                  <span className="flex flex-1">{reg}</span>
                                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/region-collapsible:rotate-180" />
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarGroupContent>
                                  <SidebarMenu>
                                    {(['Core network', 'Radio access', 'Edge devices', 'Test environment'] as const).map((groupName) => (
                                      <SidebarMenuItem key={`${reg}-${groupName}`}>
                                        <SidebarMenuButton asChild isActive={selectedGroup === groupName}>
                                          <button
                                            type="button"
                                            className="flex w-full items-center gap-2"
                                            onClick={() => setSelectedGroup(groupName)}
                                          >
                                            <Icon name="folder" size={18} />
                                            <span>{groupName}</span>
                                            <SidebarMenuBadge>{counts.groups[groupName] ?? 0}</SidebarMenuBadge>
                                          </button>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    ))}
                                    <SidebarMenuItem>
                                      <SidebarMenuButton asChild>
                                        <button type="button" className="flex w-full items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                                          <Icon name="add" size={18} />
                                          <span>Add group</span>
                                        </button>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  </SidebarMenu>
                                </SidebarGroupContent>
                              </CollapsibleContent>
                            </SidebarGroup>
                          </Collapsible>
                        );
                      })}
                    </>
                  ) : (
                    <SidebarMenu>
                      {(['Core network', 'Radio access', 'Edge devices', 'Test environment'] as const).map((groupName) => (
                        <SidebarMenuItem key={groupName}>
                          <SidebarMenuButton asChild isActive={selectedGroup === groupName}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2"
                              onClick={() => setSelectedGroup(groupName)}
                            >
                              <Icon name="folder" size={18} />
                              <span>{groupName}</span>
                              <SidebarMenuBadge>{deviceCounts.groups[groupName] ?? 0}</SidebarMenuBadge>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <button type="button" className="flex w-full items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                            <Icon name="add" size={18} />
                            <span>Add group</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
        <SidebarInset className="min-w-0 overflow-hidden">
          <Tabs value={mainTab} defaultValue="device" onValueChange={handleMainTabChange} className="flex flex-1 flex-col min-h-0">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
                <TabsList className="inline-flex h-auto gap-0 bg-transparent p-0 shrink-0 border-0 rounded-none">
                  <TabsTrigger value="device" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Devices
                  </TabsTrigger>
                  <TabsTrigger value="alarms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Alarms
                  </TabsTrigger>
                  <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="conditions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Conditions
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="scheduled-tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Scheduled tasks
                  </TabsTrigger>
                  <TabsTrigger value="software-management" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Software management
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                    Performance
                  </TabsTrigger>
                </TabsList>
              </div>
            </header>
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              <div className="@container/main flex flex-1 flex-col gap-2 min-h-0 min-w-0">
                <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 min-h-0 overflow-hidden">
              <TabsContent value="device" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <ErrorBoundary>
                {/* Default area above table: selection + actions OR search + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  {deviceSelectedCount >= 1 ? (
                    <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0 ml-auto sm:ml-0">
                      <Button variant="secondary">
                        Configure
                      </Button>
                      <Button variant="secondary">
                        Add to site
                      </Button>
                      <Button variant="secondary">
                        Group
                      </Button>
                      <Button variant="secondary" className="gap-1.5">
                        <Icon name="delete" size={18} />
                        Delete
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" className="gap-1">
                            More actions
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem>Refresh</DropdownMenuItem>
                            <DropdownMenuItem>Reboot</DropdownMenuItem>
                            <DropdownMenuItem>Network settings</DropdownMenuItem>
                            <DropdownMenuItem>Update firmware</DropdownMenuItem>
                            <DropdownMenuItem>Create backup</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  ) : (
                    <>
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
                        {regions && regions.length > 1 && (
                          <FilterSelect value={regionFilter} onValueChange={setRegionFilter} label="Region" options={['All', ...regions]} className="w-[140px] shrink-0" />
                        )}
                        <FilterSelect value={statusFilter} onValueChange={handleStatusFilterChange} label="Status" options={STATUS_OPTIONS} className="w-[120px] shrink-0" />
                        <FilterSelect value={configStatusFilter} onValueChange={handleConfigStatusFilterChange} label="Config status" options={CONFIG_STATUS_OPTIONS} className="w-[130px] shrink-0" />
                        <FilterSelect value={typeFilter} onValueChange={setTypeFilter} label="Device type" options={TYPE_OPTIONS} className="w-[130px] shrink-0" />
                        <FilterSelect value={versionFilter} onValueChange={setVersionFilter} label="Version" options={VERSION_OPTIONS} className="w-[100px] shrink-0" />
                        <FilterSelect value={alarmsFilter} onValueChange={setAlarmsFilter} label="Alarms" options={ALARMS_OPTIONS} className="w-[110px] shrink-0" />
                        <FilterSelect value={labelsFilter} onValueChange={setLabelsFilter} label="Labels" options={LABELS_OPTIONS} className="w-[110px] shrink-0" />
                      </div>
                    </>
                  )}
                </div>
                {/* Selected count + Clear OR active filters + result count (row above table like default view) */}
                {deviceSelectedCount >= 1 ? (
                  <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                    <span className="text-sm text-muted-foreground">
                      {deviceSelectedCount} {deviceSelectedCount === 1 ? 'device' : 'devices'} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-link hover:text-link-hover"
                      onClick={() => setClearSelectionTrigger((t) => t + 1)}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (() => {
                        const count = getFilteredDeviceCount({
                          sidebarRegion: selectedRegion,
                          statusFilter,
                          search,
                          configStatusFilter,
                          typeFilter,
                          versionFilter,
                          alarmsFilter,
                          labelsFilter,
                        }, regions);
                        const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                        if (regionFilter !== 'All') activeFilters.push({ key: 'region', label: `Region: ${regionFilter}`, onClear: () => setRegionFilter('All') });
                        if (statusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${statusFilter}`, onClear: () => { setStatusFilter('All'); setSelectedRegion('all'); } });
                        if (configStatusFilter !== 'All') activeFilters.push({ key: 'config', label: `Config: ${configStatusFilter}`, onClear: () => { setConfigStatusFilter('All'); if (selectedRegion === 'kpiSyncErrors') setSelectedRegion('all'); } });
                        if (typeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('All') });
                        if (versionFilter !== 'All') activeFilters.push({ key: 'version', label: `Version: ${versionFilter}`, onClear: () => setVersionFilter('All') });
                        if (alarmsFilter !== 'All') activeFilters.push({ key: 'alarms', label: `Alarms: ${alarmsFilter}`, onClear: () => setAlarmsFilter('All') });
                        if (labelsFilter !== 'All') activeFilters.push({ key: 'labels', label: `Labels: ${labelsFilter}`, onClear: () => setLabelsFilter('All') });
                        if (search.trim()) activeFilters.push({ key: 'search', label: `Search: "${search.trim()}"`, onClear: () => setSearch('') });
                        const hasActive = activeFilters.length > 0;
                        return (
                          <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                            <span className="text-sm text-muted-foreground">
                              {count} {count === 1 ? 'result' : 'results'}
                            </span>
                            {activeFilters.map((f) => (
                              <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                                {f.label}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                                  onClick={f.onClear}
                                  aria-label={`Clear ${f.label}`}
                                >
                                  <Icon name="close" size={12} aria-hidden />
                                </Button>
                              </Badge>
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
                    selectedRegions={regions}
                    sidebarRegion={selectedRegion}
                    regionFilter={regionFilter}
                    statusFilter={statusFilter}
                    search={search}
                    configStatusFilter={configStatusFilter}
                    typeFilter={typeFilter}
                    versionFilter={versionFilter}
                    alarmsFilter={alarmsFilter}
                    labelsFilter={labelsFilter}
                    onNavigateToDeviceDetail={onNavigateToDeviceDetail}
                    onSelectionChange={setDeviceSelectedCount}
                    clearSelectionTrigger={clearSelectionTrigger}
                  />
                </div>
                </ErrorBoundary>
              </TabsContent>
              <TabsContent value="alarms" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Action bar or search + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  {alarmSelectedCount >= 1 ? (
                    <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                      <Button variant="secondary">
                        Acknowledge
                      </Button>
                      <Button variant="secondary">
                        Assign ticket
                      </Button>
                      <Button variant="secondary" className="gap-1.5">
                        <Icon name="cancel" size={18} />
                        Clear alarms
                      </Button>
                    </div>
                  ) : (
                    <>
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
                        {regions && regions.length > 1 && (
                          <FilterSelect value={regionFilter} onValueChange={setRegionFilter} label="Region" options={['All', ...regions]} className="w-[140px] shrink-0" />
                        )}
                        <FilterSelect value={statusFilter} onValueChange={handleStatusFilterChange} label="Status" options={STATUS_OPTIONS} className="w-[120px] shrink-0" />
                        <FilterSelect value={configStatusFilter} onValueChange={handleConfigStatusFilterChange} label="Config status" options={CONFIG_STATUS_OPTIONS} className="w-[130px] shrink-0" />
                        <FilterSelect value={typeFilter} onValueChange={setTypeFilter} label="Device type" options={TYPE_OPTIONS} className="w-[130px] shrink-0" />
                        <FilterSelect value={versionFilter} onValueChange={setVersionFilter} label="Version" options={VERSION_OPTIONS} className="w-[100px] shrink-0" />
                        <FilterSelect value={alarmsFilter} onValueChange={setAlarmsFilter} label="Alarms" options={ALARMS_OPTIONS} className="w-[110px] shrink-0" />
                        <FilterSelect value={labelsFilter} onValueChange={setLabelsFilter} label="Labels" options={LABELS_OPTIONS} className="w-[110px] shrink-0" />
                      </div>
                    </>
                  )}
                </div>
                {alarmSelectedCount >= 1 ? (
                  <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                    <span className="text-sm text-muted-foreground">
                      {alarmSelectedCount} {alarmSelectedCount === 1 ? 'alarm' : 'alarms'} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-link hover:text-link-hover"
                      onClick={() => setAlarmClearSelectionTrigger((t) => t + 1)}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (() => {
                  const count = getFilteredAlarmsCount({ search, severityFilter: alarmsFilter, regionFilter });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (regionFilter !== 'All') activeFilters.push({ key: 'region', label: `Region: ${regionFilter}`, onClear: () => setRegionFilter('All') });
                  if (statusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${statusFilter}`, onClear: () => { setStatusFilter('All'); setSelectedRegion('all'); } });
                  if (configStatusFilter !== 'All') activeFilters.push({ key: 'config', label: `Config: ${configStatusFilter}`, onClear: () => { setConfigStatusFilter('All'); if (selectedRegion === 'kpiSyncErrors') setSelectedRegion('all'); } });
                  if (typeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${typeFilter}`, onClear: () => setTypeFilter('All') });
                  if (versionFilter !== 'All') activeFilters.push({ key: 'version', label: `Version: ${versionFilter}`, onClear: () => setVersionFilter('All') });
                  if (alarmsFilter !== 'All') activeFilters.push({ key: 'alarms', label: `Alarms: ${alarmsFilter}`, onClear: () => setAlarmsFilter('All') });
                  if (labelsFilter !== 'All') activeFilters.push({ key: 'labels', label: `Labels: ${labelsFilter}`, onClear: () => setLabelsFilter('All') });
                  if (search.trim()) activeFilters.push({ key: 'search', label: `Search: "${search.trim()}"`, onClear: () => setSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearDeviceFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <AlarmsDataTable
                    search={search}
                    severityFilter={alarmsFilter}
                    selectedRegions={regions}
                    regionFilter={regionFilter}
                    onSelectionChange={setAlarmSelectedCount}
                    clearSelectionTrigger={alarmClearSelectionTrigger}
                  />
                </div>
              </TabsContent>
              <TabsContent value="events" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Action bar or search + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  {eventSelectedCount >= 1 ? (
                    <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                      <Button variant="secondary">
                        Acknowledge
                      </Button>
                      <Button variant="secondary">
                        Assign ticket
                      </Button>
                      <Button variant="secondary" className="gap-1.5">
                        <Icon name="delete" size={18} />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <>
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
                    {regions && regions.length > 1 && (
                      <FilterSelect value={regionFilter} onValueChange={setRegionFilter} label="Region" options={['All', ...regions]} className="w-[140px] shrink-0" />
                    )}
                    <FilterSelect value={eventsTypeFilter} onValueChange={setEventsTypeFilter} label="Type" options={EVENTS_TYPE_OPTIONS} className="w-[160px] shrink-0" />
                    <FilterSelect value={eventsSeverityFilter} onValueChange={setEventsSeverityFilter} label="Severity" options={EVENTS_SEVERITY_OPTIONS} className="w-[120px] shrink-0" />
                    <FilterSelect value={eventsSourceFilter} onValueChange={setEventsSourceFilter} label="Source" options={EVENTS_SOURCE_OPTIONS} className="w-[130px] shrink-0" />
                  </div>
                    </>
                  )}
                </div>
                {/* Selected count + Clear OR active filters + result count */}
                {eventSelectedCount >= 1 ? (
                  <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                    <span className="text-sm text-muted-foreground">
                      {eventSelectedCount} {eventSelectedCount === 1 ? 'event' : 'events'} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-link hover:text-link-hover"
                      onClick={() => setEventClearSelectionTrigger((t) => t + 1)}
                    >
                      Clear
                    </Button>
                  </div>
                ) : null}
                {eventSelectedCount < 1 && (() => {
                  /* Active filters + result count */
                  const count = getFilteredEventCount({
                    search: eventsSearch,
                    typeFilter: eventsTypeFilter,
                    severityFilter: eventsSeverityFilter,
                    sourceFilter: eventsSourceFilter,
                    regionFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (regionFilter !== 'All') activeFilters.push({ key: 'region', label: `Region: ${regionFilter}`, onClear: () => setRegionFilter('All') });
                  if (eventsTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${eventsTypeFilter}`, onClear: () => setEventsTypeFilter('All') });
                  if (eventsSeverityFilter !== 'All') activeFilters.push({ key: 'severity', label: `Severity: ${eventsSeverityFilter}`, onClear: () => setEventsSeverityFilter('All') });
                  if (eventsSourceFilter !== 'All') activeFilters.push({ key: 'source', label: `Source: ${eventsSourceFilter}`, onClear: () => setEventsSourceFilter('All') });
                  if (eventsSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${eventsSearch.trim()}"`, onClear: () => setEventsSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
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
                    selectedRegions={regions}
                    regionFilter={regionFilter}
                    onSelectionChange={setEventSelectedCount}
                    clearSelectionTrigger={eventClearSelectionTrigger}
                  />
                </div>
              </TabsContent>
              <TabsContent value="conditions" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <p className="text-muted-foreground">Conditions content</p>
              </TabsContent>
              <TabsContent value="inventory" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search + Button Group + Filters + Export */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 mb-3">
                  <div className="relative">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search inventory…"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  {/* Button group: view filter */}
                  <div className="inline-flex items-center rounded-md border border-input shadow-sm">
                    {([
                      { value: 'radio-nodes', label: 'Radio nodes' },
                      { value: 'nr-cells', label: 'NR cells' },
                    ] as const).map((opt, i, arr) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInventoryViewFilter(opt.value)}
                        className={`h-9 px-3 text-sm font-medium transition-colors ${
                          inventoryViewFilter === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-foreground hover:bg-muted'
                        } ${i === 0 ? 'rounded-l-md' : ''} ${i === arr.length - 1 ? 'rounded-r-md' : ''} ${i > 0 ? 'border-l border-input' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Filters */}
                  <FilterSelect value={inventoryStatusFilter} onValueChange={setInventoryStatusFilter} label="Status" options={INVENTORY_STATUS_OPTIONS} className="w-[110px] shrink-0" />
                  <FilterSelect value={inventoryTypeFilter} onValueChange={setInventoryTypeFilter} label="Type" options={INVENTORY_TYPE_OPTIONS} className="w-[130px] shrink-0" />
                  <FilterSelect value={inventoryVersionFilter} onValueChange={setInventoryVersionFilter} label="Version" options={INVENTORY_VERSION_OPTIONS} className="w-[120px] shrink-0" />
                  <FilterSelect value={inventoryAlarmFilter} onValueChange={setInventoryAlarmFilter} label="Alarms" options={INVENTORY_ALARM_OPTIONS} className="w-[120px] shrink-0" />
                  <div className="ml-auto">
                    <Button variant="outline" size="default" className="gap-1.5">
                      <Icon name="download" size={16} />
                      Export
                    </Button>
                  </div>
                </div>
                {/* Active filters + result count */}
                {(() => {
                  const count = getFilteredInventoryCount({
                    search: inventorySearch,
                    viewFilter: inventoryViewFilter,
                    statusFilter: inventoryStatusFilter,
                    typeFilter: inventoryTypeFilter,
                    versionFilter: inventoryVersionFilter,
                    alarmFilter: inventoryAlarmFilter,
                  });
                  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                  if (inventoryViewFilter !== 'radio-nodes') activeFilters.push({ key: 'view', label: `View: NR cells`, onClear: () => setInventoryViewFilter('radio-nodes') });
                  if (inventoryStatusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${inventoryStatusFilter}`, onClear: () => setInventoryStatusFilter('All') });
                  if (inventoryTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${inventoryTypeFilter}`, onClear: () => setInventoryTypeFilter('All') });
                  if (inventoryVersionFilter !== 'All') activeFilters.push({ key: 'version', label: `Version: ${inventoryVersionFilter}`, onClear: () => setInventoryVersionFilter('All') });
                  if (inventoryAlarmFilter !== 'All') activeFilters.push({ key: 'alarm', label: `Alarms: ${inventoryAlarmFilter}`, onClear: () => setInventoryAlarmFilter('All') });
                  if (inventorySearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${inventorySearch.trim()}"`, onClear: () => setInventorySearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
                      ))}
                      {hasActive && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={clearInventoryFilters}>Clear all</Button>
                      )}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <InventoryDataTable
                    search={inventorySearch}
                    viewFilter={inventoryViewFilter}
                    statusFilter={inventoryStatusFilter}
                    typeFilter={inventoryTypeFilter}
                    versionFilter={inventoryVersionFilter}
                    alarmFilter={inventoryAlarmFilter}
                  />
                </div>
              </TabsContent>
              <TabsContent value="scheduled-tasks" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
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
                    <FilterSelect value={tasksTypeFilter} onValueChange={setTasksTypeFilter} label="Type" options={TASKS_TYPE_OPTIONS} className="w-[130px] shrink-0" />
                    <FilterSelect value={tasksStatusFilter} onValueChange={setTasksStatusFilter} label="Status" options={TASKS_STATUS_OPTIONS} className="w-[120px] shrink-0" />
                    <FilterSelect value={tasksDomainFilter} onValueChange={setTasksDomainFilter} label="Domain" options={TASKS_DOMAIN_OPTIONS} className="w-[140px] shrink-0" />
                  </div>
                  <Button variant="outline" size="default" className="shrink-0 gap-1 ml-auto" onClick={() => setAddTaskDialogOpen(true)}>
                    <Icon name="add" size={18} />
                    Add scheduled task
                  </Button>
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
                  if (tasksTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${tasksTypeFilter}`, onClear: () => setTasksTypeFilter('All') });
                  if (tasksStatusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${tasksStatusFilter}`, onClear: () => setTasksStatusFilter('All') });
                  if (tasksDomainFilter !== 'All') activeFilters.push({ key: 'domain', label: `Domain: ${tasksDomainFilter}`, onClear: () => setTasksDomainFilter('All') });
                  if (tasksSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${tasksSearch.trim()}"`, onClear: () => setTasksSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
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
              <TabsContent value="software-management" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
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
                    <FilterSelect value={softwareTypeFilter} onValueChange={setSoftwareTypeFilter} label="Type" options={SOFTWARE_TYPE_OPTIONS} className="w-[130px] shrink-0" />
                    <FilterSelect value={softwareStatusFilter} onValueChange={setSoftwareStatusFilter} label="Status" options={SOFTWARE_STATUS_OPTIONS} className="w-[120px] shrink-0" />
                    <FilterSelect value={softwareVersionFilter} onValueChange={setSoftwareVersionFilter} label="Version" options={SOFTWARE_VERSION_OPTIONS} className="w-[100px] shrink-0" />
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
                  if (softwareTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${softwareTypeFilter}`, onClear: () => setSoftwareTypeFilter('All') });
                  if (softwareStatusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${softwareStatusFilter}`, onClear: () => setSoftwareStatusFilter('All') });
                  if (softwareVersionFilter !== 'All') activeFilters.push({ key: 'version', label: `Version: ${softwareVersionFilter}`, onClear: () => setSoftwareVersionFilter('All') });
                  if (softwareSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${softwareSearch.trim()}"`, onClear: () => setSoftwareSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
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
                        <FilterSelect value={softwareTypeFilter} onValueChange={setSoftwareTypeFilter} label="Type" options={SOFTWARE_TYPE_OPTIONS} className="w-[130px] shrink-0" />
                        <FilterSelect value={softwareStatusFilter} onValueChange={setSoftwareStatusFilter} label="Status" options={SOFTWARE_STATUS_OPTIONS} className="w-[120px] shrink-0" />
                        <FilterSelect value={softwareVersionFilter} onValueChange={setSoftwareVersionFilter} label="Version" options={SOFTWARE_VERSION_OPTIONS} className="w-[100px] shrink-0" />
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
                      if (softwareTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${softwareTypeFilter}`, onClear: () => setSoftwareTypeFilter('All') });
                      if (softwareStatusFilter !== 'All') activeFilters.push({ key: 'status', label: `Status: ${softwareStatusFilter}`, onClear: () => setSoftwareStatusFilter('All') });
                      if (softwareVersionFilter !== 'All') activeFilters.push({ key: 'version', label: `Version: ${softwareVersionFilter}`, onClear: () => setSoftwareVersionFilter('All') });
                      if (softwareSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${softwareSearch.trim()}"`, onClear: () => setSoftwareSearch('') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                              {f.label}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                                onClick={f.onClear}
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={12} aria-hidden />
                              </Button>
                            </Badge>
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
              <TabsContent value="reports" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
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
                    <FilterSelect value={reportsTypeFilter} onValueChange={setReportsTypeFilter} label="Type" options={REPORT_TYPE_OPTIONS} className="w-[110px] shrink-0" />
                    <FilterSelect value={reportsTaskFilter} onValueChange={setReportsTaskFilter} label="Task" options={REPORT_TASK_OPTIONS} className="w-[140px] shrink-0" />
                    <FilterSelect value={reportsCreatedFilter} onValueChange={setReportsCreatedFilter} label="Created" options={REPORT_CREATED_OPTIONS} className="w-[120px] shrink-0" />
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
                  if (reportsTypeFilter !== 'All') activeFilters.push({ key: 'type', label: `Type: ${reportsTypeFilter}`, onClear: () => setReportsTypeFilter('All') });
                  if (reportsTaskFilter !== 'All') activeFilters.push({ key: 'task', label: `Task: ${reportsTaskFilter}`, onClear: () => setReportsTaskFilter('All') });
                  if (reportsCreatedFilter !== 'All') activeFilters.push({ key: 'created', label: `Created: ${reportsCreatedFilter}`, onClear: () => setReportsCreatedFilter('All') });
                  if (reportsSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${reportsSearch.trim()}"`, onClear: () => setReportsSearch('') });
                  const hasActive = activeFilters.length > 0;
                  return (
                    <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                      {activeFilters.map((f) => (
                        <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                          {f.label}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                            onClick={f.onClear}
                            aria-label={`Clear ${f.label}`}
                          >
                            <Icon name="close" size={12} aria-hidden />
                          </Button>
                        </Badge>
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
              <TabsContent value="performance" className="flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
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
                        <FilterSelect value={performanceLteFilter} onValueChange={setPerformanceLteFilter} label="LTE" options={PERFORMANCE_LTE_OPTIONS} className="w-[110px] shrink-0" />
                        <FilterSelect value={performanceTimeFilter} onValueChange={setPerformanceTimeFilter} label="Last hour" options={PERFORMANCE_TIME_OPTIONS} className="w-[120px] shrink-0" />
                        <div className="inline-flex items-center rounded-md border border-input shadow-sm shrink-0">
                          {([
                            { value: 'all', label: 'All' },
                            { value: 'degraded', label: 'Degraded' },
                            { value: 'optimal', label: 'Optimal' },
                          ] as const).map((opt, i, arr) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPerformanceStatusFilter(opt.value)}
                              className={`h-9 px-3 text-sm font-medium transition-colors ${
                                performanceStatusFilter === opt.value
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background text-foreground hover:bg-muted'
                              } ${i === 0 ? 'rounded-l-md' : ''} ${i === arr.length - 1 ? 'rounded-r-md' : ''} ${i > 0 ? 'border-l border-input' : ''}`}
                            >
                              {opt.label}
                            </button>
                          ))}
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
                      if (performanceLteFilter !== 'All') activeFilters.push({ key: 'lte', label: `LTE: ${performanceLteFilter}`, onClear: () => setPerformanceLteFilter('All') });
                      if (performanceTimeFilter !== 'All') activeFilters.push({ key: 'time', label: `Time: ${performanceTimeFilter}`, onClear: () => setPerformanceTimeFilter('All') });
                      if (performanceStatusFilter !== 'all') activeFilters.push({ key: 'status', label: `Status: ${performanceStatusFilter}`, onClear: () => setPerformanceStatusFilter('all') });
                      if (performanceSearch.trim()) activeFilters.push({ key: 'search', label: `Search: "${performanceSearch.trim()}"`, onClear: () => setPerformanceSearch('') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                              {f.label}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                                onClick={f.onClear}
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={12} aria-hidden />
                              </Button>
                            </Badge>
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                        <FilterSelect value={thresholdActSessFilter} onValueChange={setThresholdActSessFilter} label="ACT_SESS" options={THRESHOLD_ACT_SESS_OPTIONS} className="w-[140px] shrink-0" />
                      </div>
                    </div>
                    {(() => {
                      const count = getFilteredThresholdCount({ actSessFilter: thresholdActSessFilter });
                      const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                      if (thresholdActSessFilter !== 'All') activeFilters.push({ key: 'actSess', label: `ACT_SESS: ${thresholdActSessFilter}`, onClear: () => setThresholdActSessFilter('All') });
                      const hasActive = activeFilters.length > 0;
                      return (
                        <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                          <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                          {activeFilters.map((f) => (
                            <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                              {f.label}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                                onClick={f.onClear}
                                aria-label={`Clear ${f.label}`}
                              >
                                <Icon name="close" size={12} aria-hidden />
                              </Button>
                            </Badge>
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
                </div>
              </div>
            </div>
          </Tabs>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}

export default DevicesPage;

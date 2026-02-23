'use client';

import { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { DeviceStatus } from './ui/device-status';
import { DeviceLink } from './ui/device-link';
import { NodeTypeBadge } from './ui/node-type-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AccessControlUsersDataTable, ACCESS_CONTROL_USERS_DATA } from './access-control-users-data-table';
import { AccessControlDomainsDataTable, ACCESS_CONTROL_DOMAINS_DATA } from './access-control-domains-data-table';
import type { AccessControlDomainRow } from './access-control-domains-data-table';
import { AddDomainSheet } from './add-domain-sheet';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import FaultManagementPage from './FaultManagementPage';
import LabelManagementPage from './LabelManagementPage';
import FileManagementPage from './FileManagementPage';
import DeviceMigrationPage from './DeviceMigrationPage';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const SIDEBAR_ITEMS = [
  { label: 'Access control', icon: 'admin_panel_settings' },
  { label: 'Audit trail', icon: 'history' },
  { label: 'Northbound interface', icon: 'api' },
  { label: 'Email', icon: 'mail' },
  { label: 'File management', icon: 'folder' },
  { label: 'Fault management', icon: 'error' },
  { label: 'Service settings', icon: 'settings' },
  { label: 'Device migration', icon: 'swap_horiz' },
  { label: 'Performance', icon: 'speed' },
  { label: 'Label management', icon: 'label' },
] as const;

const PROFILE_OPTIONS = ['All', 'Administrator', 'Operator', 'Viewer'] as const;
const DEPARTMENT_OPTIONS = ['All', 'Engineering', 'Operations', 'Support', 'Management'] as const;
const LOCATION_OPTIONS = ['All', 'Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York'] as const;

export interface ProfileSchedule { days: string[]; allDay: boolean; startTime: string; endTime: string }
export interface ProfileAction { action: string; details: string; detailType?: 'badge' }
export interface ProfileRule { kpi: string; type: string; condition: string; samples: number }
export interface ProfileData {
  name: string;
  devices: number;
  description: string;
  enabled: boolean;
  actions: ProfileAction[];
  schedules: Record<string, ProfileSchedule>;
  rules: ProfileRule[];
}

export const PERF_PROFILES_INIT: Record<string, ProfileData> = {
  'LTE Throughput Baseline': {
    name: 'LTE Throughput Baseline', devices: 124,
    description: 'Monitors key LTE performance indicators including throughput, latency, and call quality metrics. Alerts are triggered when thresholds are exceeded for the configured number of consecutive samples.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'lkrug@acme.com, dkoons@acme.com, gsalaslzquiel...' },
      { action: 'Send SNMP notifications', details: 'Notification group', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'CS_RCESR', type: 'LTE', condition: '< 1000', samples: 5 },
      { kpi: 'CS_RCESR', type: 'LTE', condition: '> 500', samples: 5 },
      { kpi: 'CS_RCESR', type: 'LTE', condition: '> 5000', samples: 5 },
      { kpi: 'DL_THRP', type: 'LTE', condition: '< 2000', samples: 3 },
      { kpi: 'UL_THRP', type: 'LTE', condition: '< 1000', samples: 3 },
    ],
  },
  'NR Cell Availability': {
    name: 'NR Cell Availability', devices: 87,
    description: 'Tracks NR cell availability and service continuity. Monitors cell downtime events and triggers alerts when availability drops below defined thresholds.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'noc-team@acme.com, rgarcia@acme.com' },
      { action: 'Create incident ticket', details: 'ServiceNow integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'CELL_AVAIL', type: 'NR', condition: '< 99.5%', samples: 4 },
      { kpi: 'CELL_AVAIL', type: 'NR', condition: '< 95%', samples: 2 },
      { kpi: 'CELL_DOWNTIME', type: 'NR', condition: '> 300s', samples: 1 },
    ],
  },
  'ERAB Drop Rate': {
    name: 'ERAB Drop Rate', devices: 56,
    description: 'Monitors E-RAB (E-UTRAN Radio Access Bearer) drop rates across the network. Excessive drops indicate radio resource management issues or coverage gaps.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'ran-ops@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '06:00', endTime: '22:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '09:00', endTime: '17:00' },
    },
    rules: [
      { kpi: 'ERAB_DROP', type: 'LTE', condition: '> 2%', samples: 5 },
      { kpi: 'ERAB_DROP', type: 'LTE', condition: '> 5%', samples: 3 },
      { kpi: 'ERAB_SETUP_FAIL', type: 'LTE', condition: '> 1%', samples: 4 },
    ],
  },
  'RRC Setup Success': {
    name: 'RRC Setup Success', devices: 93,
    description: 'Evaluates RRC (Radio Resource Control) connection setup success rates. Low success rates may indicate congestion, interference, or parameter misconfiguration.',
    enabled: false,
    actions: [
      { action: 'Send email', details: 'performance@acme.com, jnelson@acme.com' },
      { action: 'Send SNMP notifications', details: 'Critical alerts', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'RRC_SETUP_SR', type: 'LTE', condition: '< 98%', samples: 4 },
      { kpi: 'RRC_SETUP_SR', type: 'LTE', condition: '< 95%', samples: 2 },
      { kpi: 'RRC_CONN_MAX', type: 'LTE', condition: '> 900', samples: 3 },
      { kpi: 'RRC_SETUP_TIME', type: 'LTE', condition: '> 500ms', samples: 5 },
      { kpi: 'RRC_REEST_SR', type: 'LTE', condition: '< 90%', samples: 3 },
    ],
  },
  'Handover Success Rate': {
    name: 'Handover Success Rate', devices: 71,
    description: 'Tracks inter-cell and inter-RAT handover success rates. Failed handovers lead to dropped calls and degraded user experience in mobility scenarios.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'mobility-team@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '07:00', endTime: '21:00' },
    },
    rules: [
      { kpi: 'HO_SUCCESS', type: 'LTE', condition: '< 97%', samples: 4 },
      { kpi: 'HO_SUCCESS', type: 'LTE', condition: '< 93%', samples: 2 },
      { kpi: 'INTER_RAT_HO', type: 'LTE', condition: '< 90%', samples: 3 },
      { kpi: 'HO_PING_PONG', type: 'LTE', condition: '> 5%', samples: 4 },
    ],
  },
  'VoLTE Call Drop': {
    name: 'VoLTE Call Drop', devices: 42,
    description: 'Monitors VoLTE call drop rates and voice quality indicators. Ensures voice service quality meets operator SLA requirements.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'volte-ops@acme.com, quality@acme.com' },
      { action: 'Send SNMP notifications', details: 'VoLTE alerts', detailType: 'badge' },
      { action: 'Create incident ticket', details: 'PagerDuty integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'VOLTE_DROP', type: 'LTE', condition: '> 1%', samples: 3 },
      { kpi: 'VOLTE_MOS', type: 'LTE', condition: '< 3.5', samples: 5 },
      { kpi: 'VOLTE_SETUP_TIME', type: 'LTE', condition: '> 3s', samples: 4 },
    ],
  },
  'Latency SLA': {
    name: 'Latency SLA', devices: 38,
    description: 'Ensures network latency remains within SLA-defined bounds. Monitors round-trip times and jitter for compliance reporting.',
    enabled: false,
    actions: [
      { action: 'Send email', details: 'sla-mgmt@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '08:00', endTime: '20:00' },
    },
    rules: [
      { kpi: 'RTT_AVG', type: 'NR', condition: '> 20ms', samples: 5 },
      { kpi: 'RTT_P95', type: 'NR', condition: '> 50ms', samples: 3 },
    ],
  },
  'CPU Utilization': {
    name: 'CPU Utilization', devices: 65,
    description: 'Monitors baseband and control-plane CPU utilization across network elements. High CPU usage can lead to processing delays and degraded service.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'infra-team@acme.com, capacity@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
      '2': { days: ['sat', 'sun'], allDay: true, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'CPU_LOAD', type: 'System', condition: '> 80%', samples: 5 },
      { kpi: 'CPU_LOAD', type: 'System', condition: '> 95%', samples: 2 },
    ],
  },
  'Packet Loss': {
    name: 'Packet Loss', devices: 51,
    description: 'Tracks packet loss rates on user-plane and transport interfaces. Excessive packet loss degrades throughput and impacts real-time services.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'transport@acme.com' },
      { action: 'Send SNMP notifications', details: 'Transport group', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'PKT_LOSS_DL', type: 'NR', condition: '> 0.5%', samples: 4 },
      { kpi: 'PKT_LOSS_UL', type: 'NR', condition: '> 0.5%', samples: 4 },
      { kpi: 'PKT_LOSS_DL', type: 'NR', condition: '> 2%', samples: 2 },
    ],
  },
  'UL/DL Throughput': {
    name: 'UL/DL Throughput', devices: 110,
    description: 'Monitors uplink and downlink throughput per cell and per device. Ensures capacity targets are met and identifies underperforming sectors.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'capacity-plan@acme.com, rops@acme.com' },
      { action: 'Create incident ticket', details: 'ServiceNow integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '06:00', endTime: '23:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '08:00', endTime: '22:00' },
    },
    rules: [
      { kpi: 'DL_THRP', type: 'NR', condition: '< 100 Mbps', samples: 4 },
      { kpi: 'UL_THRP', type: 'NR', condition: '< 20 Mbps', samples: 4 },
      { kpi: 'DL_THRP', type: 'NR', condition: '< 50 Mbps', samples: 2 },
      { kpi: 'UL_THRP', type: 'NR', condition: '< 10 Mbps', samples: 2 },
      { kpi: 'DL_PRB_UTIL', type: 'NR', condition: '> 85%', samples: 5 },
    ],
  },
};

export interface AdministrationPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

export default function AdministrationPage({
  appName = 'AMS',
  onSignOut,
  onNavigate,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
}: AdministrationPageProps) {
  const toKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const [activeSection, setActiveSection] = useState(toKey(SIDEBAR_ITEMS[0].label));
  const [accessControlTab, setAccessControlTab] = useState('users');
  const [addDomainSheetOpen, setAddDomainSheetOpen] = useState(false);
  const [editDomainSheetOpen, setEditDomainSheetOpen] = useState(false);
  const [selectedDomainForEdit, setSelectedDomainForEdit] = useState<AccessControlDomainRow | null>(null);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [perfSearch, setPerfSearch] = useState('');
  const [_perfLteFilter, _setPerfLteFilter] = useState<string>('All');
  const [_perfTimeFilter, _setPerfTimeFilter] = useState<string>('All');
  const [_perfStatusFilter, _setPerfStatusFilter] = useState<'all' | 'degraded' | 'optimal'>('all');
  const [perfProfileSearch, setPerfProfileSearch] = useState('');
  const [selectedPerfProfile, setSelectedPerfProfile] = useState('LTE Throughput Baseline');
  const [perfTab, setPerfTab] = useState<'thresholds' | 'devices'>('thresholds');
  const [perfScheduleTab, setPerfScheduleTab] = useState('1');
  const [perfNameEditing, setPerfNameEditing] = useState(false);
  const [perfDescEditing, setPerfDescEditing] = useState(false);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState<ProfileSchedule>({ days: [], allDay: true, startTime: '08:00', endTime: '18:00' });
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [profileData, setProfileData] = useState<Record<string, ProfileData>>(() => structuredClone(PERF_PROFILES_INIT));

  // Derived helpers for the currently selected profile
  const currentProfileData = profileData[selectedPerfProfile] ?? PERF_PROFILES_INIT['LTE Throughput Baseline'];
  const perfName = currentProfileData.name;
  const perfDescription = currentProfileData.description;
  const schedules = currentProfileData.schedules;
  const scheduleKeys = Object.keys(schedules).sort((a, b) => Number(a) - Number(b));
  const currentSchedule = schedules[perfScheduleTab] ?? { days: [], allDay: true, startTime: '08:00', endTime: '18:00' };

  const updateProfile = (patch: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, [selectedPerfProfile]: { ...prev[selectedPerfProfile], ...patch } }));
  };
  const setPerfName = (name: string) => updateProfile({ name });
  const setPerfDescription = (description: string) => updateProfile({ description });
  const setSchedules = (updater: Record<string, ProfileSchedule> | ((prev: Record<string, ProfileSchedule>) => Record<string, ProfileSchedule>)) => {
    setProfileData((prev) => {
      const curr = prev[selectedPerfProfile];
      const newSchedules = typeof updater === 'function' ? updater(curr.schedules) : updater;
      return { ...prev, [selectedPerfProfile]: { ...curr, schedules: newSchedules } };
    });
  };
  const updateCurrentSchedule = (patch: Partial<ProfileSchedule>) => {
    setSchedules((prev) => ({ ...prev, [perfScheduleTab]: { ...prev[perfScheduleTab], ...patch } }));
  };

  const activeLabel = SIDEBAR_ITEMS.find((item) => toKey(item.label) === activeSection)?.label ?? activeSection;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="administration"
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
              <Icon name="settings" size={18} className="text-sidebar-foreground" />
              <span className="text-sm font-bold text-sidebar-foreground">Administration</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SIDEBAR_ITEMS.map((item) => {
                    const key = toKey(item.label);
                    return (
                      <SidebarMenuItem key={key}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeSection === key}
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2"
                            onClick={() => setActiveSection(key)}
                          >
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="min-w-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            {activeSection === 'access-control' && (
              <div className="space-y-6">
                <Tabs value={accessControlTab} onValueChange={setAccessControlTab}>
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Users
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {ACCESS_CONTROL_USERS_DATA.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="authentication" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Authentication
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          3
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="profiles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Profiles
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          3
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="domains" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Domains
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {ACCESS_CONTROL_DOMAINS_DATA.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="password" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Password
                      </TabsTrigger>
                      <TabsTrigger value="connected-users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Connected users
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          12
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="users" className="mt-6 space-y-4">
                    {/* Search and filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 w-full"
                        />
                      </div>
                      <FilterSelect value={profileFilter} onValueChange={setProfileFilter} label="Profile" options={[...PROFILE_OPTIONS]} className="w-[130px]" />
                      <FilterSelect value={departmentFilter} onValueChange={setDepartmentFilter} label="Department" options={[...DEPARTMENT_OPTIONS]} className="w-[130px]" />
                      <FilterSelect value={locationFilter} onValueChange={setLocationFilter} label="Location" options={[...LOCATION_OPTIONS]} className="w-[130px]" />
                    </div>
                    <AccessControlUsersDataTable />
                  </TabsContent>

                  <TabsContent value="authentication" className="mt-6">
                    <p className="text-muted-foreground">Authentication settings will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="profiles" className="mt-6">
                    <p className="text-muted-foreground">Profile management will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="domains" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button variant="outline" size="default" className="gap-1" onClick={() => setAddDomainSheetOpen(true)}>
                        <Icon name="add" size={18} />
                        Add domain
                      </Button>
                    </div>
                    <AccessControlDomainsDataTable
                      onEditClick={(domain) => {
                        setSelectedDomainForEdit(domain);
                        setEditDomainSheetOpen(true);
                      }}
                    />
                    <AddDomainSheet
                      open={addDomainSheetOpen}
                      onOpenChange={setAddDomainSheetOpen}
                      onSubmit={() => {}}
                    />
                    <AddDomainSheet
                      open={editDomainSheetOpen}
                      onOpenChange={(open) => {
                        setEditDomainSheetOpen(open);
                        if (!open) setSelectedDomainForEdit(null);
                      }}
                      domain={selectedDomainForEdit}
                      onSubmit={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="password" className="mt-6">
                    <p className="text-muted-foreground">Password policies will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="connected-users" className="mt-6">
                    <p className="text-muted-foreground">Connected users will be displayed here.</p>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeSection === 'fault-management' && (
              <FaultManagementPage />
            )}

            {activeSection === 'label-management' && (
              <LabelManagementPage />
            )}

            {activeSection === 'file-management' && (
              <FileManagementPage />
            )}

            {activeSection === 'device-migration' && (
              <DeviceMigrationPage />
            )}

            {activeSection === 'performance' && (() => {
              const allProfiles = Object.values(profileData);
              const filteredProfiles = perfProfileSearch.trim()
                ? allProfiles.filter((p) => p.name.toLowerCase().includes(perfProfileSearch.toLowerCase().trim()))
                : allProfiles;

              return (
                <div className="flex gap-6">
                  {/* Profiles sidebar */}
                  <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden flex flex-col max-h-[calc(100vh-12rem)] self-start">
                    <div className="p-3 border-b border-border/80 bg-muted/20">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">TCA profiles</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add profile" onClick={() => { setNewProfileName(''); setNewProfileDesc(''); setAddProfileOpen(true); }}>
                              <Icon name="add" size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add profile</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative mt-3">
                        <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search profiles..."
                          value={perfProfileSearch}
                          onChange={(e) => setPerfProfileSearch(e.target.value)}
                          className="h-8 pl-8 pr-2 w-full text-sm rounded-md bg-background border-border/80"
                        />
                      </div>
                    </div>
                    <nav className="p-2 flex-1 min-h-0 overflow-y-auto">
                      {filteredProfiles.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No profiles match</p>
                      ) : (
                        filteredProfiles.map((profile) => {
                          const isSelected = selectedPerfProfile === profile.name;
                          return (
                            <button
                              key={profile.name}
                              type="button"
                              onClick={() => { setSelectedPerfProfile(profile.name); setPerfNameEditing(false); setPerfDescEditing(false); setPerfScheduleTab('1'); }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-sm transition-colors ${
                                isSelected
                                  ? 'bg-accent text-accent-foreground font-medium'
                                  : 'hover:bg-muted/60 text-foreground'
                              }`}
                            >
                              <span className="truncate min-w-0">{profile.name}</span>
                            </button>
                          );
                        })
                      )}
                    </nav>
                  </aside>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Profile-specific pill tabs */}
                    {(() => {
                      const deviceCount = currentProfileData.devices;
                      return (
                        <Tabs value={perfTab} onValueChange={(v) => setPerfTab(v as 'thresholds' | 'devices')}>
                          <TabsList>
                            <TabsTrigger value="thresholds">Threshold crossing settings</TabsTrigger>
                            <TabsTrigger value="devices" className="gap-1.5">
                              Devices
                              <Badge variant="secondary" className="ml-0.5 px-1.5 min-w-[20px] justify-center text-xs">{deviceCount}</Badge>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      );
                    })()}

                    {perfTab === 'thresholds' && (
                      <Card>
                        <CardContent className="pt-6 space-y-6">
                          {/* Name */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                              {perfNameEditing ? (
                                <Input
                                  autoFocus
                                  value={perfName}
                                  onChange={(e) => setPerfName(e.target.value)}
                                  onBlur={() => setPerfNameEditing(false)}
                                  onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setPerfNameEditing(false); }}
                                  className="h-8 text-sm w-64"
                                />
                              ) : (
                                <div
                                  className="group/name relative inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 cursor-pointer transition-colors hover:bg-muted/60"
                                  onClick={() => setPerfNameEditing(true)}
                                >
                                  <p className="text-sm">{perfName}</p>
                                  <Icon name="edit" size={14} className="text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-2">
                                <Switch id="perf-enabled" checked={currentProfileData.enabled} onCheckedChange={(v) => updateProfile({ enabled: v })} />
                                <Label htmlFor="perf-enabled" className="cursor-pointer select-none text-sm">Enabled</Label>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={Object.keys(profileData).length <= 1} onClick={() => setDeleteProfileOpen(true)}>
                                <Icon name="delete" size={18} />
                              </Button>
                            </div>
                          </div>

                          {/* Delete profile confirmation */}
                          <AlertDialog open={deleteProfileOpen} onOpenChange={setDeleteProfileOpen}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete profile</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <span className="font-medium text-foreground">{perfName}</span>? This action will remove all threshold crossing settings, actions, schedules, and alert rules associated with this profile.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    const deletedKey = selectedPerfProfile;
                                    const deletedData = structuredClone(profileData[deletedKey]);
                                    // Remove from state
                                    setProfileData((prev) => {
                                      const next = { ...prev };
                                      delete next[deletedKey];
                                      return next;
                                    });
                                    // Select next available profile
                                    const remaining = Object.keys(profileData).filter((k) => k !== deletedKey);
                                    if (remaining.length > 0) {
                                      setSelectedPerfProfile(remaining[0]);
                                      setPerfScheduleTab('1');
                                    }
                                    toast(`"${deletedData.name}" has been deleted`, {
                                      action: {
                                        label: 'Undo',
                                        onClick: () => {
                                          setProfileData((prev) => ({ ...prev, [deletedKey]: deletedData }));
                                          setSelectedPerfProfile(deletedKey);
                                          setPerfScheduleTab('1');
                                          toast.success(`"${deletedData.name}" has been restored`);
                                        },
                                      },
                                    });
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Add profile dialog */}
                          <Dialog open={addProfileOpen} onOpenChange={setAddProfileOpen}>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Add profile</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                  <Label htmlFor="new-profile-name" className="text-sm font-medium">Name</Label>
                                  <Input
                                    id="new-profile-name"
                                    autoFocus
                                    placeholder="e.g. DL Throughput SLA"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    className="h-9"
                                  />
                                  {newProfileName.trim() && profileData[newProfileName.trim()] && (
                                    <p className="text-xs text-destructive">A profile with this name already exists.</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-profile-desc" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                  <Textarea
                                    id="new-profile-desc"
                                    placeholder="Describe the purpose of this profile..."
                                    value={newProfileDesc}
                                    onChange={(e) => setNewProfileDesc(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setAddProfileOpen(false)}>Cancel</Button>
                                <Button
                                  disabled={!newProfileName.trim() || !!profileData[newProfileName.trim()]}
                                  onClick={() => {
                                    const name = newProfileName.trim();
                                    const newProfile: ProfileData = {
                                      name,
                                      devices: 0,
                                      description: newProfileDesc.trim(),
                                      enabled: true,
                                      actions: [],
                                      schedules: {
                                        '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
                                      },
                                      rules: [],
                                    };
                                    setProfileData((prev) => ({ ...prev, [name]: newProfile }));
                                    setSelectedPerfProfile(name);
                                    setPerfScheduleTab('1');
                                    setPerfNameEditing(false);
                                    setPerfDescEditing(false);
                                    setAddProfileOpen(false);
                                    toast.success(`"${name}" has been created`);
                                  }}
                                >
                                  Add
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Description */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                            {perfDescEditing ? (
                              <textarea
                                autoFocus
                                value={perfDescription}
                                onChange={(e) => setPerfDescription(e.target.value)}
                                onBlur={() => setPerfDescEditing(false)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setPerfDescEditing(false); }}
                                className="w-full text-sm text-foreground bg-background border border-input rounded-md px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                rows={3}
                              />
                            ) : (
                              <div
                                className="group/desc inline-flex items-start gap-1.5 rounded-md px-2 py-1.5 -mx-2 -my-1.5 cursor-pointer transition-colors hover:bg-muted/60"
                                onClick={() => setPerfDescEditing(true)}
                              >
                                <p className="text-sm text-foreground">{perfDescription}</p>
                                <Icon name="edit" size={14} className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                              <Button variant="outline" size="sm">
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add action
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">What actions should this profile take when triggered?</p>
                            <div className="rounded-lg border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="px-4">Action</TableHead>
                                    <TableHead className="px-4">Details</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentProfileData.actions.map((act, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="px-4">{act.action}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground truncate max-w-[300px]">
                                        {act.detailType === 'badge' ? <Badge variant="secondary">{act.details}</Badge> : act.details}
                                      </TableCell>
                                      <TableCell className="px-2 text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Icon name="more_vert" size={16} /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Icon name="edit" size={16} className="mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Icon name="delete" size={16} className="mr-2" />Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <Separator />

                          {/* Schedule */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Schedule</h4>
                              <Button variant="outline" size="sm" disabled={scheduleKeys.length >= 2} onClick={() => { setNewSchedule({ days: [], allDay: true, startTime: '08:00', endTime: '18:00' }); setAddScheduleOpen(true); }}>
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add schedule
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Set when alerts should be active for this profile. (Create up to 2)</p>
                            <Tabs value={perfScheduleTab} onValueChange={setPerfScheduleTab}>
                              <TabsList>
                                {scheduleKeys.map((k) => (
                                  <TabsTrigger key={k} value={k}>{k}</TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                            {(() => {
                              const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
                              const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
                              const weekend = ['sat', 'sun'];
                              const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                              const sorted = allDays.filter((d) => currentSchedule.days.includes(d));
                              let daysLabel: string;
                              if (sorted.length === 7) daysLabel = 'Every day';
                              else if (sorted.length === 5 && weekdays.every((d) => sorted.includes(d))) daysLabel = 'Weekdays';
                              else if (sorted.length === 2 && weekend.every((d) => sorted.includes(d))) daysLabel = 'Weekends';
                              else daysLabel = sorted.map((d) => DAY_LABELS[d]).join(', ');
                              const daysShort = sorted.map((d) => DAY_LABELS[d]).join(', ');

                              const formatTime = (t: string) => {
                                const [h, m] = t.split(':').map(Number);
                                const ampm = h >= 12 ? 'PM' : 'AM';
                                const hr = h % 12 || 12;
                                return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
                              };
                              const timeLabel = currentSchedule.allDay ? 'All day' : `${formatTime(currentSchedule.startTime)} – ${formatTime(currentSchedule.endTime)}`;

                              return (
                                <div className="mt-3 rounded-lg border bg-muted/30 p-4 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon name="calendar_today" size={16} className="text-muted-foreground" />
                                      <span className="font-medium">{daysLabel}</span>
                                      {daysLabel !== daysShort && <span className="text-muted-foreground">{daysShort}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon name="schedule" size={16} className="text-muted-foreground" />
                                      <span className="font-medium">{timeLabel}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditScheduleOpen(true)}>
                                      <Icon name="edit" size={16} className="text-muted-foreground" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      disabled={scheduleKeys.length <= 1}
                                      onClick={() => {
                                        const keyToDelete = perfScheduleTab;
                                        const remaining = scheduleKeys.filter((k) => k !== keyToDelete);
                                        setSchedules((prev) => {
                                          const next = { ...prev };
                                          delete next[keyToDelete];
                                          return next;
                                        });
                                        setPerfScheduleTab(remaining[0]);
                                        toast.success(`Schedule ${keyToDelete} deleted`);
                                      }}
                                    >
                                      <Icon name="delete" size={16} className="text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Edit schedule dialog */}
                            <Dialog open={editScheduleOpen} onOpenChange={setEditScheduleOpen}>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit schedule {perfScheduleTab}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 py-2">
                                  {/* Days */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Days</Label>
                                    <div className="flex gap-1.5">
                                      {([
                                        { value: 'mon', label: 'M' },
                                        { value: 'tue', label: 'T' },
                                        { value: 'wed', label: 'W' },
                                        { value: 'thu', label: 'T' },
                                        { value: 'fri', label: 'F' },
                                        { value: 'sat', label: 'S' },
                                        { value: 'sun', label: 'S' },
                                      ]).map((day) => {
                                        const isActive = currentSchedule.days.includes(day.value);
                                        return (
                                          <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => updateCurrentSchedule({
                                              days: isActive ? currentSchedule.days.filter((d) => d !== day.value) : [...currentSchedule.days, day.value]
                                            })}
                                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                                              isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                          >
                                            {day.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {/* All day toggle */}
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="schedule-all-day" className="text-sm font-medium cursor-pointer">All day</Label>
                                    <Switch id="schedule-all-day" checked={currentSchedule.allDay} onCheckedChange={(v) => updateCurrentSchedule({ allDay: v })} />
                                  </div>
                                  {/* Time range */}
                                  {!currentSchedule.allDay && (
                                    <div className="flex items-center gap-3">
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">Start time</Label>
                                        <Input type="time" value={currentSchedule.startTime} onChange={(e) => updateCurrentSchedule({ startTime: e.target.value })} className="h-9" />
                                      </div>
                                      <span className="text-muted-foreground mt-5">–</span>
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">End time</Label>
                                        <Input type="time" value={currentSchedule.endTime} onChange={(e) => updateCurrentSchedule({ endTime: e.target.value })} className="h-9" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditScheduleOpen(false)}>Cancel</Button>
                                  <Button onClick={() => { setEditScheduleOpen(false); toast.success('Schedule updated'); }}>Save</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Add schedule dialog */}
                            <Dialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen}>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Add schedule</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 py-2">
                                  {/* Days */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Days</Label>
                                    <div className="flex gap-1.5">
                                      {([
                                        { value: 'mon', label: 'M' },
                                        { value: 'tue', label: 'T' },
                                        { value: 'wed', label: 'W' },
                                        { value: 'thu', label: 'T' },
                                        { value: 'fri', label: 'F' },
                                        { value: 'sat', label: 'S' },
                                        { value: 'sun', label: 'S' },
                                      ]).map((day) => {
                                        const isActive = newSchedule.days.includes(day.value);
                                        return (
                                          <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => setNewSchedule((prev) => ({
                                              ...prev,
                                              days: isActive ? prev.days.filter((d) => d !== day.value) : [...prev.days, day.value]
                                            }))}
                                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                                              isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                          >
                                            {day.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {/* All day toggle */}
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="new-schedule-all-day" className="text-sm font-medium cursor-pointer">All day</Label>
                                    <Switch id="new-schedule-all-day" checked={newSchedule.allDay} onCheckedChange={(v) => setNewSchedule((prev) => ({ ...prev, allDay: v }))} />
                                  </div>
                                  {/* Time range */}
                                  {!newSchedule.allDay && (
                                    <div className="flex items-center gap-3">
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">Start time</Label>
                                        <Input type="time" value={newSchedule.startTime} onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))} className="h-9" />
                                      </div>
                                      <span className="text-muted-foreground mt-5">–</span>
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">End time</Label>
                                        <Input type="time" value={newSchedule.endTime} onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))} className="h-9" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setAddScheduleOpen(false)}>Cancel</Button>
                                  <Button
                                    disabled={newSchedule.days.length === 0}
                                    onClick={() => {
                                      const nextKey = String(Math.max(...scheduleKeys.map(Number)) + 1);
                                      setSchedules((prev) => ({ ...prev, [nextKey]: newSchedule }));
                                      setPerfScheduleTab(nextKey);
                                      setAddScheduleOpen(false);
                                      toast.success(`Schedule ${nextKey} added`);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <Separator />

                          {/* Alert when... */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Alert when...</h4>
                              <Button variant="outline" size="sm">
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add rule
                              </Button>
                            </div>
                            <div className="rounded-lg border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="px-4">KPI</TableHead>
                                    <TableHead className="px-4">KPI type</TableHead>
                                    <TableHead className="px-4">Alert when...</TableHead>
                                    <TableHead className="px-4">Consecutive samples</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentProfileData.rules.map((rule, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="px-4">{rule.kpi}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.type}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.condition}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.samples}</TableCell>
                                      <TableCell className="px-2 text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Icon name="more_vert" size={16} /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Icon name="edit" size={16} className="mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Icon name="delete" size={16} className="mr-2" />Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {perfTab === 'devices' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search devices..."
                              value={perfSearch}
                              onChange={(e) => setPerfSearch(e.target.value)}
                              className="pl-9 w-full"
                            />
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Icon name="add" size={16} className="mr-1.5" />
                              Add device
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-4">Device</TableHead>
                                <TableHead className="px-4">Type</TableHead>
                                <TableHead className="px-4">Region</TableHead>
                                <TableHead className="px-4">Status</TableHead>
                                <TableHead className="w-14"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const count = currentProfileData.devices;
                                const DEVICE_NAMES = ['SEA-SN-4012','PDX-CU-2201','VAN-RCP-1180','SEA-SN-4055','PDX-SN-3312','VAN-SN-1022','SEA-CU-4088','PDX-RCP-2150','VAN-SN-1045','SEA-SN-4101','PDX-SN-3400','VAN-CU-1090','SEA-RCP-4200','PDX-SN-3201','VAN-SN-1067'];
                                const DEVICE_TYPES = ['SN','CU','RCP','SN','SN','SN','CU','RCP','SN','SN','SN','CU','RCP','SN','SN'];
                                const DEVICE_REGIONS = ['Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest'];
                                const DEVICE_STATUSES = ['Connected','Connected','Connected','Connected','Disconnected','Connected','Connected','Connected','Connected','Connected','Connected','In maintenance','Connected','Connected','Connected'];
                                const rows = Array.from({ length: Math.min(count, 15) }, (_, i) => ({
                                  name: DEVICE_NAMES[i % DEVICE_NAMES.length],
                                  type: DEVICE_TYPES[i % DEVICE_TYPES.length],
                                  region: DEVICE_REGIONS[i % DEVICE_REGIONS.length],
                                  status: DEVICE_STATUSES[i % DEVICE_STATUSES.length],
                                }));
                                return rows.map((row, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="px-4"><DeviceLink value={row.name} maxLength={24} /></TableCell>
                                    <TableCell className="px-4"><NodeTypeBadge type={row.type} /></TableCell>
                                    <TableCell className="px-4 text-muted-foreground">{row.region}</TableCell>
                                    <TableCell className="px-4">
                                      <DeviceStatus status={row.status} />
                                    </TableCell>
                                    <TableCell className="px-4 text-right">
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Icon name="delete" size={16} className="text-muted-foreground" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeSection !== 'access-control' && activeSection !== 'fault-management' && activeSection !== 'label-management' && activeSection !== 'file-management' && activeSection !== 'device-migration' && activeSection !== 'performance' && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {activeLabel} content will be displayed here.
                </p>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Tabs, TabsContent, TabsList, TabsListUnderline, TabsTrigger, TabsTriggerUnderline } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
import { PerformanceDataTable } from './performance-data-table';
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
const PERF_LTE_OPTIONS = ['All', 'SN'] as const;
const PERF_TIME_OPTIONS = ['All', 'Last 15 min', 'Last 6 hours', 'Last 24 hours'] as const;

const PERF_PROFILES = [
  { name: 'LTE Throughput Baseline', kpis: 6, devices: 124 },
  { name: 'NR Cell Availability', kpis: 4, devices: 87 },
  { name: 'ERAB Drop Rate', kpis: 3, devices: 56 },
  { name: 'RRC Setup Success', kpis: 5, devices: 93 },
  { name: 'Handover Success Rate', kpis: 4, devices: 71 },
  { name: 'VoLTE Call Drop', kpis: 3, devices: 42 },
  { name: 'Latency SLA', kpis: 2, devices: 38 },
  { name: 'CPU Utilization', kpis: 2, devices: 65 },
  { name: 'Packet Loss', kpis: 3, devices: 51 },
  { name: 'UL/DL Throughput', kpis: 5, devices: 110 },
];

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
  const [perfLteFilter, setPerfLteFilter] = useState<string>('All');
  const [perfTimeFilter, setPerfTimeFilter] = useState<string>('All');
  const [perfStatusFilter, setPerfStatusFilter] = useState<'all' | 'degraded' | 'optimal'>('all');
  const [perfProfileSearch, setPerfProfileSearch] = useState('');
  const [selectedPerfProfile, setSelectedPerfProfile] = useState('LTE Throughput Baseline');
  const [perfTab, setPerfTab] = useState<'thresholds' | 'devices'>('thresholds');
  const [perfScheduleTab, setPerfScheduleTab] = useState('1');
  const [perfName, setPerfName] = useState(selectedPerfProfile);
  const [perfNameEditing, setPerfNameEditing] = useState(false);
  const [perfDescription, setPerfDescription] = useState('Monitors key LTE performance indicators including throughput, latency, and call quality metrics. Alerts are triggered when thresholds are exceeded for the configured number of consecutive samples.');
  const [perfDescEditing, setPerfDescEditing] = useState(false);

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
              const filteredProfiles = perfProfileSearch.trim()
                ? PERF_PROFILES.filter((p) => p.name.toLowerCase().includes(perfProfileSearch.toLowerCase().trim()))
                : PERF_PROFILES;

              return (
                <div className="flex gap-6">
                  {/* Profiles sidebar */}
                  <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden flex flex-col max-h-[calc(100vh-12rem)] self-start">
                    <div className="p-3 border-b border-border/80 bg-muted/20">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">Profiles</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add profile">
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
                              onClick={() => { setSelectedPerfProfile(profile.name); setPerfName(profile.name); setPerfNameEditing(false); setPerfDescEditing(false); }}
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
                      const currentProfile = PERF_PROFILES.find((p) => p.name === selectedPerfProfile);
                      const deviceCount = currentProfile?.devices ?? 0;
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
                                <Switch id="perf-enabled" defaultChecked />
                                <Label htmlFor="perf-enabled" className="cursor-pointer select-none text-sm">Enabled</Label>
                              </div>
                              <Button variant="outline" size="sm">
                                <Icon name="edit" size={16} className="mr-1.5" />
                                Edit profile
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Icon name="delete" size={18} />
                              </Button>
                            </div>
                          </div>

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
                                  <TableRow>
                                    <TableCell className="px-4">Send email</TableCell>
                                    <TableCell className="px-4 text-muted-foreground truncate max-w-[300px]">lkrug@acme.com, dkoons@acme.com, gsalaslzquiel...</TableCell>
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
                                  <TableRow>
                                    <TableCell className="px-4">Send SNMP notifications</TableCell>
                                    <TableCell className="px-4">
                                      <Badge variant="secondary">Notification group</Badge>
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
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <Separator />

                          {/* Schedule */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Schedule</h4>
                              <Button variant="outline" size="sm">
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add schedule
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Set when alerts should be active for this profile. (Create up to 3)</p>
                            <Tabs value={perfScheduleTab} onValueChange={setPerfScheduleTab}>
                              <TabsList>
                                <TabsTrigger value="1">1</TabsTrigger>
                                <TabsTrigger value="2">2</TabsTrigger>
                              </TabsList>
                            </Tabs>
                            <div className="space-y-2">
                              <p className="text-sm">{perfScheduleTab === '1' ? 'Weekdays, All day' : 'Weekends, 8:00 AM – 6:00 PM'}</p>
                              <Button variant="outline" size="sm">
                                <Icon name="edit" size={16} className="mr-1.5" />
                                Edit
                              </Button>
                            </div>
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
                                  {[
                                    { kpi: 'CS_RCESR', type: 'LTE', condition: '< 1000', samples: 5 },
                                    { kpi: 'CS_RCESR', type: 'LTE', condition: '> 500', samples: 5 },
                                    { kpi: 'CS_RCESR', type: 'LTE', condition: '> 5000', samples: 5 },
                                    { kpi: 'DL_THRP', type: 'LTE', condition: '< 2000', samples: 3 },
                                    { kpi: 'UL_THRP', type: 'LTE', condition: '< 1000', samples: 3 },
                                  ].map((rule, idx) => (
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
                                const currentProfile = PERF_PROFILES.find((p) => p.name === selectedPerfProfile);
                                const count = currentProfile?.devices ?? 0;
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
                                    <TableCell className="px-4 font-medium">{row.name}</TableCell>
                                    <TableCell className="px-4 text-muted-foreground">{row.type}</TableCell>
                                    <TableCell className="px-4 text-muted-foreground">{row.region}</TableCell>
                                    <TableCell className="px-4">
                                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                        row.status === 'Connected' ? 'text-emerald-600 dark:text-emerald-400' :
                                        row.status === 'Disconnected' ? 'text-red-600 dark:text-red-400' :
                                        'text-amber-600 dark:text-amber-400'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          row.status === 'Connected' ? 'bg-emerald-500' :
                                          row.status === 'Disconnected' ? 'bg-red-500' :
                                          'bg-amber-500'
                                        }`} />
                                        {row.status}
                                      </span>
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
                        <p className="text-xs text-muted-foreground">
                          Showing {Math.min(PERF_PROFILES.find((p) => p.name === selectedPerfProfile)?.devices ?? 0, 15)} of {PERF_PROFILES.find((p) => p.name === selectedPerfProfile)?.devices ?? 0} devices assigned to this profile
                        </p>
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

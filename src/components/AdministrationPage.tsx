'use client';

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
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
  { label: 'Label management', icon: 'label' },
] as const;

const PROFILE_OPTIONS = ['All profiles', 'Administrator', 'Operator', 'Viewer'] as const;
const DEPARTMENT_OPTIONS = ['Department', 'Engineering', 'Operations', 'Support', 'Management'] as const;
const LOCATION_OPTIONS = ['Location', 'Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York'] as const;

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
  const [profileFilter, setProfileFilter] = useState<string>('All profiles');
  const [departmentFilter, setDepartmentFilter] = useState<string>('Department');
  const [locationFilter, setLocationFilter] = useState<string>('Location');

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
                      <Select value={profileFilter} onValueChange={setProfileFilter}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="All profiles" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFILE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddDomainSheetOpen(true)}>
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

            {activeSection !== 'access-control' && activeSection !== 'fault-management' && activeSection !== 'label-management' && activeSection !== 'file-management' && activeSection !== 'device-migration' && (
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

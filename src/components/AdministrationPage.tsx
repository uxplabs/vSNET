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
import { AddDomainSheet } from './add-domain-sheet';
import { Badge } from './ui/badge';
import FaultManagementPage from './FaultManagementPage';
import LabelManagementPage from './LabelManagementPage';
import FileManagementPage from './FileManagementPage';
import DeviceMigrationPage from './DeviceMigrationPage';

const SIDEBAR_ITEMS = [
  'Access control',
  'Audit trail',
  'Northbound interface',
  'Email',
  'File management',
  'Fault management',
  'Service settings',
  'Device migration',
  'Label management',
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
  const [activeSection, setActiveSection] = useState(toKey(SIDEBAR_ITEMS[0]));
  const [accessControlTab, setAccessControlTab] = useState('users');
  const [addDomainSheetOpen, setAddDomainSheetOpen] = useState(false);
  const [editDomainSheetOpen, setEditDomainSheetOpen] = useState(false);
  const [selectedDomainForEdit, setSelectedDomainForEdit] = useState<AccessControlDomainRow | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState<string>('All profiles');
  const [departmentFilter, setDepartmentFilter] = useState<string>('Department');
  const [locationFilter, setLocationFilter] = useState<string>('Location');

  return (
    <TooltipProvider delayDuration={300}>
    <div className="h-screen flex flex-col bg-background overflow-hidden">
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
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar - dark background */}
        <aside
          className={`fixed top-14 left-0 bottom-0 z-30 transition-all duration-200 ease-in-out border-r overflow-hidden bg-[#0F172A] border-[#27303F] ${
            sidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          <div className="h-full flex flex-col text-[#F8FAFC]">
            <div className="border-b border-[#27303F] px-4 py-3">
              <h2 className="text-lg font-semibold truncate" title="Administration">
                Administration
              </h2>
            </div>
            <div className="flex-1 px-4 py-4 overflow-auto">
              <nav className="space-y-1">
                {SIDEBAR_ITEMS.map((label) => {
                  const key = toKey(label);
                  const isActive = activeSection === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left text-sm ${
                        isActive ? 'bg-white/15' : 'hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="border-t border-[#27303F] px-4 py-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                    <Icon name="add" size={18} />
                    Add device
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add device</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 px-4 py-6 md:px-6 lg:px-8 transition-all duration-200 ease-in-out overflow-auto ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          {activeSection === 'access-control' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Access control</h1>
              <Tabs value={accessControlTab} onValueChange={setAccessControlTab}>
                <div className="sticky top-0 z-10 -mt-6 -mb-6 bg-background/80 backdrop-blur-sm pt-6 pb-6">
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
            <div className="space-y-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {SIDEBAR_ITEMS.find((item) => toKey(item) === activeSection) ?? activeSection}
              </h1>
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {SIDEBAR_ITEMS.find((item) => toKey(item) === activeSection)} content will be displayed here.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
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
import { FaultManagementDataTable, FAULT_MANAGEMENT_DATA } from './fault-management-data-table';

const CATEGORY_OPTIONS = ['Category', 'Alarm', 'Event', 'Trap', 'Syslog'] as const;
const SEVERITY_OPTIONS = ['Severity', 'Critical', 'Major', 'Minor', 'Warning', 'Info'] as const;
const SNMP_OPTIONS = ['SNMP', 'Enabled', 'Disabled', 'All'] as const;
const EMAIL_OPTIONS = ['Email', 'Enabled', 'Disabled', 'All'] as const;

function getNotificationGroupsWithCounts(): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const row of FAULT_MANAGEMENT_DATA) {
    counts[row.group] = (counts[row.group] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface FaultManagementPageProps {
  onBack?: () => void;
}

export default function FaultManagementPage({ onBack }: FaultManagementPageProps) {
  const [faultTab, setFaultTab] = useState('events-configuration');
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const notificationGroups = useMemo(() => getNotificationGroupsWithCounts(), []);
  const [selectedGroup, setSelectedGroup] = useState(() => getNotificationGroupsWithCounts()[0]?.name ?? '');
  const [categoryFilter, setCategoryFilter] = useState<string>('Category');
  const [severityFilter, setSeverityFilter] = useState<string>('Severity');
  const [snmpFilter, setSnmpFilter] = useState<string>('SNMP');
  const [emailFilter, setEmailFilter] = useState<string>('Email');

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return notificationGroups;
    const q = groupSearch.toLowerCase().trim();
    return notificationGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupSearch, notificationGroups]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <Tabs value={faultTab} onValueChange={setFaultTab}>
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          <TabsTrigger value="events-configuration" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Events configuration
          </TabsTrigger>
          <TabsTrigger value="custom-events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Custom events
          </TabsTrigger>
          <TabsTrigger value="fault-correlation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Fault correlation
          </TabsTrigger>
          <TabsTrigger value="trap-receive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Trap receive
          </TabsTrigger>
          <TabsTrigger value="test-traps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Test traps
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="events-configuration" className="mt-6">
          <div className="flex gap-6">
            {/* Notification groups sidebar */}
            <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden">
              <div className="p-3 border-b border-border/80 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">Notification groups</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add notification group">
                        <Icon name="add" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add notification group</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative mt-3">
                  <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="h-8 pl-8 pr-2 w-full text-sm rounded-md bg-background border-border/80"
                  />
                </div>
              </div>
              <nav className="p-2 max-h-[min(400px,60vh)] overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No groups match</p>
                ) : (
                  filteredGroups.map((group) => {
                    const isSelected = selectedGroup === group.name;
                    return (
                      <button
                        key={group.name}
                        type="button"
                        onClick={() => setSelectedGroup(group.name)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium ring-1 ring-primary/20'
                            : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <span className="truncate min-w-0">{group.name}</span>
                        <span className={`tabular-nums shrink-0 text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {group.count}
                        </span>
                      </button>
                    );
                  })
                )}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Search Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                  <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={snmpFilter} onValueChange={setSnmpFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="SNMP" />
                  </SelectTrigger>
                  <SelectContent>
                    {SNMP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={emailFilter} onValueChange={setEmailFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Email" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Icon name="add" size={18} />
                    Add device
                  </Button>
                </div>
              </div>

              {/* Table */}
              <FaultManagementDataTable groupFilter={selectedGroup} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom-events" className="mt-6">
          <p className="text-muted-foreground">Custom events will be displayed here.</p>
        </TabsContent>

        <TabsContent value="fault-correlation" className="mt-6">
          <p className="text-muted-foreground">Fault correlation settings will be displayed here.</p>
        </TabsContent>

        <TabsContent value="trap-receive" className="mt-6">
          <p className="text-muted-foreground">Trap receive configuration will be displayed here.</p>
        </TabsContent>

        <TabsContent value="test-traps" className="mt-6">
          <p className="text-muted-foreground">Test traps will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}

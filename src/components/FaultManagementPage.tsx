'use client';

import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TooltipProvider } from './ui/tooltip';
import { InternalSidebarList } from './ui/internal-sidebar-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { FaultManagementDataTable, FAULT_MANAGEMENT_DATA } from './fault-management-data-table';
import { FAULT_GROUP_DEVICE_DATA, type FaultManagementRow } from './fault-management-model';
import { FaultGroupDevicesDataTable } from './fault-group-devices-data-table';
import { CustomEventsTab } from './custom-events-tab';

const SYSTEM_DEFAULT_NOTIFICATION_GROUP = 'System default' as const;

function sortNotificationGroups(
  groups: { name: string; count: number }[],
): { name: string; count: number }[] {
  const system = groups.find((g) => g.name === SYSTEM_DEFAULT_NOTIFICATION_GROUP);
  const rest = groups
    .filter((g) => g.name !== SYSTEM_DEFAULT_NOTIFICATION_GROUP)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (system) {
    return [system, ...rest];
  }
  return [{ name: SYSTEM_DEFAULT_NOTIFICATION_GROUP, count: 0 }, ...rest];
}

export default function FaultManagementPage() {
  const [faultTab, setFaultTab] = useState('events-configuration');
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(() => SYSTEM_DEFAULT_NOTIFICATION_GROUP);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [snmpFilter, setSnmpFilter] = useState<string>('All');
  const [emailFilter, setEmailFilter] = useState<string>('All');
  /** Sub-view within Events configuration: event list vs devices */
  const [eventsConfigView, setEventsConfigView] = useState('events');
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [emptyGroups, setEmptyGroups] = useState<string[]>([]);
  const [additionalFaultRows, setAdditionalFaultRows] = useState<FaultManagementRow[]>([]);

  // Event counts from static data + user-added events, merged with empty groups for the sidebar
  const allGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of FAULT_MANAGEMENT_DATA) {
      counts[row.group] = (counts[row.group] ?? 0) + 1;
    }
    for (const row of additionalFaultRows) {
      counts[row.group] = (counts[row.group] ?? 0) + 1;
    }
    if (!(SYSTEM_DEFAULT_NOTIFICATION_GROUP in counts)) {
      counts[SYSTEM_DEFAULT_NOTIFICATION_GROUP] = 0;
    }
    let groups = Object.entries(counts).map(([name, count]) => ({ name, count }));
    groups = sortNotificationGroups(groups);
    const existing = new Set(groups.map((g) => g.name));
    for (const name of emptyGroups) {
      if (!existing.has(name)) {
        groups.push({ name, count: 0 });
        existing.add(name);
      }
    }
    return sortNotificationGroups(groups);
  }, [additionalFaultRows, emptyGroups]);

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    if (name === SYSTEM_DEFAULT_NOTIFICATION_GROUP) {
      setSelectedGroup(SYSTEM_DEFAULT_NOTIFICATION_GROUP);
      setNewGroupName('');
      setAddGroupDialogOpen(false);
      return;
    }
    setEmptyGroups((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setSelectedGroup(name);
    setNewGroupName('');
    setAddGroupDialogOpen(false);
  };

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return allGroups;
    const q = groupSearch.toLowerCase().trim();
    return allGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupSearch, allGroups]);

  const devicesCountForGroup = useMemo(
    () => FAULT_GROUP_DEVICE_DATA.filter((d) => d.notificationGroup === selectedGroup).length,
    [selectedGroup],
  );

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
            <InternalSidebarList
              title="Notification groups"
              items={filteredGroups.map((g) => ({ id: g.name, label: g.name, count: g.count }))}
              selectedId={selectedGroup}
              onSelect={setSelectedGroup}
              showAddAction
              addActionPlacement="title-icon"
              onAddAction={() => setAddGroupDialogOpen(true)}
              addAriaLabel="Add notification group"
              showSearch
              searchValue={groupSearch}
              onSearchChange={setGroupSearch}
              searchPlaceholder="Search groups..."
              emptyMessage="No groups match"
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {(() => {
                const groupCount = allGroups.find((g) => g.name === selectedGroup)?.count ?? 0;
                const devicesCount = devicesCountForGroup;

                return (
                  <Tabs value={eventsConfigView} onValueChange={setEventsConfigView} className="w-full">
                    <div className="border-b border-border">
                      <TabsList className="h-auto w-full justify-start rounded-none border-0 bg-transparent p-0">
                        <TabsTrigger
                          value="events"
                          className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          <span>Events</span>
                          <span
                            className="shrink-0 tabular-nums rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-foreground"
                            aria-label={`${groupCount} events`}
                          >
                            {groupCount}
                          </span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="devices"
                          className="group inline-flex items-center gap-2 rounded-none border-b-2 border-transparent px-3 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                          <span>Devices</span>
                          <span
                            className="shrink-0 tabular-nums rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-foreground"
                            aria-label={`${devicesCount} devices`}
                          >
                            {devicesCount}
                          </span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="events" className="mt-4 space-y-4">
                      <FaultManagementDataTable
                        groupFilter={selectedGroup}
                        additionalFaultRows={additionalFaultRows}
                        setAdditionalFaultRows={setAdditionalFaultRows}
                        search={search}
                        onSearchChange={setSearch}
                        categoryFilter={categoryFilter}
                        onCategoryFilterChange={setCategoryFilter}
                        severityFilter={severityFilter}
                        onSeverityFilterChange={setSeverityFilter}
                        snmpFilter={snmpFilter}
                        onSnmpFilterChange={setSnmpFilter}
                        emailFilter={emailFilter}
                        onEmailFilterChange={setEmailFilter}
                      />
                    </TabsContent>
                    <TabsContent value="devices" className="mt-4">
                      <FaultGroupDevicesDataTable notificationGroup={selectedGroup} />
                    </TabsContent>
                  </Tabs>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom-events" className="mt-6">
          <CustomEventsTab />
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

    {/* Add notification group dialog */}
    <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add notification group</DialogTitle>
          <DialogDescription>Enter a name for the new notification group.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-group-name">Name</Label>
            <Input
              id="new-group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Critical alerts"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGroup();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddGroupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

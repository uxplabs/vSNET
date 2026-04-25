'use client';

import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { SearchInput } from './ui/search-input';
import { FilterSelect } from './ui/filter-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TooltipProvider } from './ui/tooltip';
import { InternalSidebarList } from './ui/internal-sidebar-list';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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

const CATEGORY_OPTIONS = ['All', 'Alarm', 'Event', 'Trap', 'Syslog'] as const;
const SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'Warning', 'Info'] as const;
const SNMP_OPTIONS = ['All', 'Enabled', 'Disabled'] as const;
const EMAIL_OPTIONS = ['All', 'Enabled', 'Disabled'] as const;

function getNotificationGroupsWithCounts(): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const row of FAULT_MANAGEMENT_DATA) {
    counts[row.group] = (counts[row.group] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function FaultManagementPage() {
  const [faultTab, setFaultTab] = useState('events-configuration');
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(() => getNotificationGroupsWithCounts()[0]?.name ?? '');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [snmpFilter, setSnmpFilter] = useState<string>('All');
  const [emailFilter, setEmailFilter] = useState<string>('All');
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [emptyGroups, setEmptyGroups] = useState<string[]>([]);

  // Merge data-derived groups with empty groups for the sidebar
  const allGroups = useMemo(() => {
    const groups = getNotificationGroupsWithCounts();
    const existing = new Set(groups.map((g) => g.name));
    for (const name of emptyGroups) {
      if (!existing.has(name)) {
        groups.push({ name, count: 0 });
      }
    }
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }, [emptyGroups]);

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    setEmptyGroups((prev) => prev.includes(name) ? prev : [...prev, name]);
    setSelectedGroup(name);
    setNewGroupName('');
    setAddGroupDialogOpen(false);
  };

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return allGroups;
    const q = groupSearch.toLowerCase().trim();
    return allGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupSearch, allGroups]);

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

                if (groupCount === 0) {
                  return (
                    <>
                      <div className="flex justify-end pb-4 mb-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Icon name="more_vert" size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Icon name="edit" size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Icon name="delete" size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-center">
                        <div className="rounded-lg border bg-card p-8 text-center max-w-sm w-full shadow-sm">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Icon name="error" size={24} className="text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">No events</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            This notification group has no events configured yet.
                          </p>
                          <Button type="button" variant="outline" size="sm">
                            <Icon name="add" size={16} className="mr-1.5" />
                            Add notification group
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                }

                return (
                  <>
                    {/* Search Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <SearchInput
                        size="md"
                        wrapperClassName="w-full sm:min-w-[200px] sm:max-w-[280px]"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <FilterSelect value={categoryFilter} onValueChange={setCategoryFilter} label="Category" options={[...CATEGORY_OPTIONS]} className="w-[120px]" />
                      <FilterSelect value={severityFilter} onValueChange={setSeverityFilter} label="Severity" options={[...SEVERITY_OPTIONS]} className="w-[120px]" />
                      <FilterSelect value={snmpFilter} onValueChange={setSnmpFilter} label="SNMP" options={[...SNMP_OPTIONS]} className="w-[120px]" />
                      <FilterSelect value={emailFilter} onValueChange={setEmailFilter} label="Email" options={[...EMAIL_OPTIONS]} className="w-[120px]" />
                      <div className="ml-auto flex items-center gap-2">
                        <Button type="button" aria-label="Add event">
                          <Icon name="add" size={16} className="mr-1.5" />
                          Add event
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Icon name="more_vert" size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Icon name="edit" size={16} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Icon name="delete" size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Table */}
                    <FaultManagementDataTable groupFilter={selectedGroup} />
                  </>
                );
              })()}
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

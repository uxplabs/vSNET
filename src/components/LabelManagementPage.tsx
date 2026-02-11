'use client';

import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
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
  DropdownMenuSeparator,
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
import {
  LabelManagementDataTable,
  LABEL_MANAGEMENT_DATA,
  type LabelManagementRow,
} from './label-management-data-table';
import { AddDeviceToLabelSheet } from './add-device-to-label-sheet';
import type { AddableDeviceRow } from './add-device-to-label-sheet';

const REGION_OPTIONS = ['Region', 'Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York', 'All'] as const;
const GROUP_OPTIONS = ['Group', 'Production', 'Staging', 'Testing', 'Development', 'All'] as const;

function getLabelGroupsWithCounts(data: LabelManagementRow[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.labelGroup] = (counts[row.labelGroup] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface LabelManagementPageProps {
  onBack?: () => void;
}

export default function LabelManagementPage({ onBack }: LabelManagementPageProps) {
  const [labelData, setLabelData] = useState<LabelManagementRow[]>(() => [...LABEL_MANAGEMENT_DATA]);
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [addDeviceSheetOpen, setAddDeviceSheetOpen] = useState(false);
  const labelGroups = useMemo(() => getLabelGroupsWithCounts(labelData), [labelData]);
  const [selectedGroup, setSelectedGroup] = useState(() => getLabelGroupsWithCounts(LABEL_MANAGEMENT_DATA)[0]?.name ?? '');
  const [regionFilter, setRegionFilter] = useState<string>('Region');
  const [groupFilter, setGroupFilter] = useState<string>('Group');
  const [selectedCount, setSelectedCount] = useState(0);
  const [clearSelectionTrigger, setClearSelectionTrigger] = useState(0);
  const [addLabelDialogOpen, setAddLabelDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  // Track manually created label groups that have no devices yet
  const [emptyLabelGroups, setEmptyLabelGroups] = useState<string[]>([]);

  // Merge data-derived groups with empty groups for the sidebar
  const allLabelGroups = useMemo(() => {
    const groups = getLabelGroupsWithCounts(labelData);
    const existing = new Set(groups.map((g) => g.name));
    for (const name of emptyLabelGroups) {
      if (!existing.has(name)) {
        groups.push({ name, count: 0 });
      }
    }
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }, [labelData, emptyLabelGroups]);

  const handleAddLabel = () => {
    const name = newLabelName.trim();
    if (!name) return;
    setEmptyLabelGroups((prev) => prev.includes(name) ? prev : [...prev, name]);
    setSelectedGroup(name);
    setNewLabelName('');
    setAddLabelDialogOpen(false);
  };

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return allLabelGroups;
    const q = groupSearch.toLowerCase().trim();
    return allLabelGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupSearch, allLabelGroups]);

  const handleAddDevicesToLabel = useCallback(
    (devices: AddableDeviceRow[]) => {
      if (!selectedGroup || devices.length === 0) return;
      const existingIds = new Set(
        labelData.filter((r) => r.labelGroup === selectedGroup).map((r) => r.id)
      );
      const newRows: LabelManagementRow[] = devices
        .filter((d) => !existingIds.has(d.id))
        .map((d) => ({
          id: d.id,
          device: d.device,
          deviceId: d.deviceId,
          region: d.region,
          labelGroup: selectedGroup,
        }));
      if (newRows.length > 0) {
        setLabelData((prev) => [...prev, ...newRows]);
      }
    },
    [selectedGroup, labelData]
  );

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <div className="flex gap-6 items-start">
            {/* Labels sidebar */}
            <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden">
              <div className="p-3 border-b border-border/80 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">Labels</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add label" onClick={() => setAddLabelDialogOpen(true)}>
                        <Icon name="add" size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add label</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative mt-3">
                  <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search labels"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="h-8 pl-8 pr-2 w-full text-sm rounded-md bg-background border-border/80"
                  />
                </div>
              </div>
              <nav className="p-2 max-h-[min(400px,60vh)] overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No labels match</p>
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
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <span className="truncate min-w-0">{group.name}</span>
                        <span className={`tabular-nums shrink-0 text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-accent-foreground/10 text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
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
              {(() => {
                const groupDeviceCount = allLabelGroups.find((g) => g.name === selectedGroup)?.count ?? 0;

                if (groupDeviceCount === 0) {
                  // Empty state
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
                          <Icon name="devices" size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">No devices</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This label has no devices yet. Add devices to get started.
                        </p>
                        <Button variant="outline" className="gap-1" onClick={() => setAddDeviceSheetOpen(true)}>
                          <Icon name="add" size={18} />
                          Add device
                        </Button>
                      </div>
                    </div>
                    </>
                  );
                }

                return (
                  <>
                    {/* Row 1: Action buttons (when selected) OR search + filters (when not) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                      {selectedCount >= 1 ? (
                        <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0 ml-auto sm:ml-0">
                          <Button variant="secondary" size="sm" className="gap-1.5">
                            <Icon name="delete" size={18} />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input
                              placeholder="Search..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="pl-9 w-full min-w-0"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                            <Select value={regionFilter} onValueChange={setRegionFilter}>
                              <SelectTrigger className="w-[120px] shrink-0">
                                <SelectValue placeholder="Region" />
                              </SelectTrigger>
                              <SelectContent>
                                {REGION_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={groupFilter} onValueChange={setGroupFilter}>
                              <SelectTrigger className="w-[120px] shrink-0">
                                <SelectValue placeholder="Group" />
                              </SelectTrigger>
                              <SelectContent>
                                {GROUP_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <Button variant="outline" size="default" className="gap-1" onClick={() => setAddDeviceSheetOpen(true)}>
                              <Icon name="add" size={18} />
                              Add device
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
                        </>
                      )}
                    </div>
                    {/* Row 2: "N selected + Clear" (when selected) */}
                    {selectedCount >= 1 && (
                      <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                        <span className="text-sm text-muted-foreground">
                          {selectedCount} {selectedCount === 1 ? 'device' : 'devices'} selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-link hover:text-link-hover"
                          onClick={() => setClearSelectionTrigger((n) => n + 1)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}

                    <LabelManagementDataTable
                      data={labelData}
                      labelGroupFilter={selectedGroup}
                      onSelectionChange={setSelectedCount}
                      clearSelectionTrigger={clearSelectionTrigger}
                    />
                  </>
                );
              })()}

              <Suspense fallback={null}>
                <AddDeviceToLabelSheet
                  open={addDeviceSheetOpen}
                  onOpenChange={setAddDeviceSheetOpen}
                  labelName={selectedGroup || 'label'}
                  onAdd={handleAddDevicesToLabel}
                />
              </Suspense>
            </div>
          </div>

      {/* Add label dialog */}
      <Dialog open={addLabelDialogOpen} onOpenChange={(open) => { setAddLabelDialogOpen(open); if (!open) setNewLabelName(''); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add label</DialogTitle>
            <DialogDescription>
              Create a new label to organize your devices.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label-name">Label name</Label>
              <Input
                id="label-name"
                placeholder="Enter label name..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLabel(); }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLabelDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLabel} disabled={!newLabelName.trim()}>
              Add label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

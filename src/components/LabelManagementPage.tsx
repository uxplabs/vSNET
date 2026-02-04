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

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return labelGroups;
    const q = groupSearch.toLowerCase().trim();
    return labelGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groupSearch, labelGroups]);

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
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Label management</h1>
      <div className="flex gap-6">
            {/* Labels sidebar */}
            <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden">
              <div className="p-3 border-b border-border/80 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">Labels</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add label">
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
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <LabelManagementDataTable
                data={labelData}
                labelGroupFilter={selectedGroup}
                onAddDevice={() => setAddDeviceSheetOpen(true)}
              />

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
    </div>
    </TooltipProvider>
  );
}

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConfigMismatchItem {
  id: string;
  parameter: string;
  currentConfig: string;
  templateConfig: string;
  ignored: boolean;
}

// All possible mismatch parameters
const ALL_MISMATCH_PARAMETERS: Omit<ConfigMismatchItem, 'ignored'>[] = [
  { id: '1', parameter: 'TX Power', currentConfig: '23 dBm', templateConfig: '20 dBm' },
  { id: '2', parameter: 'Bandwidth', currentConfig: '20 MHz', templateConfig: '10 MHz' },
  { id: '3', parameter: 'PCI', currentConfig: '101', templateConfig: '105' },
  { id: '4', parameter: 'Cell ID', currentConfig: '1', templateConfig: '2' },
  { id: '5', parameter: 'TAC', currentConfig: '1000', templateConfig: '1001' },
  { id: '6', parameter: 'Max UE Count', currentConfig: '64', templateConfig: '128' },
  { id: '7', parameter: 'DL MIMO Mode', currentConfig: '2x2', templateConfig: '4x4' },
  { id: '8', parameter: 'Handover Threshold', currentConfig: '-110 dBm', templateConfig: '-105 dBm' },
  { id: '9', parameter: 'UL MIMO Mode', currentConfig: '1x2', templateConfig: '2x2' },
  { id: '10', parameter: 'Timer T300', currentConfig: '1000 ms', templateConfig: '2000 ms' },
  { id: '11', parameter: 'Timer T301', currentConfig: '1000 ms', templateConfig: '1500 ms' },
  { id: '12', parameter: 'SRS Periodicity', currentConfig: '40 ms', templateConfig: '20 ms' },
  { id: '13', parameter: 'PRACH Config Index', currentConfig: '0', templateConfig: '3' },
  { id: '14', parameter: 'Root Sequence Index', currentConfig: '0', templateConfig: '22' },
  { id: '15', parameter: 'Reference Signal Power', currentConfig: '-3 dB', templateConfig: '0 dB' },
  { id: '16', parameter: 'EARFCN', currentConfig: '55990', templateConfig: '55240' },
  { id: '17', parameter: 'Frequency Band', currentConfig: 'Band 48', templateConfig: 'Band 46' },
  { id: '18', parameter: 'Admin State', currentConfig: 'Enabled', templateConfig: 'Disabled' },
  { id: '19', parameter: 'PLMN', currentConfig: '311-480', templateConfig: '310-260' },
  { id: '20', parameter: 'Sync Signal Period', currentConfig: '5 ms', templateConfig: '10 ms' },
  { id: '21', parameter: 'PUSCH Power Offset', currentConfig: '0 dB', templateConfig: '3 dB' },
  { id: '22', parameter: 'PUCCH Power Offset', currentConfig: '0 dB', templateConfig: '2 dB' },
  { id: '23', parameter: 'CQI Report Mode', currentConfig: 'Periodic', templateConfig: 'Aperiodic' },
  { id: '24', parameter: 'Antenna Port Count', currentConfig: '2', templateConfig: '4' },
];

function generateMismatchData(count: number): ConfigMismatchItem[] {
  return ALL_MISMATCH_PARAMETERS.slice(0, count).map((item) => ({
    ...item,
    ignored: false,
  }));
}

interface ConfigMismatchSheetProps {
  open: boolean;
  deviceName: string;
  mismatchCount?: number;
  onOpenChange: (open: boolean) => void;
  onMismatchCountChange?: (newCount: number) => void;
}

export function ConfigMismatchSheet({
  open,
  deviceName,
  mismatchCount = 3,
  onOpenChange,
  onMismatchCountChange,
}: ConfigMismatchSheetProps) {
  const [items, setItems] = React.useState<ConfigMismatchItem[]>(() => generateMismatchData(mismatchCount));
  const [activeTab, setActiveTab] = React.useState<'mismatches' | 'ignored'>('mismatches');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [appliedItems, setAppliedItems] = React.useState<Set<string>>(new Set());

  // Reset items when mismatchCount or deviceName changes
  React.useEffect(() => {
    setItems(generateMismatchData(mismatchCount));
    setSelectedRows(new Set());
    setAppliedItems(new Set());
    setActiveTab('mismatches');
  }, [mismatchCount, deviceName]);

  const mismatches = items.filter((item) => !item.ignored);
  const ignored = items.filter((item) => item.ignored);
  const displayedItems = activeTab === 'mismatches' ? mismatches : ignored;

  // Count remaining mismatches (not applied, not ignored)
  const remainingMismatchCount = mismatches.filter((item) => !appliedItems.has(item.id)).length;

  // Notify parent when mismatch count changes
  React.useEffect(() => {
    onMismatchCountChange?.(remainingMismatchCount);
  }, [remainingMismatchCount, onMismatchCountChange]);

  const allSelected = displayedItems.length > 0 && displayedItems.every((item) => selectedRows.has(item.id));
  const someSelected = displayedItems.some((item) => selectedRows.has(item.id)) && !allSelected;
  const hasSelection = selectedRows.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayedItems.map((item) => item.id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplyItem = (id: string) => {
    // Mark the item as applied
    setAppliedItems((prev) => new Set(prev).add(id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleIgnoreItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ignored: true } : item))
    );
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleUnignoreItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ignored: false } : item))
    );
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkApply = () => {
    setAppliedItems((prev) => {
      const next = new Set(prev);
      selectedRows.forEach((id) => next.add(id));
      return next;
    });
    setSelectedRows(new Set());
  };

  const handleBulkIgnore = () => {
    setItems((prev) =>
      prev.map((item) => (selectedRows.has(item.id) ? { ...item, ignored: true } : item))
    );
    setSelectedRows(new Set());
  };

  const handleBulkUnignore = () => {
    setItems((prev) =>
      prev.map((item) => (selectedRows.has(item.id) ? { ...item, ignored: false } : item))
    );
    setSelectedRows(new Set());
  };

  const handleApplyAll = () => {
    onApply?.();
    onOpenChange(false);
  };

  // Clear selection when switching tabs
  React.useEffect(() => {
    setSelectedRows(new Set());
  }, [activeTab]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Configuration mismatch</SheetTitle>
          <p className="text-sm text-muted-foreground">{deviceName}</p>
        </SheetHeader>

        {/* Tab Group */}
        <div className="px-6 py-3 shrink-0">
          <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('mismatches')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'mismatches'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Mismatches
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs">
                {mismatches.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ignored')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'ignored'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Ignored
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs">
                {ignored.length}
              </Badge>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="px-6 pt-3 pb-1">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              {activeTab === 'mismatches' ? (
                <>
                  <Button size="sm" onClick={handleBulkApply}>
                    Apply
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkIgnore}>
                    Ignore
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleBulkUnignore}>
                  Unignore
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {displayedItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {activeTab === 'mismatches' ? 'No mismatches' : 'No ignored items'}
            </div>
          ) : (
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] px-4 py-3">
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                        }}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="px-4 py-3">Parameter</TableHead>
                    <TableHead className="px-4 py-3">Current config</TableHead>
                    <TableHead className="px-4 py-3">Template config</TableHead>
                    <TableHead className="px-4 py-3 w-[140px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-4">
                        <Checkbox
                          checked={selectedRows.has(item.id)}
                          onCheckedChange={() => toggleRow(item.id)}
                          aria-label={`Select ${item.parameter}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 font-medium">{item.parameter}</TableCell>
                      <TableCell className="px-4 text-muted-foreground">{item.currentConfig}</TableCell>
                      <TableCell className="px-4">{item.templateConfig}</TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center justify-end gap-2">
                          {appliedItems.has(item.id) ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                              <Icon name="check_circle" size={16} className="shrink-0" />
                              Applied
                            </span>
                          ) : activeTab === 'mismatches' ? (
                            <>
                              <Button size="sm" className="h-7" onClick={() => handleApplyItem(item.id)}>
                                Apply
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => handleIgnoreItem(item.id)}>
                                Ignore
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7" onClick={() => handleUnignoreItem(item.id)}>
                              Unignore
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

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
import { NodeTypeBadge } from '@/components/ui/node-type-badge';

interface ConfigParameter {
  id: string;
  parameter: string;
  airspanValue: string;
  newValue: string;
}

// Mock data for configuration parameters
const CONFIG_PARAMETERS: ConfigParameter[] = [
  { id: '1', parameter: 'TX Power', airspanValue: '23 dBm', newValue: '20 dBm' },
  { id: '2', parameter: 'Frequency Band', airspanValue: 'Band 48', newValue: 'Band 48' },
  { id: '3', parameter: 'Bandwidth', airspanValue: '20 MHz', newValue: '10 MHz' },
  { id: '4', parameter: 'PCI', airspanValue: '101', newValue: '105' },
  { id: '5', parameter: 'EARFCN', airspanValue: '55990', newValue: '55990' },
  { id: '6', parameter: 'Cell ID', airspanValue: '1', newValue: '2' },
  { id: '7', parameter: 'TAC', airspanValue: '1000', newValue: '1001' },
  { id: '8', parameter: 'PLMN', airspanValue: '311-480', newValue: '311-480' },
  { id: '9', parameter: 'Admin State', airspanValue: 'Enabled', newValue: 'Enabled' },
  { id: '10', parameter: 'Max UE Count', airspanValue: '64', newValue: '128' },
  { id: '11', parameter: 'DL MIMO Mode', airspanValue: '2x2', newValue: '4x4' },
  { id: '12', parameter: 'UL MIMO Mode', airspanValue: '1x2', newValue: '2x2' },
  { id: '13', parameter: 'Handover Threshold', airspanValue: '-110 dBm', newValue: '-105 dBm' },
  { id: '14', parameter: 'Timer T300', airspanValue: '1000 ms', newValue: '2000 ms' },
  { id: '15', parameter: 'Timer T301', airspanValue: '1000 ms', newValue: '1000 ms' },
  { id: '16', parameter: 'SRS Periodicity', airspanValue: '40 ms', newValue: '20 ms' },
  { id: '17', parameter: 'PRACH Config Index', airspanValue: '0', newValue: '3' },
  { id: '18', parameter: 'Root Sequence Index', airspanValue: '0', newValue: '22' },
  { id: '19', parameter: 'Sync Signal Period', airspanValue: '5 ms', newValue: '5 ms' },
  { id: '20', parameter: 'Reference Signal Power', airspanValue: '-3 dB', newValue: '0 dB' },
];

type ConfigSelection = 'airspan' | 'new';

interface SelectConfigurationModalProps {
  open: boolean;
  deviceType: string;
  version: string;
  onCancel: () => void;
  onSave: (selections: Record<string, ConfigSelection>) => void;
}

export function SelectConfigurationModal({
  open,
  deviceType,
  version,
  onCancel,
  onSave,
}: SelectConfigurationModalProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [selections, setSelections] = React.useState<Record<string, ConfigSelection>>(() => {
    // Default all to 'new'
    const initial: Record<string, ConfigSelection> = {};
    CONFIG_PARAMETERS.forEach((p) => {
      initial[p.id] = 'new';
    });
    return initial;
  });

  const allSelected = selectedRows.size === CONFIG_PARAMETERS.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(CONFIG_PARAMETERS.map((p) => p.id)));
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

  const setSelection = (id: string, value: ConfigSelection) => {
    setSelections((prev) => ({ ...prev, [id]: value }));
  };

  const setAllSelections = (value: ConfigSelection) => {
    const updated: Record<string, ConfigSelection> = {};
    CONFIG_PARAMETERS.forEach((p) => {
      updated[p.id] = value;
    });
    setSelections(updated);
  };

  const allAirspan = Object.values(selections).every((v) => v === 'airspan');
  const allNew = Object.values(selections).every((v) => v === 'new');

  const handleSave = () => {
    onSave(selections);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Select configuration</SheetTitle>
          <div className="flex items-center gap-2 pt-1">
            <NodeTypeBadge type={deviceType} />
            <span className="text-sm text-muted-foreground">{version}</span>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose which configuration value to use for each parameter. Parameters with different values are highlighted.
          </p>
          
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
                  <TableHead className="px-4 py-3 w-[160px]">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="config-all"
                        checked={allAirspan}
                        onChange={() => setAllSelections('airspan')}
                        className="h-4 w-4 text-primary border-primary focus:ring-primary"
                      />
                      Airspan config
                    </label>
                  </TableHead>
                  <TableHead className="px-4 py-3 w-[160px]">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="config-all"
                        checked={allNew}
                        onChange={() => setAllSelections('new')}
                        className="h-4 w-4 text-primary border-primary focus:ring-primary"
                      />
                      New config
                    </label>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONFIG_PARAMETERS.map((param) => {
                  const hasDifference = param.airspanValue !== param.newValue;
                  return (
                    <TableRow
                      key={param.id}
                      className={hasDifference ? 'bg-warning/5' : ''}
                    >
                      <TableCell className="px-4">
                        <Checkbox
                          checked={selectedRows.has(param.id)}
                          onCheckedChange={() => toggleRow(param.id)}
                          aria-label={`Select ${param.parameter}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 font-medium">
                        {param.parameter}
                        {hasDifference && (
                          <Icon name="difference" size={14} className="inline-block ml-2 text-warning" />
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`config-${param.id}`}
                            value="airspan"
                            checked={selections[param.id] === 'airspan'}
                            onChange={() => setSelection(param.id, 'airspan')}
                            className="h-4 w-4 text-primary border-primary focus:ring-primary"
                          />
                          <span className="text-sm">{param.airspanValue}</span>
                        </label>
                      </TableCell>
                      <TableCell className="px-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`config-${param.id}`}
                            value="new"
                            checked={selections[param.id] === 'new'}
                            onChange={() => setSelection(param.id, 'new')}
                            className="h-4 w-4 text-primary border-primary focus:ring-primary"
                          />
                          <span className="text-sm">{param.newValue}</span>
                        </label>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Fixed Bottom Button Bar */}
        <div className="shrink-0 border-t bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

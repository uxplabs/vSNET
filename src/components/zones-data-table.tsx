'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface ZoneRow {
  cellId: string;
  description: string;
  cells: number;
  e911Enabled: boolean;
  priority: number;
  erfcnUl: number;
  ulBandwidth: string;
  erfcnDl: number;
  dlBandwidth: string;
}

export const ZONES_DATA: ZoneRow[] = [
  { cellId: 'NR-001', description: 'North sector primary', cells: 2, e911Enabled: true, priority: 1, erfcnUl: 123456, ulBandwidth: '50 MHz', erfcnDl: 654321, dlBandwidth: '100 MHz' },
  { cellId: 'NR-001', description: 'North sector secondary', cells: 2, e911Enabled: false, priority: 2, erfcnUl: 123460, ulBandwidth: '50 MHz', erfcnDl: 654325, dlBandwidth: '100 MHz' },
  { cellId: 'NR-002', description: 'South sector primary', cells: 2, e911Enabled: true, priority: 1, erfcnUl: 123457, ulBandwidth: '50 MHz', erfcnDl: 654322, dlBandwidth: '100 MHz' },
  { cellId: 'NR-002', description: 'South sector secondary', cells: 2, e911Enabled: true, priority: 2, erfcnUl: 123461, ulBandwidth: '50 MHz', erfcnDl: 654326, dlBandwidth: '100 MHz' },
  { cellId: 'NR-003', description: 'East sector overlay', cells: 2, e911Enabled: false, priority: 1, erfcnUl: 123458, ulBandwidth: '40 MHz', erfcnDl: 654323, dlBandwidth: '80 MHz' },
  { cellId: 'NR-003', description: 'East sector backup', cells: 2, e911Enabled: false, priority: 2, erfcnUl: 123462, ulBandwidth: '40 MHz', erfcnDl: 654327, dlBandwidth: '80 MHz' },
  { cellId: 'NR-004', description: 'West sector primary', cells: 2, e911Enabled: true, priority: 1, erfcnUl: 123459, ulBandwidth: '50 MHz', erfcnDl: 654324, dlBandwidth: '100 MHz' },
  { cellId: 'NR-004', description: 'West sector secondary', cells: 2, e911Enabled: true, priority: 2, erfcnUl: 123463, ulBandwidth: '50 MHz', erfcnDl: 654328, dlBandwidth: '100 MHz' },
  { cellId: 'NR-005', description: 'Central sector primary', cells: 2, e911Enabled: true, priority: 1, erfcnUl: 123464, ulBandwidth: '40 MHz', erfcnDl: 654329, dlBandwidth: '80 MHz' },
  { cellId: 'NR-005', description: 'Central sector overlay', cells: 2, e911Enabled: false, priority: 2, erfcnUl: 123465, ulBandwidth: '40 MHz', erfcnDl: 654330, dlBandwidth: '80 MHz' },
  { cellId: 'NR-006', description: 'Edge sector primary', cells: 2, e911Enabled: true, priority: 1, erfcnUl: 123466, ulBandwidth: '50 MHz', erfcnDl: 654331, dlBandwidth: '100 MHz' },
  { cellId: 'NR-006', description: 'Edge sector secondary', cells: 2, e911Enabled: false, priority: 2, erfcnUl: 123467, ulBandwidth: '50 MHz', erfcnDl: 654332, dlBandwidth: '100 MHz' },
];

const columns: ColumnDef<ZoneRow>[] = [
  {
    accessorKey: 'cellId',
    header: ({ column }) => <SortableHeader column={column}>Cell ID</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('cellId') as string}</span>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate max-w-[12rem]">{row.getValue('description') as string}</span>
    ),
    meta: { className: 'max-w-[12rem]' },
  },
  {
    accessorKey: 'cells',
    header: ({ column }) => <SortableHeader column={column}>Cells</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('cells') as number}</span>
    ),
  },
  {
    accessorKey: 'e911Enabled',
    header: ({ column }) => <SortableHeader column={column}>911 enabled</SortableHeader>,
    cell: ({ row }) => {
      const enabled = row.getValue('e911Enabled') as boolean;
      return (
        <Icon
          name={enabled ? 'check_circle' : 'cancel'}
          size={18}
          className={enabled ? 'text-success' : 'text-muted-foreground'}
        />
      );
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <SortableHeader column={column}>Priority</SortableHeader>,
    cell: ({ row }) => (
      <Input
        type="number"
        defaultValue={row.getValue('priority')}
        className="h-8 w-16 tabular-nums"
      />
    ),
  },
  {
    accessorKey: 'erfcnUl',
    header: ({ column }) => <SortableHeader column={column}>ERFCNUL</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('erfcnUl') as number}</span>
    ),
  },
  {
    accessorKey: 'ulBandwidth',
    header: ({ column }) => <SortableHeader column={column}>UL bandwidth</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('ulBandwidth') as string}</span>
    ),
  },
  {
    accessorKey: 'erfcnDl',
    header: ({ column }) => <SortableHeader column={column}>ERFCNDL</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('erfcnDl') as number}</span>
    ),
  },
  {
    accessorKey: 'dlBandwidth',
    header: ({ column }) => <SortableHeader column={column}>DL bandwidth</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('dlBandwidth') as string}</span>
    ),
  },
];

export function ZonesDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={ZONES_DATA} />
    </TooltipProvider>
  );
}

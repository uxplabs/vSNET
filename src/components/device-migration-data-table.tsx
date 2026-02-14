'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DeviceLink } from '@/components/ui/device-link';
import { Icon } from '@/components/Icon';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface DeviceMigrationRow {
  id: string;
  host: string;
  type: string;
  status: 'Completed' | 'In progress' | 'Pending' | 'Failed';
}

export const DEVICE_MIGRATION_DATA: DeviceMigrationRow[] = [
  { id: '1', host: 'ENB-SEA-001', type: 'SN', status: 'In progress' },
  { id: '2', host: 'ENB-SEA-002', type: 'SN', status: 'In progress' },
  { id: '3', host: 'ENB-PDX-001', type: 'SN', status: 'In progress' },
  { id: '4', host: 'ENB-SFO-001', type: 'SN', status: 'In progress' },
  { id: '5', host: 'ENB-PHX-001', type: 'SN', status: 'In progress' },
  { id: '6', host: 'RN-SEA-001', type: 'SN', status: 'In progress' },
  { id: '7', host: 'RN-SEA-002', type: 'SN', status: 'In progress' },
  { id: '8', host: 'RN-PDX-001', type: 'SN', status: 'In progress' },
  { id: '9', host: 'ENB-NYC-001', type: 'SN', status: 'In progress' },
  { id: '10', host: 'ENB-NYC-002', type: 'SN', status: 'In progress' },
];

const STATUS_ICON: Record<DeviceMigrationRow['status'], { name: string; className: string }> = {
  'Completed': { name: 'check_circle', className: 'text-green-600 dark:text-green-500' },
  'In progress': { name: 'sync', className: 'text-warning' },
  'Pending': { name: 'schedule', className: 'text-muted-foreground' },
  'Failed': { name: 'error', className: 'text-destructive' },
};

const columns: ColumnDef<DeviceMigrationRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      headerClassName: 'sticky left-0 z-10 w-10 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  },
  {
    accessorKey: 'host',
    header: ({ column }) => <SortableHeader column={column}>Host</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('host') as string} />,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {row.getValue('type') as string}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => {
      const status = row.getValue('status') as DeviceMigrationRow['status'];
      const { name: iconName, className: iconClass } = STATUS_ICON[status];
      return (
        <span className="inline-flex items-center gap-2">
          <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} />
          {status}
        </span>
      );
    },
  },
];

export function DeviceMigrationDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={DEVICE_MIGRATION_DATA} />
    </TooltipProvider>
  );
}

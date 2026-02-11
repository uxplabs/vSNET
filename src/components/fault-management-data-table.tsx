'use client';

import * as React from 'react';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import { DeviceLink } from '@/components/ui/device-link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface FaultManagementRow {
  id: string;
  device: string;
  deviceId: string;
  region: string;
  group: string;
}

export const FAULT_MANAGEMENT_DATA: FaultManagementRow[] = [
  { id: '1', device: 'ENB-SEA-001', deviceId: 'enb-sea-001', region: 'Seattle', group: 'Critical Alerts' },
  { id: '2', device: 'ENB-SEA-002', deviceId: 'enb-sea-002', region: 'Seattle', group: 'Network Operations' },
  { id: '3', device: 'ENB-PDX-001', deviceId: 'enb-pdx-001', region: 'Portland', group: 'Network Operations' },
  { id: '4', device: 'ENB-SFO-001', deviceId: 'enb-sfo-001', region: 'San Francisco', group: 'Regional Alerts - West' },
  { id: '5', device: 'ENB-PHX-001', deviceId: 'enb-phx-001', region: 'Phoenix', group: 'Regional Alerts - West' },
  { id: '6', device: 'ENB-NYC-001', deviceId: 'enb-nyc-001', region: 'New York', group: 'Regional Alerts - East' },
  { id: '7', device: 'ENB-SEA-003', deviceId: 'enb-sea-003', region: 'Seattle', group: 'Engineering Team' },
  { id: '8', device: 'ENB-PDX-002', deviceId: 'enb-pdx-002', region: 'Portland', group: 'Support Team' },
  { id: '9', device: 'ENB-SFO-002', deviceId: 'enb-sfo-002', region: 'San Francisco', group: 'Critical Alerts' },
  { id: '10', device: 'ENB-SEA-004', deviceId: 'enb-sea-004', region: 'Seattle', group: 'Management' },
];

const columns: ColumnDef<FaultManagementRow>[] = [
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
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink value={row.getValue('device') as string} />
    ),
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'group',
    header: ({ column }) => <SortableHeader column={column}>Group</SortableHeader>,
    cell: ({ row }) => row.getValue('group') as string,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete">
              <Icon name="delete" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    ),
    enableSorting: false,
    meta: {
      headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
      cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
    },
  },
];

export interface FaultManagementDataTableProps {
  groupFilter?: string;
}

export function FaultManagementDataTable({ groupFilter }: FaultManagementDataTableProps) {
  const filteredData = useMemo(() => {
    if (!groupFilter) return FAULT_MANAGEMENT_DATA;
    return FAULT_MANAGEMENT_DATA.filter((row) => row.group === groupFilter);
  }, [groupFilter]);

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={filteredData} />
    </TooltipProvider>
  );
}

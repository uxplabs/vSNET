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

export interface LabelManagementRow {
  id: string;
  device: string;
  deviceId: string;
  region: string;
  labelGroup: string;
}

export const LABEL_MANAGEMENT_DATA: LabelManagementRow[] = [
  { id: '1', device: 'ENB-SEA-001', deviceId: 'enb-sea-001', region: 'Seattle', labelGroup: 'Production' },
  { id: '2', device: 'ENB-SEA-002', deviceId: 'enb-sea-002', region: 'Seattle', labelGroup: 'Staging' },
  { id: '3', device: 'ENB-PDX-001', deviceId: 'enb-pdx-001', region: 'Portland', labelGroup: 'Staging' },
  { id: '4', device: 'ENB-SFO-001', deviceId: 'enb-sfo-001', region: 'San Francisco', labelGroup: 'Production' },
  { id: '5', device: 'ENB-PHX-001', deviceId: 'enb-phx-001', region: 'Phoenix', labelGroup: 'Testing' },
  { id: '6', device: 'ENB-NYC-001', deviceId: 'enb-nyc-001', region: 'New York', labelGroup: 'Production' },
  { id: '7', device: 'ENB-SEA-003', deviceId: 'enb-sea-003', region: 'Seattle', labelGroup: 'Development' },
  { id: '8', device: 'ENB-PDX-002', deviceId: 'enb-pdx-002', region: 'Portland', labelGroup: 'Testing' },
  { id: '9', device: 'ENB-SFO-002', deviceId: 'enb-sfo-002', region: 'San Francisco', labelGroup: 'Production' },
  { id: '10', device: 'ENB-SEA-004', deviceId: 'enb-sea-004', region: 'Seattle', labelGroup: 'Development' },
];

const columns: ColumnDef<LabelManagementRow>[] = [
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
    meta: { className: 'w-10' },
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
    accessorKey: 'labelGroup',
    header: ({ column }) => <SortableHeader column={column}>Group</SortableHeader>,
    cell: ({ row }) => row.getValue('labelGroup') as string,
  },
  {
    id: 'totalLabels',
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">
        Total labels
      </SortableHeader>
    ),
    cell: ({ table }) => (
      <div className="text-right tabular-nums">
        {table.getRowModel().rows.length}
      </div>
    ),
    enableSorting: false,
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
      className: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
    },
  },
];

export interface LabelManagementDataTableProps {
  data?: LabelManagementRow[];
  labelGroupFilter?: string;
  onAddDevice?: () => void;
}

export function LabelManagementDataTable({
  data = LABEL_MANAGEMENT_DATA,
  labelGroupFilter,
  onAddDevice,
}: LabelManagementDataTableProps) {
  const filteredData = useMemo(() => {
    if (!labelGroupFilter) return data;
    return data.filter((row) => row.labelGroup === labelGroupFilter);
  }, [data, labelGroupFilter]);

  const header = onAddDevice ? (
    <div className="flex items-center justify-end px-4 py-3 border-b bg-muted/30">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddDevice}>
            <Icon name="add" size={18} />
            Add device
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add device</TooltipContent>
      </Tooltip>
    </div>
  ) : undefined;

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={filteredData} header={header} />
    </TooltipProvider>
  );
}

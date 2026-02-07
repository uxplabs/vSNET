'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { NodeTypeBadge } from '@/components/ui/node-type-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface GoldenConfigTaskRow {
  id: string;
  nodeType: string;
  description: string;
  lastUpdate: string;
  lastRunStatus: 'pass' | 'fail';
  lastRunDate: string;
}

export const GOLDEN_CONFIG_TASKS_DATA: GoldenConfigTaskRow[] = [
  { id: '1', nodeType: 'SN-LTE', description: 'Baseline LTE eNodeB configuration v3.2', lastUpdate: '2026-01-28', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '2', nodeType: 'SN-LTE', description: 'LTE radio parameters – band 7/28', lastUpdate: '2026-01-15', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '3', nodeType: 'CU', description: 'CU RRC connection management baseline', lastUpdate: '2026-01-22', lastRunStatus: 'fail', lastRunDate: '2026-02-03' },
  { id: '4', nodeType: 'RCP', description: 'RCP security hardening profile', lastUpdate: '2026-01-10', lastRunStatus: 'pass', lastRunDate: '2026-02-01' },
  { id: '5', nodeType: 'SN-LTE', description: 'Carrier aggregation profile CA_7A-28A', lastUpdate: '2026-02-01', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '6', nodeType: 'VCU', description: 'Virtual CU resource allocation policy', lastUpdate: '2026-01-20', lastRunStatus: 'pass', lastRunDate: '2026-01-31' },
  { id: '7', nodeType: 'SN-LTE', description: 'Neighbour relation table – region sync', lastUpdate: '2026-01-30', lastRunStatus: 'fail', lastRunDate: '2026-02-03' },
  { id: '8', nodeType: 'RCP', description: 'QoS policy template – voice priority', lastUpdate: '2026-01-18', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '9', nodeType: 'SN-LTE', description: 'eNodeB alarm threshold configuration', lastUpdate: '2026-02-02', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '10', nodeType: 'DAS', description: 'DAS head-end unit configuration', lastUpdate: '2026-01-25', lastRunStatus: 'fail', lastRunDate: '2026-02-01' },
  { id: '11', nodeType: 'SN-LTE', description: 'LTE handover parameters – inter-freq', lastUpdate: '2026-01-27', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '12', nodeType: 'CU', description: 'CU F1 interface configuration', lastUpdate: '2026-01-14', lastRunStatus: 'pass', lastRunDate: '2026-02-01' },
  { id: '13', nodeType: 'SN-LTE', description: 'PRACH configuration – high-density urban', lastUpdate: '2026-01-31', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '14', nodeType: 'VCU', description: 'VCU NFVI platform baseline', lastUpdate: '2026-01-19', lastRunStatus: 'fail', lastRunDate: '2026-02-02' },
  { id: '15', nodeType: 'SN-LTE', description: 'SON self-optimization profile', lastUpdate: '2026-02-03', lastRunStatus: 'pass', lastRunDate: '2026-02-04' },
  { id: '16', nodeType: 'RCP', description: 'Core packet gateway baseline', lastUpdate: '2026-01-22', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '17', nodeType: 'SN-LTE', description: 'MIMO antenna config – 4T4R', lastUpdate: '2026-01-26', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '18', nodeType: 'DAS', description: 'DAS remote unit RF parameters', lastUpdate: '2026-01-20', lastRunStatus: 'pass', lastRunDate: '2026-01-31' },
  { id: '19', nodeType: 'CU', description: 'CU-UP user plane throughput profile', lastUpdate: '2026-01-29', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '20', nodeType: 'SN-LTE', description: 'Cell reselection priority table', lastUpdate: '2026-01-17', lastRunStatus: 'fail', lastRunDate: '2026-02-01' },
];

const columns: ColumnDef<GoldenConfigTaskRow>[] = [
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
    meta: { className: 'w-10' },
  },
  {
    accessorKey: 'nodeType',
    header: ({ column }) => (
      <SortableHeader column={column}>Node type</SortableHeader>
    ),
    cell: ({ row }) => (
      <NodeTypeBadge type={row.getValue('nodeType') as string} />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <SortableHeader column={column}>Description</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('description')}</span>
    ),
  },
  {
    accessorKey: 'lastUpdate',
    header: ({ column }) => (
      <SortableHeader column={column}>Last updated</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {new Date(row.getValue('lastUpdate') as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'lastRunDate',
    header: ({ column }) => (
      <SortableHeader column={column}>Last run</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {new Date(row.getValue('lastRunDate') as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'lastRunStatus',
    header: ({ column }) => (
      <SortableHeader column={column}>Result</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue('lastRunStatus') as string;
      return (
        <div className="flex items-center gap-1.5">
          <Icon
            name={status === 'pass' ? 'check_circle' : 'cancel'}
            size={16}
            className={status === 'pass' ? 'text-success' : 'text-destructive'}
          />
          <span className={status === 'pass' ? 'text-success' : 'text-destructive'}>
            {status === 'pass' ? 'Pass' : 'Fail'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: () => (
      <div className="flex items-center justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="more_vert" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Icon name="play_arrow" size={16} className="mr-2" />
              Run now
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="edit" size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="content_copy" size={16} className="mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Icon name="delete" size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: { className: 'w-12' },
  },
];

export function GoldenConfigTasksDataTable() {
  return <DataTable columns={columns} data={GOLDEN_CONFIG_TASKS_DATA} />;
}

'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface TaskTemplateRow {
  id: string;
  name: string;
  imageConstraints: string;
  domain: string;
  nodeType: string;
}

export const TASK_TEMPLATES_DATA: TaskTemplateRow[] = [
  { id: '1', name: 'Config backup template', imageConstraints: 'v2.x, v3.x', domain: 'All devices', nodeType: 'eNB' },
  { id: '2', name: 'KPI sync template', imageConstraints: 'v3.0+', domain: 'Pacific Northwest', nodeType: 'eNB' },
  { id: '3', name: 'Report generation template', imageConstraints: 'v2.1+', domain: 'Core network', nodeType: 'RN' },
  { id: '4', name: 'Firmware check template', imageConstraints: 'v2.2, v3.x', domain: 'Radio access', nodeType: 'eNB' },
  { id: '5', name: 'Health check template', imageConstraints: 'v3.x', domain: 'Edge devices', nodeType: 'RN' },
];

const columns: ColumnDef<TaskTemplateRow>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name') as string}</span>
    ),
  },
  {
    accessorKey: 'imageConstraints',
    header: ({ column }) => <SortableHeader column={column}>Image constraints</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('imageConstraints') as string}</span>
    ),
  },
  {
    accessorKey: 'domain',
    header: ({ column }) => <SortableHeader column={column}>Domain</SortableHeader>,
    cell: ({ row }) => row.getValue('domain') as string,
  },
  {
    accessorKey: 'nodeType',
    header: ({ column }) => <SortableHeader column={column}>Node type</SortableHeader>,
    cell: ({ row }) => row.getValue('nodeType') as string,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="inline-flex items-center gap-0.5 justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Export">
              <Icon name="download" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete">
              <Icon name="delete" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
              <Icon name="more_vert" size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
    },
  },
];

export function TaskTemplatesDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={TASK_TEMPLATES_DATA} />
    </TooltipProvider>
  );
}

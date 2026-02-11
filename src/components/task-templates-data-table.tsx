'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/Icon';
import { NodeTypeBadge } from '@/components/ui/node-type-badge';
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
  deviceType: string;
}

export const TASK_TEMPLATES_DATA: TaskTemplateRow[] = [
  { id: '1', name: 'Config backup template', imageConstraints: 'v2.x, v3.x', domain: 'All devices', deviceType: 'SN-LTE' },
  { id: '2', name: 'KPI sync template', imageConstraints: 'v3.0+', domain: 'Pacific Northwest', deviceType: 'CU' },
  { id: '3', name: 'Report generation template', imageConstraints: 'v2.1+', domain: 'Core network', deviceType: 'RCP' },
  { id: '4', name: 'Firmware check template', imageConstraints: 'v2.2, v3.x', domain: 'Radio access', deviceType: 'DAS' },
  { id: '5', name: 'Health check template', imageConstraints: 'v3.x', domain: 'Edge devices', deviceType: 'VCU' },
];

/* Editable name cell */
function EditableNameCell({ value }: { value: string }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="h-8 text-sm font-medium -my-1"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/name flex items-center gap-1.5 text-left font-medium w-full"
    >
      <span className="truncate">{value}</span>
      <Icon
        name="edit"
        size={14}
        className="shrink-0 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity"
      />
    </button>
  );
}

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
    meta: {
      headerClassName: 'sticky left-0 z-10 w-10 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => <EditableNameCell value={row.getValue('name') as string} />,
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
    accessorKey: 'deviceType',
    header: ({ column }) => <SortableHeader column={column}>Device type</SortableHeader>,
    cell: ({ row }) => <NodeTypeBadge type={row.getValue('deviceType') as string} />,
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
      headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
      cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
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

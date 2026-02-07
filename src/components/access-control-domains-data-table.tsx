'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface AccessControlDomainRow {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

export interface AccessControlDomainsDataTableProps {
  onEditClick?: (domain: AccessControlDomainRow) => void;
}

export const ACCESS_CONTROL_DOMAINS_DATA: AccessControlDomainRow[] = [
  { id: '1', name: 'Default', description: 'Primary domain for all users', isDefault: true },
  { id: '2', name: 'Engineering', description: 'Domain for engineering team access', isDefault: false },
  { id: '3', name: 'Operations', description: 'Domain for operations team access', isDefault: false },
  { id: '4', name: 'Support', description: 'Domain for support team access', isDefault: false },
  { id: '5', name: 'External', description: 'Domain for external partners and vendors', isDefault: false },
];

function getColumns(onEditClick?: (domain: AccessControlDomainRow) => void): ColumnDef<AccessControlDomainRow>[] {
  return [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name') as string}</span>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('description') as string}</span>
    ),
  },
  {
    accessorKey: 'isDefault',
    header: ({ column }) => <SortableHeader column={column}>Default</SortableHeader>,
    cell: ({ row }) => {
      const isDefault = row.getValue('isDefault') as boolean;
      return isDefault ? (
        <Icon name="check" size={20} className="text-green-600 dark:text-green-500" aria-label="Default domain" />
      ) : null;
    },
    meta: { className: 'w-20' },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Edit" onClick={() => onEditClick?.(row.original)}>
              <Icon name="edit" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete" disabled={row.original.isDefault}>
              <Icon name="delete" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{row.original.isDefault ? 'Cannot delete default domain' : 'Delete'}</TooltipContent>
        </Tooltip>
      </div>
    ),
    enableSorting: false,
    meta: {
      headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
      cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
    },
  },
];
}

export function AccessControlDomainsDataTable({ onEditClick }: AccessControlDomainsDataTableProps = {}) {
  const columns = React.useMemo(() => getColumns(onEditClick), [onEditClick]);
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={ACCESS_CONTROL_DOMAINS_DATA} />
    </TooltipProvider>
  );
}

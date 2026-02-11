'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface FileManagementUserRow {
  id: string;
  user: string;
  passwordHashed: string;
  description: string;
  permissions: string;
}

export const FILE_MANAGEMENT_USERS_DATA: FileManagementUserRow[] = [
  { id: '1', user: 'admin', passwordHashed: '••••••••••••••••', description: 'System administrator', permissions: 'Read, Write, Delete' },
  { id: '2', user: 'operator1', passwordHashed: '••••••••••••••••', description: 'Operations user', permissions: 'Read, Write' },
  { id: '3', user: 'viewer_sea', passwordHashed: '••••••••••••••••', description: 'Seattle region viewer', permissions: 'Read' },
  { id: '4', user: 'backup_user', passwordHashed: '••••••••••••••••', description: 'Backup and restore', permissions: 'Read, Write' },
  { id: '5', user: 'audit', passwordHashed: '••••••••••••••••', description: 'Audit log access', permissions: 'Read' },
  { id: '6', user: 'sync_service', passwordHashed: '••••••••••••••••', description: 'Sync service account', permissions: 'Read, Write' },
  { id: '7', user: 'operator2', passwordHashed: '••••••••••••••••', description: 'Second shift operations', permissions: 'Read, Write' },
  { id: '8', user: 'viewer_pdx', passwordHashed: '••••••••••••••••', description: 'Portland region viewer', permissions: 'Read' },
  { id: '9', user: 'reporting', passwordHashed: '••••••••••••••••', description: 'Report generation and export', permissions: 'Read, Write' },
  { id: '10', user: 'support', passwordHashed: '••••••••••••••••', description: 'Support team access', permissions: 'Read, Write' },
  { id: '11', user: 'guest', passwordHashed: '••••••••••••••••', description: 'Temporary guest access', permissions: 'Read' },
  { id: '12', user: 'config_admin', passwordHashed: '••••••••••••••••', description: 'Configuration management', permissions: 'Read, Write, Delete' },
];

const columns: ColumnDef<FileManagementUserRow>[] = [
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
    accessorKey: 'user',
    header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('user') as string}</span>
    ),
  },
  {
    accessorKey: 'passwordHashed',
    header: ({ column }) => <SortableHeader column={column}>Password</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">{row.getValue('passwordHashed') as string}</span>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
    cell: ({ row }) => (
      <span className="truncate max-w-[200px] block" title={row.getValue('description') as string}>
        {row.getValue('description') as string}
      </span>
    ),
  },
  {
    accessorKey: 'permissions',
    header: ({ column }) => <SortableHeader column={column}>Permissions</SortableHeader>,
    cell: ({ row }) => row.getValue('permissions') as string,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
              <Icon name="more_vert" size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Reset password</DropdownMenuItem>
            <DropdownMenuItem>Change permissions</DropdownMenuItem>
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

export function FileManagementUsersDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={FILE_MANAGEMENT_USERS_DATA} />
    </TooltipProvider>
  );
}

'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
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
  sshKey: string;
}

function createDefaultSshKey(user: string): string {
  return `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${user.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'generated'} ${user}@ams`;
}

type LegacyFileManagementUserRow = {
  id?: string;
  user?: string;
  sshKey?: string;
  passwordHashed?: string;
  description?: string;
  permissions?: string;
};

export function normalizeFileManagementUserRow(row: LegacyFileManagementUserRow): FileManagementUserRow {
  const user = (row.user ?? '').trim();
  return {
    id: row.id ?? `fm-${Date.now()}`,
    user,
    sshKey: (row.sshKey ?? '').trim() || createDefaultSshKey(user || 'user'),
  };
}

export function normalizeFileManagementUsers(rows: LegacyFileManagementUserRow[]): FileManagementUserRow[] {
  return rows.map(normalizeFileManagementUserRow);
}

export const FILE_MANAGEMENT_USERS_DATA: FileManagementUserRow[] = [
  { id: '1', user: 'admin', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICgVdM1eadminvSNET admin@ams' },
  { id: '2', user: 'operator1', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFxP2yVwoperator1 operator1@ams' },
  { id: '3', user: 'viewer_sea', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP8Qx3NWviewersea viewer_sea@ams' },
  { id: '4', user: 'backup_user', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM2b7wYbackupuser backup_user@ams' },
  { id: '5', user: 'audit', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK4w9hQwaudit audit@ams' },
  { id: '6', user: 'sync_service', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEq2L7dssyncservice sync_service@ams' },
  { id: '7', user: 'operator2', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG3p6xLroperator2 operator2@ams' },
  { id: '8', user: 'viewer_pdx', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAb5s4Qkviewerpdx viewer_pdx@ams' },
  { id: '9', user: 'reporting', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP1h0kRreporting reporting@ams' },
  { id: '10', user: 'support', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHz3j9Wwsupport support@ams' },
  { id: '11', user: 'guest', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK0n2aM5guest guest@ams' },
  { id: '12', user: 'config_admin', sshKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF5u8cPnconfigadmin config_admin@ams' },
];

/** File management data included in the administration save snapshot (users + retention + sync). */
export interface FileManagementPersisted {
  fileUsers: FileManagementUserRow[];
  pmDays: string;
  cmMb: string;
  cperDays: string;
  debugLogsDays: string;
  errorBundlesDays: string;
  deviceDbBackupsDays: string;
  amsDbBackupsMb: string;
  cmBackupAutoSync: boolean;
  cmFileFormat: string;
  deviceDbBackupAutoSync: boolean;
}

export function createInitialFileManagementPersisted(): FileManagementPersisted {
  return {
    fileUsers: normalizeFileManagementUsers(FILE_MANAGEMENT_USERS_DATA),
    pmDays: '30',
    cmMb: '1024',
    cperDays: '14',
    debugLogsDays: '7',
    errorBundlesDays: '14',
    deviceDbBackupsDays: '30',
    amsDbBackupsMb: '2048',
    cmBackupAutoSync: true,
    cmFileFormat: 'CSV',
    deviceDbBackupAutoSync: false,
  };
}

function buildColumns(onEditUser?: (row: FileManagementUserRow) => void): ColumnDef<FileManagementUserRow>[] {
  return [
    {
      accessorKey: 'user',
      header: ({ column }) => <SortableHeader column={column}>Username</SortableHeader>,
      cell: ({ row }) => <span className="font-medium">{row.getValue('user') as string}</span>,
    },
    {
      accessorKey: 'sshKey',
      header: ({ column }) => <SortableHeader column={column}>SSH key</SortableHeader>,
      cell: ({ row }) => (
        <span className="block max-w-[580px] truncate font-mono text-xs text-muted-foreground" title={row.getValue('sshKey') as string}>
          {row.getValue('sshKey') as string}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                <Icon name="more_vert" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  onEditUser?.(row.original);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
        cellClassName:
          'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
      },
    },
  ];
}

export interface FileManagementUsersDataTableProps {
  data: FileManagementUserRow[];
  onEditUser?: (row: FileManagementUserRow) => void;
}

export function FileManagementUsersDataTable({ data, onEditUser }: FileManagementUsersDataTableProps) {
  const columns = React.useMemo(() => buildColumns(onEditUser), [onEditUser]);
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={data} getRowId={(row) => row.id} />
    </TooltipProvider>
  );
}

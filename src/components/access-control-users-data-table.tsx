'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';

export interface AccessControlUserRow {
  id: string;
  user: string;
  profile: string;
  department: string;
  location: string;
  phone: string;
  email: string;
  lastLogIn: string;
}

export const ACCESS_CONTROL_USERS_DATA: AccessControlUserRow[] = [
  { id: '1', user: 'John Smith', profile: 'Administrator', department: 'Engineering', location: 'Seattle', phone: '+1 (555) 123-4567', email: 'john.smith@example.com', lastLogIn: 'Jan 27, 2025 2:45 PM' },
  { id: '2', user: 'Sarah Johnson', profile: 'Operator', department: 'Operations', location: 'Portland', phone: '+1 (555) 234-5678', email: 'sarah.johnson@example.com', lastLogIn: 'Jan 27, 2025 1:30 PM' },
  { id: '3', user: 'Michael Chen', profile: 'Administrator', department: 'Engineering', location: 'San Francisco', phone: '+1 (555) 345-6789', email: 'michael.chen@example.com', lastLogIn: 'Jan 27, 2025 10:15 AM' },
  { id: '4', user: 'Emily Davis', profile: 'Viewer', department: 'Support', location: 'Seattle', phone: '+1 (555) 456-7890', email: 'emily.davis@example.com', lastLogIn: 'Jan 26, 2025 4:20 PM' },
  { id: '5', user: 'David Wilson', profile: 'Operator', department: 'Operations', location: 'Phoenix', phone: '+1 (555) 567-8901', email: 'david.wilson@example.com', lastLogIn: 'Jan 27, 2025 9:00 AM' },
  { id: '6', user: 'Jessica Martinez', profile: 'Administrator', department: 'Management', location: 'New York', phone: '+1 (555) 678-9012', email: 'jessica.martinez@example.com', lastLogIn: 'Jan 27, 2025 8:45 AM' },
  { id: '7', user: 'Robert Taylor', profile: 'Operator', department: 'Operations', location: 'Seattle', phone: '+1 (555) 789-0123', email: 'robert.taylor@example.com', lastLogIn: 'Jan 26, 2025 11:30 PM' },
  { id: '8', user: 'Linda Anderson', profile: 'Viewer', department: 'Support', location: 'Portland', phone: '+1 (555) 890-1234', email: 'linda.anderson@example.com', lastLogIn: 'Jan 27, 2025 7:15 AM' },
];

const PROFILE_OPTIONS = ['Administrator', 'Operator', 'Viewer'] as const;

const columns: ColumnDef<AccessControlUserRow>[] = [
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
    accessorKey: 'user',
    header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('user') as string}</span>
    ),
  },
  {
    accessorKey: 'profile',
    header: ({ column }) => <SortableHeader column={column}>Profile</SortableHeader>,
    cell: ({ row }) => {
      const [profile, setProfile] = React.useState(row.getValue('profile') as string);
      return (
        <Select value={profile} onValueChange={setProfile}>
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFILE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <SortableHeader column={column}>Department</SortableHeader>,
    cell: ({ row }) => row.getValue('department') as string,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => <SortableHeader column={column}>Location</SortableHeader>,
    cell: ({ row }) => row.getValue('location') as string,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <SortableHeader column={column}>Phone</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm whitespace-nowrap">{row.getValue('phone') as string}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
    cell: ({ row }) => (
      <a href={`mailto:${row.getValue('email')}`} className="text-link hover:underline">
        {row.getValue('email') as string}
      </a>
    ),
  },
  {
    accessorKey: 'lastLogIn',
    header: ({ column }) => <SortableHeader column={column}>Last log in</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">{row.getValue('lastLogIn') as string}</span>
    ),
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
            <DropdownMenuItem>Change password</DropdownMenuItem>
            <DropdownMenuItem>View activity</DropdownMenuItem>
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

export function AccessControlUsersDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={ACCESS_CONTROL_USERS_DATA} />
    </TooltipProvider>
  );
}

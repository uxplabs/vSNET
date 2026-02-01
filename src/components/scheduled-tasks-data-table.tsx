'use client';

import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';

export type TaskStatus = 'Scheduled' | 'Running' | 'Completed' | 'Failed';

export interface ScheduledTaskRow {
  id: string;
  task: string;
  type: string;
  domain: string;
  startTime: string;
  lastCompleted: string;
  repeats: string;
  status: TaskStatus;
}

const STATUS_ICON: Record<TaskStatus, { name: string; className: string }> = {
  Scheduled: { name: 'schedule', className: 'text-muted-foreground' },
  Running: { name: 'sync', className: 'text-primary animate-spin' },
  Completed: { name: 'check_circle', className: 'text-green-600 dark:text-green-500' },
  Failed: { name: 'error', className: 'text-destructive' },
};

const SCHEDULED_TASKS_DATA: ScheduledTaskRow[] = [
  { id: '1', task: 'Config backup', type: 'Backup', domain: 'All devices', startTime: '2025-01-27 02:00', lastCompleted: '2025-01-27 02:15', repeats: 'Daily', status: 'Completed' },
  { id: '2', task: 'KPI sync', type: 'Sync', domain: 'Pacific Northwest', startTime: '2025-01-27 09:00', lastCompleted: '—', repeats: 'Every 15 min', status: 'Running' },
  { id: '3', task: 'Report generation', type: 'Report', domain: 'Core network', startTime: '2025-01-20 06:00', lastCompleted: '2025-01-20 06:20', repeats: 'Weekly', status: 'Scheduled' },
  { id: '4', task: 'Firmware check', type: 'Maintenance', domain: 'eNB-SEA-001', startTime: '2025-01-27 04:00', lastCompleted: '2025-01-27 04:05', repeats: 'Daily', status: 'Failed' },
  { id: '5', task: 'Inventory sync', type: 'Sync', domain: 'All devices', startTime: '2025-01-27 06:00', lastCompleted: '2025-01-27 06:12', repeats: 'Every 6 hours', status: 'Completed' },
  { id: '6', task: 'Health check', type: 'Maintenance', domain: 'Radio access', startTime: '2025-01-27 09:10', lastCompleted: '—', repeats: 'Every 5 min', status: 'Running' },
  { id: '7', task: 'Alarm report', type: 'Report', domain: 'Pacific Northwest', startTime: '2025-01-27 08:00', lastCompleted: '2025-01-27 08:10', repeats: 'Daily', status: 'Completed' },
  { id: '8', task: 'Config sync', type: 'Sync', domain: 'Edge devices', startTime: '2025-01-27 08:30', lastCompleted: '2025-01-27 08:35', repeats: 'Every 30 min', status: 'Scheduled' },
  { id: '9', task: 'Log archive', type: 'Backup', domain: 'All devices', startTime: '2025-01-19 23:00', lastCompleted: '2025-01-19 23:45', repeats: 'Weekly', status: 'Scheduled' },
  { id: '10', task: 'Certificate renewal check', type: 'Maintenance', domain: 'Core network', startTime: '2025-01-27 03:00', lastCompleted: '2025-01-27 03:02', repeats: 'Daily', status: 'Completed' },
];

const columns: ColumnDef<ScheduledTaskRow>[] = [
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
    meta: { className: 'w-12' },
  },
  {
    accessorKey: 'task',
    header: ({ column }) => (
      <SortableHeader column={column}>Tasks</SortableHeader>
    ),
    cell: ({ row }) => (
      <a href="#" className="font-medium text-link hover:underline" onClick={(e) => e.preventDefault()}>
        {row.getValue('task') as string}
      </a>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('type') as string,
  },
  {
    accessorKey: 'domain',
    header: ({ column }) => (
      <SortableHeader column={column}>Domain</SortableHeader>
    ),
    cell: ({ row }) => (
      <a href="#" className="font-medium text-link hover:underline" onClick={(e) => e.preventDefault()}>
        {row.getValue('domain') as string}
      </a>
    ),
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <SortableHeader column={column}>Start time</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('startTime')}</span>,
  },
  {
    accessorKey: 'lastCompleted',
    header: ({ column }) => (
      <SortableHeader column={column}>Last completed</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('lastCompleted')}</span>,
  },
  {
    accessorKey: 'repeats',
    header: ({ column }) => (
      <SortableHeader column={column}>Repeats</SortableHeader>
    ),
    cell: ({ row }) => <span className="text-sm">{row.getValue('repeats')}</span>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    sortingFn: (rowA, rowB) => {
      const order: Record<TaskStatus, number> = { Running: 0, Scheduled: 1, Completed: 2, Failed: 3 };
      const a = order[rowA.original.status] ?? 4;
      const b = order[rowB.original.status] ?? 4;
      return a - b;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as TaskStatus;
      const { name: iconName, className: iconClass } = STATUS_ICON[status];
      return (
        <span className="inline-flex items-center gap-2">
          <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} />
          {status}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
            <Icon name="more_vert" size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Run now</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View history</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card',
    },
  },
];

export function ScheduledTasksDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'startTime', desc: true },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: SCHEDULED_TASKS_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, rowSelection, pagination },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 h-12 ${(header.column.columnDef.meta as { className?: string })?.className ?? ''}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3 ${(cell.column.columnDef.meta as { className?: string })?.className ?? ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center px-4 py-3">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} className="justify-end shrink-0" />
    </div>
  );
}

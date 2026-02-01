'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
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
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';

export type ActivityLogStatus = 'Not transferred' | 'Transfer complete' | 'Updating' | 'Error' | 'Complete';

export interface ActivityLogRow {
  id: string;
  host: string;
  type: string;
  previousVersion: string;
  newVersion: string;
  status: ActivityLogStatus;
  startedBy: string;
  updatedDate: string;
}

const STATUS_ICON: Record<ActivityLogStatus, { name: string; className: string }> = {
  'Not transferred': { name: 'download', className: 'text-muted-foreground' },
  'Transfer complete': { name: 'check_circle', className: 'text-muted-foreground' },
  Updating: { name: 'sync', className: 'text-primary' },
  Error: { name: 'error', className: 'text-destructive' },
  Complete: { name: 'check_circle', className: 'text-green-600 dark:text-green-500' },
};

const ACTIVITY_LOG_DATA: ActivityLogRow[] = [
  { id: '1', host: 'eNB-SEA-001', type: 'SN-LTE', previousVersion: '3.1.0', newVersion: '3.1.2', status: 'Not transferred', startedBy: 'J. Smith', updatedDate: '2025-01-27 09:12' },
  { id: '2', host: 'RN-PDX-002', type: 'SN-LTE', previousVersion: '2.4.0', newVersion: '2.4.1', status: 'Complete', startedBy: 'A. Jones', updatedDate: '2025-01-27 08:45' },
  { id: '3', host: 'eNB-PHX-001', type: 'SN-LTE', previousVersion: '1.8.0', newVersion: '1.8.0', status: 'Complete', startedBy: 'System', updatedDate: '2025-01-26 14:20' },
  { id: '4', host: 'eNB-NYC-001', type: 'SN-LTE', previousVersion: '3.0.8', newVersion: '3.0.8', status: 'Complete', startedBy: 'M. Lee', updatedDate: '2025-01-26 11:05' },
  { id: '5', host: 'RN-SFO-003', type: 'SN-LTE', previousVersion: '1.0.2', newVersion: '1.0.3', status: 'Error', startedBy: 'K. Brown', updatedDate: '2025-01-27 07:30' },
  { id: '6', host: 'eNB-CHI-002', type: 'SN-LTE', previousVersion: '2.2.1', newVersion: '2.2.1', status: 'Complete', startedBy: 'System', updatedDate: '2025-01-25 16:00' },
  { id: '7', host: 'eNB-MIA-002', type: 'SN-LTE', previousVersion: '2.2.5', newVersion: '3.0.8', status: 'Transfer complete', startedBy: 'J. Smith', updatedDate: '2025-01-27 09:00' },
  { id: '8', host: 'RN-DEN-002', type: 'SN-LTE', previousVersion: '1.1.0', newVersion: '1.2.0', status: 'Updating', startedBy: 'A. Jones', updatedDate: '2025-01-27 08:55' },
  { id: '9', host: 'RN-ATL-005', type: 'SN-LTE', previousVersion: '1.5.2', newVersion: '1.5.2', status: 'Complete', startedBy: 'System', updatedDate: '2025-01-24 10:15' },
  { id: '10', host: 'eNB-BOS-001', type: 'SN-LTE', previousVersion: '2.0.5', newVersion: '2.1.0', status: 'Not transferred', startedBy: 'M. Lee', updatedDate: '2025-01-27 08:30' },
];

const columns: ColumnDef<ActivityLogRow>[] = [
  {
    accessorKey: 'host',
    header: ({ column }) => (
      <SortableHeader column={column}>Host</SortableHeader>
    ),
    cell: ({ row }) => <DeviceLink value={row.getValue('host') as string} />,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {row.getValue('type') as string}
      </Badge>
    ),
  },
  {
    accessorKey: 'previousVersion',
    header: ({ column }) => (
      <SortableHeader column={column}>Previous version</SortableHeader>
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('previousVersion')}</span>,
  },
  {
    accessorKey: 'newVersion',
    header: ({ column }) => (
      <SortableHeader column={column}>New version</SortableHeader>
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('newVersion')}</span>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    sortingFn: (rowA, rowB) => {
      const order: Record<ActivityLogStatus, number> = { 'Not transferred': 0, 'Transfer complete': 1, Updating: 2, Error: 3, Complete: 4 };
      const a = order[rowA.original.status] ?? 5;
      const b = order[rowB.original.status] ?? 5;
      return a - b;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as ActivityLogStatus;
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
    accessorKey: 'startedBy',
    header: ({ column }) => (
      <SortableHeader column={column}>Started by</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('startedBy') as string,
  },
  {
    accessorKey: 'updatedDate',
    header: ({ column }) => (
      <SortableHeader column={column}>Updated date</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('updatedDate')}</span>,
  },
];

export function ActivityLogDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'updatedDate', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: ACTIVITY_LOG_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, pagination },
  });

  return (
    <TooltipProvider delayDuration={300}>
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
                <TableRow key={row.id}>
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
    </TooltipProvider>
  );
}

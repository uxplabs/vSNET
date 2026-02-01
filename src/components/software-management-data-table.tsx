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
import { Badge } from '@/components/ui/badge';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';

export type SoftwareStatus = 'Not transferred' | 'Transfer complete' | 'Updating' | 'Error' | 'Complete';

export interface SoftwareRow {
  id: string;
  host: string;
  type: string;
  currentVersion: string;
  newVersion: string;
  status: SoftwareStatus;
}

const STATUS_ICON: Record<SoftwareStatus, { name: string; className: string }> = {
  'Not transferred': { name: 'download', className: 'text-muted-foreground' },
  'Transfer complete': { name: 'check_circle', className: 'text-muted-foreground' },
  Updating: { name: 'sync', className: 'text-primary' },
  Error: { name: 'error', className: 'text-destructive' },
  Complete: { name: 'check_circle', className: 'text-green-600 dark:text-green-500' },
};

const SOFTWARE_DATA: SoftwareRow[] = [
  { id: '1', host: 'eNB-SEA-001', type: 'SN-LTE', currentVersion: '3.1.0', newVersion: '3.1.2', status: 'Not transferred' },
  { id: '2', host: 'RN-PDX-002', type: 'SN-LTE', currentVersion: '2.4.0', newVersion: '2.4.1', status: 'Not transferred' },
  { id: '3', host: 'eNB-PHX-001', type: 'SN-LTE', currentVersion: '1.8.0', newVersion: '1.8.0', status: 'Complete' },
  { id: '4', host: 'eNB-NYC-001', type: 'SN-LTE', currentVersion: '3.0.8', newVersion: '3.0.8', status: 'Complete' },
  { id: '5', host: 'RN-SFO-003', type: 'SN-LTE', currentVersion: '1.0.2', newVersion: '1.0.3', status: 'Error' },
  { id: '6', host: 'eNB-CHI-002', type: 'SN-LTE', currentVersion: '2.2.1', newVersion: '2.2.1', status: 'Complete' },
  { id: '7', host: 'eNB-MIA-002', type: 'SN-LTE', currentVersion: '2.2.5', newVersion: '3.0.8', status: 'Transfer complete' },
  { id: '8', host: 'RN-DEN-002', type: 'SN-LTE', currentVersion: '1.1.0', newVersion: '1.2.0', status: 'Updating' },
  { id: '9', host: 'RN-ATL-005', type: 'SN-LTE', currentVersion: '1.5.2', newVersion: '1.5.2', status: 'Complete' },
  { id: '10', host: 'eNB-BOS-001', type: 'SN-LTE', currentVersion: '2.0.5', newVersion: '2.1.0', status: 'Not transferred' },
];

const columns: ColumnDef<SoftwareRow>[] = [
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
    accessorKey: 'currentVersion',
    header: ({ column }) => (
      <SortableHeader column={column}>Current version</SortableHeader>
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('currentVersion')}</span>,
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
      const order: Record<SoftwareStatus, number> = { 'Not transferred': 0, 'Transfer complete': 1, Updating: 2, Error: 3, Complete: 4 };
      const a = order[rowA.original.status] ?? 5;
      const b = order[rowB.original.status] ?? 5;
      return a - b;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as SoftwareStatus;
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
    cell: ({ row }) => {
      const status = row.original.status;
      const actionButton = status === 'Not transferred' ? (
        <Button variant="outline" size="sm" className="shrink-0 h-8">Send image</Button>
      ) : status === 'Transfer complete' ? (
        <Button variant="outline" size="sm" className="shrink-0 h-8">Start update</Button>
      ) : null;
      return (
        <div className="flex items-center gap-1 justify-end">
          {actionButton}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                <Icon name="more_vert" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Send image to device</DropdownMenuItem>
              <DropdownMenuItem>Start update</DropdownMenuItem>
              <DropdownMenuItem>View details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card',
    },
  },
];

export function SoftwareManagementDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'status', desc: false },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const pageSize = useResponsivePageSize();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: SOFTWARE_DATA,
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
    </TooltipProvider>
  );
}

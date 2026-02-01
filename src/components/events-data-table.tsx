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
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';

export type EventSeverity = 'Critical' | 'Major' | 'Minor' | 'Info';

export interface EventRow {
  id: string;
  timestamp: string;
  updated: string;
  type: string;
  severity: EventSeverity;
  source: string;
  managedObject: string;
}

const SEVERITY_ICON: Record<EventSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
  Info: { name: 'info', className: 'text-muted-foreground' },
};

const EVENTS_DATA: EventRow[] = [
  { id: 'EVT-1001', timestamp: '2025-01-27 09:12', updated: '2025-01-27 09:15', type: 'Configuration change', severity: 'Info', source: 'eNB-SEA-001', managedObject: 'Cell-1' },
  { id: 'EVT-1002', timestamp: '2025-01-27 08:45', updated: '2025-01-27 09:00', type: 'Connection', severity: 'Major', source: 'RN-PDX-002', managedObject: 'Radio-2' },
  { id: 'EVT-1003', timestamp: '2025-01-27 08:30', updated: '2025-01-27 08:35', type: 'Performance', severity: 'Minor', source: 'eNB-PHX-001', managedObject: 'Cell-3' },
  { id: 'EVT-1004', timestamp: '2025-01-27 08:15', updated: '2025-01-27 08:20', type: 'Configuration change', severity: 'Critical', source: 'eNB-NYC-001', managedObject: 'Cell-4' },
  { id: 'EVT-1005', timestamp: '2025-01-27 07:58', updated: '2025-01-27 08:10', type: 'Connection', severity: 'Info', source: 'RN-SFO-003', managedObject: 'Radio-5' },
  { id: 'EVT-1006', timestamp: '2025-01-27 07:42', updated: '2025-01-27 07:45', type: 'Security', severity: 'Minor', source: 'RN-LAS-001', managedObject: 'Radio-6' },
  { id: 'EVT-1007', timestamp: '2025-01-27 07:20', updated: '2025-01-27 07:30', type: 'System', severity: 'Info', source: 'eNB-CHI-002', managedObject: 'Cell-7' },
  { id: 'EVT-1008', timestamp: '2025-01-27 06:55', updated: '2025-01-27 07:05', type: 'Connection', severity: 'Critical', source: 'eNB-MIA-002', managedObject: 'Cell-8' },
  { id: 'EVT-1009', timestamp: '2025-01-27 06:30', updated: '2025-01-27 06:32', type: 'Performance', severity: 'Major', source: 'RN-DEN-002', managedObject: 'Radio-9' },
  { id: 'EVT-1010', timestamp: '2025-01-27 06:10', updated: '2025-01-27 06:25', type: 'Configuration change', severity: 'Info', source: 'RN-ATL-005', managedObject: 'Radio-10' },
  { id: 'EVT-1011', timestamp: '2025-01-27 05:45', updated: '2025-01-27 05:50', type: 'System', severity: 'Minor', source: 'eNB-BOS-001', managedObject: 'Cell-11' },
  { id: 'EVT-1012', timestamp: '2025-01-27 05:20', updated: '2025-01-27 05:25', type: 'Security', severity: 'Info', source: 'RN-NYC-003', managedObject: 'Radio-12' },
];

const columns: ColumnDef<EventRow>[] = [
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
    accessorKey: 'severity',
    header: ({ column }) => (
      <SortableHeader column={column}>Severity</SortableHeader>
    ),
    sortingFn: (rowA, rowB) => {
      const order: Record<EventSeverity, number> = { Critical: 0, Major: 1, Minor: 2, Info: 3 };
      const a = order[rowA.original.severity] ?? 4;
      const b = order[rowB.original.severity] ?? 4;
      return a - b;
    },
    cell: ({ row }) => {
      const severity = row.getValue('severity') as EventSeverity;
      const { name: iconName, className: iconClass } = SEVERITY_ICON[severity];
      return (
        <span className="inline-flex items-center gap-2">
          <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} />
          {severity}
        </span>
      );
    },
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <SortableHeader column={column}>ID</SortableHeader>
    ),
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('type') as string,
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <SortableHeader column={column}>Timestamp</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('timestamp')}</span>,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => (
      <SortableHeader column={column}>Updated</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('updated')}</span>,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <SortableHeader column={column}>Source</SortableHeader>
    ),
    cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} />,
  },
  {
    accessorKey: 'managedObject',
    header: ({ column }) => (
      <SortableHeader column={column}>Managed object</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('managedObject') as string,
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
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card',
    },
  },
];

export function EventsDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
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
    data: EVENTS_DATA,
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

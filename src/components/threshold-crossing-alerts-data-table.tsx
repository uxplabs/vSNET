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

export interface ThresholdCrossingAlertRow {
  id: string;
  device: string;
  triggered: string;
  lastTriggered: string;
  lastReset: string;
  umtsMonitoredCells: number;
  lteMonitoredCells: number;
}

const THRESHOLD_ALERTS_DATA: ThresholdCrossingAlertRow[] = [
  { id: '1', device: 'eNB-SEA-001', triggered: 'Yes', lastTriggered: '2025-01-27 09:12', lastReset: '2025-01-27 08:45', umtsMonitoredCells: 12, lteMonitoredCells: 24 },
  { id: '2', device: 'RN-PDX-002', triggered: 'No', lastTriggered: '—', lastReset: '2025-01-27 09:00', umtsMonitoredCells: 6, lteMonitoredCells: 12 },
  { id: '3', device: 'eNB-PHX-001', triggered: 'Yes', lastTriggered: '2025-01-27 08:30', lastReset: '2025-01-27 08:10', umtsMonitoredCells: 8, lteMonitoredCells: 18 },
  { id: '4', device: 'eNB-NYC-001', triggered: 'Yes', lastTriggered: '2025-01-27 08:15', lastReset: '2025-01-27 07:55', umtsMonitoredCells: 15, lteMonitoredCells: 30 },
  { id: '5', device: 'RN-SFO-003', triggered: 'No', lastTriggered: '—', lastReset: '2025-01-27 07:30', umtsMonitoredCells: 4, lteMonitoredCells: 8 },
  { id: '6', device: 'eNB-CHI-002', triggered: 'Yes', lastTriggered: '2025-01-27 07:20', lastReset: '2025-01-27 06:45', umtsMonitoredCells: 10, lteMonitoredCells: 20 },
];

const columns: ColumnDef<ThresholdCrossingAlertRow>[] = [
  {
    accessorKey: 'device',
    header: ({ column }) => (
      <SortableHeader column={column}>Device</SortableHeader>
    ),
    cell: ({ row }) => <DeviceLink value={row.getValue('device') as string} />,
  },
  {
    accessorKey: 'triggered',
    header: ({ column }) => (
      <SortableHeader column={column}>Triggered</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('triggered') as string,
  },
  {
    accessorKey: 'lastTriggered',
    header: ({ column }) => (
      <SortableHeader column={column}>Last triggered</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lastTriggered') as string}</span>
    ),
  },
  {
    accessorKey: 'lastReset',
    header: ({ column }) => (
      <SortableHeader column={column}>Last reset</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lastReset') as string}</span>
    ),
  },
  {
    accessorKey: 'umtsMonitoredCells',
    header: ({ column }) => (
      <SortableHeader column={column}>UMTS monitored cells</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('umtsMonitoredCells') as number}</span>
    ),
  },
  {
    accessorKey: 'lteMonitoredCells',
    header: ({ column }) => (
      <SortableHeader column={column}>LTE monitored cells</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lteMonitoredCells') as number}</span>
    ),
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
          <DropdownMenuItem>Reset threshold</DropdownMenuItem>
          <DropdownMenuItem>Edit threshold</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card',
    },
  },
];

export function ThresholdCrossingAlertsDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'lastTriggered', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: THRESHOLD_ALERTS_DATA,
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

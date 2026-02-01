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
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';

type AlarmSeverity = 'critical' | 'warning';

function MetricCell({ value, format, severity }: { value: number; format: 'pct' | 'num'; severity?: AlarmSeverity }) {
  const display = format === 'pct' ? `${value}%` : String(value);
  const icon = severity === 'critical'
    ? <Icon name="error" size={14} className="text-destructive shrink-0" aria-hidden />
    : severity === 'warning'
      ? <Icon name="warning" size={14} className="text-amber-600 dark:text-amber-500 shrink-0" aria-hidden />
      : null;
  return (
    <span className="inline-flex items-center justify-end gap-1 w-full">
      {icon}
      <span className="tabular-nums text-xs">{display}</span>
    </span>
  );
}

export interface PerformanceRow {
  id: string;
  device: string;
  dataAccessibilityPct: number;
  dataAccessSuccess: number;
  dataAccessAttempts: number;
  volteAccessibilityPct: number;
  volteAccessibilitySuccess: number;
  volteAccessibilityAttempts: number;
  dataRetainabilityPct: number;
  erabDropCount: number;
}

const PERFORMANCE_DATA: PerformanceRow[] = [
  { id: '1', device: 'eNB-SEA-001', dataAccessibilityPct: 99.2, dataAccessSuccess: 9920, dataAccessAttempts: 10000, volteAccessibilityPct: 98.5, volteAccessibilitySuccess: 9850, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 99.8, erabDropCount: 2 },
  { id: '2', device: 'RN-PDX-002', dataAccessibilityPct: 97.8, dataAccessSuccess: 9780, dataAccessAttempts: 10000, volteAccessibilityPct: 96.2, volteAccessibilitySuccess: 9620, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 98.5, erabDropCount: 5 },
  { id: '3', device: 'eNB-PHX-001', dataAccessibilityPct: 99.5, dataAccessSuccess: 9950, dataAccessAttempts: 10000, volteAccessibilityPct: 99.1, volteAccessibilitySuccess: 9910, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 99.9, erabDropCount: 1 },
  { id: '4', device: 'eNB-NYC-001', dataAccessibilityPct: 98.1, dataAccessSuccess: 9810, dataAccessAttempts: 10000, volteAccessibilityPct: 97.3, volteAccessibilitySuccess: 9730, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 98.2, erabDropCount: 8 },
  { id: '5', device: 'RN-SFO-003', dataAccessibilityPct: 99.0, dataAccessSuccess: 9900, dataAccessAttempts: 10000, volteAccessibilityPct: 98.8, volteAccessibilitySuccess: 9880, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 99.5, erabDropCount: 3 },
  { id: '6', device: 'eNB-CHI-002', dataAccessibilityPct: 96.5, dataAccessSuccess: 9650, dataAccessAttempts: 10000, volteAccessibilityPct: 95.2, volteAccessibilitySuccess: 9520, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 97.1, erabDropCount: 12 },
  { id: '7', device: 'eNB-MIA-002', dataAccessibilityPct: 99.8, dataAccessSuccess: 9980, dataAccessAttempts: 10000, volteAccessibilityPct: 99.5, volteAccessibilitySuccess: 9950, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 99.9, erabDropCount: 0 },
  { id: '8', device: 'RN-DEN-002', dataAccessibilityPct: 98.4, dataAccessSuccess: 9840, dataAccessAttempts: 10000, volteAccessibilityPct: 97.9, volteAccessibilitySuccess: 9790, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 98.8, erabDropCount: 4 },
  { id: '9', device: 'RN-ATL-005', dataAccessibilityPct: 99.1, dataAccessSuccess: 9910, dataAccessAttempts: 10000, volteAccessibilityPct: 98.2, volteAccessibilitySuccess: 9820, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 99.2, erabDropCount: 2 },
  { id: '10', device: 'eNB-BOS-001', dataAccessibilityPct: 97.2, dataAccessSuccess: 9720, dataAccessAttempts: 10000, volteAccessibilityPct: 96.8, volteAccessibilitySuccess: 9680, volteAccessibilityAttempts: 10000, dataRetainabilityPct: 97.5, erabDropCount: 9 },
];

const columns: ColumnDef<PerformanceRow>[] = [
  {
    accessorKey: 'device',
    meta: { align: 'left' },
    header: ({ column }) => (
      <SortableHeader column={column}>Device</SortableHeader>
    ),
    cell: ({ row }) => <DeviceLink value={row.getValue('device') as string} className="text-xs" />,
  },
  {
    accessorKey: 'dataAccessibilityPct',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">Data accessibility %</SortableHeader>
    ),
    cell: ({ row }) => {
      const v = row.original.dataAccessibilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 98 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'dataAccessSuccess',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">Data access success</SortableHeader>
    ),
    cell: ({ row }) => <MetricCell value={row.original.dataAccessSuccess} format="num" />,
  },
  {
    accessorKey: 'dataAccessAttempts',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">Data access attempts</SortableHeader>
    ),
    cell: ({ row }) => <MetricCell value={row.original.dataAccessAttempts} format="num" />,
  },
  {
    accessorKey: 'volteAccessibilityPct',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">VoLTE accessibility %</SortableHeader>
    ),
    cell: ({ row }) => {
      const v = row.original.volteAccessibilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 97 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'volteAccessibilitySuccess',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">VoLTE accessibility success</SortableHeader>
    ),
    cell: ({ row }) => <MetricCell value={row.original.volteAccessibilitySuccess} format="num" />,
  },
  {
    accessorKey: 'volteAccessibilityAttempts',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">VoLTE accessibility attempts</SortableHeader>
    ),
    cell: ({ row }) => <MetricCell value={row.original.volteAccessibilityAttempts} format="num" />,
  },
  {
    accessorKey: 'dataRetainabilityPct',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">Data retainability %</SortableHeader>
    ),
    cell: ({ row }) => {
      const v = row.original.dataRetainabilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 98 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'erabDropCount',
    meta: { align: 'right' },
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">ERAB drop count</SortableHeader>
    ),
    cell: ({ row }) => {
      const v = row.original.erabDropCount;
      const severity: AlarmSeverity | undefined = v > 10 ? 'critical' : v > 5 ? 'warning' : undefined;
      return <MetricCell value={v} format="num" severity={severity} />;
    },
  },
];

export function PerformanceDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'dataAccessibilityPct', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: PERFORMANCE_DATA,
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
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden rounded-lg border bg-card text-xs">
        <Table className="w-full min-w-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 h-auto min-h-[2.25rem] whitespace-normal break-words align-bottom [&_button]:h-auto [&_button]:min-h-8 [&_button]:flex-wrap [&_button]:whitespace-normal [&_button]:!px-0 [&_button]:!-ml-0 ${(header.column.columnDef.meta as { className?: string })?.className ?? 'max-w-[6rem]'} ${((header.column.columnDef.meta as { align?: string })?.align ?? 'right') === 'left' ? 'text-left' : 'text-right'}`}
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
                      className={`px-4 py-3 whitespace-nowrap ${((cell.column.columnDef.meta as { align?: string })?.align ?? 'right') === 'left' ? 'text-left' : 'text-right'} ${(cell.column.columnDef.meta as { className?: string })?.className ?? ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-16 text-center px-4 py-3">
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

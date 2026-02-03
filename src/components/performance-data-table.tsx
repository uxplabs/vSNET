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
import { TooltipProvider } from '@/components/ui/tooltip';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

type AlarmSeverity = 'critical' | 'warning';

const CARRIERS = ['Verizon', 'AT&T', 'T-Mobile'] as const;

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
  region: string;
  carrier: string;
  dataAccessibilityPct: number;
  dataAccessSuccess: number;
  dataAccessAttempts: number;
  volteAccessibilityPct: number;
  volteAccessibilitySuccess: number;
  volteAccessibilityAttempts: number;
  dataRetainabilityPct: number;
  erabDropCount: number;
}

const PERFORMANCE_DATA: PerformanceRow[] = NORTH_AMERICAN_REGIONS.map((region, regionIdx) => {
  const carrier = CARRIERS[regionIdx % CARRIERS.length];
  const dataAccessibilityPct = 96 + (regionIdx % 4) + (regionIdx * 0.2);
  const dataAccessSuccess = Math.round(dataAccessibilityPct * 100);
  const volteAccessibilityPct = dataAccessibilityPct - 0.5 + (regionIdx * 0.05);
  const volteAccessibilitySuccess = Math.round(volteAccessibilityPct * 100);
  const dataRetainabilityPct = Math.min(99.9, dataAccessibilityPct + 0.5);
  const erabDropCount = regionIdx % 12;
  return {
    id: `${regionIdx + 1}`,
    region,
    carrier,
    dataAccessibilityPct: Math.round(dataAccessibilityPct * 10) / 10,
    dataAccessSuccess,
    dataAccessAttempts: 10000,
    volteAccessibilityPct: Math.round(volteAccessibilityPct * 10) / 10,
    volteAccessibilitySuccess,
    volteAccessibilityAttempts: 10000,
    dataRetainabilityPct: Math.round(dataRetainabilityPct * 10) / 10,
    erabDropCount,
  };
});

const columns: ColumnDef<PerformanceRow>[] = [
  {
    accessorKey: 'region',
    meta: { align: 'left' },
    header: ({ column }) => (
      <SortableHeader column={column}>Region</SortableHeader>
    ),
    cell: ({ row }) => <span className="text-xs">{row.getValue('region') as string}</span>,
  },
  {
    accessorKey: 'carrier',
    meta: { align: 'left' },
    header: ({ column }) => (
      <SortableHeader column={column}>Carrier</SortableHeader>
    ),
    cell: ({ row }) => <span className="text-xs">{row.getValue('carrier') as string}</span>,
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

export interface PerformanceTableFilters {
  search?: string;
  lteFilter?: string;
  timeFilter?: string;
  statusFilter?: 'all' | 'good' | 'bad';
}

export function getFilteredPerformanceCount(filters: PerformanceTableFilters): number {
  let result = PERFORMANCE_DATA;
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((r) => r.region.toLowerCase().includes(q) || r.carrier.toLowerCase().includes(q));
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    if (filters.statusFilter === 'good') result = result.filter((r) => r.dataAccessibilityPct >= 98);
    if (filters.statusFilter === 'bad') result = result.filter((r) => r.dataAccessibilityPct < 95);
  }
  return result.length;
}

function filterPerformanceData(data: PerformanceRow[], filters: PerformanceTableFilters): PerformanceRow[] {
  let result = data;
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((r) => r.region.toLowerCase().includes(q) || r.carrier.toLowerCase().includes(q));
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    if (filters.statusFilter === 'good') result = result.filter((r) => r.dataAccessibilityPct >= 98);
    if (filters.statusFilter === 'bad') result = result.filter((r) => r.dataAccessibilityPct < 95);
  }
  return result;
}

export interface PerformanceDataTableProps extends PerformanceTableFilters {}

export function PerformanceDataTable({ search, lteFilter, timeFilter, statusFilter }: PerformanceDataTableProps = {}) {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'dataAccessibilityPct', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const filteredData = React.useMemo(
    () => filterPerformanceData(PERFORMANCE_DATA, { search, lteFilter, timeFilter, statusFilter }),
    [search, lteFilter, timeFilter, statusFilter]
  );

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: filteredData,
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

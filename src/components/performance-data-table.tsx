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
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeviceLink } from '@/components/ui/device-link';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

type AlarmSeverity = 'critical' | 'warning';

function RightAlignedHeader({ column, children }: { column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void }; children: React.ReactNode }) {
  const isSorted = column.getIsSorted();
  const sortIcon = isSorted === 'asc' ? 'arrow_upward' : isSorted === 'desc' ? 'arrow_downward' : 'swap_vert';
  return (
    <Button
      variant="ghost"
      size="sm"
      className="group ml-auto !-mr-3 h-auto py-1 flex-col items-end gap-0.5 whitespace-normal text-right"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      <span className="leading-tight">{children}</span>
      <Icon
        name={sortIcon}
        size={14}
        className={`transition-opacity ${isSorted ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}
      />
    </Button>
  );
}

function MetricCell({ value, format, severity }: { value: number; format: 'pct' | 'num'; severity?: AlarmSeverity }) {
  const display = format === 'pct' ? `${value}%` : value.toLocaleString();
  const icon = severity === 'critical'
    ? <Icon name="error" size={14} className="text-destructive shrink-0" aria-hidden />
    : severity === 'warning'
      ? <Icon name="warning" size={14} className="text-warning shrink-0" aria-hidden />
      : null;
  return (
    <span className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
      {icon}
      <span className="tabular-nums text-muted-foreground">{display}</span>
    </span>
  );
}

export interface PerformanceRow {
  id: string;
  device: string;
  region: string;
  dataAccessibilityPct: number;
  dataAccessSuccess: number;
  dataAccessAttempts: number;
  volteAccessibilityPct: number;
  volteAccessibilitySuccess: number;
  volteAccessibilityAttempts: number;
  dataRetainabilityPct: number;
  erabDropCount: number;
}

const REGION_PREFIXES: Record<string, string[]> = {
  'Pacific Northwest': ['SEA', 'PDX', 'TAC', 'VAN', 'SPO', 'EUG'],
  'Northern California': ['SFO', 'OAK', 'SJC', 'SAC', 'FRE'],
  'Southern California': ['LAX', 'SAN', 'LGB', 'ONT', 'BUR', 'SNA', 'PSP'],
  'Desert Southwest': ['PHX', 'TUS', 'ABQ', 'LAS', 'ELP'],
  'Mountain West': ['DEN', 'SLC', 'BOI', 'COS', 'BIL'],
  'Great Plains': ['OMA', 'DSM', 'LNK', 'FSD', 'ICT'],
  'Texas': ['DAL', 'HOU', 'SAT', 'AUS', 'ELP', 'FTW'],
  'Gulf Coast': ['MSY', 'MOB', 'GPT', 'PNS', 'BTR'],
  'Southeast': ['ATL', 'CLT', 'RDU', 'BNA', 'GSP', 'CHS'],
  'Florida': ['MIA', 'TPA', 'ORL', 'JAX', 'FLL', 'RSW'],
  'Midwest': ['CHI', 'STL', 'IND', 'CMH', 'MKE', 'DTW'],
  'Great Lakes': ['CLE', 'BUF', 'GRR', 'TOL', 'ERI'],
  'Northeast': ['NYC', 'EWR', 'PHL', 'PIT', 'ALB', 'SYR', 'HPN'],
  'New England': ['BOS', 'PVD', 'BDL', 'PWM', 'MHT'],
  'Mid-Atlantic': ['DCA', 'BWI', 'IAD', 'RIC', 'NFK', 'ORF'],
  'Eastern Canada': ['YYZ', 'YUL', 'YOW', 'YHZ', 'YQB'],
};
const DEVICE_TYPES = ['SN', 'CU', 'RCP', 'SN', 'SN', 'CU', 'RCP'];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

const PERFORMANCE_DATA: PerformanceRow[] = (() => {
  const rows: PerformanceRow[] = [];
  let id = 0;
  NORTH_AMERICAN_REGIONS.forEach((region, regionIdx) => {
    const prefixes = REGION_PREFIXES[region] ?? ['UNK'];
    prefixes.forEach((prefix, deviceIdx) => {
      id++;
      const seed = regionIdx * 100 + deviceIdx;
      const type = DEVICE_TYPES[(regionIdx + deviceIdx) % DEVICE_TYPES.length];
      const nodeNum = 1000 + regionIdx * 37 + deviceIdx * 13;
      const device = `${prefix}-${type}-${nodeNum}`;

      const baseAccess = 94.5 + seededRandom(seed) * 6;
      const dataAccessibilityPct = Math.round(baseAccess * 10) / 10;
      const attempts = 8000 + Math.round(seededRandom(seed + 1) * 4000);
      const dataAccessSuccess = Math.round(dataAccessibilityPct * attempts / 100);
      const volteBase = dataAccessibilityPct - 0.3 + seededRandom(seed + 2) * 0.8;
      const volteAccessibilityPct = Math.round(volteBase * 10) / 10;
      const volteAttempts = 7000 + Math.round(seededRandom(seed + 3) * 5000);
      const volteAccessibilitySuccess = Math.round(volteAccessibilityPct * volteAttempts / 100);
      const dataRetainabilityPct = Math.round(Math.min(99.9, dataAccessibilityPct + seededRandom(seed + 4) * 1.5) * 10) / 10;
      const erabDropCount = Math.round(seededRandom(seed + 5) * 14);

      rows.push({
        id: String(id),
        device,
        region,
        dataAccessibilityPct,
        dataAccessSuccess,
        dataAccessAttempts: attempts,
        volteAccessibilityPct,
        volteAccessibilitySuccess,
        volteAccessibilityAttempts: volteAttempts,
        dataRetainabilityPct,
        erabDropCount,
      });
    });
  });
  return rows;
})();

const columns: ColumnDef<PerformanceRow>[] = [
  {
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('device') as string} maxLength={20} />,
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue('region') as string}</span>,
  },
  {
    accessorKey: 'dataAccessibilityPct',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>Data accessibility %</RightAlignedHeader>,
    cell: ({ row }) => {
      const v = row.original.dataAccessibilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 98 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'dataAccessSuccess',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>Data access success</RightAlignedHeader>,
    cell: ({ row }) => <MetricCell value={row.original.dataAccessSuccess} format="num" />,
  },
  {
    accessorKey: 'dataAccessAttempts',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>Data access attempts</RightAlignedHeader>,
    cell: ({ row }) => <MetricCell value={row.original.dataAccessAttempts} format="num" />,
  },
  {
    accessorKey: 'volteAccessibilityPct',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>VoLTE accessibility %</RightAlignedHeader>,
    cell: ({ row }) => {
      const v = row.original.volteAccessibilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 97 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'volteAccessibilitySuccess',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>VoLTE access. success</RightAlignedHeader>,
    cell: ({ row }) => <MetricCell value={row.original.volteAccessibilitySuccess} format="num" />,
  },
  {
    accessorKey: 'volteAccessibilityAttempts',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>VoLTE access. attempts</RightAlignedHeader>,
    cell: ({ row }) => <MetricCell value={row.original.volteAccessibilityAttempts} format="num" />,
  },
  {
    accessorKey: 'dataRetainabilityPct',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>Data retainability %</RightAlignedHeader>,
    cell: ({ row }) => {
      const v = row.original.dataRetainabilityPct;
      const severity: AlarmSeverity | undefined = v < 95 ? 'critical' : v < 98 ? 'warning' : undefined;
      return <MetricCell value={v} format="pct" severity={severity} />;
    },
  },
  {
    accessorKey: 'erabDropCount',
    meta: { align: 'right' },
    header: ({ column }) => <RightAlignedHeader column={column}>ERAB drop count</RightAlignedHeader>,
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
    result = result.filter((r) => r.device.toLowerCase().includes(q) || r.region.toLowerCase().includes(q));
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
    result = result.filter((r) => r.device.toLowerCase().includes(q) || r.region.toLowerCase().includes(q));
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    if (filters.statusFilter === 'good') result = result.filter((r) => r.dataAccessibilityPct >= 98);
    if (filters.statusFilter === 'bad') result = result.filter((r) => r.dataAccessibilityPct < 95);
  }
  return result;
}

export interface PerformanceDataTableProps extends PerformanceTableFilters {}

export function PerformanceDataTable({ search, lteFilter, timeFilter, statusFilter }: PerformanceDataTableProps = {}) {
  const pageSize = useResponsivePageSize(540, 41);
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
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto rounded-lg border bg-card">
        <Table className="w-full min-w-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 align-top [&_button]:h-auto [&_button]:py-1 [&_button]:whitespace-normal ${(header.column.columnDef.meta as { align?: string })?.align === 'right' ? 'text-right' : ''}`}
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
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 ${(cell.column.columnDef.meta as { align?: string })?.align === 'right' ? 'text-right' : ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-16 text-center px-4">
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

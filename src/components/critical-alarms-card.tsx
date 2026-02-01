'use client';

import * as React from 'react';
import type { ColumnDef, ColumnFiltersState, Row } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TrendBadge } from '@/components/TrendBadge';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

export interface CriticalAlarmRow {
  id: string;
  device: string;
  region: string;
  timeOccurred: string;
}

const REGIONS = ['All regions', ...NORTH_AMERICAN_REGIONS] as const;

const CRITICAL_ALARMS_DATA: CriticalAlarmRow[] = [
  { id: '1', device: 'eNB-ATL-002', region: 'Americas', timeOccurred: '2 min ago' },
  { id: '2', device: 'RN-LON-001', region: 'EMEA', timeOccurred: '4 min ago' },
  { id: '3', device: 'eNB-SIN-003', region: 'APAC', timeOccurred: '5 min ago' },
  { id: '4', device: 'eNB-NYC-001', region: 'Americas', timeOccurred: '7 min ago' },
  { id: '5', device: 'RN-FRA-003', region: 'EMEA', timeOccurred: '9 min ago' },
  { id: '6', device: 'RN-TOK-001', region: 'APAC', timeOccurred: '11 min ago' },
  { id: '7', device: 'eNB-CHI-002', region: 'Americas', timeOccurred: '14 min ago' },
  { id: '8', device: 'eNB-MUC-002', region: 'EMEA', timeOccurred: '16 min ago' },
  { id: '9', device: 'RN-HKG-002', region: 'APAC', timeOccurred: '18 min ago' },
  { id: '10', device: 'RN-ATL-005', region: 'Americas', timeOccurred: '21 min ago' },
  { id: '11', device: 'eNB-AMS-001', region: 'EMEA', timeOccurred: '23 min ago' },
  { id: '12', device: 'eNB-SYD-001', region: 'APAC', timeOccurred: '26 min ago' },
  { id: '13', device: 'eNB-SFO-003', region: 'Americas', timeOccurred: '28 min ago' },
  { id: '14', device: 'RN-MAD-001', region: 'EMEA', timeOccurred: '32 min ago' },
  { id: '15', device: 'RN-SIN-005', region: 'APAC', timeOccurred: '35 min ago' },
  { id: '16', device: 'eNB-DAL-001', region: 'Americas', timeOccurred: '42 min ago' },
  { id: '17', device: 'eNB-BER-002', region: 'EMEA', timeOccurred: '48 min ago' },
  { id: '18', device: 'RN-SEL-001', region: 'APAC', timeOccurred: '55 min ago' },
  { id: '19', device: 'RN-NYC-004', region: 'Americas', timeOccurred: '1 hour ago' },
  { id: '20', device: 'eNB-PAR-002', region: 'EMEA', timeOccurred: '1 hour ago' },
  { id: '21', device: 'eNB-MEL-001', region: 'APAC', timeOccurred: '1 hour ago' },
  { id: '22', device: 'eNB-HOU-002', region: 'Americas', timeOccurred: '1 hour ago' },
  { id: '23', device: 'RN-LON-004', region: 'EMEA', timeOccurred: '2 hours ago' },
  { id: '24', device: 'RN-TOK-003', region: 'APAC', timeOccurred: '2 hours ago' },
];

const columns: ColumnDef<CriticalAlarmRow>[] = [
  {
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('device') as string} />,
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'timeOccurred',
    header: ({ column }) => <SortableHeader column={column}>Time occurred</SortableHeader>,
    cell: ({ row }) => row.getValue('timeOccurred') as string,
  },
];

function filterBySearch(row: Row<CriticalAlarmRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.device.toLowerCase().includes(search) ||
    data.region.toLowerCase().includes(search) ||
    data.timeOccurred.toLowerCase().includes(search)
  );
}

export function CriticalAlarmsCard() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<string>('All regions');
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    if (regionFilter === 'All regions') return [];
    return [{ id: 'region', value: regionFilter }];
  }, [regionFilter]);

  const table = useReactTable({
    data: CRITICAL_ALARMS_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: () => {},
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: filterBySearch,
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, globalFilter, columnFilters, pagination },
  });

  return (
    <TooltipProvider delayDuration={300}>
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Critical alarms</CardTitle>
          <TrendBadge direction="up">↑ 1</TrendBadge>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {table.getFilteredRowModel().rows.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search critical alarms..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 ml-auto" aria-label="Download">
            <Icon name="download" size={18} />
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3 h-12">
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
                      <TableCell key={cell.id} className="px-4 py-3">
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
        <TablePagination table={table} className="justify-end" />
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

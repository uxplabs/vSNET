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

export interface DisconnectedDeviceRow {
  id: string;
  device: string;
  region: string;
  timeOccurred: string;
}

const REGIONS = ['All regions', ...NORTH_AMERICAN_REGIONS] as const;

const DISCONNECTED_DEVICES_DATA: DisconnectedDeviceRow[] = [
  { id: '1', device: 'eNB-SEA-001', region: 'Pacific Northwest', timeOccurred: '2 min ago' },
  { id: '2', device: 'eNB-PDX-002', region: 'Pacific Northwest', timeOccurred: '15 min ago' },
  { id: '3', device: 'eNB-PHX-001', region: 'Desert Southwest', timeOccurred: '1 hour ago' },
  { id: '4', device: 'eNB-LAS-003', region: 'Desert Southwest', timeOccurred: '2 hours ago' },
  { id: '5', device: 'eNB-BOS-001', region: 'New England', timeOccurred: '30 min ago' },
  { id: '6', device: 'eNB-NYC-001', region: 'Northeast', timeOccurred: '5 min ago' },
  { id: '7', device: 'eNB-MIA-002', region: 'Florida', timeOccurred: '45 min ago' },
  { id: '8', device: 'eNB-ATL-001', region: 'Southeast', timeOccurred: '3 hours ago' },
];

const columns: ColumnDef<DisconnectedDeviceRow>[] = [
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

function filterBySearch(row: Row<DisconnectedDeviceRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.device.toLowerCase().includes(search) ||
    data.region.toLowerCase().includes(search) ||
    data.timeOccurred.toLowerCase().includes(search)
  );
}

export function DisconnectedDevicesCard() {
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
    data: DISCONNECTED_DEVICES_DATA,
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
          <CardTitle>Disconnected devices</CardTitle>
          <TrendBadge direction="up">↑ 2</TrendBadge>
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
              placeholder="Search devices..."
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

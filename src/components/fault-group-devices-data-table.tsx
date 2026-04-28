'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { FilterSelect } from '@/components/ui/filter-select';
import { Icon } from '@/components/Icon';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import {
  type FaultGroupDeviceRow,
  FAULT_GROUP_DEVICE_DATA,
  FAULT_DEVICE_GROUP_OPTIONS,
} from '@/components/fault-management-model';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

const REGION_OPTIONS = ['All', ...NORTH_AMERICAN_REGIONS] as const;
const DEVICE_GROUP_FILTER_OPTIONS = ['All', ...FAULT_DEVICE_GROUP_OPTIONS] as const;

export interface FaultGroupDevicesDataTableProps {
  notificationGroup: string;
}

export function FaultGroupDevicesDataTable({ notificationGroup }: FaultGroupDevicesDataTableProps) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [deviceGroupFilter, setDeviceGroupFilter] = useState<string>('All');

  useEffect(() => {
    setSearch('');
    setRegionFilter('All');
    setDeviceGroupFilter('All');
  }, [notificationGroup]);

  const filteredData = useMemo(() => {
    let data = FAULT_GROUP_DEVICE_DATA.filter((d) => d.notificationGroup === notificationGroup);
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (d) =>
          d.device.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.deviceGroup.toLowerCase().includes(q),
      );
    }
    if (regionFilter !== 'All') data = data.filter((d) => d.region === regionFilter);
    if (deviceGroupFilter !== 'All') data = data.filter((d) => d.deviceGroup === deviceGroupFilter);
    return data;
  }, [notificationGroup, search, regionFilter, deviceGroupFilter]);

  const columns = useMemo<ColumnDef<FaultGroupDeviceRow>[]>(
    () => [
      {
        accessorKey: 'device',
        header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.getValue('device') as string}</span>
        ),
      },
      {
        accessorKey: 'region',
        header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.region}</span>,
      },
      {
        accessorKey: 'deviceGroup',
        header: ({ column }) => <SortableHeader column={column}>Group</SortableHeader>,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.deviceGroup}</span>
        ),
      },
    ],
    [],
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = useResponsivePageSize();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [notificationGroup, search, regionFilter, deviceGroupFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  });

  const onAddDevice = useCallback(() => {
    toast.message('Device association is not available in this preview.');
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setRegionFilter('All');
    setDeviceGroupFilter('All');
  }, []);

  const total = filteredData.length;

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onClear: () => void }[] = [];
    if (regionFilter !== 'All') {
      list.push({
        key: 'region',
        label: `Region: ${regionFilter}`,
        onClear: () => setRegionFilter('All'),
      });
    }
    if (deviceGroupFilter !== 'All') {
      list.push({
        key: 'group',
        label: `Group: ${deviceGroupFilter}`,
        onClear: () => setDeviceGroupFilter('All'),
      });
    }
    if (search.trim()) {
      list.push({
        key: 'search',
        label: `Search: "${search.trim()}"`,
        onClear: () => setSearch(''),
      });
    }
    return list;
  }, [regionFilter, deviceGroupFilter, search]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
        <SearchInput
          size="md"
          wrapperClassName="w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <FilterSelect
            value={regionFilter}
            onValueChange={setRegionFilter}
            label="All regions"
            options={[...REGION_OPTIONS]}
            className="w-[160px]"
          />
          <FilterSelect
            value={deviceGroupFilter}
            onValueChange={setDeviceGroupFilter}
            label="All groups"
            options={[...DEVICE_GROUP_FILTER_OPTIONS]}
            className="w-[160px]"
          />
        </div>
        <Button type="button" className="ml-auto shrink-0" aria-label="Add device" onClick={onAddDevice}>
          <Icon name="add" size={16} className="mr-1.5" />
          Add device
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'result' : 'results'}
        </span>
        {activeFilters.map((f) => (
          <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
            {f.label}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
              onClick={f.onClear}
              aria-label={`Clear ${f.label}`}
            >
              <Icon name="close" size={12} aria-hidden />
            </Button>
          </Badge>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        )}
      </div>
      <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { headerClassName?: string; className?: string }
                    | undefined;
                  const headerClass = meta?.headerClassName ?? meta?.className;
                  return (
                    <TableHead key={header.id} className={`px-4 py-3 h-12 whitespace-nowrap ${headerClass ?? ''}`}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { cellClassName?: string; className?: string }
                      | undefined;
                    const cellClass = meta?.cellClassName ?? meta?.className;
                    return (
                      <TableCell key={cell.id} className={`px-4 py-3 overflow-hidden ${cellClass ?? ''}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
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
      </div>
    </div>
  );
}

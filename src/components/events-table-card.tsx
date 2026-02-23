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
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { Button } from '@/components/ui/button';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EVENTS_DATA, type EventRow, type EventSeverity } from '@/components/events-data-table';

const TYPE_OPTIONS = ['All', 'Configuration change', 'Connection', 'Performance', 'Security', 'System'] as const;
const SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'Info'] as const;
const SOURCE_OPTIONS = ['All', 'eNB', 'RN'] as const;

const SEVERITY_ICON: Record<EventSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-yellow-500' },
  Info: { name: 'info', className: 'text-muted-foreground' },
};

const columns: ColumnDef<EventRow>[] = [
  {
    accessorKey: 'severity',
    header: ({ column }) => <SortableHeader column={column}>Severity</SortableHeader>,
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
          <Icon name={iconName} size={16} className={`shrink-0 ${iconClass}`} aria-hidden />
          {severity}
        </span>
      );
    },
  },
  {
    accessorKey: 'id',
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => row.getValue('type') as string,
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => <SortableHeader column={column}>Timestamp</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('timestamp')}</span>,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => <SortableHeader column={column}>Updated</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('updated')}</span>,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => <SortableHeader column={column}>Source</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} />,
    filterFn: (row, columnId, filterValue: string) => {
      const source = row.getValue(columnId) as string;
      return source.startsWith(filterValue);
    },
  },
  {
    accessorKey: 'managedObject',
    header: ({ column }) => <SortableHeader column={column}>Managed object</SortableHeader>,
    cell: ({ row }) => row.getValue('managedObject') as string,
  },
];

function filterBySearch(row: Row<EventRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.id.toLowerCase().includes(search) ||
    data.type.toLowerCase().includes(search) ||
    data.source.toLowerCase().includes(search) ||
    data.managedObject.toLowerCase().includes(search) ||
    data.severity.toLowerCase().includes(search) ||
    data.timestamp.toLowerCase().includes(search) ||
    data.updated.toLowerCase().includes(search)
  );
}

export interface EventsTableCardProps {
  regionFilter?: string;
}

export function EventsTableCard({ regionFilter: _regionFilter }: EventsTableCardProps = {}) {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'severity', desc: false }]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('All');
  const [severityFilter, setSeverityFilter] = React.useState<string>('All');
  const [sourceFilter, setSourceFilter] = React.useState<string>('All');
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const filteredData = EVENTS_DATA;

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (typeFilter !== 'All') filters.push({ id: 'type', value: typeFilter });
    if (severityFilter !== 'All') filters.push({ id: 'severity', value: severityFilter });
    if (sourceFilter !== 'All') filters.push({ id: 'source', value: sourceFilter });
    return filters;
  }, [typeFilter, severityFilter, sourceFilter]);

  const filtersActive = globalFilter !== '' || typeFilter !== 'All' || severityFilter !== 'All' || sourceFilter !== 'All';
  const clearFilters = () => {
    setGlobalFilter('');
    setTypeFilter('All');
    setSeverityFilter('All');
    setSourceFilter('All');
  };

  const table = useReactTable({
    data: filteredData,
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
        <CardHeader>
          <CardTitle>Events</CardTitle>
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
                placeholder="Search events..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Type</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1100]">
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Severity</span>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1100]">
                  {SEVERITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Source</span>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1100]">
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filtersActive && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground h-9"
                onClick={clearFilters}
              >
                <Icon name="close" size={16} />
                Clear
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 ml-auto" aria-label="Download">
              <Icon name="download" size={18} />
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-4 py-3 h-12 whitespace-nowrap">
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
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-muted/50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3 whitespace-nowrap">
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

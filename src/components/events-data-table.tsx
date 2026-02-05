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
  region: string;
  managedObject: string;
}

const SEVERITY_ICON: Record<EventSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-warning' },
  Info: { name: 'info', className: 'text-muted-foreground' },
};

// Map city codes to regions
const CITY_TO_REGION: Record<string, string> = {
  SEA: 'Pacific Northwest',
  PDX: 'Pacific Northwest',
  SFO: 'Northern California',
  PHX: 'Desert Southwest',
  LAS: 'Desert Southwest',
  DEN: 'Mountain West',
  CHI: 'Great Lakes',
  NYC: 'Northeast',
  ATL: 'Southeast',
  MIA: 'Florida',
  BOS: 'New England',
  AUS: 'Texas',
};

function getRegionFromSource(source: string): string {
  const parts = source.split('-');
  if (parts.length >= 2) {
    const cityCode = parts[1];
    return CITY_TO_REGION[cityCode] || 'Pacific Northwest';
  }
  return 'Pacific Northwest';
}

export const EVENTS_DATA: EventRow[] = [
  { id: 'EVT-1001', timestamp: '2025-01-27 09:12', updated: '2025-01-27 09:15', type: 'Configuration change', severity: 'Info', source: 'eNB-SEA-001', region: 'Pacific Northwest', managedObject: 'Cell-1' },
  { id: 'EVT-1002', timestamp: '2025-01-27 08:45', updated: '2025-01-27 09:00', type: 'Connection', severity: 'Major', source: 'RN-PDX-002', region: 'Pacific Northwest', managedObject: 'Radio-2' },
  { id: 'EVT-1003', timestamp: '2025-01-27 08:30', updated: '2025-01-27 08:35', type: 'Performance', severity: 'Minor', source: 'eNB-PHX-001', region: 'Desert Southwest', managedObject: 'Cell-3' },
  { id: 'EVT-1004', timestamp: '2025-01-27 08:15', updated: '2025-01-27 08:20', type: 'Configuration change', severity: 'Critical', source: 'eNB-NYC-001', region: 'Northeast', managedObject: 'Cell-4' },
  { id: 'EVT-1005', timestamp: '2025-01-27 07:58', updated: '2025-01-27 08:10', type: 'Connection', severity: 'Info', source: 'RN-SFO-003', region: 'Northern California', managedObject: 'Radio-5' },
  { id: 'EVT-1006', timestamp: '2025-01-27 07:42', updated: '2025-01-27 07:45', type: 'Security', severity: 'Minor', source: 'RN-LAS-001', region: 'Desert Southwest', managedObject: 'Radio-6' },
  { id: 'EVT-1007', timestamp: '2025-01-27 07:20', updated: '2025-01-27 07:30', type: 'System', severity: 'Info', source: 'eNB-CHI-002', region: 'Great Lakes', managedObject: 'Cell-7' },
  { id: 'EVT-1008', timestamp: '2025-01-27 06:55', updated: '2025-01-27 07:05', type: 'Connection', severity: 'Critical', source: 'eNB-MIA-002', region: 'Florida', managedObject: 'Cell-8' },
  { id: 'EVT-1009', timestamp: '2025-01-27 06:30', updated: '2025-01-27 06:32', type: 'Performance', severity: 'Major', source: 'RN-DEN-002', region: 'Mountain West', managedObject: 'Radio-9' },
  { id: 'EVT-1010', timestamp: '2025-01-27 06:10', updated: '2025-01-27 06:25', type: 'Configuration change', severity: 'Info', source: 'RN-ATL-005', region: 'Southeast', managedObject: 'Radio-10' },
  { id: 'EVT-1011', timestamp: '2025-01-27 05:45', updated: '2025-01-27 05:50', type: 'System', severity: 'Minor', source: 'eNB-BOS-001', region: 'New England', managedObject: 'Cell-11' },
  { id: 'EVT-1012', timestamp: '2025-01-27 05:20', updated: '2025-01-27 05:25', type: 'Security', severity: 'Info', source: 'RN-NYC-003', region: 'Northeast', managedObject: 'Radio-12' },
];

function getColumns(showRegionColumn: boolean): ColumnDef<EventRow>[] {
  return [
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
      meta: { className: 'w-10' },
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
    ...(showRegionColumn ? [{
      accessorKey: 'region',
      header: ({ column }: { column: any }) => (
        <SortableHeader column={column}>Region</SortableHeader>
      ),
      cell: ({ row }: { row: any }) => (
        <span className="text-muted-foreground">{row.getValue('region') as string}</span>
      ),
    } as ColumnDef<EventRow>] : []),
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
        className: 'sticky right-0 w-14 text-right pr-4 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      },
    },
  ];
}

export interface EventTableFilters {
  search?: string;
  typeFilter?: string;
  severityFilter?: string;
  sourceFilter?: string;
  regionFilter?: string;
}

export function getFilteredEventCount(filters: EventTableFilters): number {
  return filterEvents(EVENTS_DATA, filters).length;
}

function filterEvents(events: EventRow[], filters: EventTableFilters): EventRow[] {
  let result = events;
  if (filters.regionFilter && filters.regionFilter !== 'Region') {
    result = result.filter((e) => e.region === filters.regionFilter);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.managedObject.toLowerCase().includes(q)
    );
  }
  if (filters.typeFilter && filters.typeFilter !== 'Type') {
    result = result.filter((e) => e.type === filters.typeFilter);
  }
  if (filters.severityFilter && filters.severityFilter !== 'Severity') {
    result = result.filter((e) => e.severity === filters.severityFilter);
  }
  if (filters.sourceFilter && filters.sourceFilter !== 'Source') {
    const want = filters.sourceFilter === 'All sources' ? '' : filters.sourceFilter;
    if (want) result = result.filter((e) => e.source.startsWith(want) || e.source.includes(want));
  }
  return result;
}

export interface EventsDataTableProps {
  pageSize?: number;
  search?: string;
  typeFilter?: string;
  severityFilter?: string;
  sourceFilter?: string;
  /** Selected regions from global nav - if multiple, show Region column */
  selectedRegions?: string[];
  /** Filter by specific region from table filter dropdown */
  regionFilter?: string;
}

export function EventsDataTable({
  pageSize: pageSizeProp,
  search = '',
  typeFilter = 'Type',
  severityFilter = 'Severity',
  sourceFilter = 'Source',
  selectedRegions = [],
  regionFilter = 'Region',
}: EventsDataTableProps = {}) {
  const showRegionColumn = selectedRegions.length > 1;
  const columns = React.useMemo(() => getColumns(showRegionColumn), [showRegionColumn]);
  const responsivePageSize = useResponsivePageSize();
  const pageSize = pageSizeProp ?? responsivePageSize;
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const data = React.useMemo(
    () => filterEvents(EVENTS_DATA, { search, typeFilter, severityFilter, sourceFilter, regionFilter }),
    [search, typeFilter, severityFilter, sourceFilter, regionFilter]
  );

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (originalRow) => originalRow.id,
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
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border bg-card">
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

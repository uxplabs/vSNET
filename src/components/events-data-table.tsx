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
import { AlarmDrawer, type AlarmDrawerAlarm } from '@/components/alarm-drawer';

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
  ticketId: string;
  owner: string;
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
  LAX: 'Southern California',
  PHX: 'Desert Southwest',
  LAS: 'Desert Southwest',
  DEN: 'Mountain West',
  SLC: 'Mountain West',
  CHI: 'Great Lakes',
  DET: 'Great Lakes',
  NYC: 'Northeast',
  PHL: 'Mid-Atlantic',
  ATL: 'Southeast',
  MIA: 'Florida',
  BOS: 'New England',
  AUS: 'Texas',
  DAL: 'Texas',
  HOU: 'Gulf Coast',
};

function getRegionFromSource(source: string): string {
  const parts = source.split('-');
  if (parts.length >= 2) {
    const cityCode = parts[1];
    return CITY_TO_REGION[cityCode] || 'Pacific Northwest';
  }
  return 'Pacific Northwest';
}

const EVENT_TYPES = ['Configuration change', 'Connection', 'Performance', 'Security', 'System'];
const EVENT_SEVERITIES: EventSeverity[] = ['Critical', 'Major', 'Minor', 'Info'];
const EVENT_OWNERS = ['J. Smith', 'A. Jones', 'M. Lee', 'K. Brown', 'R. Davis', 'P. Wilson'];
const EVENT_SOURCES: { source: string; region: string }[] = [
  // Pacific Northwest
  { source: 'eNB-SEA-001', region: 'Pacific Northwest' },
  { source: 'eNB-PDX-002', region: 'Pacific Northwest' },
  { source: 'RN-SEA-003', region: 'Pacific Northwest' },
  // Northern California / Southern California
  { source: 'eNB-SFO-004', region: 'Northern California' },
  { source: 'RN-SFO-005', region: 'Northern California' },
  { source: 'eNB-LAX-006', region: 'Southern California' },
  // Desert Southwest
  { source: 'RN-PHX-007', region: 'Desert Southwest' },
  { source: 'eNB-PHX-008', region: 'Desert Southwest' },
  { source: 'RN-LAS-009', region: 'Desert Southwest' },
  { source: 'eNB-LAS-010', region: 'Desert Southwest' },
  // Mountain West
  { source: 'RN-DEN-011', region: 'Mountain West' },
  { source: 'eNB-DEN-012', region: 'Mountain West' },
  { source: 'eNB-SLC-013', region: 'Mountain West' },
  // Texas / Gulf Coast
  { source: 'eNB-AUS-014', region: 'Texas' },
  { source: 'eNB-DAL-015', region: 'Texas' },
  { source: 'RN-HOU-016', region: 'Gulf Coast' },
  // Great Lakes / Midwest
  { source: 'eNB-CHI-017', region: 'Great Lakes' },
  { source: 'RN-CHI-018', region: 'Great Lakes' },
  { source: 'eNB-DET-019', region: 'Great Lakes' },
  // Northeast / Mid-Atlantic
  { source: 'eNB-NYC-020', region: 'Northeast' },
  { source: 'RN-NYC-021', region: 'Northeast' },
  { source: 'eNB-PHL-022', region: 'Mid-Atlantic' },
  // New England / Eastern Canada
  { source: 'eNB-BOS-023', region: 'New England' },
  { source: 'RN-BOS-024', region: 'New England' },
  // Southeast / Florida
  { source: 'RN-ATL-025', region: 'Southeast' },
  { source: 'eNB-ATL-026', region: 'Southeast' },
  { source: 'eNB-MIA-027', region: 'Florida' },
  { source: 'RN-MIA-028', region: 'Florida' },
];

function generateEvents(count: number): EventRow[] {
  const events: EventRow[] = [];
  for (let i = 1; i <= count; i++) {
    const si = (i - 1) % EVENT_SOURCES.length;
    const { source, region } = EVENT_SOURCES[si];
    const severity = EVENT_SEVERITIES[i % EVENT_SEVERITIES.length];
    const type = EVENT_TYPES[i % EVENT_TYPES.length];
    const h = 6 + Math.floor(((i * 17) % 960) / 60);
    const m = ((i * 17) % 960) % 60;
    const ts = `2025-01-27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const up = `2025-01-27 ${String(h).padStart(2, '0')}:${String(Math.min(59, m + 2 + (i % 5))).padStart(2, '0')}`;
    const hasTicket = severity !== 'Info' && i % 3 !== 0;
    events.push({
      id: `EVT-${1000 + i}`,
      timestamp: ts,
      updated: up,
      type,
      severity,
      source,
      region,
      managedObject: (i % 2 === 0 ? 'Cell-' : 'Radio-') + ((i % 12) + 1),
      ticketId: hasTicket ? `TKT-${2000 + i}` : '—',
      owner: hasTicket ? EVENT_OWNERS[i % EVENT_OWNERS.length] : '—',
    });
  }
  return events;
}

export const EVENTS_DATA: EventRow[] = generateEvents(72);

function getColumns(showRegionColumn: boolean, onSeverityClick?: (event: EventRow) => void): ColumnDef<EventRow>[] {
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
      meta: {
        headerClassName: 'sticky left-0 z-10 w-10 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
        cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      },
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
        const isClickable = severity !== 'Info' && onSeverityClick;
        if (isClickable) {
          return (
            <button
              type="button"
              className="group/alarm inline-flex items-center gap-2 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                onSeverityClick(row.original);
              }}
            >
              <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} />
              <span className="group-hover/alarm:underline">{severity}</span>
              <Icon
                name="open_in_new"
                size={16}
                className="shrink-0 opacity-0 group-hover/alarm:opacity-70 transition-opacity text-muted-foreground"
                aria-hidden
              />
            </button>
          );
        }
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
      accessorKey: 'ticketId',
      header: ({ column }) => (
        <SortableHeader column={column}>Ticket ID</SortableHeader>
      ),
      cell: ({ row }) => row.getValue('ticketId') as string,
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => (
        <SortableHeader column={column}>Owner</SortableHeader>
      ),
      cell: ({ row }) => row.getValue('owner') as string,
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
        headerClassName: 'sticky right-0 w-14 text-right pr-4 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
        cellClassName: 'sticky right-0 w-14 text-right pr-4 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
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
  const [alarmDrawerOpen, setAlarmDrawerOpen] = React.useState(false);
  const [selectedAlarm, setSelectedAlarm] = React.useState<AlarmDrawerAlarm | null>(null);

  const handleSeverityClick = React.useCallback((event: EventRow) => {
    const alarm: AlarmDrawerAlarm = {
      id: event.id,
      severity: event.severity as 'Critical' | 'Major' | 'Minor',
      timestamp: event.timestamp,
      updated: event.updated,
      source: event.source,
      region: event.region,
      managedObject: event.managedObject,
      type: event.type,
      ticketId: event.ticketId,
      owner: event.owner,
    };
    setSelectedAlarm(alarm);
    setAlarmDrawerOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(showRegionColumn, handleSeverityClick), [showRegionColumn, handleSeverityClick]);
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
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 h-12 ${((header.column.columnDef.meta as { headerClassName?: string; className?: string })?.headerClassName ?? (header.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3 ${((cell.column.columnDef.meta as { cellClassName?: string; className?: string })?.cellClassName ?? (cell.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
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
    <AlarmDrawer
      alarm={selectedAlarm}
      open={alarmDrawerOpen}
      onOpenChange={setAlarmDrawerOpen}
    />
    </TooltipProvider>
  );
}

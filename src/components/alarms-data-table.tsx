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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DeviceLink } from '@/components/ui/device-link';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { AlarmDrawer } from '@/components/alarm-drawer';
import { DeviceDrawer } from '@/components/device-drawer';
import type { DeviceRow } from '@/components/devices-data-table';

export type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

export interface AlarmRow {
  id: string;
  severity: AlarmSeverity;
  timestamp: string;
  updated: string;
  source: string;
  region: string;
  managedObject: string;
  type: string;
  ticketId: string;
  owner: string;
}

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-warning' },
};

const SOURCE_PREFIXES = [
  'eNB-SEA', 'eNB-PDX', 'RN-SEA',
  'eNB-SFO', 'RN-SFO', 'eNB-LAX',
  'RN-PHX', 'eNB-PHX', 'RN-LAS', 'eNB-LAS',
  'RN-DEN', 'eNB-DEN', 'eNB-SLC',
  'eNB-AUS', 'eNB-DAL', 'RN-HOU',
  'eNB-CHI', 'RN-CHI', 'eNB-DET',
  'eNB-NYC', 'RN-NYC', 'eNB-PHL',
  'eNB-BOS', 'RN-BOS',
  'RN-ATL', 'eNB-ATL', 'eNB-MIA', 'RN-MIA',
];
const TYPES = ['Device disconnected', 'Link down', 'Radio link failure', 'Config mismatch'];
const OWNERS = ['J. Smith', 'A. Jones', 'M. Lee', 'K. Brown', 'R. Davis', 'P. Wilson', '—'];

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
  // Extract city code from source like "eNB-SEA-001" or "RN-PHX-003"
  const parts = source.split('-');
  if (parts.length >= 2) {
    const cityCode = parts[1];
    return CITY_TO_REGION[cityCode] || 'Pacific Northwest';
  }
  return 'Pacific Northwest';
}

function generateAlarms(count: number): AlarmRow[] {
  const severities: AlarmSeverity[] = ['Critical', 'Major', 'Minor'];
  const alarms: AlarmRow[] = [];
  for (let i = 1; i <= count; i++) {
    const si = (i - 1) % 3;
    const severity = severities[si];
    const offset = (i * 13) % 240;
    const h = 6 + Math.floor(offset / 60);
    const m = offset % 60;
    const ts = `2025-01-27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const up = `2025-01-27 ${String(h).padStart(2, '0')}:${String(Math.min(59, m + 2 + (i % 3))).padStart(2, '0')}`;
    const prefix = SOURCE_PREFIXES[(i - 1) % SOURCE_PREFIXES.length];
    const num = String(((i - 1) % 20) + 1).padStart(3, '0');
    const source = `${prefix}-${num}`;
    const hasTicket = i % 4 !== 0;
    alarms.push({
      id: String(i),
      severity,
      timestamp: ts,
      updated: up,
      source,
      region: getRegionFromSource(source),
      managedObject: (i % 2 === 0 ? 'Cell-' : 'Radio-') + ((i % 12) + 1),
      type: TYPES[i % TYPES.length],
      ticketId: hasTicket ? `TKT-${1000 + i}` : '—',
      owner: hasTicket ? OWNERS[i % (OWNERS.length - 1)] : '—',
    });
  }
  return alarms;
}

export const ALARMS_DATA: AlarmRow[] = generateAlarms(124);

export interface AlarmTableFilters {
  search?: string;
  severityFilter?: string;
  regionFilter?: string;
}

function filterAlarms(alarms: AlarmRow[], filters: AlarmTableFilters): AlarmRow[] {
  let result = alarms;
  if (filters.regionFilter && filters.regionFilter !== 'Region') {
    result = result.filter((a) => a.region === filters.regionFilter);
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.source.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.managedObject.toLowerCase().includes(q)
    );
  }
  if (filters.severityFilter && filters.severityFilter !== 'Alarms') {
    result = result.filter((a) => a.severity === filters.severityFilter);
  }
  return result;
}

export function getFilteredAlarmsCount(filters: AlarmTableFilters): number {
  return filterAlarms(ALARMS_DATA, filters).length;
}

function alarmSourceToDeviceRow(source: string): DeviceRow {
  return {
    id: source,
    device: source,
    type: 'SN-LTE',
    notes: '',
    status: 'Unknown',
    alarms: 0,
    alarmType: 'None',
    configStatus: '—',
    ipAddress: '—',
    version: '—',
    deviceGroup: 'Radio access',
    region: 'Pacific Northwest',
    labels: [],
  };
}

export function getAlarmCounts(alarms: AlarmRow[]) {
  return {
    total: alarms.length,
    critical: alarms.filter((a) => a.severity === 'Critical').length,
    major: alarms.filter((a) => a.severity === 'Major').length,
    minor: alarms.filter((a) => a.severity === 'Minor').length,
  };
}

function getColumns(showRegionColumn: boolean, onAlarmClick?: (alarm: AlarmRow) => void): ColumnDef<AlarmRow>[] {
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
        cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      },
    },
    {
      accessorKey: 'severity',
      header: ({ column }) => (
        <SortableHeader column={column}>Alarms</SortableHeader>
      ),
      sortingFn: (rowA, rowB) => {
        const order: Record<AlarmSeverity, number> = { Critical: 0, Major: 1, Minor: 2 };
        const a = order[rowA.original.severity] ?? 3;
        const b = order[rowB.original.severity] ?? 3;
        return a - b;
      },
      cell: ({ row }) => {
        const severity = row.getValue('severity') as AlarmSeverity;
        const { name: iconName, className: iconClass } = SEVERITY_ICON[severity];
        return (
          <button
            type="button"
            className="group/alarm inline-flex items-center gap-2 cursor-pointer text-left"
            onClick={(e) => {
              e.stopPropagation();
              onAlarmClick?.(row.original);
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
      },
    },
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <SortableHeader column={column}>Time occurred</SortableHeader>
      ),
      cell: ({ row }) => {
        const value = row.getValue('timestamp') as string;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate max-w-[10ch] tabular-nums text-sm">
                {value}
              </span>
            </TooltipTrigger>
            <TooltipContent>{value}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'updated',
      header: ({ column }) => (
        <SortableHeader column={column}>Time updated</SortableHeader>
      ),
      cell: ({ row }) => {
        const value = row.getValue('updated') as string;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate max-w-[10ch] tabular-nums text-sm">
                {value}
              </span>
            </TooltipTrigger>
            <TooltipContent>{value}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <SortableHeader column={column}>Source</SortableHeader>
      ),
      cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} maxLength={16} />,
    },
    ...(showRegionColumn ? [{
      accessorKey: 'region',
      header: ({ column }: { column: any }) => (
        <SortableHeader column={column}>Region</SortableHeader>
      ),
      cell: ({ row }: { row: any }) => (
        <span className="text-muted-foreground">{row.getValue('region') as string}</span>
      ),
    } as ColumnDef<AlarmRow>] : []),
    {
      accessorKey: 'managedObject',
      header: ({ column }) => (
        <SortableHeader column={column}>Managed object</SortableHeader>
      ),
      cell: ({ row }) => row.getValue('managedObject') as string,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <SortableHeader column={column}>Alarm type</SortableHeader>
      ),
      cell: ({ row }) => row.getValue('type') as string,
      meta: { className: 'min-w-[21ch]' },
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
            <DropdownMenuItem>Assign ticket</DropdownMenuItem>
            <DropdownMenuItem>Acknowledge</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Clear alarm</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'sticky right-0 w-14 text-right pr-4 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
        cellClassName: 'sticky right-0 w-14 text-right pr-4 bg-card group-hover:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      },
    },
  ];
}

export interface AlarmsDataTableProps {
  search?: string;
  severityFilter?: string;
  /** Selected regions from global nav - if multiple, show Region column */
  selectedRegions?: string[];
  /** Filter by specific region from table filter dropdown */
  regionFilter?: string;
}

export function AlarmsDataTable({ 
  search = '', 
  severityFilter = 'Alarms',
  selectedRegions = [],
  regionFilter = 'Region',
}: AlarmsDataTableProps = {}) {
  const showRegionColumn = selectedRegions.length > 1;
  const pageSize = useResponsivePageSize();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedAlarm, setSelectedAlarm] = React.useState<AlarmRow | null>(null);
  const [deviceDrawerOpen, setDeviceDrawerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<DeviceRow | null>(null);

  const handleNavigateToDevice = React.useCallback((source: string) => {
    const device = alarmSourceToDeviceRow(source);
    setSelectedDevice(device);
    setDeviceDrawerOpen(true);
  }, []);

  const openAlarmDrawer = React.useCallback((alarm: AlarmRow) => {
    setSelectedAlarm(alarm);
    setDrawerOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(showRegionColumn, openAlarmDrawer), [showRegionColumn, openAlarmDrawer]);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const data = React.useMemo(
    () => filterAlarms(ALARMS_DATA, { search, severityFilter, regionFilter }),
    [search, severityFilter, regionFilter]
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3 ${((cell.column.columnDef.meta as { cellClassName?: string; className?: string })?.cellClassName ?? (cell.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
                      onClick={cell.column.id === 'select' || cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
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
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      allAlarms={ALARMS_DATA}
      tableAlarms={table.getPrePaginationRowModel().rows.map((r) => r.original)}
      onSelectAlarm={(alarm) => setSelectedAlarm(alarm as AlarmRow)}
      onNavigateToDevice={handleNavigateToDevice}
    />
    <DeviceDrawer
      device={selectedDevice}
      open={deviceDrawerOpen}
      onOpenChange={setDeviceDrawerOpen}
    />
    </TooltipProvider>
  );
}

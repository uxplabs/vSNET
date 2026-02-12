'use client';

import * as React from 'react';
import type { ColumnDef, ColumnFiltersState, Row } from '@tanstack/react-table';
import { AlarmDrawer } from '@/components/alarm-drawer';
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
import { DeviceDrawer } from '@/components/device-drawer';
import type { DeviceRow } from '@/components/devices-data-table';

export type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

export interface AlarmTableRow {
  id: string;
  severity: AlarmSeverity;
  region: string;
  timestamp: string;
  updated: string;
  source: string;
  managedObject: string;
  type: string;
  ticket: string;
  owner: string;
}

const SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor'] as const;
const TIMESTAMP_OPTIONS = ['All', 'Last 24h', 'Last 7 days', 'Last 30 days'] as const;

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-yellow-500' },
};

export const ALARMS_TABLE_DATA: AlarmTableRow[] = [
  { id: '1', severity: 'Critical', region: 'Southeast', timestamp: '2025-01-27 09:12', updated: '2025-01-27 09:15', source: 'eNB-ATL-002', managedObject: 'Cell-1', type: 'Device disconnected', ticket: 'TKT-1001', owner: 'J. Smith' },
  { id: '2', severity: 'Major', region: 'Northeast', timestamp: '2025-01-27 08:45', updated: '2025-01-27 09:00', source: 'RN-NYC-001', managedObject: 'Radio-2', type: 'Link down', ticket: 'TKT-1002', owner: 'A. Jones' },
  { id: '3', severity: 'Minor', region: 'Pacific Northwest', timestamp: '2025-01-27 08:30', updated: '2025-01-27 08:35', source: 'eNB-SEA-001', managedObject: 'Cell-3', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '4', severity: 'Critical', region: 'Northeast', timestamp: '2025-01-27 08:15', updated: '2025-01-27 08:20', source: 'eNB-NYC-001', managedObject: 'Cell-4', type: 'Radio link failure', ticket: 'TKT-1003', owner: 'M. Lee' },
  { id: '5', severity: 'Major', region: 'Desert Southwest', timestamp: '2025-01-27 07:58', updated: '2025-01-27 08:10', source: 'RN-PHX-001', managedObject: 'Radio-5', type: 'Device disconnected', ticket: 'TKT-1004', owner: 'K. Brown' },
  { id: '6', severity: 'Minor', region: 'Southeast', timestamp: '2025-01-27 07:42', updated: '2025-01-27 07:45', source: 'RN-ATL-001', managedObject: 'Radio-6', type: 'Config mismatch', ticket: '—', owner: '—' },
  { id: '7', severity: 'Major', region: 'Midwest', timestamp: '2025-01-27 07:20', updated: '2025-01-27 07:30', source: 'eNB-CHI-002', managedObject: 'Cell-7', type: 'Link down', ticket: 'TKT-1005', owner: 'J. Smith' },
  { id: '8', severity: 'Critical', region: 'Mountain West', timestamp: '2025-01-27 06:55', updated: '2025-01-27 07:05', source: 'eNB-DEN-001', managedObject: 'Cell-8', type: 'Device disconnected', ticket: 'TKT-1006', owner: 'A. Jones' },
  { id: '9', severity: 'Minor', region: 'Southern California', timestamp: '2025-01-27 06:30', updated: '2025-01-27 06:32', source: 'RN-LAX-001', managedObject: 'Radio-9', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '10', severity: 'Major', region: 'Southeast', timestamp: '2025-01-27 06:10', updated: '2025-01-27 06:25', source: 'RN-ATL-005', managedObject: 'Radio-10', type: 'Radio link failure', ticket: 'TKT-1007', owner: 'M. Lee' },
  { id: '11', severity: 'Critical', region: 'Florida', timestamp: '2025-01-27 05:45', updated: '2025-01-27 05:55', source: 'eNB-MIA-001', managedObject: 'Cell-11', type: 'Power failure', ticket: 'TKT-1008', owner: 'S. Davis' },
  { id: '12', severity: 'Major', region: 'Great Plains', timestamp: '2025-01-27 05:22', updated: '2025-01-27 05:35', source: 'eNB-KC-001', managedObject: 'Radio-11', type: 'Link down', ticket: 'TKT-1009', owner: 'J. Smith' },
  { id: '13', severity: 'Minor', region: 'Texas', timestamp: '2025-01-27 05:10', updated: '2025-01-27 05:12', source: 'eNB-AUS-001', managedObject: 'Cell-12', type: 'Config mismatch', ticket: '—', owner: '—' },
  { id: '14', severity: 'Critical', region: 'Gulf Coast', timestamp: '2025-01-27 04:58', updated: '2025-01-27 05:05', source: 'eNB-HOU-001', managedObject: 'Cell-13', type: 'Cell outage', ticket: 'TKT-1010', owner: 'A. Jones' },
  { id: '15', severity: 'Major', region: 'Northern California', timestamp: '2025-01-27 04:40', updated: '2025-01-27 04:52', source: 'eNB-SFO-001', managedObject: 'Radio-12', type: 'Device disconnected', ticket: 'TKT-1011', owner: 'M. Lee' },
  { id: '16', severity: 'Minor', region: 'Great Lakes', timestamp: '2025-01-27 04:25', updated: '2025-01-27 04:28', source: 'RN-DET-001', managedObject: 'Cell-14', type: 'Antenna fault', ticket: '—', owner: '—' },
  { id: '17', severity: 'Major', region: 'New England', timestamp: '2025-01-27 04:10', updated: '2025-01-27 04:22', source: 'eNB-BOS-001', managedObject: 'Radio-13', type: 'Radio link failure', ticket: 'TKT-1012', owner: 'K. Brown' },
  { id: '18', severity: 'Critical', region: 'Mid-Atlantic', timestamp: '2025-01-27 03:55', updated: '2025-01-27 04:02', source: 'eNB-DC-001', managedObject: 'Cell-15', type: 'Device disconnected', ticket: 'TKT-1013', owner: 'S. Davis' },
  { id: '19', severity: 'Minor', region: 'Eastern Canada', timestamp: '2025-01-27 03:42', updated: '2025-01-27 03:45', source: 'eNB-TOR-001', managedObject: 'Radio-14', type: 'Config mismatch', ticket: '—', owner: '—' },
  { id: '20', severity: 'Major', region: 'Pacific Northwest', timestamp: '2025-01-27 03:30', updated: '2025-01-27 03:40', source: 'eNB-PDX-002', managedObject: 'Cell-16', type: 'Link down', ticket: 'TKT-1014', owner: 'J. Smith' },
  { id: '21', severity: 'Critical', region: 'Southern California', timestamp: '2025-01-27 03:15', updated: '2025-01-27 03:25', source: 'eNB-SAN-002', managedObject: 'Cell-17', type: 'Radio link failure', ticket: 'TKT-1015', owner: 'A. Jones' },
  { id: '22', severity: 'Minor', region: 'Desert Southwest', timestamp: '2025-01-27 03:02', updated: '2025-01-27 03:05', source: 'eNB-LAS-002', managedObject: 'Radio-15', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '23', severity: 'Major', region: 'Northeast', timestamp: '2025-01-27 02:48', updated: '2025-01-27 02:58', source: 'eNB-NYC-002', managedObject: 'Cell-18', type: 'Power failure', ticket: 'TKT-1016', owner: 'M. Lee' },
  { id: '24', severity: 'Critical', region: 'Texas', timestamp: '2025-01-27 02:35', updated: '2025-01-27 02:45', source: 'eNB-DAL-002', managedObject: 'Cell-19', type: 'Device disconnected', ticket: 'TKT-1017', owner: 'K. Brown' },
  { id: '25', severity: 'Minor', region: 'Florida', timestamp: '2025-01-27 02:22', updated: '2025-01-27 02:25', source: 'eNB-TPA-002', managedObject: 'Radio-16', type: 'Link down', ticket: '—', owner: '—' },
  { id: '26', severity: 'Major', region: 'Midwest', timestamp: '2025-01-27 02:10', updated: '2025-01-27 02:20', source: 'RN-CHI-001', managedObject: 'Cell-20', type: 'Config mismatch', ticket: 'TKT-1018', owner: 'S. Davis' },
  { id: '27', severity: 'Critical', region: 'Southeast', timestamp: '2025-01-27 01:58', updated: '2025-01-27 02:05', source: 'eNB-ATL-001', managedObject: 'Cell-21', type: 'Cell outage', ticket: 'TKT-1019', owner: 'J. Smith' },
  { id: '28', severity: 'Minor', region: 'Mountain West', timestamp: '2025-01-27 01:45', updated: '2025-01-27 01:48', source: 'RN-DEN-001', managedObject: 'Radio-17', type: 'Antenna fault', ticket: '—', owner: '—' },
  { id: '29', severity: 'Major', region: 'Great Plains', timestamp: '2025-01-27 01:32', updated: '2025-01-27 01:42', source: 'RN-KC-001', managedObject: 'Cell-22', type: 'Device disconnected', ticket: 'TKT-1020', owner: 'A. Jones' },
  { id: '30', severity: 'Critical', region: 'New England', timestamp: '2025-01-27 01:20', updated: '2025-01-27 01:28', source: 'RN-BOS-001', managedObject: 'Cell-23', type: 'Radio link failure', ticket: 'TKT-1021', owner: 'M. Lee' },
  { id: '31', severity: 'Minor', region: 'Gulf Coast', timestamp: '2025-01-27 01:08', updated: '2025-01-27 01:12', source: 'RN-NOL-001', managedObject: 'Radio-18', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '32', severity: 'Major', region: 'Northern California', timestamp: '2025-01-27 00:55', updated: '2025-01-27 01:05', source: 'RN-OAK-001', managedObject: 'Cell-24', type: 'Link down', ticket: 'TKT-1022', owner: 'K. Brown' },
  { id: '33', severity: 'Critical', region: 'Great Lakes', timestamp: '2025-01-27 00:42', updated: '2025-01-27 00:52', source: 'eNB-DET-001', managedObject: 'Cell-25', type: 'Power failure', ticket: 'TKT-1023', owner: 'S. Davis' },
  { id: '34', severity: 'Minor', region: 'Mid-Atlantic', timestamp: '2025-01-27 00:30', updated: '2025-01-27 00:33', source: 'RN-BAL-001', managedObject: 'Radio-19', type: 'Config mismatch', ticket: '—', owner: '—' },
  { id: '35', severity: 'Major', region: 'Eastern Canada', timestamp: '2025-01-27 00:18', updated: '2025-01-27 00:28', source: 'RN-TOR-001', managedObject: 'Cell-26', type: 'Device disconnected', ticket: 'TKT-1024', owner: 'J. Smith' },
];

export function getAlarmCounts(alarms: AlarmTableRow[]): { critical: number; major: number; minor: number; total: number } {
  const critical = alarms.filter((a) => a.severity === 'Critical').length;
  const major = alarms.filter((a) => a.severity === 'Major').length;
  const minor = alarms.filter((a) => a.severity === 'Minor').length;
  return { critical, major, minor, total: alarms.length };
}

const columns: ColumnDef<AlarmTableRow>[] = [
  {
    accessorKey: 'severity',
    header: ({ column }) => <SortableHeader column={column}>Severity</SortableHeader>,
    sortingFn: (rowA, rowB) => {
      const order: Record<AlarmSeverity, number> = { Critical: 0, Major: 1, Minor: 2 };
      const severityA = rowA.getValue('severity') as AlarmSeverity;
      const severityB = rowB.getValue('severity') as AlarmSeverity;
      return order[severityA] - order[severityB];
    },
    cell: ({ row }) => {
      const severity = row.getValue('severity') as AlarmSeverity;
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
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => <SortableHeader column={column}>Time occurred</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('timestamp')}</span>,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => <SortableHeader column={column}>Time updated</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('updated')}</span>,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => <SortableHeader column={column}>Source</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} />,
  },
  {
    accessorKey: 'managedObject',
    header: ({ column }) => <SortableHeader column={column}>Managed object</SortableHeader>,
    cell: ({ row }) => row.getValue('managedObject') as string,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Alarm type</SortableHeader>,
    cell: ({ row }) => <span>{row.getValue('type') as string}</span>,
  },
  {
    accessorKey: 'ticket',
    header: ({ column }) => <SortableHeader column={column}>Ticket ID</SortableHeader>,
    cell: ({ row }) => row.getValue('ticket') as string,
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => <SortableHeader column={column}>Owner</SortableHeader>,
    cell: ({ row }) => row.getValue('owner') as string,
  },
];

function filterBySearch(row: Row<AlarmTableRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.severity.toLowerCase().includes(search) ||
    data.timestamp.toLowerCase().includes(search) ||
    data.updated.toLowerCase().includes(search) ||
    data.source.toLowerCase().includes(search) ||
    data.region.toLowerCase().includes(search) ||
    data.managedObject.toLowerCase().includes(search) ||
    data.type.toLowerCase().includes(search) ||
    data.ticket.toLowerCase().includes(search) ||
    data.owner.toLowerCase().includes(search)
  );
}

export interface AlarmsTableCardProps {
  severityFilter?: string;
  onSeverityFilterChange?: (value: string) => void;
  regionFilter?: string;
  selectedRegions?: string[];
  /** Fixed page size (overrides responsive calculation). Use for dashboard/embedded tables. */
  pageSize?: number;
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

export function AlarmsTableCard({ severityFilter: severityFilterProp, onSeverityFilterChange, regionFilter, selectedRegions, pageSize: pageSizeProp }: AlarmsTableCardProps = {}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedAlarm, setSelectedAlarm] = React.useState<AlarmTableRow | null>(null);
  const [deviceDrawerOpen, setDeviceDrawerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<DeviceRow | null>(null);

  const handleNavigateToDevice = React.useCallback((source: string) => {
    const device = alarmSourceToDeviceRow(source);
    setSelectedDevice(device);
    setDeviceDrawerOpen(true);
  }, []);

  const openAlarmDrawer = React.useCallback((alarm: AlarmTableRow) => {
    setSelectedAlarm(alarm);
    setDrawerOpen(true);
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [internalSeverityFilter, setInternalSeverityFilter] = React.useState<string>('All');
  const severityFilter = severityFilterProp ?? internalSeverityFilter;
  const setSeverityFilter = onSeverityFilterChange ?? setInternalSeverityFilter;
  const [timestampFilter, setTimestampFilter] = React.useState<string>('All');
  const responsivePageSize = useResponsivePageSize();
  const pageSize = pageSizeProp ?? responsivePageSize;
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const filteredData = React.useMemo(() => {
    // Use selectedRegions array if provided
    if (selectedRegions && selectedRegions.length > 0 && !selectedRegions.includes('All')) {
      return ALARMS_TABLE_DATA.filter((a) => selectedRegions.includes(a.region));
    }
    // Fall back to single regionFilter for backward compatibility
    if (regionFilter && regionFilter !== 'All') {
      return ALARMS_TABLE_DATA.filter((a) => a.region === regionFilter);
    }
    return ALARMS_TABLE_DATA;
  }, [regionFilter, selectedRegions]);

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (severityFilter !== 'All') filters.push({ id: 'severity', value: severityFilter });
    return filters;
  }, [severityFilter]);

  const severityCounts = React.useMemo(() => {
    const counts = { Critical: 0, Major: 0, Minor: 0 };
    filteredData.forEach((row) => { counts[row.severity]++; });
    return counts;
  }, [filteredData]);

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
        <CardTitle>Alarms</CardTitle>
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
              placeholder="Search alarms..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Severity</span>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'All' 
                    ? `All (${filteredData.length})` 
                    : `${s} (${severityCounts[s as AlarmSeverity]})`}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Timestamp</span>
            <Select value={timestampFilter} onValueChange={setTimestampFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
            <SelectContent className="z-[1100]">
              {TIMESTAMP_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          {(globalFilter !== '' || severityFilter !== 'All' || timestampFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground h-9"
              onClick={() => {
                setGlobalFilter('');
                setSeverityFilter('All');
                setTimestampFilter('All');
              }}
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openAlarmDrawer(row.original)}
                  >
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
    <AlarmDrawer
      alarm={selectedAlarm}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      allAlarms={ALARMS_TABLE_DATA}
      tableAlarms={table.getPrePaginationRowModel().rows.map((r) => r.original)}
      onSelectAlarm={(alarm) => setSelectedAlarm(alarm as AlarmTableRow)}
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

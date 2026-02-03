'use client';

import * as React from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
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
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/ui/sortable-header';
import { DeviceLink } from '@/components/ui/device-link';
import { DeviceDrawer } from '@/components/device-drawer';
import type { DeviceRow } from '@/components/devices-data-table';
import { TooltipProvider } from '@/components/ui/tooltip';

function topOffenderToDeviceRow(row: TopOffenderRow): DeviceRow {
  return {
    id: row.id,
    device: row.device,
    type: row.type,
    notes: '',
    status: row.status,
    alarms: row.alarms,
    alarmType: row.alarmType,
    configStatus: row.configStatus,
    ipAddress: row.ipAddress,
    version: 'v2.2',
    deviceGroup: 'Radio access',
    labels: [],
  };
}
export type AlarmType = 'Critical' | 'Major' | 'Minor';

export interface TopOffenderRow {
  id: string;
  device: string;
  region: string;
  type: string;
  status: string;
  alarms: number;
  alarmType: AlarmType;
  configStatus: string;
  ipAddress: string;
}


const ALARM_TYPE_ICON: Record<AlarmType, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
};

const TOP_OFFENDERS_DATA: TopOffenderRow[] = [
  { id: '1', device: 'eNB-ATL-002', region: 'Southeast', type: 'SN-LTE', status: 'Connected', alarms: 12, alarmType: 'Critical', configStatus: 'Synchronized', ipAddress: '10.12.1.42' },
  { id: '2', device: 'RN-BOS-001', region: 'Northeast', type: 'SN-LTE', status: 'Connected', alarms: 9, alarmType: 'Major', configStatus: 'Synchronized', ipAddress: '10.24.2.101' },
  { id: '3', device: 'eNB-SEA-003', region: 'Pacific Northwest', type: 'SN-LTE', status: 'Disconnected', alarms: 8, alarmType: 'Critical', configStatus: 'Synchronized', ipAddress: '10.36.1.88' },
  { id: '4', device: 'eNB-NYC-001', region: 'Northeast', type: 'SN-LTE', status: 'Connected', alarms: 7, alarmType: 'Major', configStatus: 'Synchronized', ipAddress: '10.12.2.15' },
  { id: '5', device: 'RN-PHX-003', region: 'Desert Southwest', type: 'SN-LTE', status: 'Disconnected', alarms: 6, alarmType: 'Minor', configStatus: 'Synchronized', ipAddress: '10.24.3.22' },
  { id: '6', device: 'RN-CHI-001', region: 'Midwest', type: 'SN-LTE', status: 'Connected', alarms: 6, alarmType: 'Major', configStatus: 'Synchronized', ipAddress: '10.36.2.55' },
  { id: '7', device: 'eNB-CHI-002', region: 'Midwest', type: 'SN-LTE', status: 'Connected', alarms: 5, alarmType: 'Minor', configStatus: 'Synchronized', ipAddress: '10.12.3.77' },
  { id: '8', device: 'eNB-MIA-002', region: 'Southeast', type: 'SN-LTE', status: 'Disconnected', alarms: 5, alarmType: 'Critical', configStatus: 'Synchronized', ipAddress: '10.24.1.33' },
  { id: '9', device: 'RN-DEN-002', region: 'Mountain West', type: 'SN-LTE', status: 'Disconnected', alarms: 4, alarmType: 'Minor', configStatus: 'Synchronized', ipAddress: '10.36.3.11' },
  { id: '10', device: 'RN-ATL-005', region: 'Southeast', type: 'SN-LTE', status: 'Connected', alarms: 4, alarmType: 'Major', configStatus: 'Synchronized', ipAddress: '10.12.4.99' },
];

function getColumns(onDeviceClick: (row: TopOffenderRow) => void): ColumnDef<TopOffenderRow>[] {
  return [
  {
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink
        value={row.getValue('device') as string}
        onClick={() => onDeviceClick(row.original)}
      />
    ),
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {row.getValue('type') as string}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isConnected = status === 'Connected';
      return (
        <span className="inline-flex items-center gap-2">
          <Icon
            name={isConnected ? 'link' : 'link_off'}
            size={16}
            className={isConnected ? 'text-muted-foreground shrink-0' : 'text-destructive shrink-0'}
            aria-hidden
          />
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'alarms',
    header: ({ column }) => <SortableHeader column={column}>Alarms</SortableHeader>,
    cell: ({ row }) => {
      const alarms = row.getValue('alarms') as number;
      const alarmType = row.original.alarmType;
      const { name: iconName, className: iconClass } = ALARM_TYPE_ICON[alarmType];
      return (
        <span className="inline-flex items-center gap-2">
          <span className="tabular-nums">{alarms}</span>
          <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} aria-hidden />
          <span className="text-sm">{alarmType}</span>
        </span>
      );
    },
  },
  {
    accessorKey: 'configStatus',
    header: ({ column }) => <SortableHeader column={column}>Config status</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="sync" size={16} className="text-muted-foreground shrink-0" aria-hidden />
        {row.getValue('configStatus') as string}
      </span>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => <SortableHeader column={column}>IP address</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="terminal" size={16} className="text-muted-foreground shrink-0" aria-hidden />
        <span className="font-mono text-sm">{row.getValue('ipAddress')}</span>
      </span>
    ),
  },
];
}

function filterBySearch(row: Row<TopOffenderRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.device.toLowerCase().includes(search) ||
    data.region.toLowerCase().includes(search) ||
    data.type.toLowerCase().includes(search) ||
    data.status.toLowerCase().includes(search) ||
    data.configStatus.toLowerCase().includes(search) ||
    data.ipAddress.toLowerCase().includes(search) ||
    String(data.alarms).includes(search) ||
    data.alarmType.toLowerCase().includes(search)
  );
}

const REGION_OPTIONS = ['Region', 'Southeast', 'Northeast', 'Pacific Northwest', 'Desert Southwest', 'Midwest', 'Mountain West'] as const;
const TYPE_OPTIONS = ['Type', 'SN-LTE'] as const;
const STATUS_OPTIONS = ['Status', 'Connected', 'Disconnected'] as const;
const ALARM_TYPE_FILTER_OPTIONS = ['Alarm type', 'Critical', 'Major', 'Minor'] as const;
const CONFIG_STATUS_OPTIONS = ['Config status', 'Synchronized', 'Out of sync'] as const;

export function TopOffendersCard() {
  const pageSize = useResponsivePageSize();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<TopOffenderRow | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'alarms', desc: true }]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<string>('Region');
  const [typeFilter, setTypeFilter] = React.useState<string>('Type');
  const [statusFilter, setStatusFilter] = React.useState<string>('Status');
  const [alarmTypeFilter, setAlarmTypeFilter] = React.useState<string>('Alarm type');
  const [configStatusFilter, setConfigStatusFilter] = React.useState<string>('Config status');
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  const handleDeviceClick = React.useCallback((row: TopOffenderRow) => {
    setSelectedDevice(row);
    setDrawerOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(handleDeviceClick), [handleDeviceClick]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (regionFilter !== 'Region') filters.push({ id: 'region', value: regionFilter });
    if (typeFilter !== 'Type') filters.push({ id: 'type', value: typeFilter });
    if (statusFilter !== 'Status') filters.push({ id: 'status', value: statusFilter });
    if (alarmTypeFilter !== 'Alarm type') filters.push({ id: 'alarmType', value: alarmTypeFilter });
    if (configStatusFilter !== 'Config status') filters.push({ id: 'configStatus', value: configStatusFilter });
    return filters;
  }, [regionFilter, typeFilter, statusFilter, alarmTypeFilter, configStatusFilter]);

  const filtersActive = globalFilter !== '' || regionFilter !== 'Region' || typeFilter !== 'Type' || statusFilter !== 'Status' || alarmTypeFilter !== 'Alarm type' || configStatusFilter !== 'Config status';
  const clearFilters = () => {
    setGlobalFilter('');
    setRegionFilter('Region');
    setTypeFilter('Type');
    setStatusFilter('Status');
    setAlarmTypeFilter('Alarm type');
    setConfigStatusFilter('Config status');
  };

  const table = useReactTable({
    data: TOP_OFFENDERS_DATA,
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
        <CardTitle>Top offenders</CardTitle>
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
              placeholder="Search top offenders..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex flex-nowrap items-center gap-2 min-w-0 overflow-x-auto">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[140px] shrink-0 h-9">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[110px] shrink-0 h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] shrink-0 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={alarmTypeFilter} onValueChange={setAlarmTypeFilter}>
              <SelectTrigger className="w-[120px] shrink-0 h-9">
                <SelectValue placeholder="Alarm type" />
              </SelectTrigger>
              <SelectContent>
                {ALARM_TYPE_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={configStatusFilter} onValueChange={setConfigStatusFilter}>
              <SelectTrigger className="w-[130px] shrink-0 h-9">
                <SelectValue placeholder="Config status" />
              </SelectTrigger>
              <SelectContent>
                {CONFIG_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filtersActive && (
            <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground h-9" onClick={clearFilters}>
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
    <DeviceDrawer
      device={selectedDevice ? topOffenderToDeviceRow(selectedDevice) : null}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    />
    </TooltipProvider>
  );
}

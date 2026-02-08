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
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TrendBadge } from '@/components/TrendBadge';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeviceDrawer } from '@/components/device-drawer';
import { DEVICES_DATA, type DeviceRow } from '@/components/devices-data-table';

export interface DisconnectedDeviceRow {
  id: string;
  device: string;
  region: string;
  timeOccurred: string;
}

const TIME_AGO = ['2 min ago', '5 min ago', '8 min ago', '15 min ago', '22 min ago', '30 min ago', '45 min ago', '1 hour ago', '1.5 hours ago', '2 hours ago', '3 hours ago', '4 hours ago', '5 hours ago', '6 hours ago'];

const DISCONNECTED_DEVICES_DATA: DisconnectedDeviceRow[] = DEVICES_DATA
  .filter((d) => d.status === 'Disconnected')
  .map((d, i) => ({
    id: d.id,
    device: d.device,
    region: d.region,
    timeOccurred: TIME_AGO[i % TIME_AGO.length],
  }));

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

function toDeviceRow(d: DisconnectedDeviceRow): DeviceRow {
  return {
    id: d.id,
    device: d.device,
    type: 'SN-LTE',
    notes: '',
    status: 'Disconnected',
    alarms: 0,
    alarmType: 'None',
    configStatus: '—',
    version: '—',
    ipAddress: '—',
    deviceGroup: 'Radio access',
    region: 'Pacific Northwest',
    labels: [],
  };
}

export function DisconnectedDevicesCard() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });
  const [deviceDrawerOpen, setDeviceDrawerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<DeviceRow | null>(null);

  const openDeviceDrawer = React.useCallback((row: DisconnectedDeviceRow) => {
    setSelectedDevice(toDeviceRow(row));
    setDeviceDrawerOpen(true);
  }, []);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

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
    state: { sorting, globalFilter, pagination },
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
          {globalFilter !== '' && (
            <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground h-9" onClick={() => setGlobalFilter('')}>
              <Icon name="close" size={16} />
              Clear
            </Button>
          )}
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openDeviceDrawer(row.original)}
                  >
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
    <DeviceDrawer
      device={selectedDevice}
      open={deviceDrawerOpen}
      onOpenChange={setDeviceDrawerOpen}
    />
    </TooltipProvider>
  );
}

'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
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

export interface ThresholdCrossingAlertRow {
  id: string;
  device: string;
  triggered: string;
  lastTriggered: string;
  lastReset: string;
  umtsMonitoredCells: number;
  lteMonitoredCells: number;
}

const DEVICE_IDS = ['eNB-SEA-001', 'eNB-PDX-002', 'RN-PHX-003', 'eNB-SFO-001', 'RN-LAS-001', 'eNB-NYC-001', 'RN-DEN-002', 'eNB-CHI-002', 'RN-ATL-005', 'eNB-MIA-002', 'RN-SEA-001', 'eNB-PHX-001', 'RN-SFO-003'];

const THRESHOLD_ALERTS_DATA: ThresholdCrossingAlertRow[] = DEVICE_IDS.flatMap((device, i) => [
  { id: `${device}-1`, device, triggered: i % 2 === 0 ? 'Yes' : 'No', lastTriggered: i % 2 === 0 ? '2025-01-27 09:12' : '—', lastReset: '2025-01-27 08:45', umtsMonitoredCells: 6 + (i % 6), lteMonitoredCells: 12 + (i % 12) },
  { id: `${device}-2`, device, triggered: i % 3 === 0 ? 'Yes' : 'No', lastTriggered: i % 3 === 0 ? '2025-01-27 08:30' : '—', lastReset: '2025-01-27 08:10', umtsMonitoredCells: 4 + (i % 4), lteMonitoredCells: 8 + (i % 8) },
]);

const getColumns = (hideDeviceColumn?: boolean): ColumnDef<ThresholdCrossingAlertRow>[] => {
  const cols: ColumnDef<ThresholdCrossingAlertRow>[] = [];
  if (!hideDeviceColumn) {
    cols.push({
      accessorKey: 'device',
      header: ({ column }) => (
        <SortableHeader column={column}>Device</SortableHeader>
      ),
      cell: ({ row }) => <DeviceLink value={row.getValue('device') as string} />,
    });
  }
  cols.push(
  {
    accessorKey: 'triggered',
    header: ({ column }) => (
      <SortableHeader column={column}>Triggered</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('triggered') as string,
  },
  {
    accessorKey: 'lastTriggered',
    header: ({ column }) => (
      <SortableHeader column={column}>Last triggered</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lastTriggered') as string}</span>
    ),
  },
  {
    accessorKey: 'lastReset',
    header: ({ column }) => (
      <SortableHeader column={column}>Last reset</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lastReset') as string}</span>
    ),
  },
  {
    accessorKey: 'umtsMonitoredCells',
    header: ({ column }) => (
      <SortableHeader column={column}>UMTS monitored cells</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('umtsMonitoredCells') as number}</span>
    ),
  },
  {
    accessorKey: 'lteMonitoredCells',
    header: ({ column }) => (
      <SortableHeader column={column}>LTE monitored cells</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('lteMonitoredCells') as number}</span>
    ),
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
          <DropdownMenuItem>Reset threshold</DropdownMenuItem>
          <DropdownMenuItem>Edit threshold</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 w-14 text-right pr-4 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  });
  return cols;
};

export function getFilteredThresholdCount(filters: { actSessFilter?: string }): number {
  if (!filters.actSessFilter || filters.actSessFilter === 'ACT_SESS' || filters.actSessFilter === 'All') {
    return THRESHOLD_ALERTS_DATA.length;
  }
  return THRESHOLD_ALERTS_DATA.filter((row) => {
    const idx = DEVICE_IDS.indexOf(row.device);
    if (filters.actSessFilter === 'ACT_SESS_1') return idx % 3 === 0;
    if (filters.actSessFilter === 'ACT_SESS_2') return idx % 3 === 1;
    if (filters.actSessFilter === 'ACT_SESS_3') return idx % 3 === 2;
    return true;
  }).length;
}

export interface ThresholdCrossingAlertsDataTableProps {
  /** Filter to only show conditions for this device */
  deviceId?: string;
  /** Hide the device column (for device detail page) */
  hideDeviceColumn?: boolean;
  /** ACT_SESS filter from Devices page (ACT_SESS, All, ACT_SESS_1, ACT_SESS_2, ACT_SESS_3) */
  actSessFilter?: string;
}

export function ThresholdCrossingAlertsDataTable({ deviceId, hideDeviceColumn, actSessFilter }: ThresholdCrossingAlertsDataTableProps = {}) {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'lastTriggered', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const filteredData = React.useMemo(() => {
    let data = THRESHOLD_ALERTS_DATA;
    if (deviceId) data = data.filter((row) => row.device === deviceId);
    if (actSessFilter && actSessFilter !== 'ACT_SESS' && actSessFilter !== 'All') {
      data = data.filter((row) => {
        const idx = DEVICE_IDS.indexOf(row.device);
        if (actSessFilter === 'ACT_SESS_1') return idx % 3 === 0;
        if (actSessFilter === 'ACT_SESS_2') return idx % 3 === 1;
        if (actSessFilter === 'ACT_SESS_3') return idx % 3 === 2;
        return true;
      });
    }
    return data;
  }, [deviceId, actSessFilter]);

  const columns = React.useMemo(() => getColumns(hideDeviceColumn), [hideDeviceColumn]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, pagination },
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
                <TableRow key={row.id}>
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
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center px-4 py-3">
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

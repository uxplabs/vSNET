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
  region: string;
  profileName: string;
  kpi: string;
  triggeredThreshold: string;
  triggeredValue: string;
  lastTriggered: string;
}

const DEVICE_IDS = ['eNB-SEA-001', 'eNB-PDX-002', 'RN-PHX-003', 'eNB-SFO-001', 'RN-LAS-001', 'eNB-NYC-001', 'RN-DEN-002', 'eNB-CHI-002', 'RN-ATL-005', 'eNB-MIA-002', 'RN-SEA-001', 'eNB-PHX-001', 'RN-SFO-003'];

const REGIONS = ['Pacific Northwest', 'Pacific Northwest', 'Desert Southwest', 'Northern California', 'Desert Southwest', 'Northeast', 'Mountain West', 'Great Lakes', 'Southeast', 'Florida', 'Pacific Northwest', 'Desert Southwest', 'Northern California'];

const PROFILE_NAMES = [
  'LTE Throughput Baseline',
  'NR Cell Availability',
  'ERAB Drop Rate',
  'RRC Setup Success',
  'Handover Success Rate',
  'VoLTE Call Drop',
  'Latency SLA',
  'CPU Utilization',
  'Packet Loss',
  'UL/DL Throughput',
];

const KPI_NAMES = [
  'DL throughput (Mbps)',
  'UL throughput (Mbps)',
  'Cell availability (%)',
  'ERAB drop rate (%)',
  'RRC setup SR (%)',
  'HO success rate (%)',
  'VoLTE drop rate (%)',
  'Avg latency (ms)',
  'CPU utilization (%)',
  'Packet loss (%)',
];

// Threshold / triggered-value pairs keyed by KPI index
const KPI_THRESHOLDS: [string, string][] = [
  /* DL throughput (Mbps)   */ ['≥ 50', '34.2'],
  /* UL throughput (Mbps)   */ ['≥ 20', '12.7'],
  /* Cell availability (%)  */ ['≥ 99.5', '98.1'],
  /* ERAB drop rate (%)     */ ['≤ 1.0', '2.4'],
  /* RRC setup SR (%)       */ ['≥ 99.0', '96.8'],
  /* HO success rate (%)    */ ['≥ 98.0', '94.3'],
  /* VoLTE drop rate (%)    */ ['≤ 0.5', '1.1'],
  /* Avg latency (ms)       */ ['≤ 20', '37'],
  /* CPU utilization (%)    */ ['≤ 85', '92.4'],
  /* Packet loss (%)        */ ['≤ 0.1', '0.38'],
];

// Alternate triggered values for the second alert per device
const KPI_THRESHOLDS_ALT: [string, string][] = [
  /* DL throughput (Mbps)   */ ['≥ 50', '41.5'],
  /* UL throughput (Mbps)   */ ['≥ 20', '15.3'],
  /* Cell availability (%)  */ ['≥ 99.5', '97.6'],
  /* ERAB drop rate (%)     */ ['≤ 1.0', '1.8'],
  /* RRC setup SR (%)       */ ['≥ 99.0', '98.2'],
  /* HO success rate (%)    */ ['≥ 98.0', '95.7'],
  /* VoLTE drop rate (%)    */ ['≤ 0.5', '0.9'],
  /* Avg latency (ms)       */ ['≤ 20', '28'],
  /* CPU utilization (%)    */ ['≤ 85', '88.1'],
  /* Packet loss (%)        */ ['≤ 0.1', '0.24'],
];

const THRESHOLD_ALERTS_DATA: ThresholdCrossingAlertRow[] = DEVICE_IDS.flatMap((device, i) => {
  const kpiIdx1 = i % KPI_NAMES.length;
  const kpiIdx2 = (i + 5) % KPI_NAMES.length;
  return [
    {
      id: `${device}-1`,
      device,
      region: REGIONS[i % REGIONS.length],
      profileName: PROFILE_NAMES[i % PROFILE_NAMES.length],
      kpi: KPI_NAMES[kpiIdx1],
      triggeredThreshold: KPI_THRESHOLDS[kpiIdx1][0],
      triggeredValue: KPI_THRESHOLDS[kpiIdx1][1],
      lastTriggered: i % 2 === 0 ? 'Feb 10, 2026 at 9:12 AM' : 'Feb 9, 2026 at 4:45 PM',
    },
    {
      id: `${device}-2`,
      device,
      region: REGIONS[i % REGIONS.length],
      profileName: PROFILE_NAMES[(i + 3) % PROFILE_NAMES.length],
      kpi: KPI_NAMES[kpiIdx2],
      triggeredThreshold: KPI_THRESHOLDS_ALT[kpiIdx2][0],
      triggeredValue: KPI_THRESHOLDS_ALT[kpiIdx2][1],
      lastTriggered: i % 3 === 0 ? 'Feb 11, 2026 at 8:30 AM' : 'Feb 8, 2026 at 11:22 AM',
    },
  ];
});

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
    accessorKey: 'region',
    header: ({ column }) => (
      <SortableHeader column={column}>Region</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'profileName',
    header: ({ column }) => (
      <SortableHeader column={column}>Profile name</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('profileName') as string}</span>
    ),
  },
  {
    accessorKey: 'kpi',
    header: ({ column }) => (
      <SortableHeader column={column}>KPI</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('kpi') as string,
  },
  {
    accessorKey: 'triggeredThreshold',
    header: ({ column }) => (
      <SortableHeader column={column}>Triggered threshold</SortableHeader>
    ),
    cell: ({ row }) => (
      <code className="text-sm tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
        {row.getValue('triggeredThreshold') as string}
      </code>
    ),
  },
  {
    accessorKey: 'triggeredValue',
    header: ({ column }) => (
      <SortableHeader column={column}>Triggered value</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{row.getValue('triggeredValue') as string}</span>
    ),
  },
  {
    accessorKey: 'lastTriggered',
    header: ({ column }) => (
      <SortableHeader column={column}>Last triggered</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">{row.getValue('lastTriggered') as string}</span>
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
      className: 'sticky right-0 w-14 text-right pr-4 bg-card group-hover:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  });
  return cols;
};

export function getFilteredThresholdCount(filters: { actSessFilter?: string }): number {
  if (!filters.actSessFilter || filters.actSessFilter === 'All') {
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
    if (actSessFilter && actSessFilter !== 'All') {
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
                <TableRow key={row.id} className="group">
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

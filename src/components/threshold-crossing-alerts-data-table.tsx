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
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { DeviceLink } from '@/components/ui/device-link';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface ThresholdCrossingAlertRow {
  id: string;
  device: string;
  region: string;
  profileName: string;
  kpi: string;
  triggeredThreshold: string;
  triggeredValue: string;
  state: 'Active' | 'Cleared' | 'Cleared manually';
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

const STATES: ThresholdCrossingAlertRow['state'][] = ['Active', 'Cleared', 'Cleared manually'];

export const THRESHOLD_KPI_OPTIONS = ['All', ...KPI_NAMES] as const;
export const THRESHOLD_STATE_OPTIONS = ['All', ...STATES] as const;

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
      state: STATES[i % 3],
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
      state: STATES[(i + 1) % 3],
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
      <SortableHeader column={column}>Last triggered value</SortableHeader>
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
    accessorKey: 'state',
    header: ({ column }) => (
      <SortableHeader column={column}>State</SortableHeader>
    ),
    cell: ({ row }) => {
      const state = row.getValue('state') as string;
      const variant = state === 'Active' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{state}</Badge>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      row.original.state === 'Active' ? (
        <Button variant="default" size="sm">
          Clear
        </Button>
      ) : null
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 w-14 text-right pr-4 bg-card group-hover:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  });
  return cols;
};

export function getFilteredThresholdCount(filters: { search?: string; kpiFilter?: string; stateFilter?: string; deviceId?: string }): number {
  return THRESHOLD_ALERTS_DATA.filter((row) => {
    if (filters.deviceId && row.device !== filters.deviceId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!row.device.toLowerCase().includes(q) && !row.kpi.toLowerCase().includes(q) && !row.profileName.toLowerCase().includes(q) && !row.region.toLowerCase().includes(q)) return false;
    }
    if (filters.kpiFilter && filters.kpiFilter !== 'All' && row.kpi !== filters.kpiFilter) return false;
    if (filters.stateFilter && filters.stateFilter !== 'All') {
      if (filters.stateFilter === 'Cleared' ? row.state === 'Active' : row.state !== filters.stateFilter) return false;
    }
    return true;
  }).length;
}

export interface ThresholdCrossingAlertsDataTableProps {
  deviceId?: string;
  hideDeviceColumn?: boolean;
  search?: string;
  kpiFilter?: string;
  stateFilter?: string;
}

export function ThresholdCrossingAlertsDataTable({ deviceId, hideDeviceColumn, search, kpiFilter, stateFilter }: ThresholdCrossingAlertsDataTableProps = {}) {
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
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((row) => row.device.toLowerCase().includes(q) || row.kpi.toLowerCase().includes(q) || row.profileName.toLowerCase().includes(q) || row.region.toLowerCase().includes(q));
    }
    if (kpiFilter && kpiFilter !== 'All') data = data.filter((row) => row.kpi === kpiFilter);
    if (stateFilter && stateFilter !== 'All') data = data.filter((row) => stateFilter === 'Cleared' ? row.state !== 'Active' : row.state === stateFilter);
    return data;
  }, [deviceId, search, kpiFilter, stateFilter]);

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

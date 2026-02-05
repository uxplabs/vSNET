'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

export interface RegionRow {
  region: string;
  totalDevices: number;
  connected: number;
  disconnected: number;
  inMaintenance: number;
  offline: number;
  kpiSyncErrors: number;
}

/**
 * Region device counts. connected + disconnected + inMaintenance + offline = totalDevices.
 * Sums across all regions: totalDevices=500, connected=342, disconnected=12, inMaintenance=38, offline=108, kpiSyncErrors=8
 */
function generateRegionsData(): RegionRow[] {
  const base: [number, number, number, number, number, number][] = [
    [32, 21, 1, 2, 8, 0],   // Pacific Northwest
    [31, 20, 1, 2, 8, 0],   // Northern California
    [30, 19, 1, 2, 8, 1],   // Southern California
    [28, 18, 1, 2, 7, 0],   // Desert Southwest
    [31, 20, 1, 2, 8, 1],   // Mountain West
    [32, 23, 0, 2, 7, 1],   // Great Plains
    [35, 26, 1, 2, 6, 0],   // Texas
    [30, 20, 1, 2, 7, 1],   // Gulf Coast
    [38, 28, 1, 2, 7, 1],   // Southeast
    [29, 19, 1, 2, 7, 0],   // Florida
    [36, 27, 0, 2, 7, 1],   // Midwest
    [33, 24, 1, 2, 6, 0],   // Great Lakes
    [35, 26, 0, 2, 7, 1],   // Northeast
    [28, 18, 2, 2, 6, 0],   // New England
    [31, 22, 0, 2, 7, 1],   // Mid-Atlantic
    [21, 11, 0, 2, 8, 0],   // Eastern Canada
  ];
  return NORTH_AMERICAN_REGIONS.map((region, i) => ({
    region,
    totalDevices: base[i][0],
    connected: base[i][1],
    disconnected: base[i][2],
    inMaintenance: base[i][3],
    offline: base[i][4],
    kpiSyncErrors: base[i][5],
  }));
}

export const REGIONS_DATA: RegionRow[] = generateRegionsData();

export function getRegionRow(region: string): RegionRow | undefined {
  return REGIONS_DATA.find((r) => r.region === region);
}

export function getAggregatedRegionData(): { totalDevices: number; connected: number; disconnected: number; inMaintenance: number; offline: number; kpiSyncErrors: number } {
  return REGIONS_DATA.reduce(
    (acc, r) => ({
      totalDevices: acc.totalDevices + r.totalDevices,
      connected: acc.connected + r.connected,
      disconnected: acc.disconnected + r.disconnected,
      inMaintenance: acc.inMaintenance + r.inMaintenance,
      offline: acc.offline + r.offline,
      kpiSyncErrors: acc.kpiSyncErrors + r.kpiSyncErrors,
    }),
    { totalDevices: 0, connected: 0, disconnected: 0, inMaintenance: 0, offline: 0, kpiSyncErrors: 0 }
  );
}

const regionsColumns: ColumnDef<RegionRow>[] = [
  {
    accessorKey: 'region',
    header: ({ column }) => (
      <SortableHeader column={column}>Region</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('region')}</span>
    ),
  },
  {
    accessorKey: 'totalDevices',
    header: () => <div className="text-right">Total devices</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('totalDevices')}</div>
    ),
  },
  {
    accessorKey: 'connected',
    header: () => <div className="text-right">Connected</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('connected')}</div>
    ),
  },
  {
    accessorKey: 'disconnected',
    header: () => <div className="text-right">Disconnected</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('disconnected')}</div>
    ),
  },
  {
    accessorKey: 'inMaintenance',
    header: () => <div className="text-right">In maintenance</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('inMaintenance')}</div>
    ),
  },
  {
    accessorKey: 'offline',
    header: () => <div className="text-right">Offline</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('offline')}</div>
    ),
  },
  {
    accessorKey: 'kpiSyncErrors',
    header: () => <div className="text-right">KPI sync error</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('kpiSyncErrors')}</div>
    ),
  },
];

export interface RegionsDataTableProps {
  regionFilter?: string;
  regionsFilter?: string[];
}

export function RegionsDataTable({ regionFilter, regionsFilter }: RegionsDataTableProps) {
  const data = React.useMemo(() => {
    // Use regionsFilter array if provided
    if (regionsFilter && regionsFilter.length > 0 && !regionsFilter.includes('All')) {
      return REGIONS_DATA.filter((r) => regionsFilter.includes(r.region));
    }
    // Fall back to single regionFilter for backward compatibility
    if (regionFilter && regionFilter !== 'All') {
      return REGIONS_DATA.filter((r) => r.region === regionFilter);
    }
    return REGIONS_DATA;
  }, [regionFilter, regionsFilter]);
  return <DataTable columns={regionsColumns} data={data} />;
}

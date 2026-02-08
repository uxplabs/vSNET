'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';
import { DEVICES_DATA } from './devices-data-table';

export interface RegionRow {
  region: string;
  totalDevices: number;
  connected: number;
  disconnected: number;
  inMaintenance: number;
  offline: number;
  kpiSyncErrors: number;
}

/** Derive region data from actual DEVICES_DATA */
export const REGIONS_DATA: RegionRow[] = NORTH_AMERICAN_REGIONS.map((region) => {
  const regionDevices = DEVICES_DATA.filter((d) => d.region === region);
  return {
    region,
    totalDevices: regionDevices.length,
    connected: regionDevices.filter((d) => d.status === 'Connected').length,
    disconnected: regionDevices.filter((d) => d.status === 'Disconnected').length,
    inMaintenance: regionDevices.filter((d) => d.status === 'In maintenance').length,
    offline: regionDevices.filter((d) => d.status === 'Offline').length,
    kpiSyncErrors: regionDevices.filter((d) => d.configStatus === 'Out of sync').length,
  };
});

export function getRegionRow(region: string): RegionRow | undefined {
  return REGIONS_DATA.find((r) => r.region === region);
}

export function getAggregatedRegionData(): {
  totalDevices: number;
  connected: number;
  disconnected: number;
  inMaintenance: number;
  offline: number;
  kpiSyncErrors: number;
} {
  return REGIONS_DATA.reduce(
    (acc, r) => ({
      totalDevices: acc.totalDevices + r.totalDevices,
      connected: acc.connected + r.connected,
      disconnected: acc.disconnected + r.disconnected,
      inMaintenance: acc.inMaintenance + r.inMaintenance,
      offline: acc.offline + r.offline,
      kpiSyncErrors: acc.kpiSyncErrors + r.kpiSyncErrors,
    }),
    { totalDevices: 0, connected: 0, disconnected: 0, inMaintenance: 0, offline: 0, kpiSyncErrors: 0 },
  );
}

/* ── Column definitions ─────────────────────────────────────────────── */

const numericColumn = (
  key: keyof RegionRow,
  label: string,
): ColumnDef<RegionRow> => ({
  accessorKey: key,
  header: ({ column }) => (
    <div className="flex justify-end">
      <SortableHeader column={column} className="ml-0 -mr-3">
        {label}
      </SortableHeader>
    </div>
  ),
  cell: ({ row }) => (
    <div className="text-right tabular-nums">{row.getValue(key) as number}</div>
  ),
});

const columns: ColumnDef<RegionRow>[] = [
  {
    accessorKey: 'region',
    header: ({ column }) => (
      <SortableHeader column={column}>Region</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('region')}</span>
    ),
  },
  numericColumn('totalDevices', 'Total devices'),
  numericColumn('connected', 'Connected'),
  numericColumn('disconnected', 'Disconnected'),
  numericColumn('inMaintenance', 'In maintenance'),
  numericColumn('offline', 'Offline'),
  numericColumn('kpiSyncErrors', 'KPI sync errors'),
];

/* ── Component ──────────────────────────────────────────────────────── */

export interface RegionsDataTableProps {
  /** Array of selected region names to display. Shows all when empty or contains "All". */
  regionsFilter?: string[];
}

export function RegionsDataTable({ regionsFilter }: RegionsDataTableProps) {
  const data = React.useMemo(() => {
    if (regionsFilter && regionsFilter.length > 0 && !regionsFilter.includes('All')) {
      return REGIONS_DATA.filter((r) => regionsFilter.includes(r.region));
    }
    return REGIONS_DATA;
  }, [regionsFilter]);

  return <DataTable columns={columns} data={data} />;
}

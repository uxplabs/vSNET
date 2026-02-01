'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

export interface RegionRow {
  region: string;
  totalDevices: number;
  connected: number;
  disconnected: number;
  ungrouped: number;
}

function generateRegionsData(): RegionRow[] {
  const base = [
    [210, 185, 8, 17],
    [192, 142, 12, 38],
    [98, 15, 0, 83],
    [156, 128, 6, 22],
    [144, 120, 4, 20],
    [178, 156, 9, 13],
    [165, 138, 11, 16],
    [132, 98, 14, 20],
    [188, 165, 7, 16],
    [95, 72, 5, 18],
    [201, 175, 10, 16],
    [167, 145, 8, 14],
    [143, 118, 9, 16],
    [112, 89, 6, 17],
    [134, 102, 12, 20],
    [89, 68, 7, 14],
  ];
  return NORTH_AMERICAN_REGIONS.map((region, i) => ({
    region,
    totalDevices: base[i][0],
    connected: base[i][1],
    disconnected: base[i][2],
    ungrouped: base[i][3],
  }));
}

const REGIONS_DATA: RegionRow[] = generateRegionsData();

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
    accessorKey: 'ungrouped',
    header: () => <div className="text-right">Ungrouped</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue('ungrouped')}</div>
    ),
  },
];

export function RegionsDataTable() {
  return <DataTable columns={regionsColumns} data={REGIONS_DATA} />;
}

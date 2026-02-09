'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Icon } from '@/components/Icon';
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ALARM_TYPE_CONFIG } from './devices-data-table';

export interface NrCellRow {
  cellId: string;
  name: string;
  description: string;
  status: 'Up' | 'Down';
  enabled: boolean;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  zone1: string;
  zone2: string;
  radioNode: string;
  dlBandwidth: string;
}

export const NR_CELLS_DATA: NrCellRow[] = [
  { cellId: 'NR-001', name: 'NR Cell 1', description: 'Primary sector', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', zone1: 'North sector primary', zone2: 'North sector secondary', radioNode: 'RN-001', dlBandwidth: '100 MHz' },
  { cellId: 'NR-002', name: 'NR Cell 2', description: 'Secondary sector', status: 'Up', enabled: true, alarms: 1, alarmType: 'Minor', zone1: 'South sector primary', zone2: 'South sector secondary', radioNode: 'RN-001', dlBandwidth: '100 MHz' },
  { cellId: 'NR-003', name: 'NR Cell 3', description: 'Backup sector', status: 'Down', enabled: false, alarms: 2, alarmType: 'Major', zone1: 'East sector overlay', zone2: 'East sector backup', radioNode: 'RN-002', dlBandwidth: '80 MHz' },
  { cellId: 'NR-004', name: 'NR Cell 4', description: 'Overlay sector', status: 'Down', enabled: true, alarms: 0, alarmType: 'None', zone1: 'West sector primary', zone2: 'West sector secondary', radioNode: 'RN-002', dlBandwidth: '100 MHz' },
  { cellId: 'NR-005', name: 'NR Cell 5', description: 'Test sector', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', zone1: 'Central sector primary', zone2: 'Central sector overlay', radioNode: 'RN-003', dlBandwidth: '80 MHz' },
  { cellId: 'NR-006', name: 'NR Cell 6', description: 'Edge sector', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', zone1: 'Edge sector primary', zone2: 'Edge sector secondary', radioNode: 'RN-003', dlBandwidth: '100 MHz' },
];

function getColumns(hideRadioNode = false): ColumnDef<NrCellRow>[] {
  return [
  {
    accessorKey: 'cellId',
    header: ({ column }) => <SortableHeader column={column}>Cell ID</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('cellId') as string}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate max-w-[12rem] font-medium">{row.getValue('name') as string}</span>
    ),
    meta: { className: 'max-w-[12rem]' },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate max-w-[12rem]">{row.getValue('description') as string}</span>
    ),
    meta: { className: 'max-w-[12rem]' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => (
      <DeviceStatus
        status={row.original.status === 'Up' ? 'Connected' : 'Disconnected'}
        iconSize={14}
      />
    ),
  },
  {
    accessorKey: 'enabled',
    header: ({ column }) => <SortableHeader column={column}>Enabled</SortableHeader>,
    cell: ({ row }) => {
      const enabled = row.getValue('enabled') as boolean;
      return (
        <Icon
          name={enabled ? 'check_circle' : 'cancel'}
          size={18}
          className={enabled ? 'text-success' : 'text-muted-foreground'}
        />
      );
    },
  },
  {
    accessorKey: 'alarms',
    header: ({ column }) => <SortableHeader column={column}>Alarms</SortableHeader>,
    cell: ({ row }) => {
      const alarms = row.original.alarms;
      const alarmType = row.original.alarmType;
      if (alarms === 0) return <span className="text-muted-foreground tabular-nums">0</span>;
      const config = ALARM_TYPE_CONFIG[alarmType] ?? ALARM_TYPE_CONFIG.None;
      return (
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="tabular-nums shrink-0">{alarms}</span>
          <Icon name={config.name} size={18} className={`shrink-0 ${config.className}`} />
          {alarmType !== 'None' && <span className="text-sm truncate">{alarmType}</span>}
        </span>
      );
    },
  },
  {
    accessorKey: 'zone1',
    id: 'zones',
    header: ({ column }) => <SortableHeader column={column}>Zones</SortableHeader>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <DeviceLink value={row.original.zone1} />
        <DeviceLink value={row.original.zone2} />
      </div>
    ),
  },
  ...(!hideRadioNode ? [{
    accessorKey: 'radioNode',
    header: ({ column }: { column: any }) => <SortableHeader column={column}>Radio node</SortableHeader>,
    cell: ({ row }: { row: any }) => <DeviceLink value={row.getValue('radioNode') as string} />,
  } as ColumnDef<NrCellRow>] : []),
  {
    accessorKey: 'dlBandwidth',
    header: ({ column }) => <SortableHeader column={column}>DL bandwidth</SortableHeader>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue('dlBandwidth') as string}</span>
    ),
  },
  ];
}

export interface NrCellsDataTableProps {
  data?: NrCellRow[];
  hideRadioNode?: boolean;
}

export function NrCellsDataTable({ data, hideRadioNode }: NrCellsDataTableProps = {}) {
  const columns = React.useMemo(() => getColumns(hideRadioNode), [hideRadioNode]);
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={data ?? NR_CELLS_DATA} />
    </TooltipProvider>
  );
}

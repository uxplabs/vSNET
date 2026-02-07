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

export interface RadioNodeRow {
  index: number;
  name: string;
  description: string;
  status: 'Up' | 'Down';
  enabled: boolean;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  nrCell1: string;
  nrCell2: string;
  ethernetId: string;
  model: string;
}

export const RADIO_NODES_DATA: RadioNodeRow[] = [
  { index: 1, name: 'Radio Node 1', description: 'Primary sector', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', nrCell1: 'NR-001', nrCell2: 'NR-002', ethernetId: '00:1a:2b:3c:4d:5e', model: 'ABAB123' },
  { index: 2, name: 'Radio Node 2', description: 'Secondary sector', status: 'Up', enabled: true, alarms: 1, alarmType: 'Minor', nrCell1: 'NR-002', nrCell2: 'NR-003', ethernetId: '00:1a:2b:3c:4d:5f', model: 'ABAB123' },
  { index: 3, name: 'Radio Node 3', description: 'Backup sector', status: 'Down', enabled: false, alarms: 2, alarmType: 'Major', nrCell1: 'NR-003', nrCell2: 'NR-004', ethernetId: '00:1a:2b:3c:4d:60', model: 'ABAB123' },
  { index: 4, name: 'Radio Node 4', description: 'Overlay sector', status: 'Down', enabled: true, alarms: 0, alarmType: 'None', nrCell1: 'NR-004', nrCell2: 'NR-005', ethernetId: '00:1a:2b:3c:4d:61', model: 'FGH456' },
  { index: 5, name: 'Radio Node 5', description: 'Test sector', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', nrCell1: 'NR-005', nrCell2: 'NR-006', ethernetId: '00:1a:2b:3c:4d:62', model: 'FGH456' },
];

const STATUS_OPTIONS = ['Status', 'Connected', 'Disconnected'] as const;
const MODEL_OPTIONS = ['Model', 'ABAB123', 'FGH456'] as const;

const columns: ColumnDef<RadioNodeRow>[] = [
  {
    accessorKey: 'index',
    header: ({ column }) => <SortableHeader column={column}>Index</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums">{row.getValue('index') as number}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink value={row.getValue('name') as string} maxLength={20} />
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
    meta: { className: 'w-[10rem] min-w-[10rem]' },
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
    accessorKey: 'nrCell1',
    id: 'nrCells',
    header: ({ column }) => <SortableHeader column={column}>NR cells</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <DeviceLink value={row.original.nrCell1} />
        <DeviceLink value={row.original.nrCell2} />
      </span>
    ),
  },
  {
    accessorKey: 'ethernetId',
    header: ({ column }) => <SortableHeader column={column}>Ethernet ID</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate font-mono text-sm">{row.getValue('ethernetId') as string}</span>
    ),
    meta: { className: 'min-w-[11rem]' },
  },
  {
    accessorKey: 'model',
    header: ({ column }) => <SortableHeader column={column}>Model</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate">{row.getValue('model') as string}</span>
    ),
  },
];

export function filterRadioNodes(
  data: RadioNodeRow[],
  search: string,
  statusFilter: string,
  modelFilter: string
): RadioNodeRow[] {
  return data.filter((row) => {
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      const searchable = [
        row.name,
        row.description,
        row.ethernetId,
        row.model,
        String(row.index),
      ].join(' ').toLowerCase();
      if (!searchable.includes(searchLower)) return false;
    }
    if (statusFilter && statusFilter !== 'Status') {
      const status = row.status === 'Up' ? 'Connected' : 'Disconnected';
      if (status !== statusFilter) return false;
    }
    if (modelFilter && modelFilter !== 'Model') {
      if (row.model !== modelFilter) return false;
    }
    return true;
  });
}

export const RADIO_NODES_STATUS_OPTIONS = STATUS_OPTIONS;
export const RADIO_NODES_MODEL_OPTIONS = MODEL_OPTIONS;

export interface RadioNodesDataTableProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  modelFilter: string;
  onModelFilterChange: (value: string) => void;
}

export function RadioNodesDataTable({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  modelFilter,
  onModelFilterChange,
}: RadioNodesDataTableProps) {
  const filteredData = React.useMemo(
    () => filterRadioNodes(RADIO_NODES_DATA, search, statusFilter, modelFilter),
    [search, statusFilter, modelFilter]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={filteredData} />
    </TooltipProvider>
  );
}

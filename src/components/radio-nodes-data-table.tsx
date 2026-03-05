'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Icon } from '@/components/Icon';
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';
import { Checkbox } from '@/components/ui/checkbox';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ALARM_TYPE_CONFIG } from './devices-data-table';

export interface RadioNodeRow {
  index: number;
  name: string;
  role: 'RIU' | 'DCU' | 'DEU' | 'dLRU' | 'dMRU' | 'dHRU';
  description: string;
  status: 'Up' | 'Down';
  enabled: boolean;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  supportBands: string;
  ethernetId: string;
  model: string;
  serialNumber: string;
}

export const RADIO_NODES_DATA: RadioNodeRow[] = [
  { index: 1, name: 'RIU 1', role: 'RIU', description: 'Head-end room', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', supportBands: 'n41, n71', ethernetId: '00:1a:2b:3c:4d:5e', model: 'ABAB123', serialNumber: 'RN-000001' },
  { index: 2, name: 'DCU 1', role: 'DCU', description: 'Distribution cabinet A', status: 'Up', enabled: true, alarms: 1, alarmType: 'Minor', supportBands: 'n41, n77', ethernetId: '00:1a:2b:3c:4d:5f', model: 'ABAB123', serialNumber: 'RN-000002' },
  { index: 3, name: 'DEU 1', role: 'DEU', description: 'Distribution edge unit', status: 'Down', enabled: false, alarms: 2, alarmType: 'Major', supportBands: 'n71, n77', ethernetId: '00:1a:2b:3c:4d:60', model: 'ABAB123', serialNumber: 'RN-000003' },
  { index: 4, name: 'dLRU 1', role: 'dLRU', description: 'Remote low-power unit', status: 'Down', enabled: true, alarms: 0, alarmType: 'None', supportBands: 'n41', ethernetId: '00:1a:2b:3c:4d:61', model: 'FGH456', serialNumber: 'RN-000004' },
  { index: 5, name: 'dMRU 1', role: 'dMRU', description: 'Remote medium-power unit', status: 'Up', enabled: true, alarms: 0, alarmType: 'None', supportBands: 'n77', ethernetId: '00:1a:2b:3c:4d:62', model: 'FGH456', serialNumber: 'RN-000005' },
];

const STATUS_OPTIONS = ['All', 'Connected', 'Disconnected'] as const;
const MODEL_OPTIONS = ['All', 'ABAB123', 'FGH456'] as const;
const INDEX_OPTIONS = ['All', ...RADIO_NODES_DATA.map((row) => String(row.index))] as const;

function getColumns(onNameClick?: (row: RadioNodeRow) => void): ColumnDef<RadioNodeRow>[] {
  return [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[3rem] min-w-[3rem]' },
  },
  {
    accessorKey: 'index',
    header: ({ column }) => <SortableHeader column={column}>Index</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums">{row.getValue('index') as number}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink
        value={row.getValue('name') as string}
        maxLength={20}
        onClick={onNameClick ? () => onNameClick(row.original) : undefined}
      />
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
    accessorKey: 'supportBands',
    header: ({ column }) => <SortableHeader column={column}>Support bands</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate">{row.getValue('supportBands') as string}</span>
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
  {
    accessorKey: 'serialNumber',
    header: ({ column }) => <SortableHeader column={column}>Serial number</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate font-mono text-sm">{row.getValue('serialNumber') as string}</span>
    ),
    meta: { className: 'min-w-[10rem]' },
  },
  ];
}

export function filterRadioNodes(
  data: RadioNodeRow[],
  search: string,
  statusFilter: string,
  modelFilter: string,
  indexFilter: string = 'All',
): RadioNodeRow[] {
  return data.filter((row) => {
    const searchLower = search.trim().toLowerCase();
    if (searchLower) {
      const searchable = [
        row.name,
        row.role,
        row.description,
        row.supportBands,
        row.ethernetId,
        row.model,
        row.serialNumber,
        String(row.index),
      ].join(' ').toLowerCase();
      if (!searchable.includes(searchLower)) return false;
    }
    if (statusFilter && statusFilter !== 'All') {
      const status = row.status === 'Up' ? 'Connected' : 'Disconnected';
      if (status !== statusFilter) return false;
    }
    if (modelFilter && modelFilter !== 'All') {
      if (row.model !== modelFilter) return false;
    }
    if (indexFilter && indexFilter !== 'All') {
      if (String(row.index) !== indexFilter) return false;
    }
    return true;
  });
}

export const RADIO_NODES_STATUS_OPTIONS = STATUS_OPTIONS;
export const RADIO_NODES_MODEL_OPTIONS = MODEL_OPTIONS;
export const RADIO_NODES_INDEX_OPTIONS = INDEX_OPTIONS;

export interface RadioNodesDataTableProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  modelFilter: string;
  onModelFilterChange: (value: string) => void;
  indexFilter?: string;
  onSelectionChange?: (selectedRows: RadioNodeRow[]) => void;
  onRowClick?: (row: RadioNodeRow) => void;
  onNameClick?: (row: RadioNodeRow) => void;
}

export function RadioNodesDataTable({
  search,
  statusFilter,
  modelFilter,
  indexFilter = 'All',
  onSelectionChange,
  onRowClick,
  onNameClick,
}: RadioNodesDataTableProps) {
  const columns = React.useMemo(() => getColumns(onNameClick), [onNameClick]);
  const filteredData = React.useMemo(
    () => filterRadioNodes(RADIO_NODES_DATA, search, statusFilter, modelFilter, indexFilter),
    [search, statusFilter, modelFilter, indexFilter]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable
        columns={columns}
        data={filteredData}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => String(row.index)}
        onRowClick={onRowClick}
      />
    </TooltipProvider>
  );
}

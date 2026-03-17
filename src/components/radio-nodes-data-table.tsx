'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Icon } from '@/components/Icon';
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';
import { Badge } from '@/components/ui/badge';

import { TooltipProvider } from '@/components/ui/tooltip';

export interface RadioNodeRow {
  index: number;
  name: string;
  managedObject: string;
  role: 'RIU' | 'DCU' | 'DEU' | 'dLRU' | 'dMRU' | 'dHRU';
  band: string;
  description: string;
  location: string;
  status: 'Up' | 'Down';
  ipAddress: string;
  enabled: boolean;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  supportBands: string;
  ethernetId: string;
  model: string;
  serialNumber: string;
}

export const RADIO_NODES_DATA: RadioNodeRow[] = [
  { index: 1, name: 'RIU 1', managedObject: 'MO-RIU-0001', role: 'RIU', band: '700, CELL/ESMR, PCS, AWS3', description: 'Head-end room', location: 'Head-end room', status: 'Up', ipAddress: '10.14.0.11', enabled: true, alarms: 0, alarmType: 'None', supportBands: '700, CELL/ESMR, PCS, AWS3', ethernetId: '00:1a:2b:3c:4d:5e', model: 'ABAB123', serialNumber: 'RN-000001' },
  { index: 2, name: 'DCU 1', managedObject: 'MO-DCU-0002', role: 'DCU', band: '700, PCS', description: 'Distribution cabinet A', location: 'Distribution cabinet A', status: 'Up', ipAddress: '10.14.0.12', enabled: true, alarms: 1, alarmType: 'Minor', supportBands: '700, PCS', ethernetId: '00:1a:2b:3c:4d:5f', model: 'ABAB123', serialNumber: 'RN-000002' },
  { index: 3, name: 'DEU 1', managedObject: 'MO-DEU-0003', role: 'DEU', band: 'CELL/ESMR, PCS', description: 'Distribution edge unit', location: 'Distribution edge unit', status: 'Down', ipAddress: '10.14.0.13', enabled: false, alarms: 2, alarmType: 'Major', supportBands: 'CELL/ESMR, PCS', ethernetId: '00:1a:2b:3c:4d:60', model: 'ABAB123', serialNumber: 'RN-000003' },
  { index: 4, name: 'dLRU 1', managedObject: 'MO-dLRU-0004', role: 'dLRU', band: '700', description: 'Remote low-power unit', location: 'Remote low-power unit', status: 'Down', ipAddress: '10.14.0.14', enabled: true, alarms: 0, alarmType: 'None', supportBands: '700', ethernetId: '00:1a:2b:3c:4d:61', model: 'FGH456', serialNumber: 'RN-000004' },
  { index: 5, name: 'dMRU 1', managedObject: 'MO-dMRU-0005', role: 'dMRU', band: 'PCS, AWS3', description: 'Remote medium-power unit', location: 'Remote medium-power unit', status: 'Up', ipAddress: '10.14.0.15', enabled: true, alarms: 0, alarmType: 'None', supportBands: 'PCS, AWS3', ethernetId: '00:1a:2b:3c:4d:62', model: 'FGH456', serialNumber: 'RN-000005' },
];

const STATUS_OPTIONS = ['All', 'Connected', 'Disconnected'] as const;
const MODEL_OPTIONS = ['All', 'ABAB123', 'FGH456'] as const;
const INDEX_OPTIONS = ['All', ...RADIO_NODES_DATA.map((row) => String(row.index))] as const;

function getColumns(onNameClick?: (row: RadioNodeRow) => void): ColumnDef<RadioNodeRow>[] {
  return [
  {
    accessorKey: 'index',
    header: ({ column }) => <SortableHeader column={column}>Index</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums">{row.getValue('index') as number}</span>,
    meta: { className: 'w-[5rem] min-w-[5rem]' },
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
    accessorKey: 'managedObject',
    header: ({ column }) => <SortableHeader column={column}>Managed object</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate font-mono text-sm">{row.getValue('managedObject') as string}</span>
    ),
    meta: { className: 'min-w-[12rem]' },
  },
  {
    accessorKey: 'band',
    header: ({ column }) => <SortableHeader column={column}>Band</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate max-w-[12rem]">{row.getValue('band') as string}</span>
    ),
    meta: { className: 'max-w-[12rem]' },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-normal">
        {row.getValue('role') as string}
      </Badge>
    ),
    meta: { className: 'w-[8rem] min-w-[8rem]' },
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
    accessorKey: 'ipAddress',
    header: ({ column }) => <SortableHeader column={column}>IP address</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('ipAddress') as string}</span>
    ),
    meta: { className: 'min-w-[10rem]' },
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
  {
    accessorKey: 'location',
    header: ({ column }) => <SortableHeader column={column}>Location</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5">
        <Icon name="map" size={14} className="text-muted-foreground" />
        <span className="truncate max-w-[12rem]">{row.getValue('location') as string}</span>
      </span>
    ),
    meta: { className: 'min-w-[12rem]' },
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
        row.managedObject,
        row.role,
        row.band,
        row.description,
        row.location,
        row.ipAddress,
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

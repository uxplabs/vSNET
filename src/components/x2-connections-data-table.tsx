'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ALARM_TYPE_CONFIG } from './devices-data-table';

export interface X2ConnectionRow {
  id: string;
  x2PeerName: string;
  peerEnable: boolean;
  isEndcX2: boolean;
  status: 'Up' | 'Down';
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  enodebId: string;
  localAddress: string;
  remoteAddress: string;
}

export const X2_CONNECTIONS_DATA: X2ConnectionRow[] = [
  { id: 'X2-001', x2PeerName: 'eNB-PDX-002', peerEnable: true, isEndcX2: false, status: 'Up', alarms: 0, alarmType: 'None', enodebId: '0x001', localAddress: '10.0.1.1', remoteAddress: '10.0.2.1' },
  { id: 'X2-002', x2PeerName: 'eNB-SFO-003', peerEnable: true, isEndcX2: true, status: 'Up', alarms: 1, alarmType: 'Minor', enodebId: '0x002', localAddress: '10.0.1.2', remoteAddress: '10.0.2.2' },
  { id: 'X2-003', x2PeerName: 'RN-PHX-004', peerEnable: false, isEndcX2: false, status: 'Down', alarms: 2, alarmType: 'Major', enodebId: '0x003', localAddress: '10.0.1.3', remoteAddress: '10.0.2.3' },
  { id: 'X2-004', x2PeerName: 'eNB-NYC-005', peerEnable: true, isEndcX2: true, status: 'Up', alarms: 0, alarmType: 'None', enodebId: '0x004', localAddress: '10.0.1.4', remoteAddress: '10.0.2.4' },
];

const columns: ColumnDef<X2ConnectionRow>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('id') as string}</span>
    ),
  },
  {
    accessorKey: 'x2PeerName',
    header: ({ column }) => <SortableHeader column={column}>X2 peer name</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('x2PeerName') as string} />,
  },
  {
    accessorKey: 'peerEnable',
    header: ({ column }) => <SortableHeader column={column}>Peer enable</SortableHeader>,
    cell: ({ row }) => (
      <Checkbox checked={row.getValue('peerEnable')} disabled aria-label="Peer enable" />
    ),
  },
  {
    accessorKey: 'isEndcX2',
    header: ({ column }) => <SortableHeader column={column}>IsENDCX2</SortableHeader>,
    cell: ({ row }) => (row.getValue('isEndcX2') ? 'Yes' : 'No'),
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
    accessorKey: 'alarms',
    header: ({ column }) => <SortableHeader column={column}>Alarm</SortableHeader>,
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
    accessorKey: 'enodebId',
    header: ({ column }) => <SortableHeader column={column}>ENodeBID</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('enodebId') as string}</span>
    ),
  },
  {
    accessorKey: 'localAddress',
    header: ({ column }) => <SortableHeader column={column}>Local address</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="terminal" size={16} className="shrink-0 text-muted-foreground" />
        <span className="font-mono text-sm">{row.getValue('localAddress') as string}</span>
      </span>
    ),
  },
  {
    accessorKey: 'remoteAddress',
    header: ({ column }) => <SortableHeader column={column}>Remote address</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="terminal" size={16} className="shrink-0 text-muted-foreground" />
        <span className="font-mono text-sm">{row.getValue('remoteAddress') as string}</span>
      </span>
    ),
  },
];

export function X2ConnectionsDataTable() {
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={X2_CONNECTIONS_DATA} />
    </TooltipProvider>
  );
}

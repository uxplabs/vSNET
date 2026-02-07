'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Icon } from '@/components/Icon';
import { DeviceStatus } from '@/components/ui/device-status';
import { ALARM_TYPE_CONFIG } from './devices-data-table';

export interface IpInterfaceRow {
  lanDeviceId: string;
  description: string;
  ipAddress: string;
  vlan: string;
  ethernetId: string;
  status: 'Up' | 'Down';
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
}

export const IP_INTERFACES_DATA: IpInterfaceRow[] = [
  { lanDeviceId: 'eth0', description: 'Management interface', ipAddress: '10.0.1.1', vlan: '1', ethernetId: '00:1a:2b:3c:4d:5e', status: 'Up', alarms: 0, alarmType: 'None' },
  { lanDeviceId: 'eth1', description: 'Data plane', ipAddress: '192.168.1.10', vlan: '100', ethernetId: '00:1a:2b:3c:4d:5f', status: 'Up', alarms: 1, alarmType: 'Major' },
  { lanDeviceId: 'eth2', description: 'Backup link', ipAddress: '10.0.2.1', vlan: '2', ethernetId: '00:1a:2b:3c:4d:60', status: 'Down', alarms: 2, alarmType: 'Critical' },
];

const columns: ColumnDef<IpInterfaceRow>[] = [
  {
    accessorKey: 'lanDeviceId',
    header: ({ column }) => <SortableHeader column={column}>LAN device ID</SortableHeader>,
    cell: ({ row }) => <span className="font-medium">{row.getValue('lanDeviceId')}</span>,
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
    accessorKey: 'ipAddress',
    header: ({ column }) => <SortableHeader column={column}>IP address</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="terminal" size={16} className="shrink-0 text-muted-foreground" />
        <span className="font-mono text-sm">{row.getValue('ipAddress') as string}</span>
      </span>
    ),
  },
  {
    accessorKey: 'vlan',
    header: ({ column }) => <SortableHeader column={column}>VLAN</SortableHeader>,
    cell: ({ row }) => row.getValue('vlan') as string,
  },
  {
    accessorKey: 'ethernetId',
    header: ({ column }) => <SortableHeader column={column}>Ethernet ID</SortableHeader>,
    cell: ({ row }) => (
      <span className="block truncate font-mono text-sm">{row.getValue('ethernetId') as string}</span>
    ),
    meta: { className: 'w-[11rem] min-w-[11rem]' },
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
    header: ({ column }) => <SortableHeader column={column}>Alarms</SortableHeader>,
    cell: ({ row }) => {
      const alarms = row.original.alarms;
      const alarmType = row.original.alarmType;
      if (alarms === 0) return <span className="text-muted-foreground tabular-nums">0</span>;
      const config = ALARM_TYPE_CONFIG[alarmType] ?? ALARM_TYPE_CONFIG.None;
      return (
        <span className="inline-flex items-center gap-2">
          <span className="tabular-nums">{alarms}</span>
          <Icon name={config.name} size={18} className={`shrink-0 ${config.className}`} />
          {alarmType !== 'None' && <span className="text-sm">{alarmType}</span>}
        </span>
      );
    },
  },
];

export function IpInterfacesDataTable() {
  return <DataTable columns={columns} data={IP_INTERFACES_DATA} />;
}

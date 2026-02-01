'use client';

import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/ui/table-pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeviceLink } from '@/components/ui/device-link';
import { DeviceDrawer } from '@/components/device-drawer';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/ui/badge';

export type DeviceGroup = 'Core network' | 'Radio access' | 'Edge devices' | 'Test environment';

export interface DeviceRow {
  id: string;
  device: string;
  type: string;
  notes: string;
  notesUpdatedAt?: string;
  status: string;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  configStatus: string;
  version: string;
  ipAddress: string;
  deviceGroup: DeviceGroup;
  labels: string[];
}

const LABEL_POOL = ['production', 'lte', '5g', 'core', 'radio', 'maintenance', 'critical', 'northwest', 'verified', 'active', 'standby', 'legacy', 'testing', 'hotfix'];

const ALARM_TYPE_CONFIG: Record<string, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
  None: { name: 'check_circle', className: 'text-muted-foreground' },
};

const DEVICE_PREFIXES = ['eNB-SEA', 'eNB-PDX', 'RN-PHX', 'eNB-SFO', 'RN-LAS', 'eNB-NYC', 'RN-DEN', 'eNB-CHI', 'RN-ATL', 'eNB-MIA', 'RN-SEA', 'eNB-PHX', 'RN-SFO', 'eNB-LAS', 'RN-NYC', 'eNB-DEN', 'RN-CHI', 'eNB-BOS', 'RN-MIA', 'eNB-AUS'];
const TYPES = ['SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE', 'SN-LTE'];
const STATUSES = ['Connected', 'Connected', 'Disconnected', 'Connected', 'In maintenance', 'Connected', 'Offline', 'Connected', 'Connected', 'Disconnected'];
const ALARM_TYPES: Array<'Critical' | 'Major' | 'Minor' | 'None'> = ['None', 'Minor', 'Critical', 'Major', 'None', 'Minor', 'Critical', 'None', 'Major', 'Critical'];
const CONFIG_STATUSES = ['Synchronized', 'Synchronized', 'Out of sync', 'Synchronized', 'Pending', 'Synchronized', 'Out of sync', 'Synchronized', 'Synchronized', 'Out of sync'];
const VERSIONS = ['v3.0', 'v2.2', 'v2.1', 'v3.1', 'v2.2', 'v2.1', 'v2.2', 'v3.0', 'v3.1', 'v2.1'];
const DEVICE_GROUPS: DeviceGroup[] = ['Core network', 'Radio access', 'Edge devices', 'Test environment'];

function generateDevices(count: number): DeviceRow[] {
  const devices: DeviceRow[] = [];
  const alarmCombos: Array<{ count: number; type: DeviceRow['alarmType'] }> = [
    { count: 0, type: 'None' }, { count: 1, type: 'Minor' }, { count: 2, type: 'Minor' }, { count: 3, type: 'Major' },
    { count: 4, type: 'Critical' }, { count: 5, type: 'Critical' }, { count: 2, type: 'Major' }, { count: 0, type: 'None' },
    { count: 1, type: 'Major' }, { count: 6, type: 'Critical' },
  ];
  for (let i = 1; i <= count; i++) {
    const pi = (i - 1) % 10;
    const prefix = DEVICE_PREFIXES[(i - 1) % DEVICE_PREFIXES.length];
    const num = String(i).padStart(3, '0');
    const octet4 = ((i % 250) + 1).toString();
    const octet3 = (Math.floor(i / 250) % 256).toString();
    const alarm = alarmCombos[i % alarmCombos.length];
    const notes = i % 4 === 0 ? (i % 3 === 0 ? 'Core site' : 'Radio node') : '';
    const deviceGroup: DeviceGroup = notes === 'Core site' ? 'Core network' : notes === 'Radio node' ? 'Radio access' : i % 3 === 0 ? 'Edge devices' : 'Test environment';
    const notesUpdatedAt = notes
      ? (() => {
          const d = 15 + (i % 12);
          const h = 9 + (i % 10);
          const m = (i * 7) % 60;
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
          return `Jan ${d}, 2025 at ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
        })()
      : undefined;
    const labelCount = i % 12;
    const startIdx = (i * 5) % LABEL_POOL.length;
    const labels: string[] = [];
    for (let j = 0; j < labelCount && j < LABEL_POOL.length; j++) {
      labels.push(LABEL_POOL[(startIdx + j) % LABEL_POOL.length]);
    }
    devices.push({
      id: String(i),
      device: `${prefix}-${num}`,
      type: TYPES[pi],
      notes,
      notesUpdatedAt,
      status: STATUSES[pi],
      alarms: alarm.count,
      alarmType: alarm.type,
      configStatus: CONFIG_STATUSES[pi],
      version: VERSIONS[pi],
      ipAddress: `10.${(12 + (i % 3)).toString()}.${octet3}.${octet4}`,
      deviceGroup,
      labels,
    });
  }
  return devices;
}

export const DEVICES_DATA: DeviceRow[] = generateDevices(48);

export function getDeviceSidebarCounts(devices: DeviceRow[]) {
  const region = {
    all: devices.length,
    disconnected: devices.filter((d) => d.status === 'Disconnected').length,
    kpiSyncErrors: devices.filter((d) => d.configStatus === 'Out of sync').length,
    inMaintenance: devices.filter((d) => d.status === 'In maintenance').length,
    offline: devices.filter((d) => d.status === 'Offline').length,
  };
  const groups = DEVICE_GROUPS.reduce((acc, g) => {
    acc[g] = devices.filter((d) => d.deviceGroup === g).length;
    return acc;
  }, {} as Record<DeviceGroup, number>);
  return { region, groups };
}

function StatusCell({ status }: { status: string }) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el.closest('td') ?? el);
    return () => ro.disconnect();
  }, [status]);

  const isConnected = status === 'Connected';
  const content = (
    <span ref={containerRef} className="inline-flex items-center gap-2 min-w-0 truncate">
      <Icon
        name={isConnected ? 'link' : 'link_off'}
        size={16}
        className={isConnected ? 'text-muted-foreground shrink-0' : 'text-destructive shrink-0'}
      />
      <span className="truncate">{status}</span>
    </span>
  );

  return isTruncated ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{status}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

function getColumns(onDeviceClick: (device: DeviceRow) => void): ColumnDef<DeviceRow>[] {
  return [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
    meta: { className: 'w-12' },
  },
  {
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink
        value={row.getValue('device') as string}
        maxLength={24}
        onClick={() => onDeviceClick(row.original)}
      />
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-medium">
        {row.getValue('type') as string}
      </Badge>
    ),
  },
  {
    accessorKey: 'notes',
    header: '',
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;
      const hasNotes = !!notes?.trim();
      const notesUpdatedAt = row.original.notesUpdatedAt;
      const tooltipText = hasNotes && notesUpdatedAt
        ? `Notes added ${notesUpdatedAt}`
        : hasNotes
          ? 'Notes added'
          : 'Add note';
      const button = (
        <button
          type="button"
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label={tooltipText}
        >
          <Icon
            name={hasNotes ? 'note' : 'note_add'}
            size={20}
            className={hasNotes ? 'text-primary' : 'text-muted-foreground/40'}
          />
        </button>
      );
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
      );
    },
    meta: { className: 'w-14' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) => <StatusCell status={row.getValue('status') as string} />,
    meta: { className: 'w-[10rem] pr-8' },
  },
  {
    accessorKey: 'alarms',
    header: ({ column }) => <SortableHeader column={column}>Alarms</SortableHeader>,
    sortingFn: (rowA, rowB) => {
      const order: Record<string, number> = { Critical: 0, Major: 1, Minor: 2, None: 3 };
      const a = order[rowA.original.alarmType] ?? 4;
      const b = order[rowB.original.alarmType] ?? 4;
      if (a !== b) return a - b;
      return (rowB.original.alarms ?? 0) - (rowA.original.alarms ?? 0);
    },
    cell: ({ row }) => {
      const alarms = row.getValue('alarms') as number;
      const alarmType = row.original.alarmType;
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
  {
    accessorKey: 'configStatus',
    header: ({ column }) => <SortableHeader column={column}>Config status</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="sync" size={16} className="text-muted-foreground shrink-0" />
        {row.getValue('configStatus') as string}
      </span>
    ),
    meta: { className: 'w-[10rem] pr-8' },
  },
  {
    accessorKey: 'version',
    header: ({ column }) => <SortableHeader column={column}>Version</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums">{row.getValue('version')}</span>,
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => <SortableHeader column={column}>IP address</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-mono text-sm">
        <Icon name="terminal" size={16} className="text-muted-foreground shrink-0" />
        {row.getValue('ipAddress')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
            <Icon name="more_vert" size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Configure</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card w-14',
    },
  },
];
}

export function DevicesDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'alarms', desc: false },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<DeviceRow | null>(null);

  const handleDeviceClick = React.useCallback((device: DeviceRow) => {
    setSelectedDevice(device);
    setDrawerOpen(true);
  }, []);

  const columns = React.useMemo(() => getColumns(handleDeviceClick), [handleDeviceClick]);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: DEVICES_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, rowSelection, pagination },
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                <TableCell colSpan={columns.length} className="h-24 text-center px-4 py-3">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} className="justify-end shrink-0" />
    </div>
    <DeviceDrawer
      device={selectedDevice}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    />
    </TooltipProvider>
  );
}

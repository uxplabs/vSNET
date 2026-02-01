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
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DeviceLink } from '@/components/ui/device-link';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';

export type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

export interface AlarmRow {
  id: string;
  severity: AlarmSeverity;
  timestamp: string;
  updated: string;
  source: string;
  managedObject: string;
  type: string;
  ticketId: string;
  owner: string;
}

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
};

const SOURCE_PREFIXES = ['eNB-SEA', 'eNB-PDX', 'RN-PHX', 'eNB-SFO', 'RN-LAS', 'eNB-NYC', 'RN-DEN', 'eNB-CHI', 'RN-ATL', 'eNB-MIA', 'RN-SEA', 'eNB-PHX', 'RN-SFO', 'eNB-LAS', 'RN-NYC'];
const TYPES = ['Device disconnected', 'Link down', 'Radio link failure', 'Config mismatch'];
const OWNERS = ['J. Smith', 'A. Jones', 'M. Lee', 'K. Brown', '—'];

function generateAlarms(count: number): AlarmRow[] {
  const severities: AlarmSeverity[] = ['Critical', 'Major', 'Minor'];
  const alarms: AlarmRow[] = [];
  for (let i = 1; i <= count; i++) {
    const si = (i - 1) % 3;
    const severity = severities[si];
    const offset = (i * 13) % 240;
    const h = 6 + Math.floor(offset / 60);
    const m = offset % 60;
    const ts = `2025-01-27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const up = `2025-01-27 ${String(h).padStart(2, '0')}:${String(Math.min(59, m + 2 + (i % 3))).padStart(2, '0')}`;
    const prefix = SOURCE_PREFIXES[(i - 1) % SOURCE_PREFIXES.length];
    const num = String(((i - 1) % 20) + 1).padStart(3, '0');
    const source = `${prefix}-${num}`;
    const hasTicket = i % 4 !== 0;
    alarms.push({
      id: String(i),
      severity,
      timestamp: ts,
      updated: up,
      source,
      managedObject: (i % 2 === 0 ? 'Cell-' : 'Radio-') + ((i % 12) + 1),
      type: TYPES[i % TYPES.length],
      ticketId: hasTicket ? `TKT-${1000 + i}` : '—',
      owner: hasTicket ? OWNERS[i % (OWNERS.length - 1)] : '—',
    });
  }
  return alarms;
}

export const ALARMS_DATA: AlarmRow[] = generateAlarms(124);

export function getAlarmCounts(alarms: AlarmRow[]) {
  return {
    total: alarms.length,
    critical: alarms.filter((a) => a.severity === 'Critical').length,
    major: alarms.filter((a) => a.severity === 'Major').length,
    minor: alarms.filter((a) => a.severity === 'Minor').length,
  };
}

const columns: ColumnDef<AlarmRow>[] = [
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
    accessorKey: 'severity',
    header: ({ column }) => (
      <SortableHeader column={column}>Alarms</SortableHeader>
    ),
    sortingFn: (rowA, rowB) => {
      const order: Record<AlarmSeverity, number> = { Critical: 0, Major: 1, Minor: 2 };
      const a = order[rowA.original.severity] ?? 3;
      const b = order[rowB.original.severity] ?? 3;
      return a - b;
    },
    cell: ({ row }) => {
      const severity = row.getValue('severity') as AlarmSeverity;
      const { name: iconName, className: iconClass } = SEVERITY_ICON[severity];
      return (
        <span className="inline-flex items-center gap-2">
          <Icon name={iconName} size={18} className={`shrink-0 ${iconClass}`} />
          {severity}
        </span>
      );
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => (
      <SortableHeader column={column}>Timestamp</SortableHeader>
    ),
    cell: ({ row }) => {
      const value = row.getValue('timestamp') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate max-w-[10ch] tabular-nums text-sm">
              {value}
            </span>
          </TooltipTrigger>
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => (
      <SortableHeader column={column}>Updated</SortableHeader>
    ),
    cell: ({ row }) => {
      const value = row.getValue('updated') as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate max-w-[10ch] tabular-nums text-sm">
              {value}
            </span>
          </TooltipTrigger>
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <SortableHeader column={column}>Source</SortableHeader>
    ),
    cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} maxLength={16} />,
  },
  {
    accessorKey: 'managedObject',
    header: ({ column }) => (
      <SortableHeader column={column}>Managed object</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('managedObject') as string,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('type') as string,
    meta: { className: 'min-w-[21ch]' },
  },
  {
    accessorKey: 'ticketId',
    header: ({ column }) => (
      <SortableHeader column={column}>Ticket ID</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('ticketId') as string,
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => (
      <SortableHeader column={column}>Owner</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('owner') as string,
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
          <DropdownMenuItem>Assign ticket</DropdownMenuItem>
          <DropdownMenuItem>Acknowledge</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Clear alarm</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    meta: {
      className: 'sticky right-0 bg-card',
    },
  },
];

export function AlarmsDataTable() {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data: ALARMS_DATA,
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
    </TooltipProvider>
  );
}

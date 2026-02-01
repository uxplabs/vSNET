'use client';

import * as React from 'react';
import type { ColumnDef, ColumnFiltersState, Row } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { Button } from '@/components/ui/button';
import { DeviceLink } from '@/components/ui/device-link';
import { TooltipProvider } from '@/components/ui/tooltip';

export type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

export interface AlarmTableRow {
  id: string;
  severity: AlarmSeverity;
  timestamp: string;
  updated: string;
  source: string;
  configStatus: string;
  managedObject: string;
  type: string;
  ticket: string;
  owner: string;
}

const SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor'] as const;
const TIMESTAMP_OPTIONS = ['All', 'Last 24h', 'Last 7 days', 'Last 30 days'] as const;

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
};

const ALARMS_TABLE_DATA: AlarmTableRow[] = [
  { id: '1', severity: 'Critical', timestamp: '2025-01-27 09:12', updated: '2025-01-27 09:15', source: 'eNB-ATL-002', configStatus: 'Synchronized', managedObject: 'Cell-1', type: 'Device disconnected', ticket: 'TKT-1001', owner: 'J. Smith' },
  { id: '2', severity: 'Major', timestamp: '2025-01-27 08:45', updated: '2025-01-27 09:00', source: 'RN-LON-001', configStatus: 'Synchronized', managedObject: 'Radio-2', type: 'Link down', ticket: 'TKT-1002', owner: 'A. Jones' },
  { id: '3', severity: 'Minor', timestamp: '2025-01-27 08:30', updated: '2025-01-27 08:35', source: 'eNB-SIN-003', configStatus: 'Synchronized', managedObject: 'Cell-3', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '4', severity: 'Critical', timestamp: '2025-01-27 08:15', updated: '2025-01-27 08:20', source: 'eNB-NYC-001', configStatus: 'Synchronized', managedObject: 'Cell-4', type: 'Radio link failure', ticket: 'TKT-1003', owner: 'M. Lee' },
  { id: '5', severity: 'Major', timestamp: '2025-01-27 07:58', updated: '2025-01-27 08:10', source: 'RN-FRA-003', configStatus: 'Synchronized', managedObject: 'Radio-5', type: 'Device disconnected', ticket: 'TKT-1004', owner: 'K. Brown' },
  { id: '6', severity: 'Minor', timestamp: '2025-01-27 07:42', updated: '2025-01-27 07:45', source: 'RN-TOK-001', configStatus: 'Synchronized', managedObject: 'Radio-6', type: 'Config mismatch', ticket: '—', owner: '—' },
  { id: '7', severity: 'Major', timestamp: '2025-01-27 07:20', updated: '2025-01-27 07:30', source: 'eNB-CHI-002', configStatus: 'Synchronized', managedObject: 'Cell-7', type: 'Link down', ticket: 'TKT-1005', owner: 'J. Smith' },
  { id: '8', severity: 'Critical', timestamp: '2025-01-27 06:55', updated: '2025-01-27 07:05', source: 'eNB-MUC-002', configStatus: 'Synchronized', managedObject: 'Cell-8', type: 'Device disconnected', ticket: 'TKT-1006', owner: 'A. Jones' },
  { id: '9', severity: 'Minor', timestamp: '2025-01-27 06:30', updated: '2025-01-27 06:32', source: 'RN-HKG-002', configStatus: 'Synchronized', managedObject: 'Radio-9', type: 'Device disconnected', ticket: '—', owner: '—' },
  { id: '10', severity: 'Major', timestamp: '2025-01-27 06:10', updated: '2025-01-27 06:25', source: 'RN-ATL-005', configStatus: 'Synchronized', managedObject: 'Radio-10', type: 'Radio link failure', ticket: 'TKT-1007', owner: 'M. Lee' },
];

const columns: ColumnDef<AlarmTableRow>[] = [
  {
    accessorKey: 'severity',
    header: ({ column }) => <SortableHeader column={column}>Severity</SortableHeader>,
    sortingFn: (rowA, rowB) => {
      const order: Record<AlarmSeverity, number> = { Critical: 0, Major: 1, Minor: 2 };
      const severityA = rowA.getValue('severity') as AlarmSeverity;
      const severityB = rowB.getValue('severity') as AlarmSeverity;
      return order[severityA] - order[severityB];
    },
    cell: ({ row }) => {
      const severity = row.getValue('severity') as AlarmSeverity;
      const { name: iconName, className: iconClass } = SEVERITY_ICON[severity];
      return (
        <span className="inline-flex items-center gap-2">
          <Icon name={iconName} size={16} className={`shrink-0 ${iconClass}`} aria-hidden />
          {severity}
        </span>
      );
    },
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => <SortableHeader column={column}>Timestamp</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('timestamp')}</span>,
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => <SortableHeader column={column}>Updated</SortableHeader>,
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('updated')}</span>,
  },
  {
    accessorKey: 'source',
    header: ({ column }) => <SortableHeader column={column}>Source</SortableHeader>,
    cell: ({ row }) => <DeviceLink value={row.getValue('source') as string} />,
  },
  {
    accessorKey: 'configStatus',
    header: ({ column }) => <SortableHeader column={column}>Config status</SortableHeader>,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <Icon name="sync" size={16} className="text-muted-foreground shrink-0" aria-hidden />
        <span>Synchronized</span>
      </span>
    ),
  },
  {
    accessorKey: 'managedObject',
    header: ({ column }) => <SortableHeader column={column}>Managed object</SortableHeader>,
    cell: ({ row }) => row.getValue('managedObject') as string,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <SortableHeader column={column}>Type</SortableHeader>,
    cell: ({ row }) => <span>{row.getValue('type') as string}</span>,
  },
  {
    accessorKey: 'ticket',
    header: ({ column }) => <SortableHeader column={column}>Ticket</SortableHeader>,
    cell: ({ row }) => row.getValue('ticket') as string,
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => <SortableHeader column={column}>Owner</SortableHeader>,
    cell: ({ row }) => row.getValue('owner') as string,
  },
];

function filterBySearch(row: Row<AlarmTableRow>, _columnId: string, filterValue: string) {
  if (!filterValue) return true;
  const search = filterValue.toLowerCase();
  const data = row.original;
  return (
    data.severity.toLowerCase().includes(search) ||
    data.timestamp.toLowerCase().includes(search) ||
    data.updated.toLowerCase().includes(search) ||
    data.source.toLowerCase().includes(search) ||
    data.configStatus.toLowerCase().includes(search) ||
    data.managedObject.toLowerCase().includes(search) ||
    data.type.toLowerCase().includes(search) ||
    data.ticket.toLowerCase().includes(search) ||
    data.owner.toLowerCase().includes(search)
  );
}

export function AlarmsTableCard() {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'severity', desc: false },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('All');
  const [timestampFilter, setTimestampFilter] = React.useState<string>('All');
  const pageSize = useResponsivePageSize();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const severityCounts = React.useMemo(() => {
    const counts = { Critical: 0, Major: 0, Minor: 0 };
    ALARMS_TABLE_DATA.forEach((row) => {
      counts[row.severity]++;
    });
    return counts;
  }, []);

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (severityFilter !== 'All') filters.push({ id: 'severity', value: severityFilter });
    return filters;
  }, [severityFilter]);

  const table = useReactTable({
    data: ALARMS_TABLE_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: () => {},
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: filterBySearch,
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, globalFilter, columnFilters, pagination },
  });

  return (
    <TooltipProvider delayDuration={300}>
    <Card>
      <CardHeader>
        <CardTitle>Alarms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Icon
              name="search"
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search alarms..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Severity</span>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === 'All' 
                    ? `All (${ALARMS_TABLE_DATA.length})` 
                    : `${s} (${severityCounts[s as AlarmSeverity]})`}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Timestamp</span>
            <Select value={timestampFilter} onValueChange={setTimestampFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
            <SelectContent>
              {TIMESTAMP_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 ml-auto" aria-label="Download">
            <Icon name="download" size={18} />
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 py-3 h-12 whitespace-nowrap">
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
                      <TableCell key={cell.id} className="px-4 py-3 whitespace-nowrap">
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
        <TablePagination table={table} className="justify-end" />
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
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
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { SortableHeader } from '@/components/ui/sortable-header';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';

export interface ReportRow {
  id: string;
  report: string;
  type: string;
  task: string;
  created: string;
}

const REPORTS_DATA: ReportRow[] = [
  { id: '1', report: 'Pacific Northwest daily alarm summary', type: 'Daily', task: 'Alarm report', created: '2025-01-27 08:00' },
  { id: '2', report: 'Config backup report', type: 'Weekly', task: 'Config backup', created: '2025-01-26 02:15' },
  { id: '3', report: 'KPI sync status', type: 'Daily', task: 'KPI sync', created: '2025-01-27 06:00' },
  { id: '4', report: 'Device inventory Pacific Northwest', type: 'Weekly', task: 'Inventory sync', created: '2025-01-25 12:00' },
  { id: '5', report: 'Software update summary', type: 'Monthly', task: 'Firmware check', created: '2025-01-20 04:00' },
  { id: '6', report: 'Radio access health', type: 'Daily', task: 'Health check', created: '2025-01-27 09:15' },
  { id: '7', report: 'Certificate expiry report', type: 'Weekly', task: 'Certificate renewal check', created: '2025-01-27 03:05' },
  { id: '8', report: 'Core network performance', type: 'Daily', task: 'Report generation', created: '2025-01-27 07:30' },
  { id: '9', report: 'Log archive summary', type: 'Weekly', task: 'Log archive', created: '2025-01-26 23:45' },
  { id: '10', report: 'Edge devices status', type: 'Custom', task: 'Config sync', created: '2025-01-24 14:20' },
];

const columns: ColumnDef<ReportRow>[] = [
  {
    accessorKey: 'report',
    header: ({ column }) => (
      <SortableHeader column={column}>Report</SortableHeader>
    ),
    cell: ({ row }) => (
      <a href="#" className="font-medium text-link hover:underline" onClick={(e) => e.preventDefault()}>
        {row.getValue('report') as string}
      </a>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => row.getValue('type') as string,
  },
  {
    accessorKey: 'task',
    header: ({ column }) => (
      <SortableHeader column={column}>Task</SortableHeader>
    ),
    cell: ({ row }) => (
      <a href="#" className="font-medium text-link hover:underline" onClick={(e) => e.preventDefault()}>
        {row.getValue('task') as string}
      </a>
    ),
  },
  {
    accessorKey: 'created',
    header: ({ column }) => (
      <SortableHeader column={column}>Created</SortableHeader>
    ),
    cell: ({ row }) => <span className="tabular-nums text-sm">{row.getValue('created')}</span>,
  },
  {
    id: 'download',
    header: '',
    cell: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Download">
        <Icon name="download" size={20} />
      </Button>
    ),
    enableSorting: false,
    meta: {
      headerClassName: 'sticky right-0 bg-card',
      cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted transition-colors',
    },
  },
];

export interface ReportTableFilters {
  search?: string;
  typeFilter?: string;
  taskFilter?: string;
  createdFilter?: string;
}

function filterReports(rows: ReportRow[], filters: ReportTableFilters): ReportRow[] {
  let result = rows;
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((r) => r.report.toLowerCase().includes(q) || r.task.toLowerCase().includes(q));
  }
  if (filters.typeFilter && filters.typeFilter !== 'All') result = result.filter((r) => r.type === filters.typeFilter);
  if (filters.taskFilter && filters.taskFilter !== 'All') result = result.filter((r) => r.task === filters.taskFilter);
  return result;
}

export function getFilteredReportCount(filters: ReportTableFilters): number {
  return filterReports(REPORTS_DATA, filters).length;
}

export interface ReportsDataTableProps {
  search?: string;
  typeFilter?: string;
  taskFilter?: string;
  createdFilter?: string;
}

export function ReportsDataTable({
  search = '',
  typeFilter = 'All',
  taskFilter = 'All',
  createdFilter = 'All',
}: ReportsDataTableProps = {}) {
  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'created', desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const data = React.useMemo(
    () => filterReports(REPORTS_DATA, { search, typeFilter, taskFilter, createdFilter }),
    [search, typeFilter, taskFilter, createdFilter]
  );

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => setPagination(updater),
    state: { sorting, pagination },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`px-4 py-3 h-12 ${((header.column.columnDef.meta as { headerClassName?: string; className?: string })?.headerClassName ?? (header.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
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
                <TableRow key={row.id} className="group">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 py-3 ${((cell.column.columnDef.meta as { cellClassName?: string; className?: string })?.cellClassName ?? (cell.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
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
  );
}

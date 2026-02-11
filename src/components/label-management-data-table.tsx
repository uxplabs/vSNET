'use client';

import * as React from 'react';
import { useMemo, useEffect } from 'react';
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
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import { DeviceLink } from '@/components/ui/device-link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';

export interface LabelManagementRow {
  id: string;
  device: string;
  deviceId: string;
  region: string;
  labelGroup: string;
}

export const LABEL_MANAGEMENT_DATA: LabelManagementRow[] = [
  { id: '1', device: 'ENB-SEA-001', deviceId: 'enb-sea-001', region: 'Seattle', labelGroup: 'Production' },
  { id: '2', device: 'ENB-SEA-002', deviceId: 'enb-sea-002', region: 'Seattle', labelGroup: 'Staging' },
  { id: '3', device: 'ENB-PDX-001', deviceId: 'enb-pdx-001', region: 'Portland', labelGroup: 'Staging' },
  { id: '4', device: 'ENB-SFO-001', deviceId: 'enb-sfo-001', region: 'San Francisco', labelGroup: 'Production' },
  { id: '5', device: 'ENB-PHX-001', deviceId: 'enb-phx-001', region: 'Phoenix', labelGroup: 'Testing' },
  { id: '6', device: 'ENB-NYC-001', deviceId: 'enb-nyc-001', region: 'New York', labelGroup: 'Production' },
  { id: '7', device: 'ENB-SEA-003', deviceId: 'enb-sea-003', region: 'Seattle', labelGroup: 'Development' },
  { id: '8', device: 'ENB-PDX-002', deviceId: 'enb-pdx-002', region: 'Portland', labelGroup: 'Testing' },
  { id: '9', device: 'ENB-SFO-002', deviceId: 'enb-sfo-002', region: 'San Francisco', labelGroup: 'Production' },
  { id: '10', device: 'ENB-SEA-004', deviceId: 'enb-sea-004', region: 'Seattle', labelGroup: 'Development' },
];

const columns: ColumnDef<LabelManagementRow>[] = [
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
    enableHiding: false,
    meta: {
      headerClassName: 'sticky left-0 z-10 w-10 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  },
  {
    accessorKey: 'device',
    header: ({ column }) => <SortableHeader column={column}>Device</SortableHeader>,
    cell: ({ row }) => (
      <DeviceLink value={row.getValue('device') as string} />
    ),
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'labelGroup',
    header: ({ column }) => <SortableHeader column={column}>Group</SortableHeader>,
    cell: ({ row }) => row.getValue('labelGroup') as string,
  },
  {
    id: 'totalLabels',
    header: ({ column }) => (
      <SortableHeader column={column} className="w-full justify-end text-right">
        Total labels
      </SortableHeader>
    ),
    cell: ({ table }) => (
      <div className="text-right tabular-nums">
        {table.getRowModel().rows.length}
      </div>
    ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete">
              <Icon name="delete" size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    ),
    enableSorting: false,
    meta: {
      headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
      cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
    },
  },
];

export interface LabelManagementDataTableProps {
  data?: LabelManagementRow[];
  labelGroupFilter?: string;
  onSelectionChange?: (count: number) => void;
  clearSelectionTrigger?: number;
}

export function LabelManagementDataTable({
  data = LABEL_MANAGEMENT_DATA,
  labelGroupFilter,
  onSelectionChange,
  clearSelectionTrigger,
}: LabelManagementDataTableProps) {
  const filteredData = useMemo(() => {
    if (!labelGroupFilter) return data;
    return data.filter((row) => row.labelGroup === labelGroupFilter);
  }, [data, labelGroupFilter]);

  const pageSize = useResponsivePageSize();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const selectedCount = useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]).length,
    [rowSelection],
  );

  useEffect(() => {
    onSelectionChange?.(selectedCount);
  }, [selectedCount, onSelectionChange]);

  useEffect(() => {
    if (clearSelectionTrigger != null && clearSelectionTrigger > 0) {
      setRowSelection({});
    }
  }, [clearSelectionTrigger]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, rowSelection, pagination },
  });

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-0 gap-4">
        <div className="overflow-x-auto overflow-y-hidden rounded-lg border bg-card">
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`px-4 py-3 ${((cell.column.columnDef.meta as { cellClassName?: string; className?: string })?.cellClassName ?? (cell.column.columnDef.meta as { className?: string })?.className) ?? ''}`}
                        onClick={cell.column.id === 'select' || cell.column.id === 'actions' ? (e) => e.stopPropagation() : undefined}
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

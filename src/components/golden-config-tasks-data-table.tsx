'use client';

import * as React from 'react';
import type { ColumnDef, SortingState, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useResponsivePageSize } from '@/hooks/use-responsive-page-size';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { NodeTypeBadge } from '@/components/ui/node-type-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface GoldenConfigTaskRow {
  id: string;
  nodeType: string;
  description: string;
  lastUpdate: string;
  lastRunStatus: 'pass' | 'fail';
  lastRunDate: string;
}

export const GOLDEN_CONFIG_TASKS_DATA: GoldenConfigTaskRow[] = [
  { id: '1', nodeType: 'SN-LTE', description: 'Baseline LTE eNodeB configuration v3.2', lastUpdate: '2026-01-28', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '2', nodeType: 'SN-LTE', description: 'LTE radio parameters – band 7/28', lastUpdate: '2026-01-15', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '3', nodeType: 'CU', description: 'CU RRC connection management baseline', lastUpdate: '2026-01-22', lastRunStatus: 'fail', lastRunDate: '2026-02-03' },
  { id: '4', nodeType: 'RCP', description: 'RCP security hardening profile', lastUpdate: '2026-01-10', lastRunStatus: 'pass', lastRunDate: '2026-02-01' },
  { id: '5', nodeType: 'SN-LTE', description: 'Carrier aggregation profile CA_7A-28A', lastUpdate: '2026-02-01', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '6', nodeType: 'VCU', description: 'Virtual CU resource allocation policy', lastUpdate: '2026-01-20', lastRunStatus: 'pass', lastRunDate: '2026-01-31' },
  { id: '7', nodeType: 'SN-LTE', description: 'Neighbour relation table – region sync', lastUpdate: '2026-01-30', lastRunStatus: 'fail', lastRunDate: '2026-02-03' },
  { id: '8', nodeType: 'RCP', description: 'QoS policy template – voice priority', lastUpdate: '2026-01-18', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '9', nodeType: 'SN-LTE', description: 'eNodeB alarm threshold configuration', lastUpdate: '2026-02-02', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '10', nodeType: 'DAS', description: 'DAS head-end unit configuration', lastUpdate: '2026-01-25', lastRunStatus: 'fail', lastRunDate: '2026-02-01' },
  { id: '11', nodeType: 'SN-LTE', description: 'LTE handover parameters – inter-freq', lastUpdate: '2026-01-27', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '12', nodeType: 'CU', description: 'CU F1 interface configuration', lastUpdate: '2026-01-14', lastRunStatus: 'pass', lastRunDate: '2026-02-01' },
  { id: '13', nodeType: 'SN-LTE', description: 'PRACH configuration – high-density urban', lastUpdate: '2026-01-31', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '14', nodeType: 'VCU', description: 'VCU NFVI platform baseline', lastUpdate: '2026-01-19', lastRunStatus: 'fail', lastRunDate: '2026-02-02' },
  { id: '15', nodeType: 'SN-LTE', description: 'SON self-optimization profile', lastUpdate: '2026-02-03', lastRunStatus: 'pass', lastRunDate: '2026-02-04' },
  { id: '16', nodeType: 'RCP', description: 'Core packet gateway baseline', lastUpdate: '2026-01-22', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '17', nodeType: 'SN-LTE', description: 'MIMO antenna config – 4T4R', lastUpdate: '2026-01-26', lastRunStatus: 'pass', lastRunDate: '2026-02-02' },
  { id: '18', nodeType: 'DAS', description: 'DAS remote unit RF parameters', lastUpdate: '2026-01-20', lastRunStatus: 'pass', lastRunDate: '2026-01-31' },
  { id: '19', nodeType: 'CU', description: 'CU-UP user plane throughput profile', lastUpdate: '2026-01-29', lastRunStatus: 'pass', lastRunDate: '2026-02-03' },
  { id: '20', nodeType: 'SN-LTE', description: 'Cell reselection priority table', lastUpdate: '2026-01-17', lastRunStatus: 'fail', lastRunDate: '2026-02-01' },
];

const columns: ColumnDef<GoldenConfigTaskRow>[] = [
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
    meta: {
      headerClassName: 'sticky left-0 z-10 w-10 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      cellClassName: 'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  },
  {
    accessorKey: 'nodeType',
    header: ({ column }) => (
      <SortableHeader column={column}>Node type</SortableHeader>
    ),
    cell: ({ row }) => (
      <NodeTypeBadge type={row.getValue('nodeType') as string} />
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <SortableHeader column={column}>Description</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('description')}</span>
    ),
  },
  {
    accessorKey: 'lastUpdate',
    header: ({ column }) => (
      <SortableHeader column={column}>Last updated</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {new Date(row.getValue('lastUpdate') as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'lastRunDate',
    header: ({ column }) => (
      <SortableHeader column={column}>Last run</SortableHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {new Date(row.getValue('lastRunDate') as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </span>
    ),
  },
  {
    accessorKey: 'lastRunStatus',
    header: ({ column }) => (
      <SortableHeader column={column}>Result</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue('lastRunStatus') as string;
      return (
        <div className="flex items-center gap-1.5">
          <Icon
            name={status === 'pass' ? 'check_circle' : 'cancel'}
            size={16}
            className={status === 'pass' ? 'text-success' : 'text-destructive'}
          />
          <span className={status === 'pass' ? 'text-success' : 'text-destructive'}>
            {status === 'pass' ? 'Pass' : 'Fail'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: () => (
      <div className="flex items-center justify-end gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="more_vert" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Icon name="play_arrow" size={16} className="mr-2" />
              Run now
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="edit" size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="content_copy" size={16} className="mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Icon name="delete" size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: { className: 'w-12' },
  },
];

interface GoldenConfigTasksDataTableProps {
  onSelectionChange?: (selectedCount: number) => void;
  clearSelectionTrigger?: number;
}

export function GoldenConfigTasksDataTable({ onSelectionChange, clearSelectionTrigger }: GoldenConfigTasksDataTableProps) {
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

  const selectedCount = React.useMemo(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]).length,
    [rowSelection]
  );

  React.useEffect(() => {
    onSelectionChange?.(selectedCount);
  }, [selectedCount, onSelectionChange]);

  React.useEffect(() => {
    if (clearSelectionTrigger != null && clearSelectionTrigger > 0) {
      setRowSelection({});
    }
  }, [clearSelectionTrigger]);

  const table = useReactTable({
    data: GOLDEN_CONFIG_TASKS_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, rowSelection, pagination },
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { headerClassName?: string; className?: string } | undefined;
                  const headerClass = meta?.headerClassName ?? meta?.className;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('px-4 py-3 h-12 whitespace-nowrap', headerClass)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { cellClassName?: string; className?: string } | undefined;
                    const cellClass = meta?.cellClassName ?? meta?.className;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('px-4 py-3 overflow-hidden', cellClass)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
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
    </div>
  );
}

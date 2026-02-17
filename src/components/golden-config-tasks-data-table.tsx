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
import { Input } from '@/components/ui/input';
import { NodeTypeBadge } from '@/components/ui/node-type-badge';
import { Icon } from '@/components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface GoldenConfigTaskRow {
  id: string;
  deviceType: string;
  description: string;
  technology: 'LTE' | 'NR';
  imageConstraint: string;
  lastUpdate: string;
  passCount: number;
  failCount: number;
  lastRunDate: string;
  disabled?: boolean;
}

export const GOLDEN_CONFIG_TASKS_DATA: GoldenConfigTaskRow[] = [
  { id: '1', deviceType: 'SN', description: 'Baseline LTE eNodeB configuration v3.2', technology: 'LTE', imageConstraint: '>=2.0.5', lastUpdate: '2026-01-28', passCount: 42, failCount: 3, lastRunDate: '2026-02-03' },
  { id: '2', deviceType: 'SN', description: 'LTE radio parameters – band 7/28', technology: 'LTE', imageConstraint: '>=1.8.0', lastUpdate: '2026-01-15', passCount: 38, failCount: 0, lastRunDate: '2026-02-02' },
  { id: '3', deviceType: 'CU', description: 'CU RRC connection management baseline', technology: 'NR', imageConstraint: '>=3.1.0', lastUpdate: '2026-01-22', passCount: 12, failCount: 8, lastRunDate: '2026-02-03' },
  { id: '4', deviceType: 'RCP', description: 'RCP security hardening profile', technology: 'LTE', imageConstraint: '>=4.0.2', lastUpdate: '2026-01-10', passCount: 25, failCount: 0, lastRunDate: '2026-02-01' },
  { id: '5', deviceType: 'SN', description: 'Carrier aggregation profile CA_7A-28A', technology: 'LTE', imageConstraint: '>=2.1.0', lastUpdate: '2026-02-01', passCount: 30, failCount: 2, lastRunDate: '2026-02-03' },
  { id: '6', deviceType: 'VCU', description: 'Virtual CU resource allocation policy', technology: 'NR', imageConstraint: '>=1.5.3', lastUpdate: '2026-01-20', passCount: 18, failCount: 0, lastRunDate: '2026-01-31' },
  { id: '7', deviceType: 'SN', description: 'Neighbour relation table – region sync', technology: 'LTE', imageConstraint: '>=2.0.5', lastUpdate: '2026-01-30', passCount: 20, failCount: 15, lastRunDate: '2026-02-03' },
  { id: '8', deviceType: 'RCP', description: 'QoS policy template – voice priority', technology: 'NR', imageConstraint: '>=4.0.0', lastUpdate: '2026-01-18', passCount: 22, failCount: 1, lastRunDate: '2026-02-02' },
  { id: '9', deviceType: 'SN', description: 'eNodeB alarm threshold configuration', technology: 'LTE', imageConstraint: '>=2.2.1', lastUpdate: '2026-02-02', passCount: 45, failCount: 0, lastRunDate: '2026-02-03' },
  { id: '10', deviceType: 'DAS', description: 'DAS head-end unit configuration', technology: 'LTE', imageConstraint: '>=1.0.4', lastUpdate: '2026-01-25', passCount: 5, failCount: 10, lastRunDate: '2026-02-01', disabled: true },
  { id: '11', deviceType: 'SN', description: 'LTE handover parameters – inter-freq', technology: 'LTE', imageConstraint: '>=2.0.5', lastUpdate: '2026-01-27', passCount: 35, failCount: 1, lastRunDate: '2026-02-03' },
  { id: '12', deviceType: 'CU', description: 'CU F1 interface configuration', technology: 'NR', imageConstraint: '>=3.0.0', lastUpdate: '2026-01-14', passCount: 19, failCount: 0, lastRunDate: '2026-02-01' },
  { id: '13', deviceType: 'SN', description: 'PRACH configuration – high-density urban', technology: 'LTE', imageConstraint: '>=2.1.0', lastUpdate: '2026-01-31', passCount: 28, failCount: 0, lastRunDate: '2026-02-03' },
  { id: '14', deviceType: 'VCU', description: 'VCU NFVI platform baseline', technology: 'NR', imageConstraint: '>=1.5.0', lastUpdate: '2026-01-19', passCount: 8, failCount: 6, lastRunDate: '2026-02-02' },
  { id: '15', deviceType: 'SN', description: 'SON self-optimization profile', technology: 'NR', imageConstraint: '>=2.3.0', lastUpdate: '2026-02-03', passCount: 50, failCount: 0, lastRunDate: '2026-02-04' },
  { id: '16', deviceType: 'RCP', description: 'Core packet gateway baseline', technology: 'LTE', imageConstraint: '>=4.1.0', lastUpdate: '2026-01-22', passCount: 24, failCount: 0, lastRunDate: '2026-02-03' },
  { id: '17', deviceType: 'SN', description: 'MIMO antenna config – 4T4R', technology: 'LTE', imageConstraint: '>=2.0.5', lastUpdate: '2026-01-26', passCount: 33, failCount: 2, lastRunDate: '2026-02-02' },
  { id: '18', deviceType: 'DAS', description: 'DAS remote unit RF parameters', technology: 'LTE', imageConstraint: '>=1.0.2', lastUpdate: '2026-01-20', passCount: 14, failCount: 0, lastRunDate: '2026-01-31' },
  { id: '19', deviceType: 'CU', description: 'CU-UP user plane throughput profile', technology: 'NR', imageConstraint: '>=3.1.2', lastUpdate: '2026-01-29', passCount: 21, failCount: 0, lastRunDate: '2026-02-03' },
  { id: '20', deviceType: 'SN', description: 'Cell reselection priority table', technology: 'LTE', imageConstraint: '>=1.9.0', lastUpdate: '2026-01-17', passCount: 10, failCount: 12, lastRunDate: '2026-02-01' },
];

/* Editable description cell */
function DescriptionCell({ value, disabled }: { value: string; disabled?: boolean }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="h-8 text-sm font-medium -my-1"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && setEditing(true)}
      className={cn(
        'group/desc flex items-center gap-1.5 text-left font-medium w-full',
        disabled && 'pointer-events-none'
      )}
    >
      <span className="truncate">{value}</span>
      {!disabled && (
        <Icon
          name="edit"
          size={14}
          className="shrink-0 text-muted-foreground opacity-0 group-hover/desc:opacity-100 transition-opacity"
        />
      )}
    </button>
  );
}

function getColumns(onToggleDisabled: (id: string) => void, disabledRows: Set<string>): ColumnDef<GoldenConfigTaskRow>[] {
  return [
    {
      accessorKey: 'deviceType',
      header: ({ column }) => (
        <SortableHeader column={column}>Device type</SortableHeader>
      ),
      cell: ({ row }) => (
        <NodeTypeBadge type={row.getValue('deviceType') as string} />
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <SortableHeader column={column}>Description</SortableHeader>
      ),
      cell: ({ row }) => (
        <DescriptionCell
          value={row.getValue('description')}
          disabled={disabledRows.has(row.original.id)}
        />
      ),
    },
    {
      accessorKey: 'technology',
      header: ({ column }) => (
        <SortableHeader column={column}>Technology</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('technology')}</span>
      ),
    },
    {
      accessorKey: 'imageConstraint',
      header: ({ column }) => (
        <SortableHeader column={column}>Image constraint</SortableHeader>
      ),
      cell: ({ row }) => (
        <code className="text-sm tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {row.getValue('imageConstraint')}
        </code>
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
      id: 'results',
      header: ({ column }) => (
        <SortableHeader column={column}>Results</SortableHeader>
      ),
      accessorFn: (row) => row.passCount + row.failCount,
      cell: ({ row }) => {
        const { passCount, failCount } = row.original;
        if (disabledRows.has(row.original.id)) return null;
        return (
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 text-success">
                  <Icon name="check_circle" size={16} />
                  <span className="tabular-nums text-sm">{passCount}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{passCount} passed</TooltipContent>
            </Tooltip>
            {failCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 text-destructive">
                    <Icon name="cancel" size={16} />
                    <span className="tabular-nums text-sm">{failCount}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{failCount} failed</TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isDisabled = disabledRows.has(row.original.id);
        return (
          <div className="flex items-center justify-end gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Icon name="more_vert" size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggleDisabled(row.original.id)}>
                  <Icon name={isDisabled ? 'check_circle' : 'block'} size={16} className="mr-2" />
                  {isDisabled ? 'Enable' : 'Disable'}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Icon name="delete" size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      meta: { className: 'w-12' },
    },
  ];
}

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

  // Track disabled rows – initialise from data
  const [disabledRows, setDisabledRows] = React.useState<Set<string>>(() => {
    const init = new Set<string>();
    for (const row of GOLDEN_CONFIG_TASKS_DATA) {
      if (row.disabled) init.add(row.id);
    }
    return init;
  });

  const handleToggleDisabled = React.useCallback((id: string) => {
    setDisabledRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const columns = React.useMemo(
    () => getColumns(handleToggleDisabled, disabledRows),
    [handleToggleDisabled, disabledRows]
  );

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
              table.getRowModel().rows.map((row) => {
                const isRowDisabled = disabledRows.has(row.original.id);
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn('group', isRowDisabled && 'opacity-50')}
                  >
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
                );
              })
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

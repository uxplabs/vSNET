'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface AccessControlProfileTableRow {
  id: string;
  name: string;
  regionsAll: boolean;
  regionsCount: number;
  regionsList: string[];
  adminOperationsList: string[];
  applicationOperationsList: string[];
}

function StackedList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <ul className="m-0 max-w-[min(28rem,50vw)] list-none space-y-1 py-0.5 text-sm leading-snug text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

const stackedCellMeta = {
  cellClassName: 'align-top',
  headerClassName: 'align-top',
} as const;

function buildColumns(
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<AccessControlProfileTableRow>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Profile</SortableHeader>,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue('name') as string}</span>,
      meta: { cellClassName: 'align-top' },
    },
    {
      id: 'regions',
      accessorFn: (row) =>
        row.regionsAll ? `ALL:${row.regionsCount}` : row.regionsList.join('\u0001'),
      header: ({ column }) => <SortableHeader column={column}>Regions</SortableHeader>,
      cell: ({ row }) => {
        const r = row.original;
        if (r.regionsAll) {
          return (
            <Badge variant="secondary" className="shrink-0 font-normal tabular-nums">
              All regions ({r.regionsCount})
            </Badge>
          );
        }
        return <StackedList items={r.regionsList} />;
      },
      meta: stackedCellMeta,
    },
    {
      id: 'adminOperations',
      accessorFn: (row) => row.adminOperationsList.join('\u0001'),
      header: ({ column }) => <SortableHeader column={column}>Admin operations</SortableHeader>,
      cell: ({ row }) => <StackedList items={row.original.adminOperationsList} />,
      meta: stackedCellMeta,
    },
    {
      id: 'applicationOperations',
      accessorFn: (row) => row.applicationOperationsList.join('\u0001'),
      header: ({ column }) => <SortableHeader column={column}>Application operations</SortableHeader>,
      cell: ({ row }) => <StackedList items={row.original.applicationOperationsList} />,
      meta: stackedCellMeta,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                <Icon name="more_vert" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  onEdit(row.original.id);
                }}
              >
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  onDelete(row.original.id);
                }}
              >
                Delete profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right w-14 min-w-[3.5rem]',
        cellClassName:
          'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right w-14 min-w-[3.5rem] align-top',
      },
    },
  ];
}

export interface AccessControlProfilesDataTableProps {
  data: AccessControlProfileTableRow[];
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
}

export function AccessControlProfilesDataTable({ data, onEdit, onDelete }: AccessControlProfilesDataTableProps) {
  const columns = React.useMemo(() => buildColumns(onEdit, onDelete), [onEdit, onDelete]);
  return (
    <TooltipProvider delayDuration={300}>
      <DataTable columns={columns} data={data} getRowId={(row) => row.id} />
    </TooltipProvider>
  );
}

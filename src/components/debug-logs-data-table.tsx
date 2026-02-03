'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';

export interface DebugLogRow {
  fileName: string;
  date: string;
}

export const DEBUG_LOGS_DATA: DebugLogRow[] = [
  { fileName: 'system_2025-01-27.log', date: 'Jan 27, 2025 2:45 PM' },
  { fileName: 'radio_2025-01-27.log', date: 'Jan 27, 2025 2:30 PM' },
  { fileName: 'core_2025-01-27.log', date: 'Jan 27, 2025 1:15 PM' },
  { fileName: 'system_2025-01-26.log', date: 'Jan 26, 2025 11:00 PM' },
  { fileName: 'radio_2025-01-26.log', date: 'Jan 26, 2025 10:45 PM' },
  { fileName: 'core_2025-01-26.log', date: 'Jan 26, 2025 9:20 PM' },
];

const columns: ColumnDef<DebugLogRow>[] = [
  {
    accessorKey: 'fileName',
    header: ({ column }) => <SortableHeader column={column}>File name</SortableHeader>,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('fileName') as string}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{row.getValue('date') as string}</span>
    ),
  },
];

export function DebugLogsDataTable() {
  return <DataTable columns={columns} data={DEBUG_LOGS_DATA} />;
}

'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { DeviceLink } from './ui/device-link';
import { TablePagination } from './ui/table-pagination';
import { toast } from 'sonner';
import { DEVICES_DATA } from './devices-data-table';
import type { DeviceRow } from './devices-data-table';

const REGION_OPTIONS = ['All', 'Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York'] as const;
const GROUP_OPTIONS = ['All', 'Production', 'Staging', 'Testing', 'Development'] as const;

/** Map device name prefix to region for filter. */
const PREFIX_TO_REGION: Record<string, string> = {
  SEA: 'Seattle',
  PDX: 'Portland',
  SFO: 'San Francisco',
  PHX: 'Phoenix',
  LAS: 'Phoenix',
  NYC: 'New York',
  DEN: 'Phoenix',
  CHI: 'New York',
  ATL: 'New York',
  MIA: 'New York',
  BOS: 'New York',
  AUS: 'Phoenix',
};

/** Map deviceGroup to label group for filter. */
const DEVICE_GROUP_TO_LABEL: Record<string, string> = {
  'Core network': 'Production',
  'Radio access': 'Production',
  'Edge devices': 'Staging',
  'Test environment': 'Testing',
};

export interface AddableDeviceRow {
  id: string;
  device: string;
  deviceId: string;
  region: string;
  labelGroup: string;
}

function deviceToAddable(d: DeviceRow): AddableDeviceRow {
  const prefix = d.device.split('-')[1]?.toUpperCase() ?? '';
  const region = PREFIX_TO_REGION[prefix] ?? 'New York';
  const labelGroup = DEVICE_GROUP_TO_LABEL[d.deviceGroup] ?? 'Production';
  return {
    id: d.id,
    device: d.device,
    deviceId: d.device.toLowerCase(),
    region,
    labelGroup,
  };
}

/** All devices available in the account (from DEVICES_DATA). */
const ADDABLE_DEVICES: AddableDeviceRow[] = DEVICES_DATA.map(deviceToAddable);

const columns: ColumnDef<AddableDeviceRow>[] = [
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
      headerClassName: 'sticky left-0 z-10 w-10 px-2 py-3 bg-card shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
      cellClassName: 'sticky left-0 z-10 w-10 px-2 py-3 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
    },
  },
  {
    accessorKey: 'device',
    header: 'Device',
    cell: ({ row }) => (
      <DeviceLink value={row.getValue('device') as string} />
    ),
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ row }) => row.getValue('region') as string,
  },
  {
    accessorKey: 'labelGroup',
    header: 'Group',
    cell: ({ row }) => row.getValue('labelGroup') as string,
  },
];

export interface AddDeviceToLabelSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The label group to add devices to (e.g. "Production") */
  labelName: string;
  /** Callback when user saves with selected devices (receives device rows to add to the label) */
  onAdd?: (devices: AddableDeviceRow[]) => void;
}

export function AddDeviceToLabelSheet({
  open,
  onOpenChange,
  labelName,
  onAdd,
}: AddDeviceToLabelSheetProps) {
  const [search, setSearch] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState<string>('All');
  const [groupFilter, setGroupFilter] = React.useState<string>('All');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

  const ROW_HEIGHT = 48;
  const TABLE_HEADER_HEIGHT = 44;

  const measurePageSize = React.useCallback((el: HTMLDivElement | null) => {
    if (!el || !open) return;
    const h = el.getBoundingClientRect().height;
    if (h > 60) {
      const rows = Math.max(1, Math.floor((h - TABLE_HEADER_HEIGHT) / ROW_HEIGHT));
      setPageSize(rows);
    }
  }, [open]);

  const setContainerRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (el && open) {
        const measure = () => measurePageSize(el);
        measure();
        requestAnimationFrame(measure);
        const t = setTimeout(measure, 600);
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        resizeObserverRef.current = ro;
        return () => {
          clearTimeout(t);
          ro.disconnect();
        };
      }
    },
    [open, measurePageSize]
  );

  React.useEffect(() => {
    if (!open && resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, [open]);

  const filteredData = React.useMemo(() => {
    let list = [...ADDABLE_DEVICES];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.device.toLowerCase().includes(q) ||
          r.deviceId.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          r.labelGroup.toLowerCase().includes(q)
      );
    }
    if (regionFilter && regionFilter !== 'All') {
      list = list.filter((r) => r.region === regionFilter);
    }
    if (groupFilter && groupFilter !== 'All') {
      list = list.filter((r) => r.labelGroup === groupFilter);
    }
    return list;
  }, [search, regionFilter, groupFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (originalRow) => originalRow.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
    },
    state: {
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
  });

  const selectedIds = React.useMemo(() => {
    const rows = table.getFilteredSelectedRowModel().rows;
    return rows.map((r) => r.original.id);
  }, [rowSelection, filteredData]);

  const handleSave = React.useCallback(() => {
    const rows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
    const count = rows.length;
    onAdd?.(rows);
    setRowSelection({});
    onOpenChange(false);
    toast.success(
      count === 1
        ? `1 device added to ${labelName}`
        : `${count} devices added to ${labelName}`
    );
  }, [onAdd, table, onOpenChange, labelName]);

  const handleCancel = React.useCallback(() => {
    setRowSelection({});
    onOpenChange(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (open) setPageIndex(0);
  }, [open]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setRowSelection({});
        setSearch('');
        setRegionFilter('All');
        setGroupFilter('All');
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl flex flex-col h-full">
        <SheetHeader className="shrink-0">
          <SheetTitle>Add device to {labelName}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4 flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="relative flex-1 min-w-[180px]">
              <Icon
                name="search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search devices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <FilterSelect value={regionFilter} onValueChange={setRegionFilter} label="Region" options={[...REGION_OPTIONS]} className="w-[120px]" />
            <FilterSelect value={groupFilter} onValueChange={setGroupFilter} label="Group" options={[...GROUP_OPTIONS]} className="w-[120px]" />
          </div>

          <div
            ref={setContainerRef}
            className="flex-1 min-h-0 rounded-lg border overflow-hidden flex flex-col"
          >
            <Table className="w-full table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => {
                      const meta = h.column.columnDef.meta as { className?: string } | undefined;
                      const headerClass = meta?.className ?? 'px-4 py-3 whitespace-nowrap';
                      return (
                        <TableHead
                          key={h.id}
                          className={`${headerClass} h-11`}
                        >
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                        const cellClass = meta?.className ?? 'px-4 py-3';
                        return (
                          <TableCell key={cell.id} className={cellClass}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No devices match.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination table={table} className="shrink-0 justify-end py-2" />
        </div>

        <SheetFooter className="shrink-0 flex flex-row gap-2 sm:justify-end border-t pt-4 mt-auto">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedIds.length === 0}>
            {selectedIds.length > 0 ? `Add ${selectedIds.length} device${selectedIds.length === 1 ? '' : 's'}` : 'Add'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

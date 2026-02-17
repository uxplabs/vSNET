'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/ui/table-pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeviceLink } from '@/components/ui/device-link';
import { ALARM_TYPE_CONFIG } from './devices-data-table';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

// ── Types ──────────────────────────────────────────────────────

export interface InventoryRow {
  id: string;
  radioNode: string;
  nrCell: string;
  region: string;
  description: string;
  host: string;
  status: 'Up' | 'Down';
  enabled: boolean;
  alarms: number;
  alarmType: 'Critical' | 'Major' | 'Minor' | 'None';
  nrCells: string[];
  ethernetId: string;
  model: string;
  serialNumber: string;
  zones: string[];
  dlBandwidth: string;
  type: 'Radio node' | 'NR cell';
  technology: 'LTE' | 'NR';
  version: string;
}

// ── Mock data ──────────────────────────────────────────────────

const MODELS = ['AIR 6449', 'AIR 6419', 'AIR 3246', 'AIR 1281', 'RBS 6601', 'RBS 6301'];
const VERSIONS = ['v3.1.0', 'v3.0.2', 'v2.9.4', 'v3.2.1', 'v2.8.0'];
const DL_BANDWIDTHS = ['5 MHz', '10 MHz', '15 MHz', '20 MHz', '40 MHz', '50 MHz', '100 MHz'];
const ZONE_DESCRIPTIONS = ['North sector primary', 'South sector primary', 'East sector overlay', 'West sector primary', 'Central sector primary', 'Edge sector primary'];
const HOST_DEVICES = [
  'eNB-SEA-001', 'eNB-PDX-002', 'RN-PHX-003', 'eNB-SFO-004', 'RN-LAS-005',
  'eNB-NYC-006', 'RN-DEN-007', 'eNB-CHI-008', 'RN-ATL-009', 'eNB-MIA-010',
  'RN-SEA-011', 'eNB-PHX-012', 'RN-SFO-013', 'eNB-LAS-014', 'RN-NYC-015',
  'eNB-DEN-016', 'RN-CHI-017', 'eNB-BOS-018', 'RN-MIA-019', 'eNB-AUS-020',
  'eNB-SEA-021', 'RN-PDX-022', 'eNB-PHX-023', 'RN-SFO-024', 'eNB-LAS-025',
  'RN-NYC-026', 'eNB-DEN-027', 'RN-CHI-028', 'eNB-ATL-029', 'RN-MIA-030',
  'eNB-AUS-031', 'RN-SEA-032', 'eNB-PDX-033', 'RN-PHX-034', 'eNB-SFO-035',
  'RN-LAS-036', 'eNB-NYC-037', 'RN-DEN-038', 'eNB-CHI-039', 'RN-ATL-040',
  'eNB-MIA-041', 'RN-AUS-042', 'eNB-BOS-043', 'RN-SEA-044', 'eNB-PDX-045',
  'RN-PHX-046', 'eNB-SFO-047', 'RN-LAS-048', 'eNB-NYC-049', 'RN-DEN-050',
  'eNB-CHI-051', 'RN-ATL-052', 'eNB-MIA-053', 'RN-AUS-054', 'eNB-BOS-055',
  'RN-SEA-056', 'eNB-PDX-057', 'RN-PHX-058', 'eNB-SFO-059', 'RN-LAS-060',
];
const DESCRIPTIONS = [
  'Primary macro sector A',
  'Secondary sector B',
  'Urban micro cell',
  'Highway coverage',
  'Indoor DAS node',
  'Rural macro site',
  'Dense urban overlay',
  'Suburban coverage',
  'Enterprise campus',
  'Stadium sector',
  'Transport corridor',
  'Waterfront site',
];

function generateInventoryData(): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const alarmTypes: Array<'Critical' | 'Major' | 'Minor' | 'None'> = ['None', 'None', 'None', 'Minor', 'Major', 'Critical', 'None', 'None'];

  for (let i = 1; i <= 900; i++) {
    const alarmType = alarmTypes[i % alarmTypes.length];
    const alarmHash = ((i * 1597334677) >>> 0) % 100;
    const alarms = alarmType === 'None' ? 0 : alarmType === 'Minor' ? 1 : alarmType === 'Major' ? (alarmHash % 3) + 1 : (alarmHash % 5) + 1;
    const region = NORTH_AMERICAN_REGIONS[(i - 1) % NORTH_AMERICAN_REGIONS.length];
    const serialHash = ((i * 2654435761) >>> 0);
    const serialNumber = `SN${String(serialHash % 10000000).padStart(7, '0')}`;
    const zones: string[] = [
      `NR-${String(i * 2 - 1).padStart(3, '0')}`,
      `NR-${String(i * 2).padStart(3, '0')}`,
    ];
    rows.push({
      id: `inv-${i}`,
      radioNode: `RN-${String(i).padStart(4, '0')}`,
      nrCell: `NRC-${String(i).padStart(4, '0')}`,
      region,
      description: DESCRIPTIONS[(i - 1) % DESCRIPTIONS.length],
      host: HOST_DEVICES[(i - 1) % HOST_DEVICES.length],
      status: i % 7 === 0 ? 'Down' : 'Up',
      enabled: i % 9 !== 0,
      alarms,
      alarmType,
      nrCells: [`NR-${String(i * 2 - 1).padStart(4, '0')}`, `NR-${String(i * 2).padStart(4, '0')}`],
      ethernetId: `00:1a:2b:${String((i * 3) % 256).padStart(2, '0')}:${String((i * 7) % 256).padStart(2, '0')}:${String((i * 11) % 256).padStart(2, '0')}`,
      model: MODELS[i % MODELS.length],
      serialNumber,
      zones,
      dlBandwidth: DL_BANDWIDTHS[i % DL_BANDWIDTHS.length],
      type: i % 5 === 0 ? 'NR cell' : 'Radio node',
      technology: i % 3 === 0 ? 'NR' : 'LTE',
      version: VERSIONS[i % VERSIONS.length],
    });
  }
  return rows;
}

export const INVENTORY_DATA: InventoryRow[] = generateInventoryData();

// ── Filter options ─────────────────────────────────────────────

export const INVENTORY_STATUS_OPTIONS = ['All', 'Up', 'Down'] as const;
export const INVENTORY_TECHNOLOGY_OPTIONS = ['All', 'LTE', 'NR'] as const;
export const INVENTORY_MODEL_OPTIONS = ['All', ...MODELS] as const;
export const INVENTORY_VERSION_OPTIONS = ['All', ...VERSIONS] as const;
export const INVENTORY_ALARM_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'None'] as const;

// ── Filtered count helper ──────────────────────────────────────

export function getFilteredInventoryCount(opts: {
  search: string;
  viewFilter: string;
  statusFilter: string;
  technologyFilter: string;
  modelFilter: string;
  versionFilter: string;
  alarmFilter: string;
  selectedRegions?: string[];
}): number {
  return INVENTORY_DATA.filter((row) => {
    if (opts.selectedRegions && opts.selectedRegions.length > 0 && !opts.selectedRegions.includes('All') && !opts.selectedRegions.includes(row.region)) return false;
    if (opts.viewFilter === 'radio-nodes' && row.type !== 'Radio node') return false;
    if (opts.viewFilter === 'cells' && row.type !== 'NR cell') return false;
    if (opts.statusFilter !== 'All' && row.status !== opts.statusFilter) return false;
    if (opts.technologyFilter !== 'All' && row.technology !== opts.technologyFilter) return false;
    if (opts.modelFilter !== 'All' && row.model !== opts.modelFilter) return false;
    if (opts.versionFilter !== 'All' && row.version !== opts.versionFilter) return false;
    if (opts.alarmFilter !== 'All' && row.alarmType !== opts.alarmFilter) return false;
    if (opts.search.trim()) {
      const q = opts.search.toLowerCase();
      return (
        row.radioNode.toLowerCase().includes(q) ||
        row.region.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        row.host.toLowerCase().includes(q) ||
        row.model.toLowerCase().includes(q) ||
        row.serialNumber.toLowerCase().includes(q) ||
        row.ethernetId.toLowerCase().includes(q)
      );
    }
    return true;
  }).length;
}

// ── Truncated description cell ──────────────────────────────────

function TruncatedDescriptionCell({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el.closest('td') ?? el);
    return () => ro.disconnect();
  }, [value]);

  const content = (
    <span ref={ref} className="block truncate max-w-[14rem] text-muted-foreground">
      {value}
    </span>
  );

  if (!isTruncated) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">{value}</TooltipContent>
    </Tooltip>
  );
}

// ── Shared column helpers ────────────────────────────────────────

const selectColumn: ColumnDef<InventoryRow> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
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
};

const actionsColumn: ColumnDef<InventoryRow> = {
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
    headerClassName: 'sticky right-0 bg-card w-14',
    cellClassName: 'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors w-14',
  },
};

// ── Columns ────────────────────────────────────────────────────

function getColumns(viewFilter: string): ColumnDef<InventoryRow>[] {
  if (viewFilter === 'cells') {
    return [
      selectColumn,
      {
        accessorKey: 'nrCell',
        header: ({ column }) => <SortableHeader column={column}>Cell</SortableHeader>,
        cell: ({ row }) => <DeviceLink value={row.getValue('nrCell') as string} maxLength={20} />,
      },
      {
        accessorKey: 'technology',
        header: ({ column }) => <SortableHeader column={column}>Technology</SortableHeader>,
        cell: ({ row }) => <span className="text-sm">{row.getValue('technology') as string}</span>,
      },
      {
        accessorKey: 'region',
        header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
        cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue('region') as string}</span>,
      },
      {
        accessorKey: 'description',
        header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
        cell: ({ row }) => <TruncatedDescriptionCell value={row.getValue('description') as string} />,
        meta: { className: 'max-w-[14rem]' },
      },
      {
        accessorKey: 'host',
        header: ({ column }) => <SortableHeader column={column}>Host</SortableHeader>,
        cell: ({ row }) => <DeviceLink value={row.getValue('host') as string} maxLength={24} />,
      },
      {
        accessorKey: 'radioNode',
        header: ({ column }) => <SortableHeader column={column}>Radio node</SortableHeader>,
        cell: ({ row }) => <DeviceLink value={row.getValue('radioNode') as string} maxLength={20} />,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <span className={`inline-flex items-center gap-1.5 text-sm ${status === 'Up' ? 'text-success' : 'text-destructive'}`}>
              <span className={`h-2 w-2 rounded-full ${status === 'Up' ? 'bg-success' : 'bg-destructive'}`} />
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'enabled',
        header: ({ column }) => <SortableHeader column={column}>Enabled</SortableHeader>,
        cell: ({ row }) => {
          const enabled = row.getValue('enabled') as boolean;
          return <Icon name={enabled ? 'check_circle' : 'cancel'} size={18} className={enabled ? 'text-success' : 'text-muted-foreground'} />;
        },
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
          if (alarms === 0) return <span className="text-muted-foreground tabular-nums">0</span>;
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
        accessorKey: 'zones',
        header: ({ column }) => <SortableHeader column={column}>Zones</SortableHeader>,
        cell: ({ row }) => {
          const zoneList = row.getValue('zones') as string[];
          return (
            <div className="flex flex-col gap-0.5">
              {zoneList.map((z) => (
                <span key={z} className="font-mono text-xs text-muted-foreground">{z}</span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'dlBandwidth',
        header: ({ column }) => <SortableHeader column={column}>DL bandwidth</SortableHeader>,
        cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue('dlBandwidth') as string}</span>,
      },
      {
        accessorKey: 'serialNumber',
        header: ({ column }) => <SortableHeader column={column}>Serial number</SortableHeader>,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('serialNumber') as string}</span>,
      },
      actionsColumn,
    ];
  }

  // Radio nodes columns (default)
  return [
    selectColumn,
    {
      accessorKey: 'radioNode',
      header: ({ column }) => <SortableHeader column={column}>Radio node</SortableHeader>,
      cell: ({ row }) => (
        <DeviceLink value={row.getValue('radioNode') as string} maxLength={20} />
      ),
    },
    {
      accessorKey: 'region',
      header: ({ column }) => <SortableHeader column={column}>Region</SortableHeader>,
      cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue('region') as string}</span>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
      cell: ({ row }) => <TruncatedDescriptionCell value={row.getValue('description') as string} />,
      meta: { className: 'max-w-[14rem]' },
    },
    {
      accessorKey: 'host',
      header: ({ column }) => <SortableHeader column={column}>Host</SortableHeader>,
      cell: ({ row }) => (
        <DeviceLink
          value={row.getValue('host') as string}
          maxLength={24}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={`inline-flex items-center gap-1.5 text-sm ${status === 'Up' ? 'text-success' : 'text-destructive'}`}>
            <span className={`h-2 w-2 rounded-full ${status === 'Up' ? 'bg-success' : 'bg-destructive'}`} />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'enabled',
      header: ({ column }) => <SortableHeader column={column}>Enabled</SortableHeader>,
      cell: ({ row }) => {
        const enabled = row.getValue('enabled') as boolean;
        return (
          <Icon
            name={enabled ? 'check_circle' : 'cancel'}
            size={18}
            className={enabled ? 'text-success' : 'text-muted-foreground'}
          />
        );
      },
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
        if (alarms === 0) return <span className="text-muted-foreground tabular-nums">0</span>;
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
      accessorKey: 'nrCells',
      header: ({ column }) => <SortableHeader column={column}>NR cells</SortableHeader>,
      cell: ({ row }) => {
        const cells = row.getValue('nrCells') as string[];
        return (
          <div className="flex flex-col gap-0.5">
            {cells.map((c) => (
              <DeviceLink key={c} value={c} />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'ethernetId',
      header: ({ column }) => <SortableHeader column={column}>Ethernet ID</SortableHeader>,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.getValue('ethernetId') as string}</span>
      ),
    },
    {
      accessorKey: 'model',
      header: ({ column }) => <SortableHeader column={column}>Model</SortableHeader>,
      cell: ({ row }) => row.getValue('model') as string,
    },
    {
      accessorKey: 'serialNumber',
      header: ({ column }) => <SortableHeader column={column}>Serial number</SortableHeader>,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('serialNumber') as string}</span>,
    },
    actionsColumn,
  ];
}

// ── Component ──────────────────────────────────────────────────

export interface InventoryDataTableProps {
  search?: string;
  viewFilter?: string;
  statusFilter?: string;
  technologyFilter?: string;
  modelFilter?: string;
  versionFilter?: string;
  alarmFilter?: string;
  selectedRegions?: string[];
}

export function InventoryDataTable({
  search = '',
  viewFilter = 'all',
  statusFilter = 'All',
  technologyFilter = 'All',
  modelFilter = 'All',
  versionFilter = 'All',
  alarmFilter = 'All',
  selectedRegions,
}: InventoryDataTableProps) {
  const columns = React.useMemo(() => getColumns(viewFilter), [viewFilter]);

  const filteredData = React.useMemo(() => {
    return INVENTORY_DATA.filter((row) => {
      if (selectedRegions && selectedRegions.length > 0 && !selectedRegions.includes('All') && !selectedRegions.includes(row.region)) return false;
      if (viewFilter === 'radio-nodes' && row.type !== 'Radio node') return false;
      if (viewFilter === 'cells' && row.type !== 'NR cell') return false;
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (technologyFilter !== 'All' && row.technology !== technologyFilter) return false;
      if (modelFilter !== 'All' && row.model !== modelFilter) return false;
      if (versionFilter !== 'All' && row.version !== versionFilter) return false;
      if (alarmFilter !== 'All' && row.alarmType !== alarmFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          row.radioNode.toLowerCase().includes(q) ||
          row.region.toLowerCase().includes(q) ||
          row.description.toLowerCase().includes(q) ||
          row.host.toLowerCase().includes(q) ||
          row.model.toLowerCase().includes(q) ||
          row.serialNumber.toLowerCase().includes(q) ||
          row.ethernetId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, viewFilter, statusFilter, technologyFilter, modelFilter, versionFilter, alarmFilter, selectedRegions]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, rowSelection, pagination },
  });

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
      <div className="overflow-x-auto rounded-lg border bg-card flex-1 min-h-0">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="group">
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
    </TooltipProvider>
  );
}

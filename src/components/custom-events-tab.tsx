'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Icon } from '@/components/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomEventSheet } from '@/components/custom-event-sheet';
import {
  createDraftCustomEventRow,
  type CustomFaultEventRow,
} from '@/components/custom-events-model';

export function CustomEventsTab() {
  const [rows, setRows] = useState<CustomFaultEventRow[]>([]);
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState<CustomFaultEventRow | null>(null);
  const [addingRow, setAddingRow] = useState<CustomFaultEventRow | null>(null);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.pattern.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const activeFilters = useMemo(() => {
    if (!search.trim()) return [];
    return [
      {
        key: 'search',
        label: `Search: "${search.trim()}"`,
        onClear: () => setSearch(''),
      },
    ];
  }, [search]);

  const columns: ColumnDef<CustomFaultEventRow>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.getValue('name') as string}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: ({ column }) => <SortableHeader column={column}>Description</SortableHeader>,
        cell: ({ row }) => (
          <span className="text-sm text-foreground line-clamp-2 max-w-md">
            {row.original.description || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'pattern',
        header: ({ column }) => <SortableHeader column={column}>Pattern</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-foreground">{row.original.pattern}</span>
        ),
      },
      {
        id: 'regex',
        header: ({ column }) => <SortableHeader column={column}>Regex</SortableHeader>,
        accessorFn: (r) => r.regex,
        cell: ({ row }) =>
          row.original.regex ? (
            <Badge variant="secondary" className="font-normal">
              Yes
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">No</span>
          ),
      },
      {
        id: 'matchCase',
        header: ({ column }) => <SortableHeader column={column}>Match case</SortableHeader>,
        accessorFn: (r) => r.matchCase,
        cell: ({ row }) =>
          row.original.matchCase ? (
            <Badge variant="secondary" className="font-normal">
              Yes
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">No</span>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Row actions">
                  <Icon name="more_vert" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditingRow(row.original)}>
                  <Icon name="edit" size={16} className="mr-2 opacity-70" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onSelect={() => {
                    const id = row.original.id;
                    setRows((p) => p.filter((r) => r.id !== id));
                    setEditingRow((cur) => (cur?.id === id ? null : cur));
                    toast.success('Custom event removed');
                  }}
                >
                  <Icon name="delete" size={16} className="mr-2 opacity-70" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        enableSorting: false,
        meta: {
          headerClassName: 'sticky right-0 bg-card shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
          cellClassName:
            'sticky right-0 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.1)] text-right',
        },
      },
    ],
    [],
  );

  const handleSave = useCallback((updated: CustomFaultEventRow) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.id === updated.id);
      if (i === -1) return [...prev, updated];
      const next = [...prev];
      next[i] = updated;
      return next;
    });
    toast.success('Custom event saved');
  }, []);

  const handleAddSave = useCallback((updated: CustomFaultEventRow) => {
    setRows((p) => [...p, updated]);
    toast.success('Custom event added');
  }, []);

  const openAdd = useCallback(() => {
    setAddingRow(createDraftCustomEventRow());
  }, []);

  return (
    <>
      <div className="flex flex-col min-w-0 space-y-4">
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
            <SearchInput
              size="md"
              wrapperClassName="w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]"
              placeholder="Search custom events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="button" className="ml-auto shrink-0" aria-label="Add event" onClick={openAdd}>
              <Icon name="add" size={16} className="mr-1.5" />
              Add Event
            </Button>
          </div>
        )}
        {rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
            <span className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
            </span>
            {activeFilters.map((f) => (
              <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                {f.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                  onClick={f.onClear}
                  aria-label={`Clear ${f.label}`}
                >
                  <Icon name="close" size={12} aria-hidden />
                </Button>
              </Badge>
            ))}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSearch('')}
              >
                Clear all
              </Button>
            )}
          </div>
        )}
        {rows.length === 0 ? (
          <div className="flex justify-center">
            <div className="rounded-lg border bg-card p-8 text-center max-w-sm w-full shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon name="event_note" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No custom events yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a custom event to define a name, pattern, and matching options.
              </p>
              <Button type="button" size="sm" onClick={openAdd}>
                <Icon name="add" size={16} className="mr-1.5" />
                Add Event
              </Button>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} getRowId={(r) => r.id} />
        )}
      </div>

      <CustomEventSheet
        key={addingRow ? 'add' : editingRow?.id ?? 'closed'}
        open={addingRow !== null || editingRow !== null}
        onOpenChange={(next) => {
          if (!next) {
            setAddingRow(null);
            setEditingRow(null);
          }
        }}
        mode={addingRow ? 'add' : 'edit'}
        row={(addingRow ?? editingRow) ?? createDraftCustomEventRow()}
        onSave={addingRow ? handleAddSave : handleSave}
      />
    </>
  );
}

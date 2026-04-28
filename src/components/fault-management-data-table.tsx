'use client';

/* eslint-disable react-refresh/only-export-components -- re-exports fault model alongside FaultManagementDataTable */

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { FilterSelect } from '@/components/ui/filter-select';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaultEventEditSheet } from '@/components/fault-event-edit-sheet';
import {
  createDraftFaultEventRow,
  FAULT_EVENTS_CATEGORY_FILTER_OPTIONS,
  FAULT_EVENTS_EMAIL_FILTER_OPTIONS,
  FAULT_EVENTS_SEVERITY_FILTER_OPTIONS,
  FAULT_EVENTS_SNMP_FILTER_OPTIONS,
  type FaultManagementEmailForward,
  type FaultManagementRow,
  FAULT_MANAGEMENT_DATA,
} from '@/components/fault-management-model';

export {
  EMAIL_FORWARD_OPTIONS_UI,
  FAULT_CATEGORY_OPTIONS_UI,
  FAULT_MANAGEMENT_DATA,
  SNMP_FORWARD_OPTIONS_UI,
  SEVERITY_OPTIONS_UI,
  type FaultManagementCategory,
  type FaultManagementEmailForward,
  type FaultManagementRow,
  type FaultManagementSeverity,
  type FaultManagementSnmpForward,
} from '@/components/fault-management-model';

export interface FaultManagementDataTableProps {
  groupFilter?: string;
  /** User-added events (not part of static FAULT_MANAGEMENT_DATA) */
  additionalFaultRows: FaultManagementRow[];
  setAdditionalFaultRows: Dispatch<SetStateAction<FaultManagementRow[]>>;
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  snmpFilter: string;
  onSnmpFilterChange: (value: string) => void;
  emailFilter: string;
  onEmailFilterChange: (value: string) => void;
}

export function FaultManagementDataTable({
  groupFilter,
  additionalFaultRows,
  setAdditionalFaultRows,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  severityFilter,
  onSeverityFilterChange,
  snmpFilter,
  onSnmpFilterChange,
  emailFilter,
  onEmailFilterChange,
}: FaultManagementDataTableProps) {
  const [rowEdits, setRowEdits] = useState<Record<string, Partial<FaultManagementRow>>>({});
  const [editingRow, setEditingRow] = useState<FaultManagementRow | null>(null);
  const [addingEvent, setAddingEvent] = useState<FaultManagementRow | null>(null);

  const additionalIdSet = useMemo(
    () => new Set(additionalFaultRows.map((r) => r.id)),
    [additionalFaultRows],
  );

  const rows = useMemo(() => {
    const base = FAULT_MANAGEMENT_DATA.map((row) => ({
      ...row,
      ...(rowEdits[row.id] ?? {}),
    }));
    const extras = additionalFaultRows.map((row) => ({
      ...row,
      ...(rowEdits[row.id] ?? {}),
    }));
    return [...base, ...extras];
  }, [rowEdits, additionalFaultRows]);

  const applyRowSave = useCallback((updated: FaultManagementRow) => {
    setRowEdits((prev) => ({
      ...prev,
      [updated.id]: {
        ...(prev[updated.id] ?? {}),
        event: updated.event,
        category: updated.category,
        severity: updated.severity,
        forwardToSnmp: updated.forwardToSnmp,
        forwardToEmail: updated.forwardToEmail,
      },
    }));
  }, []);

  const applyFieldsToGroup = useCallback(
    (
      group: string,
      fields: Pick<
        FaultManagementRow,
        'category' | 'severity' | 'forwardToSnmp' | 'forwardToEmail'
      >,
    ) => {
      const idsFromStatic = FAULT_MANAGEMENT_DATA.filter((r) => r.group === group).map((r) => r.id);
      const idsFromAdded = additionalFaultRows.filter((r) => r.group === group).map((r) => r.id);
      const ids = [...idsFromStatic, ...idsFromAdded];
      if (ids.length === 0) {
        toast.message('There are no events in this notification group.');
        return;
      }
      setRowEdits((prev) => {
        const next = { ...prev };
        for (const id of ids) {
          next[id] = { ...(next[id] ?? {}), ...fields };
        }
        return next;
      });
      toast.success(`Applied to ${ids.length} event${ids.length === 1 ? '' : 's'} in “${group}”.`);
    },
    [additionalFaultRows],
  );

  const filteredData = useMemo(() => {
    let data = rows;
    if (groupFilter) data = data.filter((r) => r.group === groupFilter);

    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (r) =>
          r.event.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== 'All') data = data.filter((r) => r.category === categoryFilter);
    if (severityFilter !== 'All') data = data.filter((r) => r.severity === severityFilter);
    if (snmpFilter !== 'All') data = data.filter((r) => r.forwardToSnmp === snmpFilter);

    if (emailFilter !== 'All') {
      const targetForward: FaultManagementEmailForward | undefined =
        emailFilter === 'All recipients'
          ? 'All'
          : emailFilter === 'None' || emailFilter === 'Filtered'
            ? emailFilter
            : undefined;
      if (targetForward !== undefined) {
        data = data.filter((r) => r.forwardToEmail === targetForward);
      }
    }

    return data;
  }, [rows, groupFilter, search, categoryFilter, severityFilter, snmpFilter, emailFilter]);

  /** True group-empty state (not “filters returned 0 results” with events still present) */
  const eventCountInGroup = useMemo(() => {
    if (!groupFilter) return 0;
    return rows.filter((r) => r.group === groupFilter).length;
  }, [rows, groupFilter]);
  const showGroupEmpty = Boolean(groupFilter) && eventCountInGroup === 0;

  const clearAllFilters = useCallback(() => {
    onSearchChange('');
    onCategoryFilterChange('All');
    onSeverityFilterChange('All');
    onSnmpFilterChange('All');
    onEmailFilterChange('All');
  }, [
    onSearchChange,
    onCategoryFilterChange,
    onSeverityFilterChange,
    onSnmpFilterChange,
    onEmailFilterChange,
  ]);

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onClear: () => void }[] = [];
    if (categoryFilter !== 'All') {
      list.push({
        key: 'category',
        label: `Category: ${categoryFilter}`,
        onClear: () => onCategoryFilterChange('All'),
      });
    }
    if (severityFilter !== 'All') {
      list.push({
        key: 'severity',
        label: `Severity: ${severityFilter}`,
        onClear: () => onSeverityFilterChange('All'),
      });
    }
    if (snmpFilter !== 'All') {
      list.push({
        key: 'snmp',
        label: `SNMP: ${snmpFilter}`,
        onClear: () => onSnmpFilterChange('All'),
      });
    }
    if (emailFilter !== 'All') {
      list.push({
        key: 'email',
        label: `Email: ${emailFilter}`,
        onClear: () => onEmailFilterChange('All'),
      });
    }
    if (search.trim()) {
      list.push({
        key: 'search',
        label: `Search: "${search.trim()}"`,
        onClear: () => onSearchChange(''),
      });
    }
    return list;
  }, [
    categoryFilter,
    severityFilter,
    snmpFilter,
    emailFilter,
    search,
    onCategoryFilterChange,
    onSeverityFilterChange,
    onSnmpFilterChange,
    onEmailFilterChange,
    onSearchChange,
  ]);

  const hasActiveFilters = activeFilters.length > 0;

  const columns: ColumnDef<FaultManagementRow>[] = useMemo(
    () => [
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
          cellClassName:
            'sticky left-0 z-10 w-10 bg-card group-hover:!bg-muted group-data-[state=selected]:!bg-muted transition-colors shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]',
        },
      },
      {
        accessorKey: 'event',
        header: ({ column }) => <SortableHeader column={column}>Event</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.getValue('event') as string}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.category}</span>,
      },
      {
        accessorKey: 'severity',
        header: ({ column }) => <SortableHeader column={column}>Severity</SortableHeader>,
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.severity}</span>,
      },
      {
        accessorKey: 'forwardToSnmp',
        header: ({ column }) => <SortableHeader column={column}>Forward to SNMP</SortableHeader>,
        cell: ({ row }) => (
          <span className="text-sm text-foreground tabular-nums">{row.original.forwardToSnmp}</span>
        ),
      },
      {
        accessorKey: 'forwardToEmail',
        header: ({ column }) => <SortableHeader column={column}>Forward to email</SortableHeader>,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.forwardToEmail}</span>
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
                    if (additionalIdSet.has(id)) {
                      setAdditionalFaultRows((p) => p.filter((r) => r.id !== id));
                      setRowEdits((prev) => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                      });
                      setEditingRow((cur) => (cur?.id === id ? null : cur));
                      toast.success('Event removed');
                    } else {
                      toast.message('Built-in events cannot be deleted.');
                    }
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
    [setEditingRow, additionalIdSet, setAdditionalFaultRows, setRowEdits],
  );

  return (
    <>
      {showGroupEmpty ? (
        <div className="space-y-4">
          <div className="flex justify-end pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Notification group actions">
                  <Icon name="more_vert" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => toast.message('Edit notification group is not available yet.')}>
                  <Icon name="edit" size={16} className="mr-2 opacity-70" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.message('Delete notification group is not available yet.')}>
                  <Icon name="delete" size={16} className="mr-2 opacity-70" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-center">
            <div className="rounded-lg border bg-card p-8 text-center max-w-sm w-full shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon name="error" size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No events</h3>
              <p className="text-sm text-muted-foreground mb-4">No events in this group.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => groupFilter && setAddingEvent(createDraftFaultEventRow(groupFilter))}
              >
                <Icon name="add" size={16} className="mr-1.5" />
                Add event
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
            <SearchInput
              size="md"
              wrapperClassName="w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]"
              placeholder="Search events..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              <FilterSelect
                value={categoryFilter}
                onValueChange={onCategoryFilterChange}
                label="Category"
                options={[...FAULT_EVENTS_CATEGORY_FILTER_OPTIONS]}
                className="w-[140px]"
              />
              <FilterSelect
                value={severityFilter}
                onValueChange={onSeverityFilterChange}
                label="Severity"
                options={[...FAULT_EVENTS_SEVERITY_FILTER_OPTIONS]}
                className="w-[120px]"
              />
              <FilterSelect
                value={snmpFilter}
                onValueChange={onSnmpFilterChange}
                label="SNMP"
                options={[...FAULT_EVENTS_SNMP_FILTER_OPTIONS]}
                className="w-[120px]"
              />
              <FilterSelect
                value={emailFilter}
                onValueChange={onEmailFilterChange}
                label="Email"
                options={[...FAULT_EVENTS_EMAIL_FILTER_OPTIONS]}
                className="w-[120px]"
              />
            </div>
            <Button
              type="button"
              className="ml-auto shrink-0"
              aria-label="Add event"
              onClick={() => {
                if (!groupFilter) {
                  toast.message('Select a notification group first.');
                  return;
                }
                setAddingEvent(createDraftFaultEventRow(groupFilter));
              }}
            >
              <Icon name="add" size={16} className="mr-1.5" />
              Add event
            </Button>
          </div>
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
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          <DataTable columns={columns} data={filteredData} getRowId={(r) => r.id} />
        </div>
      )}
      {editingRow && !addingEvent && (
        <FaultEventEditSheet
          key={editingRow.id}
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={applyRowSave}
          onApplyToAllInGroup={applyFieldsToGroup}
        />
      )}
      {addingEvent && (
        <FaultEventEditSheet
          key="add-fault-event"
          mode="add"
          row={addingEvent}
          onClose={() => setAddingEvent(null)}
          onSave={(r) => {
            setAdditionalFaultRows((p) => [...p, r]);
            setAddingEvent(null);
            toast.success('Event added');
          }}
        />
      )}
    </>
  );
}

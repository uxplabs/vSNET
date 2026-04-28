'use client';

/**
 * Admin editor sheet: `sm:max-w-xl`, fields directly in the scroll body (no inner Card), footer.
 */

import * as React from 'react';
import { Button } from './ui/button';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';
import type { FaultManagementRow } from './fault-management-model';
import {
  EMAIL_FORWARD_OPTIONS_UI,
  FAULT_CATEGORY_OPTIONS_UI,
  newFaultEventId,
  SEVERITY_OPTIONS_UI,
  SNMP_FORWARD_OPTIONS_UI,
} from './fault-management-model';

/** Sheet overlay/content use z-[1200]; Select dropdown must stack above or it receives no clicks. */
const selectContentInSheetClass = 'z-[1300]';

export type FaultEventApplyFields = Pick<
  FaultManagementRow,
  'category' | 'severity' | 'forwardToSnmp' | 'forwardToEmail'
>;

export interface FaultEventEditSheetProps {
  /** Use `add` when creating an event for the given notification group (`row.group`). */
  mode?: 'edit' | 'add';
  row: FaultManagementRow;
  onClose: () => void;
  onSave: (row: FaultManagementRow) => void;
  /** Edit only: applies the sheet’s category / severity / forwarding values to every event in this notification group. */
  onApplyToAllInGroup?: (group: string, fields: FaultEventApplyFields) => void;
}

type FormState = Pick<
  FaultManagementRow,
  'id' | 'event' | 'category' | 'severity' | 'forwardToSnmp' | 'forwardToEmail'
>;

function rowToForm(r: FaultManagementRow): FormState {
  return {
    id: r.id,
    event: r.event,
    category: r.category,
    severity: r.severity,
    forwardToSnmp: r.forwardToSnmp,
    forwardToEmail: r.forwardToEmail,
  };
}

export function FaultEventEditSheet({
  mode = 'edit',
  row,
  onClose,
  onSave,
  onApplyToAllInGroup,
}: FaultEventEditSheetProps) {
  const [form, setForm] = React.useState<FormState>(() => rowToForm(row));
  const isAdd = mode === 'add';

  React.useLayoutEffect(() => {
    setForm(rowToForm(row));
  }, [row]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );

  const handleSave = React.useCallback(() => {
    const eventName = form.event.trim();
    if (!eventName) return;
    onSave({
      ...row,
      id: isAdd ? newFaultEventId() : row.id,
      event: eventName,
      category: form.category,
      severity: form.severity,
      forwardToSnmp: form.forwardToSnmp,
      forwardToEmail: form.forwardToEmail,
    });
    onClose();
  }, [form, row, isAdd, onSave, onClose]);

  const handleApplyToAll = React.useCallback(() => {
    if (!onApplyToAllInGroup) return;
    onApplyToAllInGroup(row.group, {
      category: form.category,
      severity: form.severity,
      forwardToSnmp: form.forwardToSnmp,
      forwardToEmail: form.forwardToEmail,
    });
  }, [form, row.group, onApplyToAllInGroup]);

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
          <SheetTitle>{isAdd ? 'Add event' : 'Edit event'}</SheetTitle>
          <SheetDescription>
            {isAdd
              ? `Add a new event to the “${row.group}” notification group.`
              : 'Update forwarding and classification for this event.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-6">
          <FieldGroup>
            <Field controlSize="full">
              <FieldLabel htmlFor="fault-edit-event">Event name</FieldLabel>
              <Input
                id="fault-edit-event"
                value={form.event}
                onChange={(e) => setForm((f) => ({ ...f, event: e.target.value }))}
                placeholder="e.g. Antenna port status"
                autoFocus
              />
            </Field>

            <Field controlSize="md">
              <FieldLabel>Category</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as FormState['category'] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentInSheetClass}>
                  {FAULT_CATEGORY_OPTIONS_UI.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field controlSize="md">
              <FieldLabel>Severity</FieldLabel>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm((f) => ({ ...f, severity: v as FormState['severity'] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentInSheetClass}>
                  {SEVERITY_OPTIONS_UI.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field controlSize="md">
              <FieldLabel>Forward to SNMP</FieldLabel>
              <Select
                value={form.forwardToSnmp}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, forwardToSnmp: v as FormState['forwardToSnmp'] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentInSheetClass}>
                  {SNMP_FORWARD_OPTIONS_UI.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field controlSize="md">
              <FieldLabel>Forward to email</FieldLabel>
              <Select
                value={form.forwardToEmail}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, forwardToEmail: v as FormState['forwardToEmail'] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentInSheetClass}>
                  {EMAIL_FORWARD_OPTIONS_UI.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="mt-auto shrink-0 flex flex-row flex-wrap items-center justify-between gap-2 border-t px-4 py-4">
          <div className="flex min-w-0 flex-1">
            {!isAdd && onApplyToAllInGroup ? (
              <Button type="button" variant="outline" onClick={handleApplyToAll}>
                Apply to all
              </Button>
            ) : null}
          </div>
          <div className="flex flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!form.event.trim()}>
              {isAdd ? 'Add event' : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

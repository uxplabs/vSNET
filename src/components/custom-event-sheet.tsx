'use client';

/**
 * Right-side editor sheet: full-height column (`sm:max-w-xl`), header + scroll body
 * (fields directly in the body — no inner Card form container) + footer.
 * Spacing: `FieldGroup` / `Field` / `FieldLabel` per `form-field-spacing.mdc`.
 */

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CustomFaultEventRow } from '@/components/custom-events-model';
import { newCustomEventId } from '@/components/custom-events-model';

export interface CustomEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'edit' | 'add';
  row: CustomFaultEventRow;
  onSave: (row: CustomFaultEventRow) => void;
}

type FormState = Pick<
  CustomFaultEventRow,
  'id' | 'name' | 'description' | 'pattern' | 'regex' | 'matchCase'
>;

function rowToForm(r: CustomFaultEventRow): FormState {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    pattern: r.pattern,
    regex: r.regex,
    matchCase: r.matchCase,
  };
}

export function CustomEventSheet({
  open,
  onOpenChange,
  mode = 'edit',
  row,
  onSave,
}: CustomEventSheetProps) {
  const [form, setForm] = React.useState<FormState>(() => rowToForm(row));
  const isAdd = mode === 'add';

  React.useLayoutEffect(() => {
    if (!open) return;
    setForm(rowToForm(row));
  }, [row, open]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleSave = React.useCallback(() => {
    const name = form.name.trim();
    const pattern = form.pattern.trim();
    if (!name || !pattern) return;
    onSave({
      ...row,
      id: isAdd ? newCustomEventId() : row.id,
      name,
      description: form.description.trim(),
      pattern,
      regex: form.regex,
      matchCase: form.matchCase,
    });
    handleOpenChange(false);
  }, [form, row, isAdd, onSave, handleOpenChange]);

  const canSave = Boolean(form.name.trim() && form.pattern.trim());

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
          <SheetTitle>{isAdd ? 'Add Custom Event' : 'Edit Custom Event'}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-6">
          <FieldGroup>
            <Field controlSize="full">
              <FieldLabel htmlFor="custom-event-name">
                Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="custom-event-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter name"
                autoFocus={open}
                autoComplete="off"
              />
            </Field>
            <Field controlSize="full">
              <FieldLabel htmlFor="custom-event-description">Description</FieldLabel>
              <Input
                id="custom-event-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Enter description"
                autoComplete="off"
              />
            </Field>
            <Field controlSize="full">
              <FieldLabel htmlFor="custom-event-pattern">
                Pattern <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="custom-event-pattern"
                value={form.pattern}
                onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))}
                placeholder="Enter pattern"
                autoComplete="off"
              />
            </Field>
            <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="custom-event-regex"
                  checked={form.regex}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, regex: !!v }))}
                />
                <Label htmlFor="custom-event-regex" className="cursor-pointer font-normal">
                  Regex
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="custom-event-match-case"
                  checked={form.matchCase}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, matchCase: !!v }))}
                />
                <Label htmlFor="custom-event-match-case" className="cursor-pointer font-normal">
                  Match case
                </Label>
              </div>
            </div>
          </FieldGroup>
        </div>

        <SheetFooter className="mt-auto shrink-0 flex flex-row flex-wrap gap-2 border-t px-4 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Field, FieldContent, FieldGroup, FieldLabel } from './ui/field';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Input } from './ui/input';
import type { FileManagementUserRow } from './file-management-users-data-table';

export interface FileManagementUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: FileManagementUserRow | null;
  /** Lowercase user names already taken (exclude current user when editing). */
  takenUsernamesLower?: string[];
  onSave?: (user: FileManagementUserRow) => void;
}

type FormState = {
  id?: string;
  user: string;
  sshKey: string;
};

function emptyForm(): FormState {
  return {
    user: '',
    sshKey: '',
  };
}

function rowToForm(row: FileManagementUserRow): FormState {
  return {
    id: row.id,
    user: row.user,
    sshKey: row.sshKey,
  };
}

export function FileManagementUserSheet({
  open,
  onOpenChange,
  user,
  takenUsernamesLower = [],
  onSave,
}: FileManagementUserSheetProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm);

  const update = React.useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setForm(user ? rowToForm(user) : { ...emptyForm(), id: `fm-${Date.now()}` });
  }, [open, user]);

  const handleClose = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setForm(emptyForm());
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const isEdit = !!user;

  const handleSubmit = React.useCallback(() => {
    const name = form.user.trim();
    const sshKey = form.sshKey.trim();
    if (!name || !sshKey || !form.id) return;

    if (takenUsernamesLower.includes(name.toLowerCase())) {
      toast.error('A user with that name already exists.');
      return;
    }

    const row: FileManagementUserRow = {
      id: form.id,
      user: name,
      sshKey,
    };
    onSave?.(row);
    toast.success(isEdit ? `User "${row.user}" updated` : `User "${row.user}" added`);
    handleClose(false);
  }, [form, isEdit, onSave, handleClose, takenUsernamesLower]);

  const canSave =
    form.user.trim().length > 0 &&
    form.sshKey.trim().length > 0 &&
    !!form.id;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
          <SheetTitle>{isEdit ? 'Edit user' : 'Add user'}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <FieldGroup>
            <Field controlSize="md">
              <FieldLabel htmlFor="fm-user-name">
                Username <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fm-user-name"
                  autoComplete="off"
                  value={form.user}
                  onChange={(e) => update({ user: e.target.value })}
                  placeholder="username"
                />
              </FieldContent>
            </Field>
            <Field controlSize="full">
              <FieldLabel htmlFor="fm-user-ssh-key">
                SSH key <span className="text-destructive">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id="fm-user-ssh-key"
                  autoComplete="off"
                  value={form.sshKey}
                  onChange={(e) => update({ sshKey: e.target.value })}
                  placeholder="ssh-ed25519 AAAA... user@host"
                  className="font-mono text-xs"
                />
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>

        <div className="mt-auto flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-4">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSave}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

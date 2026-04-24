'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import type { FileManagementUserRow } from './file-management-users-data-table';

const MOCK_PASSWORD_DISPLAY = '••••••••••••••••';

function flagsFromPermissionsString(value: string): { read: boolean; write: boolean; delete: boolean } {
  const parts = value.split(',').map((s) => s.trim().toLowerCase());
  return {
    read: parts.includes('read'),
    write: parts.includes('write'),
    delete: parts.includes('delete'),
  };
}

function permissionsStringFromFlags(f: { read: boolean; write: boolean; delete: boolean }): string {
  const parts: string[] = [];
  if (f.read) parts.push('Read');
  if (f.write) parts.push('Write');
  if (f.delete) parts.push('Delete');
  return parts.length > 0 ? parts.join(', ') : 'Read';
}

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
  password: string;
  description: string;
  permRead: boolean;
  permWrite: boolean;
  permDelete: boolean;
};

function emptyForm(): FormState {
  return {
    user: '',
    password: '',
    description: '',
    permRead: true,
    permWrite: false,
    permDelete: false,
  };
}

function rowToForm(row: FileManagementUserRow): FormState {
  const f = flagsFromPermissionsString(row.permissions);
  const normDelete = f.delete;
  const normWrite = f.write || normDelete;
  const normRead = f.read || normWrite;
  return {
    id: row.id,
    user: row.user,
    password: '',
    description: row.description,
    permRead: normRead,
    permWrite: normWrite && normRead,
    permDelete: normDelete && normWrite && normRead,
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
    const desc = form.description.trim();
    if (!name || !desc || !form.id) return;
    if (!isEdit && !form.password.trim()) return;

    if (!isEdit && takenUsernamesLower.includes(name.toLowerCase())) {
      toast.error('A user with that name already exists.');
      return;
    }

    const passwordHashed =
      form.password.trim().length > 0 ? MOCK_PASSWORD_DISPLAY : user?.passwordHashed ?? MOCK_PASSWORD_DISPLAY;

    const row: FileManagementUserRow = {
      id: form.id,
      user: name,
      passwordHashed,
      description: desc,
      permissions: permissionsStringFromFlags({
        read: form.permRead,
        write: form.permWrite,
        delete: form.permDelete,
      }),
    };
    onSave?.(row);
    toast.success(isEdit ? `User "${row.user}" updated` : `User "${row.user}" added`);
    handleClose(false);
  }, [form, isEdit, onSave, handleClose, user?.passwordHashed, takenUsernamesLower]);

  const canSave =
    form.user.trim().length > 0 &&
    form.description.trim().length > 0 &&
    !!form.id &&
    form.permRead &&
    (isEdit || form.password.trim().length > 0);

  const setPermRead = (checked: boolean) => {
    if (checked) {
      update({ permRead: true });
    } else {
      update({ permRead: false, permWrite: false, permDelete: false });
    }
  };

  const setPermWrite = (checked: boolean) => {
    if (checked) {
      update({ permRead: true, permWrite: true });
    } else {
      update({ permWrite: false, permDelete: false });
    }
  };

  const setPermDelete = (checked: boolean) => {
    if (checked) {
      update({ permRead: true, permWrite: true, permDelete: true });
    } else {
      update({ permDelete: false });
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
          <SheetTitle>{isEdit ? 'Edit user' : 'Add user'}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            <div>
              <Label htmlFor="fm-user-name">
                User <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fm-user-name"
                className="mt-3"
                autoComplete="off"
                value={form.user}
                onChange={(e) => update({ user: e.target.value })}
                placeholder="username"
                disabled={isEdit}
              />
              {isEdit ? (
                <p className="mt-1.5 text-xs text-muted-foreground">User name cannot be changed after the account is created.</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="fm-user-password">
                Password {!isEdit ? <span className="text-destructive">*</span> : null}
              </Label>
              <Input
                id="fm-user-password"
                type="password"
                className="mt-3"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
              />
            </div>
            <div>
              <Label htmlFor="fm-user-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fm-user-description"
                className="mt-3"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Role or purpose for this account"
              />
            </div>
            <div>
              <Label className="text-base">Permissions</Label>
              <p className="mt-1 text-xs text-muted-foreground">Write requires Read. Delete requires Read and Write.</p>
              <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/10 p-4">
                <label htmlFor="fm-perm-read" className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id="fm-perm-read"
                    checked={form.permRead}
                    onCheckedChange={(v) => setPermRead(v === true)}
                  />
                  <span className="text-sm font-normal">Read</span>
                </label>
                <label htmlFor="fm-perm-write" className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id="fm-perm-write"
                    checked={form.permWrite}
                    onCheckedChange={(v) => setPermWrite(v === true)}
                    disabled={!form.permRead}
                  />
                  <span className="text-sm font-normal">Write</span>
                </label>
                <label htmlFor="fm-perm-delete" className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id="fm-perm-delete"
                    checked={form.permDelete}
                    onCheckedChange={(v) => setPermDelete(v === true)}
                    disabled={!form.permRead || !form.permWrite}
                  />
                  <span className="text-sm font-normal">Delete</span>
                </label>
              </div>
            </div>
          </div>
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

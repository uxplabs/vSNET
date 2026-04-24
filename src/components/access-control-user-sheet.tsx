'use client';

import * as React from 'react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { AccessControlUserRow } from './access-control-users-data-table';

const PROFILE_OPTIONS = ['Administrator', 'Operator', 'Viewer'] as const;
const DEPARTMENT_OPTIONS = ['Engineering', 'Operations', 'Support', 'Management'] as const;
const LOCATION_OPTIONS = ['Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York'] as const;

export interface AccessControlUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, sheet opens in edit mode with this row */
  user?: AccessControlUserRow | null;
  onSave?: (user: AccessControlUserRow) => void;
}

type FormState = Omit<AccessControlUserRow, 'id'> & { id?: string };

const emptyForm = (): FormState => ({
  user: '',
  profile: 'Viewer',
  department: 'Engineering',
  location: 'Seattle',
  phone: '',
  email: '',
  lastLogIn: 'Never',
});

function rowToForm(user: AccessControlUserRow): FormState {
  return {
    id: user.id,
    user: user.user,
    profile: user.profile,
    department: user.department,
    location: user.location,
    phone: user.phone,
    email: user.email,
    lastLogIn: user.lastLogIn,
  };
}

export function AccessControlUserSheet({
  open,
  onOpenChange,
  user,
  onSave,
}: AccessControlUserSheetProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [sendWelcomeEmail, setSendWelcomeEmail] = React.useState(true);
  const [requirePasswordChange, setRequirePasswordChange] = React.useState(false);

  const update = React.useCallback((updates: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setForm(user ? rowToForm(user) : { ...emptyForm(), id: `u-${Date.now()}` });
    if (user) {
      setSendWelcomeEmail(false);
      setRequirePasswordChange(false);
    } else {
      setSendWelcomeEmail(true);
      setRequirePasswordChange(false);
    }
  }, [open, user]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setForm(emptyForm());
        setSendWelcomeEmail(true);
        setRequirePasswordChange(false);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const handleSubmit = React.useCallback(() => {
    if (!form.user.trim() || !form.email.trim() || !form.id) return;
    const row: AccessControlUserRow = {
      id: form.id,
      user: form.user.trim(),
      profile: form.profile,
      department: form.department,
      location: form.location,
      phone: form.phone.trim(),
      email: form.email.trim(),
      lastLogIn: form.lastLogIn,
    };
    onSave?.(row);
    handleOpenChange(false);
  }, [form, onSave, handleOpenChange]);

  const isEdit = !!user;
  const canSave = form.user.trim().length > 0 && form.email.trim().length > 0 && !!form.id;

  const title = isEdit ? 'Edit user' : 'Add user';

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update identity and org context. Profile changes apply on the user’s next sign-in.'
              : 'Create an account for AMS access. The profile controls permissions across nodes and administration.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-10">
            <section className="space-y-4" aria-labelledby="ac-user-details-heading">
              <div>
                <h3 id="ac-user-details-heading" className="text-sm font-semibold text-foreground">
                  User details
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Name, organization, and how to reach this person.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ac-user-name">Name</Label>
                  <Input
                    id="ac-user-name"
                    value={form.user}
                    onChange={(e) => update({ user: e.target.value })}
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ac-user-profile">Profile</Label>
                    <Select value={form.profile} onValueChange={(value) => update({ profile: value })}>
                      <SelectTrigger id="ac-user-profile">
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFILE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-user-department">Department</Label>
                    <Select value={form.department} onValueChange={(value) => update({ department: value })}>
                      <SelectTrigger id="ac-user-department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-user-location">Location</Label>
                    <Select value={form.location} onValueChange={(value) => update({ location: value })}>
                      <SelectTrigger id="ac-user-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ac-user-phone">Phone</Label>
                    <Input
                      id="ac-user-phone"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ac-user-email">Email</Label>
                    <Input
                      id="ac-user-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update({ email: e.target.value })}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-border/70 pt-10" aria-labelledby="ac-user-access-heading">
              <div>
                <h3 id="ac-user-access-heading" className="text-sm font-semibold text-foreground">
                  Access &amp; notifications
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">Optional actions when you save this user.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/80 bg-muted/25 px-4 py-3">
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="ac-user-welcome-email" className="text-sm font-medium leading-none">
                      Send welcome email
                    </Label>
                    <p id="ac-user-welcome-email-hint" className="text-xs text-muted-foreground">
                      Deliver sign-in instructions to the email address above.
                    </p>
                  </div>
                  <Switch
                    id="ac-user-welcome-email"
                    checked={sendWelcomeEmail}
                    onCheckedChange={setSendWelcomeEmail}
                    aria-describedby="ac-user-welcome-email-hint"
                    className="shrink-0"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/80 bg-muted/25 px-4 py-3">
                  <div className="min-w-0 space-y-1">
                    <Label htmlFor="ac-user-require-pwd" className="text-sm font-medium leading-none">
                      Require password change
                    </Label>
                    <p id="ac-user-require-pwd-hint" className="text-xs text-muted-foreground">
                      Prompt for a new password at next sign-in.
                    </p>
                  </div>
                  <Switch
                    id="ac-user-require-pwd"
                    checked={requirePasswordChange}
                    onCheckedChange={setRequirePasswordChange}
                    aria-describedby="ac-user-require-pwd-hint"
                    className="shrink-0"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <SheetFooter className="mt-auto shrink-0 flex-row justify-end gap-2 border-t border-border bg-muted/20 px-4 py-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Checkbox } from './ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './ui/sheet';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { AccessControlDomainRow } from './access-control-domains-data-table';

export interface AddDomainSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, sheet opens in edit mode with form pre-filled */
  domain?: AccessControlDomainRow | null;
  onSubmit?: (data: AddDomainFormData) => void;
}

export interface AddDomainFormData {
  name: string;
  description: string;
  isDefault: boolean;
}

const defaultFormState: AddDomainFormData = {
  name: '',
  description: '',
  isDefault: false,
};

export function AddDomainSheet({
  open,
  onOpenChange,
  domain,
  onSubmit,
}: AddDomainSheetProps) {
  const [form, setForm] = React.useState<AddDomainFormData>(defaultFormState);

  const update = React.useCallback((updates: Partial<AddDomainFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  React.useEffect(() => {
    if (open) {
      setForm(domain ? { name: domain.name, description: domain.description, isDefault: domain.isDefault } : defaultFormState);
    }
  }, [open, domain]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) setForm(defaultFormState);
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const handleSubmit = React.useCallback(() => {
    if (!form.name.trim()) return;
    onSubmit?.(form);
    handleOpenChange(false);
  }, [form, onSubmit, handleOpenChange]);

  const isEdit = !!domain;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl flex flex-col h-full p-0">
        <SheetHeader className="shrink-0 px-4 pt-4 pb-2">
          <SheetTitle>{isEdit ? 'Edit domain' : 'Add domain'}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-auto px-4 pt-6 pb-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h4 className="text-sm font-semibold text-foreground">Configuration</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain-name">Name</Label>
                  <Input
                    id="domain-name"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Enter domain name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain-description">Description</Label>
                  <Textarea
                    id="domain-description"
                    value={form.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="domain-default"
                    checked={form.isDefault}
                    onCheckedChange={(checked) => update({ isDefault: !!checked })}
                  />
                  <Label htmlFor="domain-default" className="font-normal cursor-pointer">
                    Set as default domain
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="shrink-0 mt-auto py-4 px-4 border-t flex-row justify-between">
          <div className="flex-1">
            {isEdit && (
              <Button variant="outline" className="gap-1.5" disabled={domain?.isDefault}>
                <Icon name="delete" size={18} />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim()}>
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Icon } from '@/components/Icon';
import { DEVICES_DATA } from '@/components/devices-data-table';
import { SCHEDULED_TASKS_DATA } from '@/components/scheduled-tasks-data-table';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';
import { cn } from '@/lib/utils';

const DEVICE_GROUPS = ['Core network', 'Radio access', 'Edge devices', 'Test environment'] as const;
const TASK_NAMES = [...new Set(SCHEDULED_TASKS_DATA.map((t) => t.task))].sort();

type Scope = 'device' | 'group' | 'all-region';

export interface AddScheduledTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current region when used from a context that has one (e.g. Devices page) */
  region?: string;
  onAdd?: (payload: { scope: Scope; device?: string; group?: string; region?: string; task: string }) => void;
}

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  buttonClassName,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal', buttonClassName)}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <Icon name="expand_more" size={18} className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onValueChange(opt);
                    setOpen(false);
                  }}
                >
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AddScheduledTaskDialog({
  open,
  onOpenChange,
  region: regionProp,
  onAdd,
}: AddScheduledTaskDialogProps) {
  const [scope, setScope] = React.useState<Scope>('device');
  const [device, setDevice] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [region, setRegion] = React.useState(regionProp || '');
  const [task, setTask] = React.useState('');

  const deviceOptions = React.useMemo(
    () => DEVICES_DATA.map((d) => d.device),
    []
  );
  const regionOptions = React.useMemo(() => [...NORTH_AMERICAN_REGIONS], []);

  React.useEffect(() => {
    if (regionProp) setRegion(regionProp);
  }, [regionProp]);

  React.useEffect(() => {
    if (!open) return;
    setScope('device');
    setDevice('');
    setGroup('');
    setRegion(regionProp || NORTH_AMERICAN_REGIONS[0] || '');
    setTask('');
  }, [open, regionProp]);

  const handleAdd = () => {
    onAdd?.({
      scope,
      ...(scope === 'device' && device ? { device } : undefined),
      ...(scope === 'group' && group ? { group } : undefined),
      ...(scope === 'all-region' && region ? { region } : undefined),
      task,
    });
    onOpenChange(false);
  };

  const canSubmit =
    task.trim() !== '' &&
    (scope !== 'device' || device !== '') &&
    (scope !== 'group' || group !== '') &&
    (scope !== 'all-region' || region !== '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add scheduled task</DialogTitle>
          <DialogDescription>
            Choose the target (device, group, or all region devices) and the task to run.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label>Target</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as Scope)}
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="device" id="scope-device" />
                <Label htmlFor="scope-device" className="font-normal cursor-pointer">
                  Device
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="scope-group" />
                <Label htmlFor="scope-group" className="font-normal cursor-pointer">
                  Group
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-region" id="scope-all-region" />
                <Label htmlFor="scope-all-region" className="font-normal cursor-pointer">
                  All region devices
                </Label>
              </div>
            </RadioGroup>
          </div>

          {scope === 'device' && (
            <div className="grid gap-2">
              <Label htmlFor="select-device">Select device</Label>
              <SearchableSelect
                value={device}
                onValueChange={setDevice}
                options={deviceOptions}
                placeholder="Select device..."
                searchPlaceholder="Search devices..."
                emptyText="No device found."
              />
            </div>
          )}

          {scope === 'group' && (
            <div className="grid gap-2">
              <Label htmlFor="select-group">Select group</Label>
              <SearchableSelect
                value={group}
                onValueChange={setGroup}
                options={[...DEVICE_GROUPS]}
                placeholder="Select group..."
                searchPlaceholder="Search groups..."
                emptyText="No group found."
              />
            </div>
          )}

          {scope === 'all-region' && (
            <div className="grid gap-2">
              <Label htmlFor="select-region">Select region</Label>
              <SearchableSelect
                value={region}
                onValueChange={setRegion}
                options={regionOptions}
                placeholder="Select region..."
                searchPlaceholder="Search regions..."
                emptyText="No region found."
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="select-task">Select task</Label>
            <SearchableSelect
              value={task}
              onValueChange={setTask}
              options={TASK_NAMES}
              placeholder="Select task..."
              searchPlaceholder="Search tasks..."
              emptyText="No task found."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canSubmit}>
            Add scheduled task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

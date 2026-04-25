'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, isSameDay, set, startOfDay } from 'date-fns';
import { CornerDownLeft } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { AuditAmsDateRangeCalendar } from './audit-ams-date-range-calendar';
import { AuditCustomTimeInput } from './audit-custom-time-input';
import { Button } from './ui/button';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

function createDefaultAuditCustomRange(): DateRange {
  const day = startOfDay(new Date());
  return {
    from: set(day, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
    to: set(day, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }),
  };
}

function mergeAuditCalendarDay(
  calendarDay: Date,
  previousInstant: Date | undefined,
  boundary: 'start' | 'end',
): Date {
  const day = startOfDay(calendarDay);
  if (previousInstant && isSameDay(previousInstant, calendarDay)) {
    return set(day, {
      hours: previousInstant.getHours(),
      minutes: previousInstant.getMinutes(),
      seconds: previousInstant.getSeconds(),
      milliseconds: previousInstant.getMilliseconds(),
    });
  }
  if (boundary === 'start') {
    return set(day, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  }
  return set(day, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });
}

export type AuditDateRangeFilterFieldProps = {
  presets: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  customApplied: DateRange | undefined;
  onCustomAppliedChange: (range: DateRange | undefined) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
  className?: string;
};

/**
 * Preset date-range select plus custom range popover (AMS grid calendar, times, Apply, time zone).
 */
export function AuditDateRangeFilterField({
  presets,
  value,
  onValueChange,
  customApplied,
  onCustomAppliedChange,
  timezone,
  onTimezoneChange,
  className,
}: AuditDateRangeFilterFieldProps) {
  const [draft, setDraft] = useState<DateRange | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const appliedRef = useRef<DateRange | undefined>(undefined);
  const openCustomAfterSelectClosesRef = useRef(false);
  const popoverOpenedAtRef = useRef(0);

  useEffect(() => {
    appliedRef.current = customApplied;
  }, [customApplied]);

  const timezoneOptions = useMemo(() => {
    const local = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const zonePresets = ['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] as const;
    return [local, ...zonePresets.filter((z) => z !== local)];
  }, []);

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range?.from) {
      setDraft(undefined);
      return;
    }
    setDraft((prev) => {
      const from = mergeAuditCalendarDay(range.from!, prev?.from, 'start');
      if (!range.to) {
        const to = mergeAuditCalendarDay(range.from!, prev?.to, 'end');
        return { from, to };
      }
      const to = mergeAuditCalendarDay(range.to, prev?.to, 'end');
      return { from, to };
    });
  }, []);

  const handleSelectValueChange = useCallback(
    (next: string) => {
      onValueChange(next);
      if (next === 'Custom') {
        openCustomAfterSelectClosesRef.current = true;
      } else {
        openCustomAfterSelectClosesRef.current = false;
      }
    },
    [onValueChange],
  );

  return (
    <Popover
      modal={false}
      open={value === 'Custom' && popoverOpen}
      onOpenChange={(open) => {
        if (value !== 'Custom') {
          setPopoverOpen(false);
          return;
        }
        if (!open) {
          if (Date.now() - popoverOpenedAtRef.current < 320) {
            return;
          }
          setPopoverOpen(false);
          setDraft(appliedRef.current ?? createDefaultAuditCustomRange());
          return;
        }
        setPopoverOpen(true);
        setDraft(appliedRef.current ?? createDefaultAuditCustomRange());
      }}
    >
      <PopoverAnchor asChild>
        <div
          className={cn(
            'min-w-[168px] max-w-[min(280px,calc(100vw-2rem))] rounded-md border border-input bg-background shadow-sm transition-[color,box-shadow]',
            'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
            className,
          )}
        >
          <Select
            value={value}
            onValueChange={handleSelectValueChange}
            onOpenChange={(selectMenuOpen) => {
              if (selectMenuOpen) return;
              if (!openCustomAfterSelectClosesRef.current) return;
              openCustomAfterSelectClosesRef.current = false;
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setPopoverOpen(true);
                  popoverOpenedAtRef.current = Date.now();
                });
              });
            }}
          >
            <SelectTrigger className="h-9 w-full rounded-md border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0">
              <SelectValue
                placeholder="Date range"
                className={cn(
                  'min-w-0 flex-1 truncate text-left',
                  value === 'All' && 'text-muted-foreground',
                )}
              >
                {value === 'All'
                  ? 'Date range'
                  : value === 'Custom' && customApplied?.from && customApplied?.to
                    ? `${format(customApplied.from, 'MMM d, yyyy')} – ${format(customApplied.to, 'MMM d, yyyy')}`
                    : value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {presets.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  onPointerUp={
                    opt === 'Custom'
                      ? () => {
                          openCustomAfterSelectClosesRef.current = true;
                        }
                      : undefined
                  }
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverAnchor>
      {value === 'Custom' ? (
        <PopoverContent
          avoidCollisions={false}
          className="isolate z-[100] w-[min(16.75rem,calc(100vw-2rem))] min-w-0 overflow-x-hidden overflow-y-visible rounded-xl border border-border !bg-popover p-0 text-popover-foreground shadow-xl"
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={8}
        >
          <div className="flex w-full min-w-0 flex-col bg-popover">
            <div className="bg-popover pb-1 pt-2">
              <AuditAmsDateRangeCalendar
                className="mx-auto rounded-lg text-popover-foreground"
                defaultMonth={draft?.from ?? draft?.to ?? new Date()}
                value={draft}
                onSelect={handleCalendarSelect}
              />
            </div>
            <FieldGroup className="border-t border-border bg-popover px-2 py-3">
              <Field>
                <FieldLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Start
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    tabIndex={-1}
                    aria-label="Start date"
                    value={draft?.from ? format(draft.from, 'MMM d, yyyy') : ''}
                    placeholder="Date"
                    className="h-9 min-w-0 flex-1 cursor-default border-input/80 bg-background font-normal tabular-nums"
                  />
                  <AuditCustomTimeInput
                    value={draft?.from}
                    disabled={!draft?.from}
                    aria-label="Start time"
                    onChange={(next) => {
                      setDraft((prev) => (prev?.from ? { ...prev, from: next } : prev));
                    }}
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  End
                </FieldLabel>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    tabIndex={-1}
                    aria-label="End date"
                    value={draft?.to ? format(draft.to, 'MMM d, yyyy') : ''}
                    placeholder="Date"
                    className="h-9 min-w-0 flex-1 cursor-default border-input/80 bg-background font-normal tabular-nums"
                  />
                  <AuditCustomTimeInput
                    value={draft?.to}
                    disabled={!draft?.to}
                    aria-label="End time"
                    onChange={(next) => {
                      setDraft((prev) => (prev?.to ? { ...prev, to: next } : prev));
                    }}
                  />
                </div>
              </Field>
            </FieldGroup>
            <div className="border-t border-border bg-popover px-2 pb-3 pt-1.5">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full gap-2 rounded-md border-input bg-muted/40 font-medium text-popover-foreground shadow-none hover:bg-muted/55"
                disabled={!draft?.from || !draft?.to}
                onClick={() => {
                  if (!draft?.from || !draft?.to) return;
                  appliedRef.current = draft;
                  onCustomAppliedChange(draft);
                  setPopoverOpen(false);
                }}
              >
                <CornerDownLeft className="size-4 shrink-0 opacity-80" aria-hidden />
                Apply
              </Button>
            </div>
            <FieldGroup className="border-t border-border bg-muted/20 px-2 py-2">
              <Field>
                <FieldLabel className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Time zone
                </FieldLabel>
                <Select value={timezone} onValueChange={onTimezoneChange}>
                  <SelectTrigger className="h-9 w-full min-w-0 max-w-full border-0 bg-transparent text-xs text-muted-foreground shadow-none ring-0 focus-visible:ring-0 [&>span]:min-w-0 [&>span]:truncate [&>svg]:shrink-0">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                <SelectContent align="start" className="min-w-[var(--radix-select-trigger-width)] max-w-[min(320px,calc(100vw-2rem))]">
                  {timezoneOptions.map((tz) => {
                    const localTz = timezoneOptions[0];
                    return (
                      <SelectItem key={tz} value={tz} className="text-xs">
                        {tz === localTz ? `Local (${tz})` : tz}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </div>
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

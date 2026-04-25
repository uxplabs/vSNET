'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { format, set } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HOURS12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function to24h(h12: number, ap: 'AM' | 'PM'): number {
  if (ap === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function from24h(h24: number): { h12: number; ap: 'AM' | 'PM' } {
  const ap: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { h12, ap };
}

export function AuditCustomTimeInput({
  value,
  onChange,
  disabled,
  id,
  'aria-label': ariaLabel,
}: {
  value: Date | undefined;
  onChange: (next: Date) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}) {
  const parts = useMemo(() => {
    if (!value) return { h12: 12, mm: 0, ap: 'AM' as const };
    const mm = value.getMinutes();
    const { h12, ap } = from24h(value.getHours());
    return { h12, mm, ap };
  }, [value]);

  const apply = (h12: number, mm: number, ap: 'AM' | 'PM') => {
    if (!value) return;
    const h24 = to24h(h12, ap);
    onChange(set(value, { hours: h24, minutes: mm, seconds: 0, milliseconds: 0 }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-label={ariaLabel}
          disabled={disabled || !value}
          className={cn(
            'relative flex h-9 min-w-[7.5rem] max-w-[8.5rem] flex-1 shrink-0 items-center rounded-md border border-input bg-background px-2.5 pr-9 text-left text-sm tabular-nums tracking-tight',
            'outline-none transition-[color,box-shadow] hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="min-w-0 flex-1 truncate">{value ? format(value, 'h:mm a') : '—'}</span>
          <Clock className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-border/80 p-3 shadow-lg" align="end" sideOffset={6}>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(parts.h12)}
            onValueChange={(v) => apply(Number(v), parts.mm, parts.ap)}
          >
            <SelectTrigger className="h-8 w-[4.5rem] text-xs" aria-label="Hour">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {HOURS12.map((h) => (
                <SelectItem key={h} value={String(h)} className="text-xs">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(parts.mm)}
            onValueChange={(v) => apply(parts.h12, Number(v), parts.ap)}
          >
            <SelectTrigger className="h-8 w-[4.25rem] text-xs" aria-label="Minute">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {MINUTES.map((m) => (
                <SelectItem key={m} value={String(m)} className="text-xs font-mono tabular-nums">
                  {String(m).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={parts.ap}
            onValueChange={(v) => apply(parts.h12, parts.mm, v as 'AM' | 'PM')}
          >
            <SelectTrigger className="h-8 w-[4.75rem] text-xs" aria-label="AM or PM">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM" className="text-xs">
                AM
              </SelectItem>
              <SelectItem value="PM" className="text-xs">
                PM
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

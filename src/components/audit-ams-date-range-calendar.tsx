'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, addMonths, compareAsc, format, isSameDay, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import './audit-ams-date-range-calendar.css';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

function monthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const start = addDays(first, -startDow);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
  return cells;
}

function cmpDay(a: Date, b: Date): number {
  return compareAsc(startOfDay(a), startOfDay(b));
}

export type AuditAmsDateRangeCalendarProps = {
  value: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  defaultMonth?: Date;
  className?: string;
};

/**
 * Grid-based range calendar from the AMS “Date Range Picker — Core” standalone
 * (picker-core.jsx CalendarMonth), wired to react-day-picker’s DateRange shape.
 */
export function AuditAmsDateRangeCalendar({
  value,
  onSelect,
  defaultMonth,
  className,
}: AuditAmsDateRangeCalendarProps) {
  const [view, setView] = useState(() => {
    const seed = defaultMonth ?? value?.from ?? value?.to ?? new Date();
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  });
  const [hover, setHover] = useState<Date | null>(null);

  const defaultMonthTime = defaultMonth?.getTime() ?? null;

  useEffect(() => {
    if (defaultMonthTime == null) return;
    const dm = new Date(defaultMonthTime);
    setView(new Date(dm.getFullYear(), dm.getMonth(), 1));
  }, [defaultMonthTime]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const { rStart, rEnd } = useMemo(() => {
    const from = value?.from;
    const to = value?.to;
    if (!from) return { rStart: undefined as Date | undefined, rEnd: undefined as Date | undefined };

    const collapsed = to && isSameDay(from, to);
    const previewOpen = !to || collapsed;

    if (previewOpen && hover && !isSameDay(hover, from)) {
      if (cmpDay(hover, from) < 0) return { rStart: hover, rEnd: from };
      return { rStart: from, rEnd: hover };
    }

    if (to) return { rStart: from, rEnd: to };
    return { rStart: from, rEnd: from };
  }, [value?.from, value?.to, hover]);

  const pick = useCallback(
    (d: Date) => {
      const from = value?.from;
      const to = value?.to;

      if (!from) {
        onSelect({ from: d, to: undefined });
        return;
      }

      if (from && !to) {
        if (cmpDay(d, from) < 0) onSelect({ from: d, to: from });
        else onSelect({ from, to: d });
        return;
      }

      if (from && to && !isSameDay(from, to)) {
        onSelect({ from: d, to: undefined });
        return;
      }

      if (isSameDay(d, from)) return;

      const earlier = cmpDay(d, from) < 0 ? d : from;
      const later = cmpDay(d, from) < 0 ? from : d;
      onSelect({ from: earlier, to: later });
    },
    [onSelect, value?.from, value?.to],
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const cells = useMemo(() => monthMatrix(year, month), [year, month]);

  return (
    <div className={cn('audit-ams-drp drp', className)}>
      <div className="audit-ams-drp__head">
        <button
          type="button"
          className="audit-ams-drp__navbtn"
          aria-label="Previous month"
          onClick={() => setView((v) => addMonths(v, -1))}
        >
          <ChevronLeft className="size-[18px] shrink-0" aria-hidden />
        </button>
        <div className="audit-ams-drp__title">{format(view, 'MMMM yyyy')}</div>
        <button
          type="button"
          className="audit-ams-drp__navbtn"
          aria-label="Next month"
          onClick={() => setView((v) => addMonths(v, 1))}
        >
          <ChevronRight className="size-[18px] shrink-0" aria-hidden />
        </button>
      </div>

      <div className="drp__dow">
        {DOW.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="drp__week">
            {cells.slice(row * 7, row * 7 + 7).map((d, col) => {
              const inMonth = d.getMonth() === month;
              const isToday = isSameDay(d, today);
              const isStart = rStart ? isSameDay(d, rStart) : false;
              const isEnd = rEnd ? isSameDay(d, rEnd) : false;
              const isIn =
                rStart && rEnd ? cmpDay(d, rStart) > 0 && cmpDay(d, rEnd) < 0 : false;
              const cls = cn(
                'drp__cell',
                !inMonth && 'out',
                isToday && 'today',
                isStart && 'start',
                isEnd && 'end',
                isIn && 'in',
              );
              return (
                <button
                  key={col}
                  type="button"
                  className={cls}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className="num">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

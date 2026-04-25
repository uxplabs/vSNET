"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { Day, DayButton, DayPicker, getDefaultClassNames, Month } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function mergedChildClassName(node: React.ReactNode): string {
  if (!React.isValidElement(node)) return ""
  const raw = (node.props as { className?: unknown }).className
  if (typeof raw === "string") return raw
  if (Array.isArray(raw)) return raw.filter(Boolean).join(" ")
  return ""
}

/**
 * With `navLayout="around"`, RDP stacks prev/caption/next vertically.
 * Prev/next render as native `<button>` (via `components.Button`), not the wrapper function type,
 * and caption/grid render as `div`/`table` — so we locate them by stable `rdp-*` class names.
 */
function CalendarMonth(props: React.ComponentProps<typeof Month>) {
  const { calendarMonth: _cm, displayIndex: _di, children, className, ...rest } = props
  const arr = React.Children.toArray(children)
  const prev = arr.find(
    (el) => React.isValidElement(el) && mergedChildClassName(el).includes("rdp-button_previous")
  )
  const next = arr.find(
    (el) => React.isValidElement(el) && mergedChildClassName(el).includes("rdp-button_next")
  )
  const caption = arr.find(
    (el) => React.isValidElement(el) && mergedChildClassName(el).includes("rdp-month_caption")
  )
  const grid = arr.find(
    (el) => React.isValidElement(el) && mergedChildClassName(el).includes("rdp-month_grid")
  )
  const loose = arr.filter((el) => el !== prev && el !== next && el !== caption && el !== grid)

  if (caption && grid) {
    const prevSlot =
      prev ?? (
        <span className="inline-block w-[var(--cell-size)] shrink-0" aria-hidden />
      )
    const nextSlot =
      next ?? (
        <span className="inline-block w-[var(--cell-size)] shrink-0" aria-hidden />
      )
    return (
      <div
        className={cn(
          "flex w-fit min-w-[calc(7*var(--cell-size))] shrink-0 flex-col gap-1 sm:gap-1.5",
          className
        )}
        {...rest}
      >
        <div className="grid w-full min-w-0 grid-cols-[minmax(var(--cell-size),auto)_1fr_minmax(var(--cell-size),auto)] items-center gap-2">
          <div className="flex justify-start">{prevSlot}</div>
          <div className="flex w-full min-w-0 justify-center [&_.rdp-month_caption]:w-full">
            {caption}
          </div>
          <div className="flex justify-end">{nextSlot}</div>
        </div>
        {grid}
        {loose}
      </div>
    )
  }

  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  )
}

/** Centers the day button in the cell without `display:flex` on `<td>` (which breaks the table grid). */
function CalendarDay(props: React.ComponentProps<typeof Day>) {
  const { children, day: _day, modifiers: _modifiers, ...tdProps } = props
  return (
    <td {...tdProps}>
      <div className="flex h-full min-h-[var(--cell-size)] w-full items-center justify-center p-0">
        {children}
      </div>
    </td>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  navButtonClassName,
  dayButtonClassName,
  navLayout = "around",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  /** Appended to previous/next month controls (e.g. bordered square arrows). */
  navButtonClassName?: string
  /** Appended to each day cell button (e.g. circular range selection). */
  dayButtonClassName?: string
}) {
  const defaultClassNames = getDefaultClassNames()

  const mergedComponents = {
    ...components,
    ...(dayButtonClassName
      ? {
          DayButton: (dayProps: React.ComponentProps<typeof DayButton>) => (
            <CalendarDayButton {...dayProps} className={cn(dayProps.className, dayButtonClassName)} />
          ),
        }
      : {}),
  }

  return (
    <DayPicker
      {...props}
      navLayout={navLayout}
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-2 text-sm [--cell-size:1.75rem] [[data-slot=card-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          defaultClassNames.months,
          // w-max + overflow-visible avoids clipping day cells in narrow popovers (e.g. audit custom range).
          "relative flex w-max max-w-none flex-row flex-nowrap items-start justify-center gap-3 overflow-visible sm:gap-4",
        ),
        month: cn(defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous,
          navButtonClassName,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next,
          navButtonClassName,
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full min-w-0 items-center justify-center p-0 [&:has(.rdp-caption_label)]:justify-center",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-xs font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "min-w-0 select-none truncate px-1 text-center font-medium max-w-full",
          captionLayout === "label"
            ? "block w-full text-xs"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-xs [&>svg]:size-3",
          defaultClassNames.caption_label
        ),
        // table-fixed + explicit table width: equal columns without per-cell % widths (avoids thead/body drift).
        table:
          "table-fixed w-[calc(7*var(--cell-size))] min-w-[calc(7*var(--cell-size))] max-w-[calc(7*var(--cell-size))] border-collapse",
        weekdays: cn(
          defaultClassNames.weekdays,
          "w-[calc(7*var(--cell-size))] min-w-[calc(7*var(--cell-size))] max-w-none shrink-0",
        ),
        weekday: cn(
          defaultClassNames.weekday,
          "text-muted-foreground box-border h-6 min-w-0 select-none p-0 text-center align-middle text-[10px] font-medium tabular-nums",
        ),
        week: cn(
          defaultClassNames.week,
          "mt-0.5 w-[calc(7*var(--cell-size))] min-w-[calc(7*var(--cell-size))] max-w-none shrink-0",
        ),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          defaultClassNames.day,
          // Never use display:flex on <td> — breaks table layout; centering is done by CalendarDay inner wrapper.
          "group/day relative box-border h-[var(--cell-size)] min-w-0 p-0 text-center align-middle [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
        ),
        range_start: cn(
          "bg-muted rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("bg-muted rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-muted rounded-r-md", defaultClassNames.range_end),
        today: cn("rounded-md", defaultClassNames.today),
        outside: cn(
          "text-muted-foreground/50 aria-selected:text-muted-foreground/60",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-3.5", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-3.5", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-3.5", className)} {...props} />
          )
        },
        Day: CalendarDay,
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...mergedComponents,
        Month: components?.Month ?? CalendarMonth,
      }}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      data-day={day.date.toLocaleDateString()}
      data-today={modifiers.today}
      data-in-range={modifiers.selected ? "true" : undefined}
      data-outside={modifiers.outside ? "true" : undefined}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "inline-flex align-middle !h-[var(--cell-size)] !w-[var(--cell-size)] !min-h-[var(--cell-size)] !min-w-[var(--cell-size)] !max-h-[var(--cell-size)] !max-w-[var(--cell-size)] !shrink-0 !items-center !justify-center !gap-0 !p-0 text-[10px] font-medium tabular-nums leading-none rounded-md text-foreground shadow-none",
        "transition-[color,box-shadow,background-color] duration-150",
        "aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground",
        "hover:bg-white/12 hover:text-foreground",
        "data-[outside=true]:text-muted-foreground/55 data-[outside=true]:hover:bg-muted/35",
        "data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-foreground data-[range-middle=true]:hover:bg-white/10",
        "data-[today=true]:data-[in-range=false]:bg-transparent data-[today=true]:data-[in-range=false]:text-foreground data-[today=true]:data-[in-range=false]:ring-2 data-[today=true]:data-[in-range=false]:ring-blue-500 data-[today=true]:data-[in-range=false]:hover:bg-white/10",
        "data-[selected-single=true]:!bg-white data-[selected-single=true]:!text-zinc-950 data-[selected-single=true]:hover:!bg-white data-[selected-single=true]:hover:!text-zinc-950",
        "data-[range-start=true]:!bg-white data-[range-start=true]:!text-zinc-950 data-[range-start=true]:shadow-sm data-[range-start=true]:hover:!bg-white data-[range-start=true]:hover:!text-zinc-950",
        "data-[range-end=true]:!bg-white data-[range-end=true]:!text-zinc-950 data-[range-end=true]:shadow-sm data-[range-end=true]:hover:!bg-white data-[range-end=true]:hover:!text-zinc-950",
        "[&[data-range-start=true][data-range-end=true]]:!rounded-md [&[data-range-start=true][data-range-end=true]]:hover:!rounded-md",
        "data-[range-start=true]:data-[today=true]:!bg-white data-[range-start=true]:data-[today=true]:ring-0 data-[range-start=true]:data-[today=true]:ring-offset-0",
        "data-[range-end=true]:data-[today=true]:!bg-white data-[range-end=true]:data-[today=true]:ring-0 data-[range-end=true]:data-[today=true]:ring-offset-0",
        "focus-visible:!ring-0 focus-visible:!ring-offset-0",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:outline group-data-[focused=true]/day:outline-2 group-data-[focused=true]/day:outline-offset-2 group-data-[focused=true]/day:outline-white/60",
        "data-[selected-single=true]:[&>span]:text-zinc-950 data-[range-start=true]:[&>span]:text-zinc-950 data-[range-end=true]:[&>span]:text-zinc-950 data-[range-middle=true]:[&>span]:text-foreground data-[today=true]:data-[in-range=false]:[&>span]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

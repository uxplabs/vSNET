'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NameValueField } from '@/components/ui/editable-value';
import { DeviceLink } from '@/components/ui/device-link';
import type { AlarmSeverity } from './alarms-table-card';

/** Shared alarm shape for AlarmDrawer (AlarmTableRow or AlarmRow from alarms-data-table) */
export interface AlarmDrawerAlarm {
  id: string;
  severity: AlarmSeverity;
  region?: string;
  timestamp: string;
  updated: string;
  source: string;
  configStatus?: string;
  managedObject: string;
  type: string;
  description?: string;
  ticket?: string;
  ticketId?: string;
  owner: string;
}

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-warning' },
};

export interface AlarmDrawerProps {
  alarm: AlarmDrawerAlarm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allAlarms?: AlarmDrawerAlarm[];
  /** Ordered list from the alarm table (filtered/sorted) for prev/next nav */
  tableAlarms?: AlarmDrawerAlarm[];
  /** Called when user navigates to prev/next alarm */
  onSelectAlarm?: (alarm: AlarmDrawerAlarm) => void;
  onNavigateToDevice?: (source: string) => void;
}

export function AlarmDrawer({ alarm, open, onOpenChange, allAlarms = [], tableAlarms = [], onSelectAlarm }: AlarmDrawerProps) {
  const [summaryValues, setSummaryValues] = React.useState(() => ({
    ticket: alarm?.ticket ?? '',
    owner: alarm?.owner ?? '',
  }));

  React.useEffect(() => {
    if (alarm) {
      const t = alarm.ticket ?? (alarm as { ticketId?: string }).ticketId ?? '';
      setSummaryValues({
        ticket: t,
        owner: alarm.owner ?? '',
      });
    }
  }, [alarm]);

  if (!alarm) return null;

  const severityCfg = SEVERITY_ICON[alarm.severity];
  const relatedAlarms = allAlarms.filter((a) => a.source === alarm.source && a.id !== alarm.id).slice(0, 5);

  const currentIndex = tableAlarms.length > 0
    ? tableAlarms.findIndex((a) => a.id === alarm.id)
    : -1;
  const hasNav = tableAlarms.length > 0 && currentIndex >= 0;
  const canPrev = hasNav && currentIndex > 0;
  const canNext = hasNav && currentIndex < tableAlarms.length - 1;
  const navLabel = hasNav ? `${currentIndex + 1} of ${tableAlarms.length}` : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="left-auto right-0 top-0 bottom-0 h-full w-[560px] max-w-[90vw] rounded-l-[10px] rounded-t-none mt-0 [&>div:first-child]:hidden">
        <TooltipProvider delayDuration={300}>
        <div className="flex flex-col h-full min-h-0">
          <DrawerHeader className="relative pr-12 shrink-0">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 shrink-0"
                aria-label="Close"
              >
                <Icon name="close" size={20} />
              </Button>
            </DrawerClose>
            <DrawerTitle className="text-xl font-semibold flex items-center gap-2">
              <Icon name={severityCfg.name} size={24} className={`shrink-0 ${severityCfg.className}`} />
              {alarm.severity} – {alarm.type}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-auto px-4 pt-6 pb-4 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h4 className="text-sm font-semibold text-foreground">Alarm details</h4>
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Device</span>
                    <DeviceLink value={alarm.source} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-medium inline-flex items-center gap-1.5">
                      <Icon name={severityCfg.name} size={18} className={`shrink-0 ${severityCfg.className}`} />
                      {alarm.severity}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Time occurred</span>
                    <span className="font-medium tabular-nums">{alarm.timestamp}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Time updated</span>
                    <span className="font-medium tabular-nums">{alarm.updated}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Managed object</span>
                    <span className="font-medium">{alarm.managedObject}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{alarm.type}</span>
                  </div>
                  <div className="flex flex-col gap-1 col-span-3">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{alarm.description ?? `${alarm.type}. Check device ${alarm.source} for connectivity and configuration.`}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <NameValueField
                    label="Ticket ID"
                    value={summaryValues.ticket}
                    onSave={(v) => setSummaryValues((s) => ({ ...s, ticket: v }))}
                    placeholder="—"
                  />
                  <NameValueField
                    label="Owner"
                    value={summaryValues.owner}
                    onSave={(v) => setSummaryValues((s) => ({ ...s, owner: v }))}
                    placeholder="—"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Other alarms from {alarm.source}
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs font-medium">
                    {relatedAlarms.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {relatedAlarms.length > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 px-2">Time occurred</TableHead>
                          <TableHead className="h-8 px-2">Severity</TableHead>
                          <TableHead className="h-8 px-2">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedAlarms.map((a) => {
                          const cfg = SEVERITY_ICON[a.severity];
                          return (
                            <TableRow
                              key={a.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => onSelectAlarm?.(a)}
                            >
                              <TableCell className="py-1.5 px-2 text-xs tabular-nums">{a.timestamp}</TableCell>
                              <TableCell className="py-1.5 px-2">
                                <span className="inline-flex items-center gap-1.5 text-xs">
                                  <Icon name={cfg.name} size={14} className={`shrink-0 ${cfg.className}`} />
                                  {a.severity}
                                </span>
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs truncate max-w-[20ch]">{a.type}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No other alarms from this source</p>
                )}
              </CardContent>
            </Card>
          </div>
          {hasNav && (
            <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={!canPrev}
                onClick={() => canPrev && onSelectAlarm?.(tableAlarms[currentIndex - 1])}
                aria-label="Previous alarm"
              >
                <Icon name="chevron_left" size={20} />
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground min-w-[4rem] text-center">
                {navLabel}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={!canNext}
                onClick={() => canNext && onSelectAlarm?.(tableAlarms[currentIndex + 1])}
                aria-label="Next alarm"
              >
                <Icon name="chevron_right" size={20} />
              </Button>
            </div>
          )}
        </div>
        </TooltipProvider>
      </DrawerContent>
    </Drawer>
  );
}

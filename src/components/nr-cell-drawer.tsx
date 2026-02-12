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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';
import type { NrCellRow } from './nr-cells-data-table';
import { NR_CELLS_DATA } from './nr-cells-data-table';
import { ZONES_DATA } from './zones-data-table';
import { AlarmDrawer } from './alarm-drawer';
import type { AlarmDrawerAlarm } from './alarm-drawer';
import { ALARM_TYPE_CONFIG } from './devices-data-table';

type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-yellow-500' },
};

const ALARM_TYPES = ['Device disconnected', 'Link down', 'Radio link failure', 'Config mismatch'];

function getNrCellAlarms(name: string, count: number) {
  const severities: AlarmSeverity[] = ['Critical', 'Major', 'Minor'];
  const alarms: { timestamp: string; updated: string; source: string; severity: AlarmSeverity; type: string; managedObject: string }[] = [];
  for (let i = 0; i < count; i++) {
    const h = 8 + (i * 3) % 12;
    const m = (i * 7) % 60;
    const ts = `01/27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const up = `01/27 ${String(h).padStart(2, '0')}:${String(Math.min(59, m + 2)).padStart(2, '0')}`;
    alarms.push({
      timestamp: ts,
      updated: up,
      source: name,
      severity: severities[i % 3],
      type: ALARM_TYPES[i % ALARM_TYPES.length],
      managedObject: `Cell-${(i % 6) + 1}`,
    });
  }
  return alarms;
}

interface NrCellDrawerProps {
  nrCell: NrCellRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NrCellDrawer({ nrCell, open, onOpenChange }: NrCellDrawerProps) {
  const [alarmDrawerOpen, setAlarmDrawerOpen] = React.useState(false);
  const [selectedAlarm, setSelectedAlarm] = React.useState<AlarmDrawerAlarm | null>(null);

  if (!nrCell) return null;

  const statusLabel = nrCell.status === 'Up' ? 'Connected' : 'Disconnected';
  const alarmConfig = ALARM_TYPE_CONFIG[nrCell.alarmType] ?? ALARM_TYPE_CONFIG.None;

  // Find zones that reference this cell
  const cellZones = ZONES_DATA.filter((z) => z.cellId === nrCell.cellId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="left-auto right-0 top-0 bottom-0 h-full w-[560px] max-w-[90vw] rounded-l-[10px] rounded-t-none mt-0 [&>div:first-child]:hidden">
        <TooltipProvider delayDuration={300}>
        <div className="flex flex-col h-full min-h-0">
          {nrCell.status === 'Down' && (
            <div className="shrink-0 h-4 bg-destructive rounded-tl-[10px]" />
          )}
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
            <DrawerTitle className="text-xl font-semibold">{nrCell.name}</DrawerTitle>
            <div className="flex items-center gap-3 pt-1">
              <DeviceStatus
                status={nrCell.status === 'Up' ? 'Connected' : 'Disconnected'}
                iconSize={16}
              />
            </div>
            <div className="flex items-center gap-2 pt-3">
              <Button variant="outline" size="sm" className="h-8">
                Edit NR cell
              </Button>
            </div>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-4">
            {/* Summary Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Cell ID</span>
                    <span className="font-medium font-mono text-xs">{nrCell.cellId}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{nrCell.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{nrCell.description}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Status</span>
                    <DeviceStatus status={statusLabel} iconSize={14} className="text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Enabled</span>
                    <span className="font-medium inline-flex items-center gap-1.5">
                      <Icon
                        name={nrCell.enabled ? 'check_circle' : 'cancel'}
                        size={18}
                        className={nrCell.enabled ? 'text-success' : 'text-muted-foreground'}
                      />
                      {nrCell.enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">DL bandwidth</span>
                    <span className="font-medium tabular-nums">{nrCell.dlBandwidth}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Radio node</span>
                    <DeviceLink value={nrCell.radioNode} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Alarms</span>
                    {nrCell.alarms === 0 ? (
                      <span className="font-medium text-muted-foreground tabular-nums">0</span>
                    ) : (
                      <span className="font-medium inline-flex items-center gap-2">
                        <span className="tabular-nums">{nrCell.alarms}</span>
                        <Icon name={alarmConfig.name} size={18} className={`shrink-0 ${alarmConfig.className}`} />
                        {nrCell.alarmType !== 'None' && <span className="text-sm">{nrCell.alarmType}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zones */}
            {cellZones.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    Zones
                    <span className="inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                      {cellZones.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-0 divide-y">
                  {cellZones.map((zone) => (
                    <div key={zone.cellId + zone.description} className="py-4 first:pt-0 last:pb-0 space-y-3">
                      <div>
                        <span className="font-mono text-sm font-semibold">{zone.cellId}</span>
                        <p className="text-sm text-muted-foreground mt-0.5">{zone.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">911 enabled</span>
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Icon
                              name={zone.e911Enabled ? 'check_circle' : 'cancel'}
                              size={14}
                              className={zone.e911Enabled ? 'text-success' : 'text-muted-foreground'}
                            />
                            {zone.e911Enabled ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">Priority</span>
                          <span className="font-medium tabular-nums">{zone.priority}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">ERFCN UL</span>
                          <span className="font-medium tabular-nums">{zone.erfcnUl}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">UL bandwidth</span>
                          <span className="font-medium tabular-nums">{zone.ulBandwidth}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">ERFCN DL</span>
                          <span className="font-medium tabular-nums">{zone.erfcnDl}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">DL bandwidth</span>
                          <span className="font-medium tabular-nums">{zone.dlBandwidth}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Alarms Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Alarms
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs font-medium">
                    {nrCell.alarms}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {nrCell.alarms > 0 ? (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 px-2">Severity</TableHead>
                          <TableHead className="h-8 px-2">Timestamp</TableHead>
                          <TableHead className="h-8 px-2">Updated</TableHead>
                          <TableHead className="h-8 px-2">Source</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getNrCellAlarms(nrCell.name, Math.min(nrCell.alarms, 5)).map((alarm, i) => {
                          const cfg = SEVERITY_ICON[alarm.severity];
                          const alarmForDrawer: AlarmDrawerAlarm = {
                            id: `nrc-alarm-${i}`,
                            severity: alarm.severity,
                            timestamp: alarm.timestamp,
                            updated: alarm.updated,
                            source: alarm.source,
                            managedObject: alarm.managedObject,
                            type: alarm.type,
                            owner: '—',
                          };
                          return (
                            <TableRow key={i}>
                              <TableCell className="py-1.5 px-2">
                                <button
                                  type="button"
                                  className="group/alarm inline-flex items-center gap-1.5 text-xs cursor-pointer text-left"
                                  onClick={() => {
                                    setSelectedAlarm(alarmForDrawer);
                                    setAlarmDrawerOpen(true);
                                  }}
                                >
                                  <Icon name={cfg.name} size={14} className={`shrink-0 ${cfg.className}`} />
                                  <span className="group-hover/alarm:underline">{alarm.severity}</span>
                                  <Icon
                                    name="open_in_new"
                                    size={12}
                                    className="shrink-0 opacity-0 group-hover/alarm:opacity-70 transition-opacity text-muted-foreground"
                                    aria-hidden
                                  />
                                </button>
                              </TableCell>
                              <TableCell className="py-1.5 px-2 text-xs tabular-nums">{alarm.timestamp}</TableCell>
                              <TableCell className="py-1.5 px-2 text-xs tabular-nums">{alarm.updated}</TableCell>
                              <TableCell className="py-1.5 px-2 text-xs truncate max-w-[24ch]">{alarm.source}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No active alarms</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
        </TooltipProvider>
      </DrawerContent>
      <AlarmDrawer
        alarm={selectedAlarm}
        open={alarmDrawerOpen}
        onOpenChange={setAlarmDrawerOpen}
      />
    </Drawer>
  );
}

/** Look up an NrCellRow by cellId or name */
export function findNrCell(name: string): NrCellRow | null {
  // Direct cellId match (e.g. "NR-001")
  const found = NR_CELLS_DATA.find((c) => c.cellId === name);
  if (found) return found;
  // Name match (e.g. "NR Cell 1")
  const byName = NR_CELLS_DATA.find((c) => c.name === name);
  if (byName) return byName;
  // Synthetic fallback
  const idx = parseInt(name.replace(/\D/g, ''), 10) || 0;
  if (idx <= 0) return null;
  const cellId = `NR-${String(idx).padStart(3, '0')}`;
  // Look up zones from ZONES_DATA if they exist
  const matchedZones = ZONES_DATA.filter((z) => z.cellId === cellId);
  return {
    cellId,
    name: `NR Cell ${idx}`,
    description: 'NR cell',
    status: 'Up',
    enabled: true,
    alarms: 0,
    alarmType: 'None',
    zone1: matchedZones[0]?.description ?? 'Zone 1',
    zone2: matchedZones[1]?.description ?? 'Zone 2',
    radioNode: `RN-${String(Math.ceil(idx / 2)).padStart(3, '0')}`,
    dlBandwidth: '100 MHz',
  };
}

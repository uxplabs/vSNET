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
import { DeviceStatus } from '@/components/ui/device-status';
import { DeviceLink } from '@/components/ui/device-link';
import type { RadioNodeRow } from './radio-nodes-data-table';
import { RADIO_NODES_DATA } from './radio-nodes-data-table';
import { AlarmDrawer } from './alarm-drawer';
import type { AlarmDrawerAlarm } from './alarm-drawer';
import { ALARM_TYPE_CONFIG } from './devices-data-table';
import { NR_CELLS_DATA } from './nr-cells-data-table';

type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-warning' },
};

const DRAWER_ALARM_TYPES = ['Device disconnected', 'Link down', 'Radio link failure', 'Config mismatch'];

function getRadioNodeAlarms(name: string, count: number) {
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
      type: DRAWER_ALARM_TYPES[i % DRAWER_ALARM_TYPES.length],
      managedObject: (i % 2 === 0 ? 'Cell-' : 'Radio-') + ((i % 12) + 1),
    });
  }
  return alarms;
}


interface RadioNodeDrawerProps {
  radioNode: RadioNodeRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToHost?: (deviceName: string) => void;
}

export function RadioNodeDrawer({ radioNode, open, onOpenChange, onNavigateToHost }: RadioNodeDrawerProps) {
  const [alarmDrawerOpen, setAlarmDrawerOpen] = React.useState(false);
  const [selectedAlarm, setSelectedAlarm] = React.useState<AlarmDrawerAlarm | null>(null);

  if (!radioNode) return null;

  const statusLabel = radioNode.status === 'Up' ? 'Connected' : 'Disconnected';
  const alarmConfig = ALARM_TYPE_CONFIG[radioNode.alarmType] ?? ALARM_TYPE_CONFIG.None;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="left-auto right-0 top-0 bottom-0 h-full w-[560px] max-w-[90vw] rounded-l-[10px] rounded-t-none mt-0 [&>div:first-child]:hidden">
        <TooltipProvider delayDuration={300}>
        <div className="flex flex-col h-full min-h-0">
          {radioNode.status === 'Down' && (
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
            <DrawerTitle className="text-xl font-semibold">{radioNode.name}</DrawerTitle>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <Icon
                  name={radioNode.status === 'Up' ? 'arrow_upward' : 'arrow_downward'}
                  size={16}
                  className={radioNode.status === 'Up' ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}
                />
                {radioNode.status}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  onNavigateToHost?.(radioNode.name);
                  onOpenChange(false);
                }}
              >
                Host details
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Edit radio node
              </Button>
            </div>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-4">
            {/* Radio Node Info Card — mirrors data from the radio nodes table in device details */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Status</span>
                    <DeviceStatus status={statusLabel} iconSize={14} className="text-sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Enabled</span>
                    <span className="font-medium inline-flex items-center gap-1.5">
                      <Icon
                        name={radioNode.enabled ? 'check_circle' : 'cancel'}
                        size={18}
                        className={radioNode.enabled ? 'text-success' : 'text-muted-foreground'}
                      />
                      {radioNode.enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Alarms</span>
                    <span className="font-medium inline-flex items-center gap-2">
                      <span className="tabular-nums">{radioNode.alarms}</span>
                      <Icon name={alarmConfig.name} size={18} className={`shrink-0 ${alarmConfig.className}`} />
                      {radioNode.alarmType !== 'None' && <span className="text-sm">{radioNode.alarmType}</span>}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">NR cells</span>
                    <div className="flex flex-col gap-0.5">
                      <DeviceLink value={radioNode.nrCell1} />
                      <DeviceLink value={radioNode.nrCell2} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Ethernet ID</span>
                    <span className="font-medium font-mono text-xs">{radioNode.ethernetId}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{radioNode.model}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium">{radioNode.description}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Index</span>
                    <span className="font-medium tabular-nums">{radioNode.index}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NR Cells */}
            {(() => {
              const rnId = `RN-${String(radioNode.index).padStart(3, '0')}`;
              const nrCells = NR_CELLS_DATA.filter((c) => c.radioNode === rnId);
              if (nrCells.length === 0) return null;
              return (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      NR cells
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs font-medium">
                        {nrCells.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-0 divide-y">
                    {nrCells.map((cell) => {
                      const cellAlarmCfg = ALARM_TYPE_CONFIG[cell.alarmType] ?? ALARM_TYPE_CONFIG.None;
                      return (
                        <div key={cell.cellId} className="py-4 first:pt-0 last:pb-0 space-y-3">
                          <div>
                            <DeviceLink value={cell.cellId} className="font-mono text-sm font-semibold" />
                            <p className="text-sm text-muted-foreground mt-0.5">{cell.description}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-muted-foreground text-xs">Status</span>
                              <DeviceStatus status={cell.status === 'Up' ? 'Connected' : 'Disconnected'} iconSize={14} className="text-sm" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-muted-foreground text-xs">Enabled</span>
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <Icon
                                  name={cell.enabled ? 'check_circle' : 'cancel'}
                                  size={14}
                                  className={cell.enabled ? 'text-success' : 'text-muted-foreground'}
                                />
                                {cell.enabled ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-muted-foreground text-xs">Alarms</span>
                              {cell.alarms === 0 ? (
                                <span className="font-medium text-muted-foreground tabular-nums">0</span>
                              ) : (
                                <span className="font-medium inline-flex items-center gap-1.5">
                                  <span className="tabular-nums">{cell.alarms}</span>
                                  <Icon name={cellAlarmCfg.name} size={14} className={cellAlarmCfg.className} />
                                  <span>{cell.alarmType}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-muted-foreground text-xs">DL bandwidth</span>
                              <span className="font-medium tabular-nums">{cell.dlBandwidth}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-muted-foreground text-xs">Zones</span>
                              <div className="flex flex-col gap-0.5">
                                <DeviceLink value={cell.zone1} />
                                <DeviceLink value={cell.zone2} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Alarms Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Alarms
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs font-medium">
                    {radioNode.alarms}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {radioNode.alarms > 0 ? (
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
                        {getRadioNodeAlarms(radioNode.name, Math.min(radioNode.alarms, 5) || 1).map((alarm, i) => {
                          const cfg = SEVERITY_ICON[alarm.severity];
                          const alarmForDrawer: AlarmDrawerAlarm = {
                            id: `rn-alarm-${i}`,
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

/** Look up a RadioNodeRow by name, or create a synthetic one */
export function findRadioNode(name: string): RadioNodeRow | null {
  const found = RADIO_NODES_DATA.find((rn) => rn.name === name);
  if (found) return found;
  // Check for inventory-style names like RN-001
  const invMatch = RADIO_NODES_DATA.find((rn) => {
    const invName = `RN-${String(rn.index).padStart(3, '0')}`;
    return invName === name;
  });
  if (invMatch) return invMatch;
  // Create synthetic for unknown radio nodes
  const idx = parseInt(name.replace(/\D/g, ''), 10) || 0;
  return {
    index: idx,
    name,
    description: 'Radio node',
    status: 'Up',
    enabled: true,
    alarms: 0,
    alarmType: 'None',
    nrCell1: `NR-${String(idx * 2 - 1).padStart(3, '0')}`,
    nrCell2: `NR-${String(idx * 2).padStart(3, '0')}`,
    ethernetId: `00:1a:2b:3c:4d:${(0x5e + idx).toString(16).padStart(2, '0')}`,
    model: 'ABAB123',
  };
}

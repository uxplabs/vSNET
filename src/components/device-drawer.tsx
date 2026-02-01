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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DeviceRow } from './devices-data-table';

const ALARM_TYPE_CONFIG: Record<string, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
  None: { name: 'check_circle', className: 'text-muted-foreground' },
};

type AlarmSeverity = 'Critical' | 'Major' | 'Minor';

interface DrawerAlarmRow {
  timestamp: string;
  updated: string;
  source: string;
  severity: AlarmSeverity;
}

interface NoteMessage {
  id: string;
  author: string;
  content: string;
  datetime: string;
}

const MOCK_NOTES: NoteMessage[] = [
  { id: '1', author: 'J. Smith', content: 'Scheduled maintenance completed. All systems nominal.', datetime: 'Jan 25, 2025 at 2:34 PM' },
  { id: '2', author: 'A. Jones', content: 'Radio config updated per change request #2841.', datetime: 'Jan 26, 2025 at 9:15 AM' },
  { id: '3', author: 'M. Lee', content: 'Site visit completed. No issues found.', datetime: 'Jan 27, 2025 at 11:42 AM' },
];

const SEVERITY_ICON: Record<AlarmSeverity, { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-amber-600 dark:text-amber-500' },
  Minor: { name: 'warning', className: 'text-amber-600 dark:text-amber-500' },
};

function getDeviceAlarms(deviceName: string, count: number): DrawerAlarmRow[] {
  const severities: AlarmSeverity[] = ['Critical', 'Major', 'Minor'];
  const alarms: DrawerAlarmRow[] = [];
  for (let i = 0; i < count; i++) {
    const h = 8 + (i * 3) % 12;
    const m = (i * 7) % 60;
    const ts = `01/27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const up = `01/27 ${String(h).padStart(2, '0')}:${String(Math.min(59, m + 2)).padStart(2, '0')}`;
    alarms.push({
      timestamp: ts,
      updated: up,
      source: deviceName,
      severity: severities[i % 3],
    });
  }
  return alarms;
}

function KpiCard({
  title,
  kpiValue,
  kpiIcon,
  subtext,
}: {
  title: string;
  kpiValue: React.ReactNode;
  kpiIcon?: React.ReactNode;
  subtext?: string;
}) {
  return (
    <Card className="p-4">
      <CardTitle className="text-sm font-semibold mb-2">{title}</CardTitle>
      <div className="flex items-center gap-2">
        {kpiIcon}
        <span className="text-xl font-semibold tabular-nums">{kpiValue}</span>
      </div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </Card>
  );
}

interface DeviceDrawerProps {
  device: DeviceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LABELS_VISIBLE_COUNT = 4;

export function DeviceDrawer({ device, open, onOpenChange }: DeviceDrawerProps) {
  const notesSectionRef = React.useRef<HTMLDivElement>(null);
  const [labelsExpanded, setLabelsExpanded] = React.useState(false);
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  React.useEffect(() => {
    setLabelsExpanded(false);
    setDetailsExpanded(false);
  }, [device?.id]);

  if (!device) return null;

  const alarmConfig = ALARM_TYPE_CONFIG[device.alarmType] ?? ALARM_TYPE_CONFIG.None;
  const hasNotes = !!device.notes?.trim();

  const scrollToNotes = () => {
    if (hasNotes && notesSectionRef.current) {
      notesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const notesTooltip = hasNotes && device.notesUpdatedAt
    ? `Notes added ${device.notesUpdatedAt}`
    : hasNotes
      ? 'Notes added'
      : 'Add note';

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="left-auto right-0 top-0 bottom-0 h-full w-[560px] max-w-[90vw] rounded-l-[10px] rounded-t-none mt-0 [&>div:first-child]:hidden">
        <TooltipProvider delayDuration={300}>
        <div className="flex flex-col h-full overflow-auto">
          <DrawerHeader className="relative pr-12">
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
            <DrawerTitle className="text-xl font-semibold">{device.device}</DrawerTitle>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="font-normal">
                {device.type}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label={notesTooltip}
                    onClick={hasNotes ? scrollToNotes : undefined}
                  >
                    <Icon
                      name={hasNotes ? 'note' : 'note_add'}
                      size={18}
                      className={hasNotes ? 'text-primary' : 'text-muted-foreground/40'}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{notesTooltip}</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <Button variant="outline" size="sm" className="h-8">
                Details
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Performance
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1" aria-label="Actions">
                    Action
                    <Icon name="expand_more" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Configure</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DrawerHeader>
          <div className="flex-1 px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                title="Alarms"
                kpiValue={
                  <div className="flex items-center gap-6">
                    {(['Critical', 'Major', 'Minor'] as const).map((severity) => {
                      const cfg = SEVERITY_ICON[severity];
                      const count = severity === 'Critical' ? Math.ceil(device.alarms * 0.4)
                        : severity === 'Major' ? Math.floor(device.alarms * 0.4)
                        : Math.max(0, device.alarms - Math.ceil(device.alarms * 0.4) - Math.floor(device.alarms * 0.4));
                      return (
                        <span key={severity} className="inline-flex items-center gap-1.5">
                          <Icon name={cfg.name} size={18} className={`shrink-0 ${cfg.className}`} />
                          <span className="tabular-nums">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                }
              />
              <KpiCard
                title="UE sessions with KPI"
                kpiValue={240}
                kpiIcon={<Icon name="smartphone" size={20} className="text-muted-foreground" />}
                subtext="240 max"
              />
            </div>
            <Card>
              <CardContent className="pt-6 space-y-8">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-muted-foreground">Radio nodes</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium tabular-nums inline-flex items-center gap-1.5">
                        <Icon name="arrow_upward" size={16} className="text-emerald-600 dark:text-emerald-500" />
                        12
                      </span>
                      <span className="font-medium tabular-nums inline-flex items-center gap-1.5">
                        <Icon name="arrow_downward" size={16} className="text-destructive" />
                        2
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">NR cells</span>
                    <span className="font-medium tabular-nums inline-flex items-center gap-1.5">
                      <Icon name="arrow_upward" size={16} className="text-emerald-600 dark:text-emerald-500" />
                      48
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">X2 connections</span>
                    <span className="font-medium tabular-nums inline-flex items-center gap-1.5">
                      <Icon name="arrow_downward" size={16} className="text-destructive" />
                      6
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Hostname</span>
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{device.deviceGroup}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Description</span>
                      <span className="font-medium">{device.notes || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Deployment type</span>
                      <span className="font-medium">Standalone</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Cluster ID</span>
                      <span className="font-medium">{device.id.padStart(3, '0')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Contact</span>
                      <span className="font-medium">ops@example.com</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Group name</span>
                      <span className="font-medium">{device.deviceGroup}</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-muted-foreground">Labels</span>
                      {device.labels?.length ? (
                        <div className={`flex gap-1.5 ${labelsExpanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'}`}>
                          {(labelsExpanded ? device.labels : device.labels.slice(0, LABELS_VISIBLE_COUNT)).map((label) => (
                            <Badge key={label} variant="outline" className="font-normal shrink-0">{label}</Badge>
                          ))}
                          {!labelsExpanded && device.labels.length > LABELS_VISIBLE_COUNT && (
                            <button
                              type="button"
                              className="text-xs text-link hover:underline shrink-0 font-normal"
                              onClick={() => setLabelsExpanded(true)}
                            >
                              {device.labels.length - LABELS_VISIBLE_COUNT} more
                            </button>
                          )}
                          {labelsExpanded && device.labels.length > LABELS_VISIBLE_COUNT && (
                            <button
                              type="button"
                              className="text-xs text-link hover:underline shrink-0 font-normal"
                              onClick={() => setLabelsExpanded(false)}
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Status</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Node status</span>
                      <span className="font-medium">{device.status}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Config status</span>
                      <span className="font-medium">{device.configStatus}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">{device.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Last inform</span>
                      <span className="font-medium">Jan 27, 2025 2:34 PM</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">5d 3h</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">KPI sync status</span>
                      <span className="font-medium inline-flex items-center">
                        <Icon name="check_circle" size={18} className="text-emerald-600 dark:text-emerald-500" />
                      </span>
                    </div>
                  </div>
                </div>
                {detailsExpanded && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Location</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Latitude</span>
                          <span className="font-medium">47.6062° N</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Longitude</span>
                          <span className="font-medium">122.3321° W</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Hardware</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Management server</span>
                          <span className="font-medium">10.12.0.1</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Version</span>
                          <span className="font-medium">{device.version}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Model #</span>
                          <span className="font-medium">SN-LTE-2000</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Serial #</span>
                          <span className="font-medium font-mono text-xs">SN-{device.id.padStart(6, '0')}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Part #</span>
                          <span className="font-medium">P-8842-A</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Settings</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Notifications</span>
                          <span className="font-medium">Enabled</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Domain</span>
                          <span className="font-medium">prod.example.com</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Upgrades</span>
                          <span className="font-medium">Auto</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">PCI lock enabled</span>
                          <span className="font-medium">Yes</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Operating mode</span>
                          <span className="font-medium">Normal</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">RCP mode</span>
                          <span className="font-medium">Active</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">DU mode</span>
                          <span className="font-medium">FDD</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs w-full justify-center"
                  onClick={() => setDetailsExpanded(!detailsExpanded)}
                >
                  {detailsExpanded ? 'Show less' : 'See more'}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Alarms
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs font-medium">
                    {device.alarms}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 px-2">Timestamp</TableHead>
                        <TableHead className="h-8 px-2">Updated</TableHead>
                        <TableHead className="h-8 px-2">Source</TableHead>
                        <TableHead className="h-8 px-2">Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDeviceAlarms(device.device, Math.min(device.alarms, 5) || 3).map((alarm, i) => {
                        const cfg = SEVERITY_ICON[alarm.severity];
                        return (
                          <TableRow key={i}>
                            <TableCell className="py-1.5 px-2 text-xs tabular-nums">{alarm.timestamp}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs tabular-nums">{alarm.updated}</TableCell>
                            <TableCell className="py-1.5 px-2 text-xs truncate max-w-[24ch]">{alarm.source}</TableCell>
                            <TableCell className="py-1.5 px-2">
                              <span className="inline-flex items-center gap-1.5 text-xs">
                                <Icon name={cfg.name} size={14} className={`shrink-0 ${cfg.className}`} />
                                {alarm.severity}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs w-full justify-center">
                  See all
                </Button>
              </CardContent>
            </Card>
            <Card ref={notesSectionRef}>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {hasNotes ? (
                  <div className="space-y-4 max-h-[240px] overflow-y-auto">
                    {MOCK_NOTES.map((note) => (
                      <div key={note.id} className="flex flex-col gap-1">
                        <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2 text-xs text-foreground">
                          {note.content}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {note.author} · {note.datetime}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="note_add" size={18} />
                      Add note
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </TooltipProvider>
      </DrawerContent>
    </Drawer>
  );
}

'use client';

import React, { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { DeviceStatus } from './ui/device-status';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { DasTopology, getDasTopologyInventoryRows, getDasTopologyPathToNode, type DasTopologyNodeSelection } from './das-topology';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { DeviceLink } from './ui/device-link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { FilterSelect } from './ui/filter-select';
import type { DeviceGroup } from './devices-data-table';
import { ALARM_TYPE_CONFIG } from './devices-data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { PERF_PROFILES_INIT, type ProfileData } from './AdministrationPage';
import type { DeviceRow } from './devices-data-table';
import { AlarmsDataTable } from './alarms-data-table';
import { EventsDataTable } from './events-data-table';
import { ThresholdCrossingAlertsDataTable, getFilteredThresholdCount, THRESHOLD_KPI_OPTIONS } from './threshold-crossing-alerts-data-table';
import { IpInterfacesDataTable } from './ip-interfaces-data-table';
import { RadioNodesDataTable, RADIO_NODES_STATUS_OPTIONS, RADIO_NODES_MODEL_OPTIONS, RADIO_NODES_INDEX_OPTIONS, RADIO_NODES_DATA, filterRadioNodes, type RadioNodeRow } from './radio-nodes-data-table';
import { AddRadioNodeSheet, type AddRadioNodeFormData } from './add-radio-node-sheet';
import { toast } from 'sonner';
import { NrCellsDataTable, NR_CELLS_DATA } from './nr-cells-data-table';
import { ConfigMismatchSheet } from './config-mismatch-sheet';
import { ZonesDataTable, ZONES_DATA } from './zones-data-table';
import { X2ConnectionsDataTable } from './x2-connections-data-table';
import { DebugLogsDataTable } from './debug-logs-data-table';
import { IP_INTERFACES_DATA } from './ip-interfaces-data-table';
import { NameValueField, EditableLabelsField } from './ui/editable-value';
import { NodeTypeBadge } from './ui/node-type-badge';
import { RegionsMap } from './regions-map';
import { InternalSidebarList } from './ui/internal-sidebar-list';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

interface DeviceDetailPageProps {
  device: DeviceRow;
  appName?: string;
  onSignOut?: () => void;
  onBack?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  onOpenWebTerminal?: (device: DeviceRow) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
  initialSection?: string;
  /** Template name to pre-populate in the commissioning table (from config mismatch sheet). */
  initialCreatedTemplate?: string | null;
  /** When true, scroll to the alarms card in the Summary section. */
  scrollToAlarms?: boolean;
  /** Called after scroll-to-alarms has been applied so parent can clear the flag. */
  onScrollToAlarmsDone?: () => void;
  /** When true, switch to Notes tab and scroll to the notes section (e.g. after clicking add note in devices table). */
  scrollToNotes?: boolean;
  /** Called after scroll-to-notes has been applied so parent can clear the flag. */
  onScrollToNotesDone?: () => void;
}

/** Mock data for Site > Accessibility line charts (x-axis: days). */
const ACCESSIBILITY_CHART_DATA = [
  {
    day: 'Jan 20',
    erabEstablishmentSr: 98.3,
    erabEstablishmentAttempts: 14680,
    volteEstablishmentSr: 99.15,
    volteEstablishmentAttempts: 4520,
    rrcSr: 99.56,
    erabDropRate: 0.61,
    erabDropCount: 90,
    volteDropRate: 0.31,
    volteDropCount: 14,
    s1HoSuccessRate: 97.9,
    s1HoAttempts: 3280,
    handInIntra: 2860,
    handInIntraAttempts: 2940,
    handInIntraSr: 97.3,
    gtpDlNumBytes: 1210000000000,
    gtpUlNumBytes: 338000000000,
  },
  {
    day: 'Jan 21',
    erabEstablishmentSr: 97.7,
    erabEstablishmentAttempts: 15840,
    volteEstablishmentSr: 98.78,
    volteEstablishmentAttempts: 4890,
    rrcSr: 99.31,
    erabDropRate: 0.85,
    erabDropCount: 134,
    volteDropRate: 0.44,
    volteDropCount: 21,
    s1HoSuccessRate: 97.1,
    s1HoAttempts: 3560,
    handInIntra: 3020,
    handInIntraAttempts: 3140,
    handInIntraSr: 96.2,
    gtpDlNumBytes: 1295000000000,
    gtpUlNumBytes: 362000000000,
  },
  {
    day: 'Jan 22',
    erabEstablishmentSr: 98.1,
    erabEstablishmentAttempts: 15120,
    volteEstablishmentSr: 99.02,
    volteEstablishmentAttempts: 4730,
    rrcSr: 99.45,
    erabDropRate: 0.69,
    erabDropCount: 104,
    volteDropRate: 0.35,
    volteDropCount: 16,
    s1HoSuccessRate: 97.5,
    s1HoAttempts: 3410,
    handInIntra: 2960,
    handInIntraAttempts: 3050,
    handInIntraSr: 97.0,
    gtpDlNumBytes: 1252000000000,
    gtpUlNumBytes: 349000000000,
  },
  {
    day: 'Jan 23',
    erabEstablishmentSr: 97.6,
    erabEstablishmentAttempts: 16240,
    volteEstablishmentSr: 98.71,
    volteEstablishmentAttempts: 5010,
    rrcSr: 99.28,
    erabDropRate: 0.91,
    erabDropCount: 148,
    volteDropRate: 0.49,
    volteDropCount: 25,
    s1HoSuccessRate: 96.9,
    s1HoAttempts: 3720,
    handInIntra: 3090,
    handInIntraAttempts: 3230,
    handInIntraSr: 95.7,
    gtpDlNumBytes: 1338000000000,
    gtpUlNumBytes: 374000000000,
  },
  {
    day: 'Jan 24',
    erabEstablishmentSr: 98.0,
    erabEstablishmentAttempts: 15510,
    volteEstablishmentSr: 98.96,
    volteEstablishmentAttempts: 4860,
    rrcSr: 99.42,
    erabDropRate: 0.74,
    erabDropCount: 115,
    volteDropRate: 0.38,
    volteDropCount: 18,
    s1HoSuccessRate: 97.3,
    s1HoAttempts: 3490,
    handInIntra: 3005,
    handInIntraAttempts: 3110,
    handInIntraSr: 96.6,
    gtpDlNumBytes: 1276000000000,
    gtpUlNumBytes: 355000000000,
  },
  {
    day: 'Jan 25',
    erabEstablishmentSr: 98.9,
    erabEstablishmentAttempts: 11780,
    volteEstablishmentSr: 99.43,
    volteEstablishmentAttempts: 3640,
    rrcSr: 99.73,
    erabDropRate: 0.42,
    erabDropCount: 49,
    volteDropRate: 0.22,
    volteDropCount: 8,
    s1HoSuccessRate: 98.4,
    s1HoAttempts: 2760,
    handInIntra: 2450,
    handInIntraAttempts: 2510,
    handInIntraSr: 97.6,
    gtpDlNumBytes: 982000000000,
    gtpUlNumBytes: 274000000000,
  },
  {
    day: 'Jan 26',
    erabEstablishmentSr: 99.0,
    erabEstablishmentAttempts: 11240,
    volteEstablishmentSr: 99.48,
    volteEstablishmentAttempts: 3490,
    rrcSr: 99.78,
    erabDropRate: 0.39,
    erabDropCount: 44,
    volteDropRate: 0.19,
    volteDropCount: 7,
    s1HoSuccessRate: 98.6,
    s1HoAttempts: 2640,
    handInIntra: 2360,
    handInIntraAttempts: 2410,
    handInIntraSr: 97.9,
    gtpDlNumBytes: 945000000000,
    gtpUlNumBytes: 262000000000,
  },
  {
    day: 'Jan 27',
    erabEstablishmentSr: 98.2,
    erabEstablishmentAttempts: 14960,
    volteEstablishmentSr: 99.04,
    volteEstablishmentAttempts: 4680,
    rrcSr: 99.46,
    erabDropRate: 0.66,
    erabDropCount: 99,
    volteDropRate: 0.33,
    volteDropCount: 15,
    s1HoSuccessRate: 97.7,
    s1HoAttempts: 3390,
    handInIntra: 2920,
    handInIntraAttempts: 3000,
    handInIntraSr: 96.9,
    gtpDlNumBytes: 1239000000000,
    gtpUlNumBytes: 346000000000,
  },
];

const RESOURCES_TIME_RANGES = ['Last 7 days'] as const;
const RESOURCES_CHART_DATA = [
  { day: 'Jan 21', cpu: 54, memory: 68 },
  { day: 'Jan 22', cpu: 62, memory: 70 },
  { day: 'Jan 23', cpu: 58, memory: 66 },
  { day: 'Jan 24', cpu: 71, memory: 74 },
  { day: 'Jan 25', cpu: 65, memory: 72 },
  { day: 'Jan 26', cpu: 60, memory: 69 },
  { day: 'Jan 27', cpu: 67, memory: 73 },
];

const CELL_TIME_RANGES = ['Last 7 days'] as const;
const CELL_STATUS_OPTIONS = ['all', 'good', 'bad'] as const;

const CELL_PERFORMANCE_ROWS = [
  {
    name: 'Cell-1',
    cellId: 'CELL-1001',
    callSetupSuccessRate: 99.2,
    erabs: 1245,
    rrcSuccessRate: 98.7,
    connEstabAttSum: 14520,
    maxRrcUsers: 842,
    erabDropRate: 0.42,
    erabDrops: 12,
    dlBytes: 987654321,
    ulBytes: 321654987,
    status: 'good',
    enabled: true,
    zones: 4,
    radioNodes: 3,
    dlBandwidth: '100 MHz',
  },
  {
    name: 'Cell-2',
    cellId: 'CELL-1002',
    callSetupSuccessRate: 97.4,
    erabs: 1132,
    rrcSuccessRate: 96.8,
    connEstabAttSum: 13210,
    maxRrcUsers: 910,
    erabDropRate: 1.12,
    erabDrops: 34,
    dlBytes: 756432198,
    ulBytes: 289765432,
    status: 'bad',
    enabled: true,
    zones: 3,
    radioNodes: 2,
    dlBandwidth: '80 MHz',
  },
  {
    name: 'Cell-3',
    cellId: 'CELL-1003',
    callSetupSuccessRate: 98.6,
    erabs: 1388,
    rrcSuccessRate: 98.1,
    connEstabAttSum: 15110,
    maxRrcUsers: 765,
    erabDropRate: 0.58,
    erabDrops: 18,
    dlBytes: 1123456789,
    ulBytes: 412356789,
    status: 'good',
    enabled: true,
    zones: 5,
    radioNodes: 4,
    dlBandwidth: '100 MHz',
  },
  {
    name: 'Cell-4',
    cellId: 'CELL-1004',
    callSetupSuccessRate: 96.9,
    erabs: 1045,
    rrcSuccessRate: 95.7,
    connEstabAttSum: 12004,
    maxRrcUsers: 688,
    erabDropRate: 1.38,
    erabDrops: 41,
    dlBytes: 623456789,
    ulBytes: 245678901,
    status: 'bad',
    enabled: false,
    zones: 2,
    radioNodes: 2,
    dlBandwidth: '60 MHz',
  },
  {
    name: 'Cell-5',
    cellId: 'CELL-1005',
    callSetupSuccessRate: 98.9,
    erabs: 1294,
    rrcSuccessRate: 98.4,
    connEstabAttSum: 14780,
    maxRrcUsers: 812,
    erabDropRate: 0.51,
    erabDrops: 15,
    dlBytes: 998877665,
    ulBytes: 356778899,
    status: 'good',
    enabled: true,
    zones: 4,
    radioNodes: 3,
    dlBandwidth: '80 MHz',
  },
] as const;

const CELL_DETAIL_INTERVALS = ['15 min'] as const;
const REMOTE_MODULE_TABS = ['Module Info', 'PAM Alarms', 'Alarms', 'RF Parameters', 'Comment(N/A)'] as const;
const REMOTE_RF_TABLE_COLUMNS = ['700', 'CELL/ESMR', 'PCS', 'AWS3'] as const;
const CELL_ALARM_ROWS = [
  { cellName: 'Cell-1', timestamp: 'Jan 27, 10:15', updated: 'Jan 27, 10:22', severity: 'Major', source: 'RAN' },
  { cellName: 'Cell-1', timestamp: 'Jan 27, 11:30', updated: 'Jan 27, 11:37', severity: 'Minor', source: 'Scheduler' },
  { cellName: 'Cell-2', timestamp: 'Jan 27, 09:45', updated: 'Jan 27, 09:52', severity: 'Critical', source: 'Backhaul' },
  { cellName: 'Cell-2', timestamp: 'Jan 27, 12:00', updated: 'Jan 27, 12:05', severity: 'Major', source: 'RRC' },
  { cellName: 'Cell-3', timestamp: 'Jan 27, 08:30', updated: 'Jan 27, 08:41', severity: 'Minor', source: 'Sync' },
  { cellName: 'Cell-4', timestamp: 'Jan 27, 07:50', updated: 'Jan 27, 08:02', severity: 'Major', source: 'Cell config' },
  { cellName: 'Cell-5', timestamp: 'Jan 27, 11:10', updated: 'Jan 27, 11:18', severity: 'Minor', source: 'ANR' },
] as const;
const CELL_ALARM_SEVERITY_ICON: Record<'Critical' | 'Major' | 'Minor', { name: string; className: string }> = {
  Critical: { name: 'error', className: 'text-destructive' },
  Major: { name: 'error_outline', className: 'text-warning' },
  Minor: { name: 'warning', className: 'text-yellow-500' },
};
const FLOOR_VIEW_BUILDINGS = [
  { id: 'north-tower', name: 'North Tower', floors: 12, remotes: 48, bound: 44, unbound: 4 },
  { id: 'south-annex', name: 'South Annex', floors: 6, remotes: 18, bound: 16, unbound: 2 },
  { id: 'parking-structure', name: 'Parking Structure', floors: 4, remotes: 10, bound: 7, unbound: 3 },
] as const;
function getFloorRows(building: (typeof FLOOR_VIEW_BUILDINGS)[number]) {
  return Array.from({ length: building.floors }).map((_, index, arr) => {
    const base = Math.floor(building.remotes / arr.length);
    const remainder = building.remotes % arr.length;
    const remotes = base + (index < remainder ? 1 : 0);
    const level = arr.length - index;
    return {
      id: `${building.id}-floor-${level}`,
      name: `Floor ${level}`,
      remotes,
    };
  });
}
type SiteChartId =
  | 'erab-establishment'
  | 'volte-establishment'
  | 'rrc-success-rate'
  | 'erab-drop-rate'
  | 'volte-drop-rate'
  | 's1-ho'
  | 'handin-intra'
  | 'gtp-data-volume'
  | 'hw-memory-usage';

const formatBytes = (value: number) => `${(value / 1_000_000).toFixed(1)} MB`;

/* ─── Interactive SSH / Web Terminal ─────────────────────────── */
interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
}

function getCommandResponse(cmd: string, device: DeviceRow): string {
  const trimmed = cmd.trim().toLowerCase();
  const hostname = device.device.toLowerCase().replace(/\s+/g, '-');
  const ip = device.ipAddress || '10.12.1.42';
  const uptime = `${Math.floor(Math.random() * 90) + 10} days, ${Math.floor(Math.random() * 23)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

  if (!trimmed) return '';

  if (trimmed === 'help') {
    return [
      'Available commands:',
      '  help                  Show this help message',
      '  hostname              Display device hostname',
      '  whoami                Display current user',
      '  uptime                Show system uptime',
      '  date                  Show current date/time',
      '  ifconfig              Show network interfaces',
      '  ip addr               Show IP addresses',
      '  ping <host>           Ping a host',
      '  traceroute <host>     Trace route to host',
      '  show version          Show software version',
      '  show interfaces       Show interface summary',
      '  show alarms           Show active alarms',
      '  show inventory        Show hardware inventory',
      '  show running-config   Show running configuration',
      '  show status           Show device status',
      '  show neighbors        Show connected neighbors',
      '  top                   Show process status',
      '  df -h                 Show disk usage',
      '  free -m               Show memory usage',
      '  ls                    List current directory',
      '  cat <file>            Display file contents',
      '  clear                 Clear terminal',
      '  exit                  Close session',
    ].join('\n');
  }

  if (trimmed === 'hostname') return hostname;
  if (trimmed === 'whoami') return 'admin';
  if (trimmed === 'uptime') return ` ${new Date().toLocaleTimeString()} up ${uptime}, 1 user, load average: 0.12, 0.08, 0.05`;
  if (trimmed === 'date') return new Date().toString();

  if (trimmed === 'ifconfig' || trimmed === 'ip addr') {
    return [
      `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536`,
      `    inet 127.0.0.1/8 scope host lo`,
      `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500`,
      `    inet ${ip}/24 brd ${ip.replace(/\.\d+$/, '.255')} scope global eth0`,
      `    ether 00:1a:2b:3c:4d:${String(parseInt(device.id) % 100).padStart(2, '0')}`,
      `3: mgmt0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500`,
      `    inet 192.168.1.${(parseInt(device.id) % 254) + 1}/24 scope global mgmt0`,
    ].join('\n');
  }

  if (trimmed.startsWith('ping ')) {
    const host = cmd.trim().slice(5).trim() || '8.8.8.8';
    const lines: string[] = [`PING ${host} (${host}): 56 data bytes`];
    for (let i = 0; i < 4; i++) {
      const ms = (Math.random() * 20 + 1).toFixed(3);
      lines.push(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms} ms`);
    }
    lines.push('', `--- ${host} ping statistics ---`, `4 packets transmitted, 4 received, 0% packet loss`, `rtt min/avg/max/mdev = 1.234/8.456/19.876/4.321 ms`);
    return lines.join('\n');
  }

  if (trimmed.startsWith('traceroute ')) {
    const host = cmd.trim().slice(11).trim() || '8.8.8.8';
    const lines: string[] = [`traceroute to ${host}, 30 hops max, 60 byte packets`];
    const hops = Math.floor(Math.random() * 5) + 3;
    for (let i = 1; i <= hops; i++) {
      const hopIp = `10.${i}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const ms1 = (Math.random() * 10 + 0.5).toFixed(3);
      const ms2 = (Math.random() * 10 + 0.5).toFixed(3);
      const ms3 = (Math.random() * 10 + 0.5).toFixed(3);
      lines.push(` ${i}  ${hopIp}  ${ms1} ms  ${ms2} ms  ${ms3} ms`);
    }
    lines.push(` ${hops + 1}  ${host}  ${(Math.random() * 5 + 1).toFixed(3)} ms  ${(Math.random() * 5 + 1).toFixed(3)} ms  ${(Math.random() * 5 + 1).toFixed(3)} ms`);
    return lines.join('\n');
  }

  if (trimmed === 'show version') {
    return [
      `${device.device} Software, Version ${device.version || '4.2.1'}`,
      `Copyright (c) 2020-2025 Acme Networks, Inc.`,
      `Compiled Mon 27-Jan-25 08:00 by release-build`,
      ``,
      `ROM: System Bootstrap, Version 15.2(1r)`,
      ``,
      `System uptime is ${uptime}`,
      `System image file is "flash:/system-image-${device.version || '4.2.1'}.bin"`,
      ``,
      `Processor: ARM Cortex-A72 @ 1.8GHz`,
      `Memory: 8192 MB (7856 MB available)`,
      `Storage: 64 GB eMMC`,
    ].join('\n');
  }

  if (trimmed === 'show interfaces') {
    return [
      `Interface          Status     Protocol   Speed      Duplex`,
      `─────────────────  ─────────  ─────────  ─────────  ──────`,
      `eth0               up         up         1 Gbps     full`,
      `mgmt0              up         up         100 Mbps   full`,
      `radio0             up         up         10 Gbps    full`,
      `radio1             ${device.status === 'Connected' ? 'up' : 'down'}         ${device.status === 'Connected' ? 'up' : 'down'}         10 Gbps    full`,
      `loopback0          up         up         —          —`,
    ].join('\n');
  }

  if (trimmed === 'show alarms') {
    if (device.alarms === 0) return 'No active alarms.';
    const severities = ['Critical', 'Major', 'Minor'];
    const types = ['Link down', 'Radio link failure', 'Config mismatch', 'Device disconnected'];
    const lines: string[] = [`Active alarms: ${device.alarms}`, '', `Severity   Type                    Source          Time`];
    lines.push(`─────────  ──────────────────────  ──────────────  ────────────────`);
    for (let i = 0; i < Math.min(device.alarms, 8); i++) {
      const sev = severities[i % 3].padEnd(9);
      const typ = types[i % types.length].padEnd(22);
      const src = `Cell-${i + 1}`.padEnd(14);
      const h = 8 + (i * 3) % 12;
      const m = (i * 7) % 60;
      lines.push(`${sev}  ${typ}  ${src}  01/27 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return lines.join('\n');
  }

  if (trimmed === 'show inventory') {
    return [
      `NAME: "${device.device}", DESCR: "${device.type || 'SN'} Network Element"`,
      `PID: ${device.type || 'SN'}-4200, VID: V02, SN: FTX${String(parseInt(device.id) + 1000).padStart(4, '0')}A${String(parseInt(device.id) + 100).padStart(3, '0')}`,
      ``,
      `NAME: "Power Supply 0", DESCR: "AC Power Supply"`,
      `PID: PWR-750WAC, VID: V03, SN: ART0${String(parseInt(device.id) + 200).padStart(4, '0')}`,
      ``,
      `NAME: "Fan Tray", DESCR: "Fan Assembly"`,
      `PID: FAN-MOD-4HS, VID: V01, SN: FOC${String(parseInt(device.id) + 300).padStart(4, '0')}`,
    ].join('\n');
  }

  if (trimmed === 'show running-config') {
    return [
      `! Running configuration`,
      `! Last modified: ${new Date().toISOString().split('T')[0]}`,
      `!`,
      `hostname ${hostname}`,
      `!`,
      `interface eth0`,
      `  ip address ${ip} 255.255.255.0`,
      `  no shutdown`,
      `!`,
      `interface mgmt0`,
      `  ip address 192.168.1.${(parseInt(device.id) % 254) + 1} 255.255.255.0`,
      `  no shutdown`,
      `!`,
      `interface radio0`,
      `  description "Primary radio interface"`,
      `  bandwidth 10000`,
      `  no shutdown`,
      `!`,
      `logging host 10.0.1.50`,
      `logging trap informational`,
      `!`,
      `ntp server 10.0.1.10`,
      `ntp server 10.0.1.11`,
      `!`,
      `snmp-server community public RO`,
      `snmp-server location "${device.region || 'Pacific Northwest'}"`,
      `!`,
      `end`,
    ].join('\n');
  }

  if (trimmed === 'show status') {
    return [
      `Device:     ${device.device}`,
      `Status:     ${device.status}`,
      `Type:       ${device.type || 'SN'}`,
      `Version:    ${device.version || '4.2.1'}`,
      `IP:         ${ip}`,
      `Region:     ${device.region || 'Pacific Northwest'}`,
      `Alarms:     ${device.alarms} (${device.alarmType})`,
      `Uptime:     ${uptime}`,
      `Config:     ${device.configStatus || 'Synchronized'}`,
    ].join('\n');
  }

  if (trimmed === 'show neighbors') {
    const neighbors = [
      { id: 'eth0', neighbor: 'sw-core-01', port: 'Gi0/1', platform: 'Switch-4500' },
      { id: 'radio0', neighbor: 'rn-sector-a', port: 'radio0', platform: 'RN-4200' },
      { id: 'radio1', neighbor: 'rn-sector-b', port: 'radio0', platform: 'RN-4200' },
    ];
    const lines = [`Device ID       Local Intf    Port ID       Platform`, `──────────────  ────────────  ────────────  ─────────────`];
    neighbors.forEach((n) => lines.push(`${n.neighbor.padEnd(14)}  ${n.id.padEnd(12)}  ${n.port.padEnd(12)}  ${n.platform}`));
    return lines.join('\n');
  }

  if (trimmed === 'top') {
    return [
      `top - ${new Date().toLocaleTimeString()} up ${uptime}, 1 user, load average: 0.12, 0.08, 0.05`,
      `Tasks:  87 total,   1 running,  86 sleeping,   0 stopped,   0 zombie`,
      `%Cpu(s):  3.2 us,  1.1 sy,  0.0 ni, 95.4 id,  0.1 wa,  0.0 hi,  0.2 si`,
      `MiB Mem :   8192.0 total,   4256.3 free,   2104.8 used,   1830.9 buff/cache`,
      `MiB Swap:   2048.0 total,   2048.0 free,      0.0 used,   5832.1 avail Mem`,
      ``,
      `  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND`,
      ` 1024 root      20   0  412768  48320  12544 S   2.3   0.6   12:34.56 ne-manager`,
      ` 1156 root      20   0  285440  32768   8192 S   1.1   0.4    8:22.10 alarm-daemon`,
      ` 1287 root      20   0  198656  24576   6144 S   0.7   0.3    5:15.33 config-sync`,
      ` 1342 root      20   0  156400  18432   4096 S   0.3   0.2    3:44.21 snmp-agent`,
      ` 1498 root      20   0  132096  15360   3072 S   0.1   0.2    2:11.08 radio-ctrl`,
      `  892 root      20   0   98304  12288   2048 S   0.0   0.1    1:05.42 syslog-ng`,
    ].join('\n');
  }

  if (trimmed === 'df -h') {
    return [
      `Filesystem      Size  Used Avail Use% Mounted on`,
      `/dev/mmcblk0p2   56G   12G   41G  23% /`,
      `tmpfs           3.9G     0  3.9G   0% /dev/shm`,
      `/dev/mmcblk0p1  256M   48M  209M  19% /boot`,
      `/dev/mmcblk0p3  4.0G  1.2G  2.6G  32% /var/log`,
    ].join('\n');
  }

  if (trimmed === 'free -m') {
    return [
      `              total        used        free      shared  buff/cache   available`,
      `Mem:           8192        2104        4256         128        1830        5832`,
      `Swap:          2048           0        2048`,
    ].join('\n');
  }

  if (trimmed === 'ls') {
    return [
      `bin   boot  config  dev  etc  home  lib  log  media  mnt`,
      `opt   proc  root    run  sbin  srv  sys  tmp  usr    var`,
    ].join('\n');
  }

  if (trimmed.startsWith('cat ')) {
    const file = cmd.trim().slice(4).trim();
    if (file === '/etc/hostname' || file === 'hostname') return hostname;
    if (file === '/etc/version' || file === 'version') return device.version || '4.2.1';
    if (file === '/var/log/syslog' || file === 'syslog') {
      return [
        `Jan 27 14:32:18 ${hostname} ne-manager[1024]: System startup complete`,
        `Jan 27 14:32:19 ${hostname} alarm-daemon[1156]: Monitoring ${device.alarms} active alarms`,
        `Jan 27 14:32:20 ${hostname} config-sync[1287]: Configuration synchronized`,
        `Jan 27 14:33:01 ${hostname} snmp-agent[1342]: SNMP community loaded`,
        `Jan 27 14:35:00 ${hostname} radio-ctrl[1498]: Radio interfaces initialized`,
      ].join('\n');
    }
    return `cat: ${file}: No such file or directory`;
  }

  if (trimmed === 'exit') return '__EXIT__';

  return `bash: ${cmd.trim().split(' ')[0]}: command not found`;
}

function SshTerminal({ device }: { device: DeviceRow }) {
  const hostname = device.device.toLowerCase().replace(/\s+/g, '-');
  const prompt = `admin@${hostname}:~$`;
  const [lines, setLines] = React.useState<TerminalLine[]>([
    { type: 'system', text: `Last login: Mon Jan 27 14:32:18 2025 from 10.0.1.100` },
    { type: 'system', text: `Welcome to ${device.device}` },
    { type: 'system', text: `Type 'help' for available commands.` },
  ]);
  const [input, setInput] = React.useState('');
  const [connected, setConnected] = React.useState(true);
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = React.useState(-1);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [connected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return;
    const cmd = input;
    setInput('');
    setHistoryIdx(-1);
    if (cmd.trim()) {
      setHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    }

    const newLines: TerminalLine[] = [{ type: 'input', text: `${prompt} ${cmd}` }];

    if (cmd.trim().toLowerCase() === 'clear') {
      setLines([]);
      return;
    }

    const response = getCommandResponse(cmd, device);
    if (response === '__EXIT__') {
      newLines.push({ type: 'system', text: 'Connection closed.' });
      setLines((prev) => [...prev, ...newLines]);
      setConnected(false);
      return;
    }
    if (response) {
      newLines.push({ type: response.startsWith('bash:') || response.startsWith('cat:') ? 'error' : 'output', text: response });
    }
    setLines((prev) => [...prev, ...newLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const handleReconnect = () => {
    setConnected(true);
    setLines([
      { type: 'system', text: `Last login: ${new Date().toLocaleString()} from 10.0.1.100` },
      { type: 'system', text: `Welcome to ${device.device}` },
      { type: 'system', text: `Type 'help' for available commands.` },
    ]);
    setHistory([]);
    setHistoryIdx(-1);
    setInput('');
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-[#d4d4d4]';
      case 'output': return 'text-[#d4d4d4]';
      case 'system': return 'text-green-400';
      case 'error': return 'text-red-400';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm flex flex-col" style={{ minHeight: 420 }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground">{connected ? 'Connected' : 'Disconnected'} — {device.device} ({device.ipAddress || '10.12.1.42'})</span>
          </div>
          <div className="flex items-center gap-1">
            {!connected && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-white/5" onClick={handleReconnect}>
                <Icon name="refresh" size={14} className="mr-1" />
                Reconnect
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-[#d4d4d4] hover:bg-white/5" onClick={() => setLines([])}>
              <Icon name="delete_sweep" size={14} className="mr-1" />
              Clear
            </Button>
          </div>
        </div>
        {/* Output */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-auto whitespace-pre-wrap break-all cursor-text"
          style={{ maxHeight: 480 }}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={lineColor(line.type)}>
              {line.type === 'input' ? (
                <>
                  <span className="text-green-400">{prompt}</span>{' '}
                  <span>{line.text.slice(prompt.length + 1)}</span>
                </>
              ) : (
                line.text
              )}
            </div>
          ))}
          {connected && (
            <div className="flex items-center">
              <span className="text-green-400">{prompt}</span>
              <span className="ml-1 animate-pulse">▌</span>
            </div>
          )}
        </div>
        {/* Input */}
        {connected && (
          <form onSubmit={handleSubmit} className="border-t border-white/10 px-4 py-3 flex items-center gap-2">
            <span className="text-green-400 shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setHistoryIdx(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] placeholder:text-[#666] font-mono text-sm"
              aria-label="Terminal input"
              autoFocus
            />
          </form>
        )}
      </div>
    </Card>
  );
}

const REGION_ADDRESSES: Record<string, string[]> = {
  'Pacific Northwest':    ['1201 3rd Ave, Seattle, WA 98101', '700 SW 5th Ave, Portland, OR 97204', '818 Stewart St, Seattle, WA 98101', '421 SW 6th Ave, Portland, OR 97204'],
  'Northern California':  ['100 Montgomery St, San Francisco, CA 94104', '500 Terry A Francois Blvd, San Francisco, CA 94158', '1 Hacker Way, Menlo Park, CA 94025', '350 Mission St, San Francisco, CA 94105'],
  'Southern California':  ['633 W 5th St, Los Angeles, CA 90071', '402 W Broadway, San Diego, CA 92101', '1 World Way, Los Angeles, CA 90045', '100 Universal City Plz, Universal City, CA 91608'],
  'Desert Southwest':     ['2 N Central Ave, Phoenix, AZ 85004', '400 E Van Buren St, Phoenix, AZ 85004', '150 N Stone Ave, Tucson, AZ 85701', '1 E Washington St, Phoenix, AZ 85004'],
  'Mountain West':        ['1700 Lincoln St, Denver, CO 80203', '201 S Main St, Salt Lake City, UT 84111', '555 17th St, Denver, CO 80202', '15 W South Temple, Salt Lake City, UT 84101'],
  'Great Plains':         ['1500 Farnam St, Omaha, NE 68102', '200 S 6th St, Minneapolis, MN 55402', '401 S 2nd Ave, Minneapolis, MN 55401', '1000 Walnut St, Kansas City, MO 64106'],
  'Texas':                ['600 Congress Ave, Austin, TX 78701', '1401 Elm St, Dallas, TX 75202', '1000 Main St, Houston, TX 77002', '100 W Houston St, San Antonio, TX 78205'],
  'Gulf Coast':           ['1250 Poydras St, New Orleans, LA 70113', '1 Canal St, New Orleans, LA 70130', '1515 Poydras St, New Orleans, LA 70112', '400 Poydras St, New Orleans, LA 70130'],
  'Southeast':            ['191 Peachtree St NE, Atlanta, GA 30303', '301 N Tryon St, Charlotte, NC 28202', '414 Union St, Nashville, TN 37219', '600 Peachtree St NE, Atlanta, GA 30308'],
  'Florida':              ['100 SE 2nd St, Miami, FL 33131', '201 N Franklin St, Tampa, FL 33602', '400 S Orange Ave, Orlando, FL 32801', '1 SE 3rd Ave, Miami, FL 33131'],
  'Midwest':              ['1 N Capitol Ave, Indianapolis, IN 46204', '1 S Wacker Dr, Chicago, IL 60606', '200 Public Sq, Cleveland, OH 44114', '600 Superior Ave E, Cleveland, OH 44114'],
  'Great Lakes':          ['233 S Wacker Dr, Chicago, IL 60606', '1 Campus Martius, Detroit, MI 48226', '1 AT&T Plaza, Chicago, IL 60601', '150 W Jefferson Ave, Detroit, MI 48226'],
  'Northeast':            ['200 Park Ave, New York, NY 10166', '1 Penn Plaza, New York, NY 10119', '30 Hudson Yards, New York, NY 10001', '1 World Trade Center, New York, NY 10007'],
  'New England':          ['1 Federal St, Boston, MA 02110', '100 Summer St, Boston, MA 02110', '200 Clarendon St, Boston, MA 02116', '99 High St, Boston, MA 02110'],
  'Mid-Atlantic':         ['1300 I St NW, Washington, DC 20005', '1 N Charles St, Baltimore, MD 21201', '1500 Market St, Philadelphia, PA 19102', '101 Constitution Ave NW, Washington, DC 20001'],
  'Eastern Canada':       ['100 King St W, Toronto, ON M5X 1A9', '1000 De La Gauchetière W, Montreal, QC H3B 4W5', '181 Bay St, Toronto, ON M5J 2T3', '800 René-Lévesque Blvd W, Montreal, QC H3B 1X9'],
};

function getDeviceAddress(region: string, deviceId: string) {
  const addresses = REGION_ADDRESSES[region] ?? REGION_ADDRESSES['Pacific Northwest'];
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return addresses[hash % addresses.length];
}

const REGION_COORDINATES: Record<string, { lat: number; lng: number; latDir: string; lngDir: string }> = {
  'Pacific Northwest':    { lat: 47.6062, lng: 122.3321, latDir: 'N', lngDir: 'W' },
  'Northern California':  { lat: 37.7749, lng: 122.4194, latDir: 'N', lngDir: 'W' },
  'Southern California':  { lat: 34.0522, lng: 118.2437, latDir: 'N', lngDir: 'W' },
  'Desert Southwest':     { lat: 33.4484, lng: 112.0740, latDir: 'N', lngDir: 'W' },
  'Mountain West':        { lat: 39.7392, lng: 104.9903, latDir: 'N', lngDir: 'W' },
  'Great Plains':         { lat: 41.2565, lng: 95.9345,  latDir: 'N', lngDir: 'W' },
  'Texas':                { lat: 30.2672, lng: 97.7431,  latDir: 'N', lngDir: 'W' },
  'Gulf Coast':           { lat: 29.9511, lng: 90.0715,  latDir: 'N', lngDir: 'W' },
  'Southeast':            { lat: 33.7490, lng: 84.3880,  latDir: 'N', lngDir: 'W' },
  'Florida':              { lat: 25.7617, lng: 80.1918,  latDir: 'N', lngDir: 'W' },
  'Midwest':              { lat: 39.7684, lng: 86.1581,  latDir: 'N', lngDir: 'W' },
  'Great Lakes':          { lat: 41.8781, lng: 87.6298,  latDir: 'N', lngDir: 'W' },
  'Northeast':            { lat: 40.7128, lng: 74.0060,  latDir: 'N', lngDir: 'W' },
  'New England':          { lat: 42.3601, lng: 71.0589,  latDir: 'N', lngDir: 'W' },
  'Mid-Atlantic':         { lat: 38.9072, lng: 77.0369,  latDir: 'N', lngDir: 'W' },
  'Eastern Canada':       { lat: 43.6532, lng: 79.3832,  latDir: 'N', lngDir: 'W' },
};

function getDeviceCoordinates(region: string, deviceId: string) {
  const base = REGION_COORDINATES[region] ?? REGION_COORDINATES['Pacific Northwest'];
  const hash = deviceId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash * 7) % 100 - 50) / 500;
  const lngOffset = ((hash * 13) % 100 - 50) / 500;
  return {
    lat: `${(base.lat + latOffset).toFixed(4)}° ${base.latDir}`,
    lng: `${(base.lng + lngOffset).toFixed(4)}° ${base.lngDir}`,
  };
}

function DeviceDetailPage({
  device,
  appName = 'AMS',
  onSignOut,
  onBack,
  onNavigate,
  onOpenWebTerminal,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
  scrollToAlarms,
  onScrollToAlarmsDone,
  scrollToNotes,
  onScrollToNotesDone,
  initialSection,
  initialCreatedTemplate,
}: DeviceDetailPageProps) {
  const officeFloorPlanSrc = `${import.meta.env.BASE_URL}office-floor-plan.svg`;
  const [floorPlanImgSrc, setFloorPlanImgSrc] = React.useState(officeFloorPlanSrc);
  React.useEffect(() => {
    setFloorPlanImgSrc(officeFloorPlanSrc);
  }, [officeFloorPlanSrc]);
  const remoteUnitMapBackgroundSrc = `${import.meta.env.BASE_URL}radio-unit-floor-plan.png`;
  const isDas = device.type === 'MA3000' || device.type === 'MA6200' || device.type === 'MA6000';
  const SIDEBAR_ITEMS = isDas
    ? (['Summary', 'HCM info', 'Radio units', 'Inventory', 'SNMP details', 'Web terminal'] as const)
    : ([
        'Summary',
        'Commissioning',
        'IP interfaces',
        'Radio nodes',
        'NR cells',
        'Zones',
        'X2 connections',
        'Floor view',
        'Performance',
        'Files',
        'SSH terminal',
      ] as const);
  const toKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const radioNodesSectionKey = isDas ? 'radio-units' : 'radio-nodes';
  const normalizedInitialSection = isDas && initialSection === 'remotes' ? 'radio-units' : initialSection;
  const [activeSection, setActiveSection] = useState(normalizedInitialSection ?? toKey(SIDEBAR_ITEMS[0]));

  React.useEffect(() => {
    const keys = SIDEBAR_ITEMS.map(toKey);
    if (!keys.includes(activeSection)) {
      setActiveSection(toKey(SIDEBAR_ITEMS[0]));
    }
  }, [device.id, isDas]);
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const [showSummaryMap, setShowSummaryMap] = React.useState(false);
  const [alarmsEventsTab, setAlarmsEventsTab] = React.useState('alarms');
  const [performanceTab, setPerformanceTab] = React.useState('site');
  const [expandedSiteChart, setExpandedSiteChart] = React.useState<SiteChartId | null>(null);
  const [selectedFloorByBuilding, setSelectedFloorByBuilding] = React.useState<Record<string, string>>({});
  const [floorSearchByBuilding, setFloorSearchByBuilding] = React.useState<Record<string, string>>({});
  const [tcHistSearch, setTcHistSearch] = React.useState('');
  const [tcHistKpiFilter, setTcHistKpiFilter] = React.useState('All');
  const [tcHistStateFilter, setTcHistStateFilter] = React.useState('All');
  const [filesTab, setFilesTab] = React.useState('debug-logs');
  const ALARMS_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'None'] as const;
  const EVENTS_TYPE_OPTIONS = ['All', 'Configuration change', 'Connection', 'Performance', 'Security', 'System'] as const;
  const EVENTS_SEVERITY_OPTIONS = ['All', 'Critical', 'Major', 'Minor', 'Info'] as const;
  const EVENTS_SOURCE_OPTIONS = ['All', 'eNB', 'RN'] as const;

  const INITIAL_NOTES = [
    { id: '1', author: 'J. Smith', content: 'Scheduled maintenance completed. All systems nominal.', datetime: 'Jan 25, 2025 at 2:34 PM' },
    { id: '2', author: 'A. Jones', content: 'Radio config updated per change request #2841.', datetime: 'Jan 26, 2025 at 9:15 AM' },
    { id: '3', author: 'M. Lee', content: 'Site visit completed. No issues found.', datetime: 'Jan 27, 2025 at 11:42 AM' },
  ] as const;

  const [notes, setNotes] = useState<Array<{ id: string; author: string; content: string; datetime: string }>>([...INITIAL_NOTES]);
  const [radioNodesSearch, setRadioNodesSearch] = useState('');
  const [radioNodesIndexFilter, setRadioNodesIndexFilter] = useState('All');
  const [radioNodesStatusFilter, setRadioNodesStatusFilter] = useState('All');
  const [radioNodesModelFilter, setRadioNodesModelFilter] = useState('All');
  const radioNodesSourceData = React.useMemo(
    () => {
      if (isDas && device.device === 'MA3000-HOU-001') {
        return RADIO_NODES_DATA.map((node) => {
          if (node.role !== 'dMRU') return node;
          return {
            ...node,
            name: node.name.replace('dMRU', 'MRU'),
            description: node.description.replace('Remote medium-power unit', 'Remote unit'),
          };
        });
      }
      return RADIO_NODES_DATA;
    },
    [isDas, device.device],
  );
  const filteredRadioNodes = React.useMemo(
    () => filterRadioNodes(radioNodesSourceData, radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter, radioNodesIndexFilter),
    [radioNodesSourceData, radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter, radioNodesIndexFilter],
  );
  const summaryMapDevices = React.useMemo<DeviceRow[]>(
    () => [
      {
        ...device,
        id: `${device.id}-summary`,
      },
    ],
    [device],
  );
  const [addRadioNodeSheetOpen, setAddRadioNodeSheetOpen] = useState(false);
  const [configMismatchSheetOpen, setConfigMismatchSheetOpen] = useState(false);
  const [createdTemplateName, setCreatedTemplateName] = useState<string | null>(initialCreatedTemplate ?? null);
  const [commissioningSubTab, setCommissioningSubTab] = useState('template-logs');
  // Sync createdTemplateName when navigating to this page with a new template
  React.useEffect(() => {
    if (initialCreatedTemplate) {
      setCreatedTemplateName(initialCreatedTemplate);
      setCommissioningSubTab('local-templates');
    }
  }, [initialCreatedTemplate]);
  const [resourcesTimeRange, setResourcesTimeRange] = useState<(typeof RESOURCES_TIME_RANGES)[number]>(RESOURCES_TIME_RANGES[0]);
  const [cellSearch, setCellSearch] = useState('');
  const [cellTimeRange, setCellTimeRange] = useState<(typeof CELL_TIME_RANGES)[number]>(CELL_TIME_RANGES[0]);
  const [cellStatusFilter, setCellStatusFilter] = useState<(typeof CELL_STATUS_OPTIONS)[number]>('all');
  const [cellDetailSheetOpen, setCellDetailSheetOpen] = useState(false);
  const [selectedCellName, setSelectedCellName] = useState<string | null>(null);
  const [cellDetailInterval, setCellDetailInterval] = useState<(typeof CELL_DETAIL_INTERVALS)[number]>(CELL_DETAIL_INTERVALS[0]);
  const [remoteMapSheetOpen, setRemoteMapSheetOpen] = useState(false);
  const [remoteSheetHydrated, setRemoteSheetHydrated] = useState(false);
  const [remoteSummaryExpanded, setRemoteSummaryExpanded] = useState(false);
  const [remoteModuleTab, setRemoteModuleTab] = useState<(typeof REMOTE_MODULE_TABS)[number]>(REMOTE_MODULE_TABS[1]);
  const [selectedRemoteRow, setSelectedRemoteRow] = useState<RadioNodeRow | null>(null);
  const currentTopologyNodeRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedRemoteTopologyPath, setSelectedRemoteTopologyPath] = useState<DasTopologyNodeSelection[] | null>(null);
  React.useEffect(() => {
    setRemoteSummaryExpanded(false);
  }, [selectedRemoteRow?.index]);
  React.useEffect(() => {
    if (!remoteMapSheetOpen) {
      setRemoteSheetHydrated(false);
      return;
    }
    let rafOne = 0;
    let rafTwo = 0;
    setRemoteSheetHydrated(false);
    rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(() => {
        setRemoteSheetHydrated(true);
      });
    });
    return () => {
      if (rafOne) window.cancelAnimationFrame(rafOne);
      if (rafTwo) window.cancelAnimationFrame(rafTwo);
    };
  }, [remoteMapSheetOpen]);
  const selectedRemoteFloorplanMarkerStyle = React.useMemo<React.CSSProperties>(() => {
    const index = selectedRemoteRow?.index ?? 1;
    const markerPositions = [
      { left: '38%', top: '34%' },
      { left: '56%', top: '34%' },
      { left: '47%', top: '46%' },
      { left: '33%', top: '58%' },
      { left: '63%', top: '58%' },
    ];
    return markerPositions[(index - 1) % markerPositions.length];
  }, [selectedRemoteRow?.index]);
  const selectedRemoteBandPowerData = React.useMemo(
    () => {
      const indexSeed = selectedRemoteRow?.index ?? 1;
      const totalSteps = 48; // 24h at 30-minute intervals
      return Array.from({ length: totalSteps + 1 }, (_, idx) => {
        const progress = idx / totalSteps;
        const hoursAgo = (totalSteps - idx) * 0.5;
        const waveA = Math.sin(progress * Math.PI * 2);
        const waveB = Math.cos(progress * Math.PI * 3);
        const trend = progress * 0.9;
        const timeLabel =
          hoursAgo === 0
            ? 'Now'
            : hoursAgo < 1
              ? '30m'
              : Number.isInteger(hoursAgo)
                ? `${hoursAgo}h`
                : `${Math.floor(hoursAgo)}h 30m`;

        return {
          time: timeLabel,
          band700: Number((14 + indexSeed * 0.3 + trend + waveA * 0.45 + waveB * 0.15).toFixed(2)),
          cellEsmr: Number((17 + indexSeed * 0.2 + trend + waveA * 0.4 - waveB * 0.2).toFixed(2)),
          pcs: Number((20 + indexSeed * 0.25 + trend + waveA * 0.5 + waveB * 0.1).toFixed(2)),
          aw53: Number((18 + indexSeed * 0.2 + trend + waveA * 0.35 - waveB * 0.12).toFixed(2)),
          ulBand700: Number((8 + indexSeed * 0.2 + trend * 0.35 + waveA * 0.28 + waveB * 0.08).toFixed(2)),
          ulCellEsmr: Number((10 + indexSeed * 0.2 + trend * 0.35 + waveA * 0.25 - waveB * 0.1).toFixed(2)),
          ulPcs: Number((12 + indexSeed * 0.2 + trend * 0.35 + waveA * 0.3 + waveB * 0.06).toFixed(2)),
          ulAw53: Number((11 + indexSeed * 0.15 + trend * 0.35 + waveA * 0.22 - waveB * 0.09).toFixed(2)),
        };
      });
    },
    [selectedRemoteRow?.index],
  );
  const handleDasTopologyNodeSelect = React.useCallback((node: DasTopologyNodeSelection) => {
    const normalizedLabel = node.label.toLowerCase();
    const existing = RADIO_NODES_DATA.find((row) => row.name.toLowerCase() === normalizedLabel);
    const role: RadioNodeRow['role'] =
      normalizedLabel.includes('riu') ? 'RIU'
        : normalizedLabel.includes('dcu') ? 'DCU'
          : normalizedLabel.includes('deu') ? 'DEU'
            : normalizedLabel.includes('hru') ? 'dHRU'
              : normalizedLabel.includes('lru') ? 'dLRU'
                : 'dMRU';
    const status: RadioNodeRow['status'] = node.status === 'offline' ? 'Down' : 'Up';
    const alarmType: RadioNodeRow['alarmType'] = status === 'Down' ? 'Major' : 'None';
    const fallbackIndex = (Math.abs(node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 90) + 10;
    const fallbackRow: RadioNodeRow = {
      index: fallbackIndex,
      name: node.label,
      role,
      description: node.location ?? 'Topology path',
      status,
      enabled: status === 'Up',
      alarms: status === 'Down' ? 1 : 0,
      alarmType,
      supportBands: '700, CELL/ESMR, PCS, AWS3',
      ethernetId: `00:1a:2b:3c:4d:${String(fallbackIndex).padStart(2, '0')}`,
      model: node.model ?? 'FGH456',
      serialNumber: `RN-${String(fallbackIndex).padStart(6, '0')}`,
    };

    setSelectedRemoteRow(existing ?? fallbackRow);
    setSelectedRemoteTopologyPath(getDasTopologyPathToNode(node.id));
    setRemoteMapSheetOpen(true);
  }, []);
  const selectedRemoteBandLatest = React.useMemo(
    () => selectedRemoteBandPowerData[selectedRemoteBandPowerData.length - 1] ?? null,
    [selectedRemoteBandPowerData],
  );
  const selectedRemoteRfRows = React.useMemo(
    () => {
      const dl700 = selectedRemoteBandLatest?.band700 ?? 0;
      const dlCellEsmr = selectedRemoteBandLatest?.cellEsmr ?? 0;
      const dlPcs = selectedRemoteBandLatest?.pcs ?? 0;
      const dlAws3 = selectedRemoteBandLatest?.aw53 ?? 0;
      const ul700 = selectedRemoteBandLatest?.ulBand700 ?? 0;
      const ulCellEsmr = selectedRemoteBandLatest?.ulCellEsmr ?? 0;
      const ulPcs = selectedRemoteBandLatest?.ulPcs ?? 0;
      const ulAws3 = selectedRemoteBandLatest?.ulAw53 ?? 0;

      return [
        { parameter: 'UL Limiter', showTrend: false, showDot: false, values: ['Off', 'Off', 'Off', 'Off'] },
        { parameter: 'Service State', showTrend: false, showDot: false, values: ['On', 'Off', 'Off', 'Off'] },
        {
          parameter: 'Out Power',
          showTrend: false,
          showDot: false,
          values: [
            `${dl700.toFixed(2)} dBm`,
            `${dlCellEsmr.toFixed(2)} dBm`,
            `${dlPcs.toFixed(2)} dBm`,
            `${dlAws3.toFixed(2)} dBm`,
          ],
        },
        {
          parameter: 'DL Power',
          showTrend: true,
          showDot: true,
          values: [
            `${dl700.toFixed(2)} dBm`,
            `${dlCellEsmr.toFixed(2)} dBm`,
            `${dlPcs.toFixed(2)} dBm`,
            `${dlAws3.toFixed(2)} dBm`,
          ],
        },
        {
          parameter: 'UL Power Detector',
          showTrend: true,
          showDot: true,
          values: [
            `${ul700.toFixed(2)} dBm`,
            `${ulCellEsmr.toFixed(2)} dBm`,
            `${ulPcs.toFixed(2)} dBm`,
            `${ulAws3.toFixed(2)} dBm`,
          ],
        },
      ] as const;
    },
    [selectedRemoteBandLatest, selectedRemoteRow?.index],
  );
  const selectedRemoteMruAlarmRows = React.useMemo(
    () => [
      { name: 'Inconsistent Version', status: 'ok' as const },
      { name: 'Over Temperature', status: 'ok' as const },
      { name: 'Service 700', status: selectedRemoteRow?.alarmType === 'Critical' ? 'critical' as const : 'ok' as const },
      { name: 'Service CELL/ESMR', status: selectedRemoteRow?.alarmType === 'Critical' ? 'critical' as const : 'ok' as const },
      { name: 'Service AWS3', status: selectedRemoteRow?.alarmType === 'Major' ? 'warning' as const : 'ok' as const },
      { name: 'Service PCS', status: selectedRemoteRow?.alarmType === 'Major' ? 'warning' as const : 'ok' as const },
      { name: 'Adjustment Fault', status: 'ok' as const },
      { name: 'HW Failure', status: selectedRemoteRow?.status === 'Down' ? 'warning' as const : 'ok' as const },
    ],
    [selectedRemoteRow?.alarmType, selectedRemoteRow?.status],
  );
  const selectedRemoteTopologyChain = React.useMemo(() => {
    const typeSubtitleMap: Record<string, string> = {
      stack: 'Main stack',
      extension: 'Extension',
      ihu: 'Head-end',
      oim: 'Optical interface',
      mru: 'Remote unit',
      och_unit: 'Optical channel unit',
      och_bank: 'Optical channel bank',
      rim: 'RIM module',
      fmm: 'FMM module',
      hcm: 'HCM module',
      info: 'Info node',
    };

    if (selectedRemoteTopologyPath && selectedRemoteTopologyPath.length > 0) {
      return selectedRemoteTopologyPath.map((node) => ({
        label: node.label,
        subtitle: node.location || typeSubtitleMap[node.type] || 'Topology node',
      }));
    }

    if (device.device === 'MA3000-HOU-001') {
      const selectedLabel = (selectedRemoteRow?.name ?? 'MRU-1').replace(/\s+/g, '-');
      const baseChain = [
        { label: 'Stack - HCM', subtitle: 'Root stack' },
        { label: 'Extension - ONE Cl...', subtitle: 'Extension' },
        { label: 'IHU-22-20-49-0201', subtitle: 'Chassis' },
      ];
      const role = selectedRemoteRow?.role;
      if (role === 'RIU') {
        return [
          ...baseChain,
          { label: 'RIM1 - VZW 700 Path...', subtitle: 'RIU branch' },
          { label: selectedLabel, subtitle: 'Radio interface unit' },
        ];
      }
      if (role === 'DCU') {
        return [
          ...baseChain,
          { label: 'FMM9', subtitle: 'Fiber matrix branch' },
          { label: selectedLabel, subtitle: 'Distribution cabinet unit' },
        ];
      }
      if (role === 'DEU') {
        return [
          ...baseChain,
          { label: 'OIM11', subtitle: 'Optical branch' },
          { label: selectedLabel, subtitle: 'Distribution edge unit' },
        ];
      }
      if (role === 'dLRU') {
        return [
          ...baseChain,
          { label: 'OIM12', subtitle: 'Optical branch' },
          { label: selectedLabel, subtitle: 'Low-power remote unit' },
        ];
      }
      return [
        ...baseChain,
        { label: 'HIU-1', subtitle: 'HIU branch' },
        { label: 'OIM-10', subtitle: 'Optical interface' },
        { label: selectedLabel, subtitle: 'Remote unit' },
      ];
    }

    const role = selectedRemoteRow?.role;
    if (!role) {
      return [
        { label: 'IHU', subtitle: 'Head-end' },
        { label: 'MRU1', subtitle: 'Primary remote' },
      ];
    }
    if (role === 'RIU') {
      return [
        { label: 'IHU', subtitle: 'Head-end' },
        { label: selectedRemoteRow?.name ?? 'RIU', subtitle: 'Radio interface unit' },
      ];
    }
    if (role === 'DCU') {
      return [
        { label: 'IHU', subtitle: 'Head-end' },
        { label: 'RIU 1', subtitle: 'Radio interface unit' },
        { label: selectedRemoteRow?.name ?? 'DCU', subtitle: 'Distribution cabinet unit' },
      ];
    }
    if (role === 'DEU') {
      return [
        { label: 'IHU', subtitle: 'Head-end' },
        { label: 'RIU 1', subtitle: 'Radio interface unit' },
        { label: 'DCU 1', subtitle: 'Distribution cabinet unit' },
        { label: selectedRemoteRow?.name ?? 'DEU', subtitle: 'Distribution edge unit' },
      ];
    }
    return [
      { label: 'IHU', subtitle: 'Head-end' },
      { label: 'OIM10', subtitle: 'Optical interface' },
      { label: 'MRU1', subtitle: 'Primary remote' },
      { label: selectedRemoteRow?.name ?? 'MRU', subtitle: 'Radio unit' },
    ];
  }, [device.device, selectedRemoteTopologyPath, selectedRemoteRow?.name, selectedRemoteRow?.role]);
  const selectedRemoteTopologyDisplayChain = React.useMemo(() => {
    const tail = selectedRemoteTopologyChain.slice(-3);
    return tail.map((node) => ({ ...node, compact: false }));
  }, [selectedRemoteTopologyChain]);
  React.useEffect(() => {
    if (!remoteMapSheetOpen || !remoteSheetHydrated) return;
    const id = window.setTimeout(() => {
      currentTopologyNodeRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }, 30);
    return () => window.clearTimeout(id);
  }, [remoteMapSheetOpen, remoteSheetHydrated, selectedRemoteTopologyDisplayChain.length, selectedRemoteRow?.name]);
  const selectedRemotePamAlarmRows = React.useMemo(
    () => [
      {
        alarm: 'DL Out Pwr Low',
        cols: ['warning', 'warning', 'ok', 'ok'],
      },
      {
        alarm: 'UL In Pwr High',
        cols: ['ok', 'ok', selectedRemoteRow?.alarmType === 'Major' ? 'warning' : 'ok', 'ok'],
      },
      {
        alarm: 'Over Power',
        cols: ['ok', selectedRemoteRow?.alarmType === 'Critical' ? 'critical' : 'ok', 'ok', 'ok'],
      },
      {
        alarm: 'VSWR',
        cols: ['ok', 'ok', 'ok', selectedRemoteRow?.status === 'Down' ? 'warning' : 'ok'],
      },
    ] as const,
    [selectedRemoteRow?.alarmType, selectedRemoteRow?.status],
  );
  const renderRemoteAlarmDot = React.useCallback((status: 'ok' | 'warning' | 'critical') => {
    const className = status === 'critical'
      ? 'bg-destructive'
      : status === 'warning'
        ? 'bg-warning'
        : 'bg-success';
    return <span className={`inline-block h-2.5 w-2.5 rounded-full border border-slate-900/40 ${className}`} />;
  }, []);
  const renderBandStatsLegend = React.useCallback(
    (props: any) => {
      const payload = (props?.payload ?? []).filter((item: any) => item.type !== 'none');
      if (!payload.length || !selectedRemoteBandLatest) return null;

      return (
        <div className="pt-2">
          <div className="grid grid-cols-2 rounded-md border border-border/60 bg-muted/20 sm:grid-cols-4">
            {payload.map((item: any) => {
              const dataKey = String(item.dataKey ?? '');
              const latestValue = (selectedRemoteBandLatest as Record<string, unknown>)[dataKey];
              const numericValue = typeof latestValue === 'number' ? latestValue : null;

              return (
                <div
                  key={dataKey}
                  className="flex min-w-0 flex-col gap-1 border-r border-b border-border/40 px-2 py-1.5 text-xs last:border-r-0 sm:[&:nth-child(2)]:border-r sm:[&:nth-child(2)]:border-border/40 sm:[&:nth-child(n+3)]:border-b-0"
                >
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.value}</span>
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {numericValue !== null ? `${numericValue.toFixed(1)} dBm` : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
    [selectedRemoteBandLatest],
  );
  const hcmInfoValues = React.useMemo(() => {
    const ipv4Parts = device.ipAddress.split('.');
    const localSubnetMask = '255.255.255.0';
    const lanSubnetMask = '255.255.254.0';
    const lanGateway = ipv4Parts.length === 4 ? `${ipv4Parts[0]}.${ipv4Parts[1]}.${ipv4Parts[2]}.1` : '192.168.10.1';
    const lanIpv6Address = 'fe80::2a0:5ff:fe12:3456';
    const lanIpv6SubnetMask = '/64';

    return {
      localDhcpMode: 'Disabled',
      localIpAddress: device.ipAddress,
      localSubnetMask,
      lanDhcpMode: 'Enabled',
      lanIpAddress: lanGateway,
      lanSubnetMask,
      lanDefaultGateway: lanGateway,
      lanIpv6DhcpMode: 'Enabled',
      lanIpv6Address,
      lanIpv6SubnetMask,
      agcMode: 'Auto',
      tddAllocationMode: 'Dynamic',
      tddCpType: 'Normal CP',
      tddSubFrameAllocation: '2:2',
      tddCenterFrequency: '3.55 GHz',
    };
  }, [device.ipAddress]);
  const SIDEBAR_BADGE_COUNTS = React.useMemo<Record<string, number>>(() => ({
    'ip-interfaces': IP_INTERFACES_DATA.length,
    'radio-nodes': filteredRadioNodes.length,
    remotes: filteredRadioNodes.length,
    'radio-units': filteredRadioNodes.length,
    'nr-cells': NR_CELLS_DATA.length,
    'zones': ZONES_DATA.length,
  }), [filteredRadioNodes.length]);
  const [noteInput, setNoteInput] = useState('');
  const notesScrollRef = React.useRef<HTMLDivElement>(null);
  const alarmsCardRef = React.useRef<HTMLDivElement>(null);
  const selectedCell = React.useMemo(
    () => CELL_PERFORMANCE_ROWS.find((row) => row.name === selectedCellName) ?? null,
    [selectedCellName],
  );
  const selectedCellAlarms = React.useMemo(
    () => (selectedCell ? CELL_ALARM_ROWS.filter((row) => row.cellName === selectedCell.name) : []),
    [selectedCell],
  );
  const cellDetailChartData = React.useMemo(() => {
    if (!selectedCell) return [];
    const slots = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'];
    return slots.map((time, index) => {
      const wave = [0, 1, -1, 2, -2, 1, 0, -1][index] ?? 0;
      const availabilityOutages = selectedCell.status === 'good'
        ? [0, 0, 1, 0, 0, 1, 0, 0][index]
        : [1, 2, 1, 3, 2, 2, 1, 2][index];
      return {
        time,
        erabEstablishmentSr: Number((selectedCell.callSetupSuccessRate - 0.35 + wave * 0.12).toFixed(2)),
        erabEstablishmentAttempts: Math.max(200, Math.round(selectedCell.connEstabAttSum / 8 + wave * 70)),
        volteEstablishmentSr: Number((selectedCell.callSetupSuccessRate + 0.6 + wave * 0.1).toFixed(2)),
        volteEstablishmentAttempts: Math.max(80, Math.round((selectedCell.connEstabAttSum * 0.28) / 8 + wave * 22)),
        erabsDropRate: Number((selectedCell.erabDropRate + wave * 0.05).toFixed(2)),
        erabsDrops: Math.max(0, Math.round(selectedCell.erabDrops / 2 + wave * 2)),
        volteDropRate: Number((selectedCell.erabDropRate * 0.6 + wave * 0.03).toFixed(2)),
        volteDropCount: Math.max(0, Math.round(selectedCell.erabDrops * 0.45 + wave * 1.5)),
        s1HoSuccessRate: Number((selectedCell.rrcSuccessRate - 0.35 + wave * 0.12).toFixed(2)),
        s1HoAttempts: Math.max(60, Math.round(selectedCell.maxRrcUsers * 0.72 + wave * 20)),
        handInIntra: Math.max(45, Math.round(selectedCell.maxRrcUsers * 0.58 + wave * 16)),
        handInIntraAttempts: Math.max(50, Math.round(selectedCell.maxRrcUsers * 0.63 + wave * 18)),
        handInIntraSr: Number((selectedCell.rrcSuccessRate - 0.55 + wave * 0.14).toFixed(2)),
        sceLteCellGtpDlNumBytes: Math.max(50_000_000, Math.round(selectedCell.dlBytes * (0.78 + wave * 0.03))),
        sceLteCellGtpUlNumBytes: Math.max(20_000_000, Math.round(selectedCell.ulBytes * (0.78 + wave * 0.03))),
        availabilityPct: Number(((selectedCell.enabled ? 99.7 : 97.8) + wave * 0.12).toFixed(2)),
        availabilityOutages,
      };
    });
  }, [selectedCell]);
  const expandedSiteChartTitle = React.useMemo(() => {
    switch (expandedSiteChart) {
      case 'erab-establishment':
        return 'ERAB establishment';
      case 'volte-establishment':
        return 'VoLTE establishment';
      case 'rrc-success-rate':
        return 'RRC success rate';
      case 'erab-drop-rate':
        return 'ERAB drop rate';
      case 'volte-drop-rate':
        return 'VoLTE drop rate';
      case 's1-ho':
        return 'S1 HO success rate';
      case 'handin-intra':
        return 'HandIn Intra';
      case 'gtp-data-volume':
        return 'SCE_LTE_GTP data volume';
      case 'hw-memory-usage':
        return 'Memory usage';
      default:
        return 'Chart';
    }
  }, [expandedSiteChart]);

  const [dasInventoryView, setDasInventoryView] = useState<'list' | 'map'>('list');
  const [dasTopologySearch, setDasTopologySearch] = useState('');
  const [dasTopologyStatusFilter, setDasTopologyStatusFilter] = useState('All');
  const [dasTopologyTypeFilter, setDasTopologyTypeFilter] = useState('All');
  const [dasTableSearch, setDasTableSearch] = useState('');
  const [dasTableStatusFilter, setDasTableStatusFilter] = useState('All');
  const [dasTableTypeFilter, setDasTableTypeFilter] = useState('All');
  const [snmpValues, setSnmpValues] = useState({
    ipAddress: device.ipAddress || '10.12.1.42',
    snmpPort: '161',
    timeout: '5',
    snmpVersion: 'v2c',
    readCommunity: 'public',
    writeCommunity: 'private',
  });
  const [snmpEditDrawerOpen, setSnmpEditDrawerOpen] = useState(false);
  const [snmpEditDraft, setSnmpEditDraft] = useState(snmpValues);

  // Threshold crossing profile state
  const [tcProfiles, setTcProfiles] = useState<ProfileData[]>([structuredClone(PERF_PROFILES_INIT['LTE Throughput Baseline'])]);
  const [tcSelectedProfileName, setTcSelectedProfileName] = useState<string | null>('LTE Throughput Baseline');
  const [tcProfileScheduleTab, setTcProfileScheduleTab] = useState('1');
  const [removeTcProfileTarget, setRemoveTcProfileTarget] = useState<string | null>(null);
  const [addTcProfileOpen, setAddTcProfileOpen] = useState(false);
  const [addTcProfileSelection, setAddTcProfileSelection] = useState('');
  const [tcProfileSheetOpen, setTcProfileSheetOpen] = useState(false);
  const tcProfile = tcProfiles.find((p) => p.name === tcSelectedProfileName) ?? null;

  const handleOpenSnmpEdit = React.useCallback(() => {
    setSnmpEditDraft(snmpValues);
    setSnmpEditDrawerOpen(true);
  }, [snmpValues]);

  const handleSaveSnmpEdit = React.useCallback(() => {
    setSnmpValues(snmpEditDraft);
    setSnmpEditDrawerOpen(false);
    toast.success('SNMP configuration saved');
  }, [snmpEditDraft]);

  const handleCancelSnmpEdit = React.useCallback(() => {
    setSnmpEditDraft(snmpValues);
    setSnmpEditDrawerOpen(false);
  }, [snmpValues]);

  React.useEffect(() => {
    if (!scrollToAlarms) return;
    setActiveSection('summary');
    setAlarmsEventsTab('alarms');
    const t = setTimeout(() => {
      alarmsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onScrollToAlarmsDone?.();
    }, 150);
    return () => clearTimeout(t);
  }, [scrollToAlarms, onScrollToAlarmsDone]);

  React.useEffect(() => {
    setShowSummaryMap(false);
  }, [device.id]);

  React.useEffect(() => {
    if (!scrollToNotes) return;
    setAlarmsEventsTab('notes');
    const t = setTimeout(() => {
      alarmsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onScrollToNotesDone?.();
    }, 150);
    return () => clearTimeout(t);
  }, [scrollToNotes, onScrollToNotesDone]);

  const [summaryValues, setSummaryValues] = useState({
    hostname: device.device,
    location: getDeviceAddress(device.region || 'Pacific Northwest', device.id),
    description: device.notes || '',
    deploymentType: 'Standalone',
    clusterId: device.id.padStart(3, '0'),
    contact: 'ops@example.com',
    groupName: device.deviceGroup,
    labels: device.labels ?? [],
  });

  React.useEffect(() => {
    setSummaryValues((prev) => ({
      ...prev,
      hostname: device.device,
      location: getDeviceAddress(device.region || 'Pacific Northwest', device.id),
      description: device.notes || '',
      clusterId: device.id.padStart(3, '0'),
      groupName: device.deviceGroup,
      labels: device.labels ?? [],
    }));
  }, [device.device, device.deviceGroup, device.notes, device.id, device.labels, device.region]);

  const formatNoteDatetime = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const handleSendNote = React.useCallback(() => {
    const content = noteInput.trim();
    if (!content) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: 'You',
      content,
      datetime: formatNoteDatetime(),
    };
    setNotes((prev) => [...prev, newNote]);
    setNoteInput('');
  }, [noteInput]);

  React.useEffect(() => {
    notesScrollRef.current?.scrollTo({ top: notesScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [notes]);

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendNote();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="devices"
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
      />
      <main className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8 min-h-0 flex flex-col overflow-hidden">
        {/* Header - fixed at top of main */}
        <div className="shrink-0 bg-gray-900 -mx-4 -mt-6 mb-6 md:-mx-6 lg:-mx-8 rounded-b-lg overflow-hidden dark:border-b dark:border-white/10">
          {device.status === 'In maintenance' && (
            <div className="h-4 bg-warning" />
          )}
          {device.status === 'Disconnected' && (
            <div className="h-4 bg-destructive" />
          )}
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-12 flex-wrap">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -ml-2 mt-1 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={onBack}
                aria-label="Back to devices"
              >
                <Icon name="chevron_left" size={24} />
              </Button>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight mb-2 text-white max-w-md leading-tight">
                  {device.device}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-0">
                    {device.type}
                  </Badge>
                  {device.region && (
                    <Badge variant="secondary" className="bg-blue-900/60 text-blue-200 hover:bg-blue-800/60 border-0">
                      {device.region}
                    </Badge>
                  )}
                  <DeviceStatus status={device.status} variant="dark" iconSize={14} className="text-sm" />
                  {device.configMismatch != null && device.configMismatch > 0 && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="group/mismatch inline-flex items-center gap-1.5 text-sm text-warning"
                            onClick={() => setConfigMismatchSheetOpen(true)}
                          >
                            <Icon name="difference" size={16} className="shrink-0" />
                            <span className="group-hover/mismatch:underline">{device.configMismatch} config {device.configMismatch === 1 ? 'mismatch' : 'mismatches'}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View configuration mismatches</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10 shrink-0">
              {/* Name/value pairs */}
              <div className="flex items-center gap-10 text-sm">
                {!isDas && (
                  <div>
                    <p className="text-gray-400 mb-0.5">IP interfaces</p>
                    <div className="flex items-center gap-1.5 text-white">
                      <Icon name="arrow_upward" size={14} className="text-green-400" />
                      <span className="font-semibold tabular-nums">12</span>
                      <Icon name="arrow_downward" size={14} className="text-destructive" />
                      <span className="font-semibold tabular-nums">2</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-0.5">{isDas ? 'Radio units' : 'Radio nodes'}</p>
                  <div className="flex items-center gap-1.5 text-white">
                    <Icon name="arrow_upward" size={14} className="text-green-400" />
                    <span className="font-semibold tabular-nums">12</span>
                    <Icon name="arrow_downward" size={14} className="text-destructive" />
                    <span className="font-semibold tabular-nums">2</span>
                  </div>
                </div>
                {!isDas && (
                  <div>
                    <p className="text-gray-400 mb-0.5">UE sessions</p>
                    <span className="font-semibold tabular-nums text-white">
                      {Math.floor(Math.random() * 400 + 100)}
                    </span>
                  </div>
                )}
              </div>
              {/* Major and Critical alarms */}
              <div className="flex items-center gap-10 text-sm">
                <div>
                  <p className="text-gray-400 mb-0.5">Critical</p>
                  <div className="flex items-center gap-1.5">
                    <Icon name="error" size={14} className="text-destructive" />
                    <span className="font-semibold tabular-nums text-white">{Math.ceil(device.alarms * 0.4)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Major</p>
                  <div className="flex items-center gap-1.5">
                    <Icon name="error_outline" size={14} className="text-warning" />
                    <span className="font-semibold tabular-nums text-white">{Math.floor(device.alarms * 0.4)}</span>
                  </div>
                </div>
              </div>
              {/* Actions dropdown */}
              <div className="ml-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 border border-gray-600 bg-transparent text-white hover:bg-gray-800 hover:text-white">
                    Actions
                    <Icon name="expand_more" size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Icon name="edit" size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon name="settings" size={16} className="mr-2" />
                    Configure
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon name="refresh" size={16} className="mr-2" />
                    Refresh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar - fixed, only content area scrolls */}
          <Card className="w-48 shrink-0 p-2 h-fit self-start">
            <nav className="flex flex-col gap-0.5">
            {SIDEBAR_ITEMS.map((label) => {
              const key = toKey(label);
              const isActive = activeSection === key;
              const count = SIDEBAR_BADGE_COUNTS[key];
              const isWebTerminal = key === 'web-terminal';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (isWebTerminal && onOpenWebTerminal) {
                      onOpenWebTerminal(device);
                    } else {
                      setActiveSection(key);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive && !isWebTerminal
                      ? 'bg-muted font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {count != null && (
                      <Badge variant="secondary" className="shrink-0 h-5 min-w-5 px-1.5 text-xs tabular-nums">
                        {count}
                      </Badge>
                    )}
                    {isWebTerminal && (
                      <Icon name="open_in_new" size={14} className="text-muted-foreground" />
                    )}
                  </span>
                </button>
              );
            })}
            </nav>
          </Card>

          {/* Main content - scrollable */}
          <div className="flex-1 min-w-0 overflow-y-auto">
          {activeSection === 'summary' && (
          <div className="space-y-6">
            {!isDas && showSummaryMap && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2">
                <RegionsMap
                  region={device.region}
                  regions={device.region ? [device.region] : undefined}
                  devices={summaryMapDevices}
                  singleRegionZoom={13}
                  heightClassName="h-[280px]"
                  fitToDevices
                />
              </div>
            )}
            {!isDas && (
              <div className="flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={showSummaryMap ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowSummaryMap((prev) => !prev)}
                      aria-label={showSummaryMap ? 'Hide device location map' : 'Show device location map'}
                    >
                      <Icon name="map" size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showSummaryMap ? 'Hide map' : 'Show map'}</TooltipContent>
                </Tooltip>
              </div>
            )}
            {/* Name/value pair section from device drawer */}
            <div>
            <Card>
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <NameValueField
                      label="Hostname"
                      value={summaryValues.hostname}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, hostname: v }))}
                      placeholder="—"
                    />
                    <NameValueField
                      label="Location"
                      value={summaryValues.location}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, location: v }))}
                      placeholder="—"
                    />
                    <NameValueField
                      label="Description"
                      value={summaryValues.description}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, description: v }))}
                      placeholder="—"
                      multiline
                    />
                    <NameValueField
                      label="Deployment type"
                      value={summaryValues.deploymentType}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, deploymentType: v }))}
                      placeholder="—"
                    />
                    <NameValueField
                      label="Cluster ID"
                      value={summaryValues.clusterId}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, clusterId: v }))}
                      placeholder="—"
                    />
                    <NameValueField
                      label="Contact"
                      value={summaryValues.contact}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, contact: v }))}
                      placeholder="—"
                    />
                    <NameValueField
                      label="Group name"
                      value={summaryValues.groupName}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, groupName: v as DeviceGroup }))}
                      placeholder="—"
                    />
                    <EditableLabelsField
                      label="Labels"
                      value={summaryValues.labels}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, labels: v }))}
                      placeholder="—"
                      style={{ gridColumn: '1 / -1' }}
                    />
                  </div>
                </div>
                <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Status</h4>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Location</h4>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Latitude</span>
                          <span className="font-medium">{getDeviceCoordinates(device.region || 'Pacific Northwest', device.id).lat}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Longitude</span>
                          <span className="font-medium">{getDeviceCoordinates(device.region || 'Pacific Northwest', device.id).lng}</span>
                        </div>
                      </div>
                    </div>
                    <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Hardware</h4>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                          <span className="font-medium">SN-2000</span>
                        </div>
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
                    <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Settings</h4>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  <Icon name={detailsExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={16} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
            </div>

            {/* Alarms, Events, Conditions, Notes */}
            <Card ref={alarmsCardRef}>
              <CardContent className="pt-6">
                <Tabs value={alarmsEventsTab} onValueChange={setAlarmsEventsTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                    <TabsTrigger value="alarms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      Alarms
                    </TabsTrigger>
                    <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="conditions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      Conditions
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                      Notes
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                        {notes.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="alarms" className="mt-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search alarms..." className="pl-9 w-full" />
                      </div>
                      <Select>
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Alarms" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALARMS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-h-[200px]">
                      <AlarmsDataTable />
                    </div>
                  </TabsContent>

                  <TabsContent value="events" className="mt-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search events..." className="pl-9 w-full" />
                      </div>
                      <Select>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENTS_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENTS_SEVERITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENTS_SOURCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-h-[200px]">
                      <EventsDataTable />
                    </div>
                  </TabsContent>

                  <TabsContent value="conditions" className="mt-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search conditions..." className="pl-9 w-full" />
                      </div>
                    </div>
                    <div className="min-h-[200px]">
                      <ThresholdCrossingAlertsDataTable deviceId={device.device} hideDeviceColumn />
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <div className="flex flex-col min-h-[320px]">
                      <div ref={notesScrollRef} className="flex-1 min-h-0 overflow-x-auto overflow-y-auto space-y-4 pb-3 pr-1">
                        {notes.map((note) => {
                          const isMine = note.author === 'You';
                          return (
                            <div key={note.id} className={`group flex flex-col gap-1 w-full ${isMine ? 'items-end' : 'items-start'}`}>
                              <div className={`flex items-center gap-1.5 w-2/3 min-w-0 ${isMine ? 'ml-auto justify-end' : ''}`}>
                                {isMine && (
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                      aria-label="Edit note"
                                      onClick={() => {
                                        setNoteInput(note.content);
                                        setNotes((prev) => prev.filter((n) => n.id !== note.id));
                                      }}
                                    >
                                      <Icon name="edit" size={18} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      aria-label="Delete note"
                                      onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                                    >
                                      <Icon name="delete" size={18} />
                                    </Button>
                                  </div>
                                )}
                                <div
                                  className={
                                    isMine
                                      ? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-base w-max max-w-full break-words shrink-0 min-w-0'
                                      : 'rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2 text-base text-foreground w-max max-w-full break-words shrink-0 min-w-0'
                                  }
                                >
                                  {note.content}
                                </div>
                              </div>
                              <div className={`w-2/3 min-w-0 ${isMine ? 'ml-auto text-right pr-3' : 'text-left pl-3'}`}>
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                  {note.author} · {note.datetime}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-end gap-2 pt-3 border-t shrink-0">
                        <div className="flex-1 flex items-end gap-2 rounded-2xl border bg-muted/30 px-3 py-2 min-h-[44px]">
                          <Textarea
                            placeholder="Add a note..."
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            onKeyDown={handleNoteKeyDown}
                            className="min-h-[36px] max-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0 py-1.5 text-base"
                            rows={1}
                          />
                          <Button
                            type="button"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90"
                            aria-label="Send note"
                            onClick={handleSendNote}
                          >
                            <Icon name="arrow_upward" size={18} className="text-primary-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          )}

          {activeSection === 'hcm-info' && isDas && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Local IP settings</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Local DHCP mode</span>
                        <span className="font-medium">{hcmInfoValues.localDhcpMode}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Local IP address</span>
                        <span className="font-medium font-mono">{hcmInfoValues.localIpAddress}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Local subnet mask</span>
                        <span className="font-medium font-mono">{hcmInfoValues.localSubnetMask}</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">LAN IP settings</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN DHCP mode</span>
                        <span className="font-medium">{hcmInfoValues.lanDhcpMode}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN IP address</span>
                        <span className="font-medium font-mono">{hcmInfoValues.lanIpAddress}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN subnet mask</span>
                        <span className="font-medium font-mono">{hcmInfoValues.lanSubnetMask}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN default gateway</span>
                        <span className="font-medium font-mono">{hcmInfoValues.lanDefaultGateway}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN IPv6 DHCP mode</span>
                        <span className="font-medium">{hcmInfoValues.lanIpv6DhcpMode}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN IPv6 address</span>
                        <span className="font-medium font-mono">{hcmInfoValues.lanIpv6Address}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">LAN IPv6 subnet mask</span>
                        <span className="font-medium font-mono">{hcmInfoValues.lanIpv6SubnetMask}</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Settings</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">AGC mode</span>
                        <span className="font-medium">{hcmInfoValues.agcMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">TDD configuration</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">TDD allocation mode</span>
                        <span className="font-medium">{hcmInfoValues.tddAllocationMode}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">TDD CP type</span>
                        <span className="font-medium">{hcmInfoValues.tddCpType}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">TDD sub frame allocation</span>
                        <span className="font-medium">{hcmInfoValues.tddSubFrameAllocation}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">TDD center frequency</span>
                        <span className="font-medium">{hcmInfoValues.tddCenterFrequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Alarms</h4>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Overall status</span>
                        <span className="inline-flex items-center gap-2 font-medium text-success">
                          <span className="h-2.5 w-2.5 rounded-full bg-success" />
                          Cleared
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="h-8 px-2">Status</TableHead>
                            <TableHead className="h-8 px-2">Alarm name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">
                              <span className="inline-flex items-center gap-2 text-success">
                                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                Cleared
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">Over Power</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">
                              <span className="inline-flex items-center gap-2 text-success">
                                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                Cleared
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">UL In Pwr High</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">
                              <span className="inline-flex items-center gap-2 text-success">
                                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                Cleared
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">VSWR High</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-1.5 px-2 text-xs">
                              <span className="inline-flex items-center gap-2 text-success">
                                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                Cleared
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-xs">LNA Gain Imbalance</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'commissioning' && (() => {
            const commissioningRows = [
              { step: 1, name: 'Upgrade', col2: [{ label: 'Current version', value: 'v2.1' }, { label: 'New version', value: 'v2.2' }], actions: ['Download', 'Upgrade'], highlight: false },
              { step: 2, name: 'Global template', col2: [{ label: 'Current version', value: 'v1.0' }], actions: ['Choose templates', 'Start'], highlight: false },
              {
                step: 3,
                name: 'Local/bulk template',
                col2: createdTemplateName
                  ? [{ label: 'Template', value: createdTemplateName }, { label: 'Version', value: 'v1.0' }]
                  : [{ label: 'Template', value: 'default' }, { label: 'Version', value: 'v3.2' }],
                actions: ['Start'],
                highlight: !!createdTemplateName,
              },
              { step: 4, name: 'Start rem scan', col2: [], actions: ['Start'], highlight: false },
            ];
            const LOCAL_TEMPLATES = [
              { id: 'lt-1', name: 'Seattle baseline config', imageConstraints: '>=2.0.5', deviceType: 'SN' },
              { id: 'lt-2', name: 'Portland RF optimization', imageConstraints: '>=3.1.0', deviceType: 'CU' },
              { id: 'lt-3', name: 'Edge device hardening', imageConstraints: '>=2.2.0', deviceType: 'VCU' },
              ...(createdTemplateName ? [{ id: 'lt-new', name: createdTemplateName, imageConstraints: '>=1.0.0', deviceType: device.type || 'SN' }] : []),
            ];
            const TEMPLATE_LOGS = [
              { id: 'tl-1', task: 'Baseline audit', type: 'Reboot', domain: 'seattle-core.acme.net', startTime: '2025-01-27 14:32', lastCompleted: '2025-01-27 14:45' },
              { id: 'tl-2', task: 'RF optimization sweep', type: 'Configuration', domain: 'portland-ran.acme.net', startTime: '2025-01-26 09:15', lastCompleted: '2025-01-26 09:42' },
              { id: 'tl-3', task: 'Firmware rollback', type: 'Software upgrade', domain: 'seattle-core.acme.net', startTime: '2025-01-25 16:48', lastCompleted: '2025-01-25 17:10' },
              { id: 'tl-4', task: 'Edge hardening check', type: 'Health check', domain: 'edge-west.acme.net', startTime: '2025-01-24 11:20', lastCompleted: '2025-01-24 11:35' },
              { id: 'tl-5', task: 'Nightly config sync', type: 'Configuration', domain: 'seattle-core.acme.net', startTime: '2025-01-23 08:05', lastCompleted: '2025-01-23 08:22' },
              { id: 'tl-6', task: 'Certificate renewal', type: 'Reboot', domain: 'portland-ran.acme.net', startTime: '2025-01-22 03:00', lastCompleted: '2025-01-22 03:18' },
            ];
            return (
            <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableBody>
                    {commissioningRows.map((row) => (
                      <TableRow key={row.step} className={row.highlight ? 'bg-success/10 dark:bg-success/5' : ''}>
                        <TableCell className="py-3 align-middle">
                          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 text-sm font-medium">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium">
                              {row.step}
                            </span>
                            {row.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 align-middle">
                          {row.col2?.length ? (
                            <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
                              {row.col2.map((pair, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5">
                                  {i > 0 && <span className="text-muted-foreground">, </span>}
                                  <span className="text-muted-foreground">{pair.label}:</span>
                                  <Badge variant="secondary" className="font-normal">{pair.value}</Badge>
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="py-3 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            {row.actions.map((action) => (
                              <Button key={action} variant="outline" size="sm" className="h-8">
                                {action}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Template logs & Local templates */}
            <Card>
              <CardContent className="pt-6">
                <Tabs value={commissioningSubTab} onValueChange={setCommissioningSubTab}>
                  <TabsList className="w-fit rounded-full p-0.5 h-auto bg-muted">
                    <TabsTrigger value="template-logs" className="rounded-full px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Template logs
                    </TabsTrigger>
                    <TabsTrigger value="local-templates" className="rounded-full px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Local templates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="template-logs" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Domain</TableHead>
                          <TableHead>Start time</TableHead>
                          <TableHead>Last completed</TableHead>
                          <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {TEMPLATE_LOGS.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="text-sm font-medium">{log.task}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.type}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.domain}</TableCell>
                            <TableCell className="tabular-nums text-sm text-muted-foreground">{log.startTime}</TableCell>
                            <TableCell className="tabular-nums text-sm text-muted-foreground">{log.lastCompleted}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Export">
                                      <Icon name="download" size={18} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Export</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete">
                                      <Icon name="delete" size={18} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="local-templates" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template name</TableHead>
                          <TableHead>Image constraints</TableHead>
                          <TableHead>Device type</TableHead>
                          <TableHead className="w-14"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {LOCAL_TEMPLATES.map((tpl) => (
                          <TableRow key={tpl.id} className={tpl.id === 'lt-new' ? 'bg-success/10 dark:bg-success/5' : ''}>
                            <TableCell className="text-sm font-medium">{tpl.name}</TableCell>
                            <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{tpl.imageConstraints}</code></TableCell>
                            <TableCell><NodeTypeBadge type={tpl.deviceType} /></TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                                    <Icon name="more_vert" size={20} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            </div>
            );
          })()}

          {activeSection === 'ip-interfaces' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Icon name="add" size={18} />
                      Add LAN device
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add LAN device</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <IpInterfacesDataTable />
              </CardContent>
            </Card>
          )}

          {activeSection === radioNodesSectionKey && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4 flex-wrap">
                <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={isDas ? 'Search radio units...' : 'Search radio nodes...'}
                      className="pl-9 w-full"
                      value={radioNodesSearch}
                      onChange={(e) => setRadioNodesSearch(e.target.value)}
                    />
                  </div>
                  <FilterSelect value={radioNodesIndexFilter} onValueChange={setRadioNodesIndexFilter} label="Index" options={[...RADIO_NODES_INDEX_OPTIONS]} className="w-[110px]" />
                  <FilterSelect value={radioNodesStatusFilter} onValueChange={setRadioNodesStatusFilter} label="Status" options={[...RADIO_NODES_STATUS_OPTIONS]} className="w-[130px]" />
                  <FilterSelect value={radioNodesModelFilter} onValueChange={setRadioNodesModelFilter} label="Model" options={[...RADIO_NODES_MODEL_OPTIONS]} className="w-[120px]" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="shrink-0 gap-1" onClick={() => setAddRadioNodeSheetOpen(true)}>
                      <Icon name="add" size={18} />
                      {isDas ? 'Add radio unit' : 'Add radio node'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isDas ? 'Add radio unit' : 'Add radio node'}</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <RadioNodesDataTable
                  search={radioNodesSearch}
                  onSearchChange={setRadioNodesSearch}
                  statusFilter={radioNodesStatusFilter}
                  onStatusFilterChange={setRadioNodesStatusFilter}
                  modelFilter={radioNodesModelFilter}
                  onModelFilterChange={setRadioNodesModelFilter}
                  indexFilter={radioNodesIndexFilter}
                  onNameClick={isDas ? (row) => { setSelectedRemoteRow(row); setSelectedRemoteTopologyPath(null); setRemoteMapSheetOpen(true); } : undefined}
                />
              </CardContent>
            </Card>
          )}

          {activeSection === 'nr-cells' && (
            <Card>
              <CardContent className="pt-6">
                <NrCellsDataTable />
              </CardContent>
            </Card>
          )}

          {activeSection === 'zones' && (
            <Card>
              <CardContent className="pt-6">
                <ZonesDataTable />
              </CardContent>
            </Card>
          )}

          {activeSection === 'x2-connections' && (
            <Card>
              <CardContent className="pt-6">
                <X2ConnectionsDataTable />
              </CardContent>
            </Card>
          )}

          {activeSection === 'floor-view' && (
            <Tabs defaultValue={FLOOR_VIEW_BUILDINGS[0].id} className="space-y-6">
              <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-transparent p-0">
                {FLOOR_VIEW_BUILDINGS.map((building) => (
                  <TabsTrigger
                    key={building.id}
                    value={building.id}
                    className="group relative h-auto min-w-[260px] items-start justify-start rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-left data-[state=active]:border-primary data-[state=active]:bg-muted/40 data-[state=active]:shadow-none"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 pointer-events-none group-data-[state=active]:opacity-100 group-data-[state=active]:pointer-events-auto"
                          aria-label="Building options"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="more_vert" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            toast(`Edit ${building.name}`);
                          }}
                        >
                          <Icon name="edit" size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            toast(`Delete ${building.name}`);
                          }}
                        >
                          <Icon name="delete" size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">{building.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {building.floors} floors, {building.remotes} radio units
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              {FLOOR_VIEW_BUILDINGS.map((building) => (
                <TabsContent key={building.id} value={building.id} className="mt-0">
                  {(() => {
                    const floorRows = getFloorRows(building);
                    const floorSearch = floorSearchByBuilding[building.id] ?? '';
                    const filteredFloorRows = floorSearch.trim()
                      ? floorRows.filter((row) => row.name.toLowerCase().includes(floorSearch.trim().toLowerCase()))
                      : floorRows;
                    const selectedFloorId = selectedFloorByBuilding[building.id] ?? floorRows[0]?.id;
                    const selectedFloor = floorRows.find((row) => row.id === selectedFloorId) ?? floorRows[0];
                    return (
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <InternalSidebarList
                      title="Floors"
                      items={filteredFloorRows.map((row) => ({ id: row.id, label: row.name, count: row.remotes }))}
                      selectedId={selectedFloorId}
                      onSelect={(id) =>
                        setSelectedFloorByBuilding((prev) => ({
                          ...prev,
                          [building.id]: id,
                        }))
                      }
                      showAddAction
                      onAddAction={() => toast('Add floor action')}
                      addAriaLabel="Add floor"
                      showSearch
                      searchValue={floorSearch}
                      onSearchChange={(value) =>
                        setFloorSearchByBuilding((prev) => ({
                          ...prev,
                          [building.id]: value,
                        }))
                      }
                      searchPlaceholder="Search floors..."
                      emptyMessage="No floors match"
                    />
                    <div className="flex-1 rounded-lg border bg-muted/20 p-6">
                      <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
                        <h3 className="text-base font-semibold text-foreground">
                          {selectedFloor ? selectedFloor.name : 'Floor'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit floor">
                            <Icon name="edit" size={16} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete floor">
                            <Icon name="delete" size={16} />
                          </Button>
                        </div>
                      </div>
                      {selectedFloor?.id === `${building.id}-floor-12` ? (
                        <div>
                          <img
                            src={floorPlanImgSrc}
                            alt={`${building.name} ${selectedFloor.name} floor plan`}
                            className="w-full h-auto dark:hidden"
                            onError={() => {
                              if (floorPlanImgSrc !== '/office-floor-plan.svg') {
                                setFloorPlanImgSrc('/office-floor-plan.svg');
                              }
                            }}
                          />
                          <img
                            src={floorPlanImgSrc}
                            alt={`${building.name} ${selectedFloor.name} floor plan dark`}
                            className="hidden w-full h-auto dark:block [filter:invert(1)_hue-rotate(180deg)_brightness(.9)_contrast(1.05)]"
                            onError={() => {
                              if (floorPlanImgSrc !== '/office-floor-plan.svg') {
                                setFloorPlanImgSrc('/office-floor-plan.svg');
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {building.name} {selectedFloor ? `${selectedFloor.name}` : ''} floor view placeholder.
                        </div>
                      )}
                    </div>
                  </div>
                    );
                  })()}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {activeSection === 'performance' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">PM collection</span>
                      <span className="text-2xl font-semibold">Enabled</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">KPI sync status</span>
                      <div className="flex items-center gap-2">
                        <Icon name="error" size={20} className="text-destructive" />
                        <span className="text-2xl font-semibold">Error</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Intervals</span>
                      <span className="text-2xl font-semibold">8 min</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Last received file</span>
                      <span className="text-2xl font-semibold">Jan 27, 2:45 PM</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={performanceTab} onValueChange={setPerformanceTab}>
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="site" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Site
                      </TabsTrigger>
                      <TabsTrigger value="cell" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Cell
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Resources
                      </TabsTrigger>
                      <TabsTrigger value="threshold-history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Threshold crossing
                      </TabsTrigger>
                      <TabsTrigger value="threshold-profiles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Threshold crossing profiles
                        {tcProfiles.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-medium min-w-[18px] h-[18px] px-1">
                            {tcProfiles.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="site" className="mt-6">
                      <div className="space-y-10">
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">Accessibility</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Chart 1: ERAB establishment */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>ERAB establishment</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('erab-establishment')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  erabEstablishmentSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' },
                                  erabEstablishmentAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[97, 100]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="sr" type="monotone" dataKey="erabEstablishmentSr" stroke="var(--color-erabEstablishmentSr)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="attempts" type="monotone" dataKey="erabEstablishmentAttempts" stroke="var(--color-erabEstablishmentAttempts)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          {/* Chart 2: VoLTE establishment */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>VoLTE establishment</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('volte-establishment')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  volteEstablishmentSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' },
                                  volteEstablishmentAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[98.5, 99.6]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="sr" type="monotone" dataKey="volteEstablishmentSr" stroke="var(--color-volteEstablishmentSr)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="attempts" type="monotone" dataKey="volteEstablishmentAttempts" stroke="var(--color-volteEstablishmentAttempts)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          {/* Chart 3: RRC SR */}
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>RRC success rate</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('rrc-success-rate')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  rrcSr: { label: 'RRC SR (%)', color: 'var(--chart-1, #38BDF8)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}%`} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line type="monotone" dataKey="rrcSr" stroke="var(--color-rrcSr)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">Retainability</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>ERAB drop rate</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('erab-drop-rate')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  erabDropRate: { label: 'Drop rate (%)', color: 'var(--chart-1, #38BDF8)' },
                                  erabDropCount: { label: 'Drop count', color: 'var(--chart-2, #2DD4BF)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 1.2]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="rate" type="monotone" dataKey="erabDropRate" stroke="var(--color-erabDropRate)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="count" type="monotone" dataKey="erabDropCount" stroke="var(--color-erabDropCount)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>VoLTE drop rate</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('volte-drop-rate')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  volteDropRate: { label: 'Drop rate (%)', color: 'var(--chart-1, #38BDF8)' },
                                  volteDropCount: { label: 'Drop count', color: 'var(--chart-2, #2DD4BF)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 0.7]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="rate" type="monotone" dataKey="volteDropRate" stroke="var(--color-volteDropRate)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="count" type="monotone" dataKey="volteDropCount" stroke="var(--color-volteDropCount)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">Handover</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>S1 HO success rate</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('s1-ho')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  s1HoSuccessRate: { label: 'Success rate (%)', color: 'var(--chart-1, #38BDF8)' },
                                  s1HoAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[96.5, 99]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="sr" type="monotone" dataKey="s1HoSuccessRate" stroke="var(--color-s1HoSuccessRate)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="attempts" type="monotone" dataKey="s1HoAttempts" stroke="var(--color-s1HoAttempts)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>HandIn Intra</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('handin-intra')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  handInIntra: { label: 'HandIn Intra', color: 'var(--chart-2, #2DD4BF)' },
                                  handInIntraAttempts: { label: 'Intra attempts', color: 'var(--chart-4, #A78BFA)' },
                                  handInIntraSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' },
                                } satisfies ChartConfig}
                                className="h-[200px] min-h-[200px] w-full !aspect-auto"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 99]} tickFormatter={(v) => `${v}%`} />
                                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line yAxisId="count" type="monotone" dataKey="handInIntra" stroke="var(--color-handInIntra)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="count" type="monotone" dataKey="handInIntraAttempts" stroke="var(--color-handInIntraAttempts)" strokeWidth={2} dot={false} />
                                  <Line yAxisId="sr" type="monotone" dataKey="handInIntraSr" stroke="var(--color-handInIntraSr)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">Data volume</h3>
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>SCE_LTE_GTP data volume</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('gtp-data-volume')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[200px]">
                                <ChartContainer
                                  config={{
                                    day: { label: 'Day' },
                                    gtpDlNumBytes: { label: 'SCE_LTE_GTP.DL.NumBytes', color: 'var(--chart-1, #38BDF8)' },
                                    gtpUlNumBytes: { label: 'SCE_LTE_GTP.UL.NumBytes', color: 'var(--chart-2, #2DD4BF)' },
                                  } satisfies ChartConfig}
                                  className="h-full w-full !aspect-auto"
                                >
                                  <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${(Number(v) / 1_000_000_000).toFixed(0)} GB`} />
                                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line type="monotone" dataKey="gtpDlNumBytes" stroke="var(--color-gtpDlNumBytes)" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="gtpUlNumBytes" stroke="var(--color-gtpUlNumBytes)" strokeWidth={2} dot={false} />
                                  </LineChart>
                                </ChartContainer>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">HW resources</h3>
                        <div className="grid grid-cols-1 gap-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                              <CardTitle>Memory usage</CardTitle>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedSiteChart('hw-memory-usage')}>
                                <Icon name="open_in_full" size={16} />
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[200px]">
                                <ChartContainer
                                  config={{
                                    day: { label: 'Day' },
                                    memory: { label: 'Memory usage (%)', color: 'var(--chart-2, #2DD4BF)' },
                                  } satisfies ChartConfig}
                                  className="h-full w-full !aspect-auto"
                                >
                                  <LineChart accessibilityLayer data={RESOURCES_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line type="monotone" dataKey="memory" stroke="var(--color-memory)" strokeWidth={2} dot={false} />
                                  </LineChart>
                                </ChartContainer>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </section>
                      </div>
                    </TabsContent>

                    <TabsContent value="cell" className="mt-6 space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
                        <div className="relative w-full md:max-w-[280px]">
                          <Icon
                            name="search"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            placeholder="Search cells..."
                            value={cellSearch}
                            onChange={(e) => setCellSearch(e.target.value)}
                            className="pl-9 w-full"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Select value={cellTimeRange} onValueChange={(v) => setCellTimeRange(v as (typeof CELL_TIME_RANGES)[number])}>
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Time period" />
                            </SelectTrigger>
                            <SelectContent>
                              {CELL_TIME_RANGES.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="inline-flex items-center rounded-md border border-input shadow-sm shrink-0">
                            {CELL_STATUS_OPTIONS.map((opt, i, arr) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setCellStatusFilter(opt)}
                                className={`h-9 px-3 text-sm font-medium capitalize transition-colors ${
                                  cellStatusFilter === opt
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-foreground hover:bg-muted'
                                } ${i === 0 ? 'rounded-l-md' : ''} ${i === arr.length - 1 ? 'rounded-r-md' : ''} ${i > 0 ? 'border-l border-input' : ''}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-card overflow-x-auto">
                        <Table className="table-fixed min-w-[1480px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead className="sticky left-0 z-20 px-3 py-3 h-11 w-[140px] bg-card">Cell name</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">Call setup success rate (ERAB)</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">ERABs</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">RRC establishment success rate</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">SCE_LTE_RRC_Cell.ConnEstabAtt.Sum</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">LTE_MAX_RRC_CONNECTED_USERS_Cell</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">ERAB drop rate</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">ERAB drops</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">SCE_LTECell_GTP.DL.NumBytes</TableHead>
                              <TableHead className="px-3 py-3 h-11 w-[140px] whitespace-normal break-all leading-snug">SCE_LTECell_GTP.UL.NumBytes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {CELL_PERFORMANCE_ROWS.filter((row) => {
                              const matchesSearch = cellSearch.trim()
                                ? row.name.toLowerCase().includes(cellSearch.trim().toLowerCase())
                                : true;
                              const matchesStatus = cellStatusFilter === 'all' ? true : row.status === cellStatusFilter;
                              return matchesSearch && matchesStatus;
                            }).map((row) => (
                              <TableRow
                                key={row.name}
                                className="group cursor-pointer"
                                onClick={() => {
                                  setSelectedCellName(row.name);
                                  setCellDetailSheetOpen(true);
                                }}
                              >
                                <TableCell className="sticky left-0 z-10 px-3 py-3 w-[140px] font-medium bg-card group-hover:bg-muted/50">{row.name}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.callSetupSuccessRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.erabs}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.rrcSuccessRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.connEstabAttSum}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.maxRrcUsers}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.erabDropRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{row.erabDrops}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{formatBytes(row.dlBytes)}</TableCell>
                                <TableCell className="px-3 py-3 w-[140px] tabular-nums">{formatBytes(row.ulBytes)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="resources" className="mt-6 space-y-4">
                      <div className="flex items-center justify-start">
                        <Select value={resourcesTimeRange} onValueChange={(v) => setResourcesTimeRange(v as (typeof RESOURCES_TIME_RANGES)[number])}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Time period" />
                          </SelectTrigger>
                          <SelectContent>
                            {RESOURCES_TIME_RANGES.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>CPU utilization</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer
                              config={{
                                day: { label: 'Day' },
                                cpu: { label: 'CPU (%)', color: 'var(--chart-1, #38BDF8)' },
                              } satisfies ChartConfig}
                              className="min-h-[220px] w-full"
                            >
                              <LineChart accessibilityLayer data={RESOURCES_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}%`} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line type="monotone" dataKey="cpu" stroke="var(--color-cpu)" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Memory usage</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer
                              config={{
                                day: { label: 'Day' },
                                memory: { label: 'Memory (%)', color: 'var(--chart-2, #2DD4BF)' },
                              } satisfies ChartConfig}
                              className="min-h-[220px] w-full"
                            >
                              <LineChart accessibilityLayer data={RESOURCES_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}%`} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line type="monotone" dataKey="memory" stroke="var(--color-memory)" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="threshold-profiles" className="mt-6">
                      <div className="flex justify-end mb-4">
                        <Button variant="outline" onClick={() => { setAddTcProfileSelection(''); setAddTcProfileOpen(true); }}>
                          <Icon name="add" size={16} className="mr-1.5" />
                          Add profile
                        </Button>
                      </div>

                      {/* Add profile dialog */}
                      <Dialog open={addTcProfileOpen} onOpenChange={setAddTcProfileOpen}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="space-y-2">
                              <Label htmlFor="tc-profile-select" className="text-sm font-medium">Profile</Label>
                              <Select value={addTcProfileSelection} onValueChange={setAddTcProfileSelection}>
                                <SelectTrigger id="tc-profile-select" className="w-full">
                                  <SelectValue placeholder="Select a profile..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(PERF_PROFILES_INIT)
                                    .filter((p) => !tcProfiles.some((tp) => tp.name === p.name))
                                    .map((p) => (
                                      <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {addTcProfileSelection && PERF_PROFILES_INIT[addTcProfileSelection] && (() => {
                              const p = PERF_PROFILES_INIT[addTcProfileSelection];
                              return (
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                  <p className="text-sm text-muted-foreground">{p.description}</p>
                                  {p.rules.length > 0 && (
                                    <>
                                      <Separator />
                                      <div className="space-y-1.5">
                                        <h4 className="text-sm font-semibold text-foreground">Alert rules</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {p.rules.map((r, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{r.kpi} {r.condition}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  {p.actions.length > 0 && (
                                    <>
                                      <Separator />
                                      <div className="space-y-1.5">
                                        <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                                        <div className="flex flex-wrap gap-1">
                                          {p.actions.map((a) => (
                                            <Badge key={a.action} variant="secondary" className="text-xs">{a.action}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                  <Separator />
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">Schedules</h4>
                                    {Object.entries(p.schedules).map(([key, s]) => {
                                      const DAY_MAP: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
                                      const allDaysArr = ['mon','tue','wed','thu','fri','sat','sun'];
                                      const wk = ['mon','tue','wed','thu','fri'];
                                      const we = ['sat','sun'];
                                      const sorted = allDaysArr.filter((d) => s.days.includes(d));
                                      let daysLabel: string;
                                      if (sorted.length === 7) daysLabel = 'Every day';
                                      else if (sorted.length === 5 && wk.every((d) => sorted.includes(d))) daysLabel = 'Weekdays';
                                      else if (sorted.length === 2 && we.every((d) => sorted.includes(d))) daysLabel = 'Weekends';
                                      else daysLabel = sorted.map((d) => DAY_MAP[d]).join(', ');
                                      const fmtTime = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
                                      const timeLabel = s.allDay ? 'All day' : `${fmtTime(s.startTime)} – ${fmtTime(s.endTime)}`;
                                      return (
                                        <div key={key} className="flex items-center gap-4 text-sm">
                                          <div className="flex items-center gap-1.5">
                                            <Icon name="calendar_today" size={14} className="text-muted-foreground" />
                                            <span>{daysLabel}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <Icon name="schedule" size={14} className="text-muted-foreground" />
                                            <span>{timeLabel}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setAddTcProfileOpen(false)}>Cancel</Button>
                            <Button
                              disabled={!addTcProfileSelection}
                              onClick={() => {
                                const selected = PERF_PROFILES_INIT[addTcProfileSelection];
                                if (selected) {
                                  const clone = structuredClone(selected);
                                  setTcProfiles((prev) => {
                                    const next = [...prev, clone];
                                    if (next.length > 1) setTcSelectedProfileName(null);
                                    else setTcSelectedProfileName(clone.name);
                                    return next;
                                  });
                                  setTcProfileScheduleTab('1');
                                  setAddTcProfileOpen(false);
                                  toast.success(`"${selected.name}" has been assigned`);
                                }
                              }}
                            >
                              Assign
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {tcProfiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="rounded-full bg-muted p-4 mb-4">
                            <Icon name="monitoring" size={32} className="text-muted-foreground" />
                          </div>
                          <h4 className="text-sm font-semibold text-foreground mb-1">No profile assigned</h4>
                          <p className="text-sm text-muted-foreground max-w-sm mb-6">This device does not have a threshold crossing profile. Assign a profile to enable threshold-based alerting.</p>
                          <Button variant="outline" onClick={() => { setAddTcProfileSelection(''); setAddTcProfileOpen(true); }}>
                            <Icon name="add" size={16} className="mr-1.5" />
                            Add profile
                          </Button>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Profile</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Thresholds</TableHead>
                                    <TableHead className="w-[80px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tcProfiles.map((p) => (
                                    <TableRow key={p.name} className="cursor-pointer" onClick={() => { setTcSelectedProfileName(p.name); setTcProfileScheduleTab('1'); setTcProfileSheetOpen(true); }}>
                                      <TableCell className="font-medium">{p.name}</TableCell>
                                      <TableCell>
                                        <Badge variant={p.enabled ? 'default' : 'secondary'}>
                                          {p.enabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                          {p.actions.map((a, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">{a.action}</Badge>
                                          ))}
                                        </div>
                                      </TableCell>
                                      <TableCell>{Object.keys(p.schedules).length}</TableCell>
                                      <TableCell>{p.rules.length}</TableCell>
                                      <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setRemoveTcProfileTarget(p.name); }}>
                                          <Icon name="delete" size={16} />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <AlertDialog open={!!removeTcProfileTarget} onOpenChange={(open) => { if (!open) setRemoveTcProfileTarget(null); }}>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove profile</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove <span className="font-medium text-foreground">{removeTcProfileTarget}</span> from this device?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                      setTcProfiles((prev) => prev.filter((pr) => pr.name !== removeTcProfileTarget));
                                      setRemoveTcProfileTarget(null);
                                    }}
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardContent>
                        </Card>
                      )}

                      {/* Profile detail sheet (for multi-profile table) */}
                      <Sheet open={tcProfileSheetOpen} onOpenChange={setTcProfileSheetOpen}>
                        <SheetContent className="sm:max-w-lg flex flex-col overflow-y-auto">
                          {tcProfile && (() => {
                            const profile = tcProfile;
                            const scheduleKeys = Object.keys(profile.schedules).sort((a, b) => Number(a) - Number(b));
                            const currentSchedule = profile.schedules[tcProfileScheduleTab] ?? profile.schedules[scheduleKeys[0]];
                            const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
                            const weekdays = ['mon','tue','wed','thu','fri'];
                            const weekend = ['sat','sun'];
                            const allDays = ['mon','tue','wed','thu','fri','sat','sun'];
                            const formatDays = (days: string[]) => {
                              const sorted = allDays.filter((d) => days.includes(d));
                              if (sorted.length === 7) return 'Every day';
                              if (sorted.length === 5 && weekdays.every((d) => sorted.includes(d))) return 'Weekdays';
                              if (sorted.length === 2 && weekend.every((d) => sorted.includes(d))) return 'Weekends';
                              return sorted.map((d) => DAY_LABELS[d]).join(', ');
                            };
                            const formatTime = (t: string) => {
                              const [h, m] = t.split(':').map(Number);
                              return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                            };

                            return (
                              <>
                                <SheetHeader>
                                  <SheetTitle className="flex items-center gap-3">
                                    {profile.name}
                                    <Badge variant={profile.enabled ? 'default' : 'secondary'}>
                                      {profile.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                  </SheetTitle>
                                </SheetHeader>

                                <div className="space-y-6 py-6">
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                    <p className="text-sm text-foreground">{profile.description}</p>
                                  </div>

                                  <Separator />

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                                    <div className="rounded-lg border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="px-4">Action</TableHead>
                                            <TableHead className="px-4">Details</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {profile.actions.map((act, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="px-4">{act.action}</TableCell>
                                              <TableCell className="px-4 text-muted-foreground truncate max-w-[200px]">
                                                {act.detailType === 'badge' ? <Badge variant="secondary">{act.details}</Badge> : act.details}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Schedule</h4>
                                    {scheduleKeys.length > 1 && (
                                      <Tabs value={tcProfileScheduleTab} onValueChange={setTcProfileScheduleTab}>
                                        <TabsList>
                                          {scheduleKeys.map((k) => (
                                            <TabsTrigger key={k} value={k}>{k}</TabsTrigger>
                                          ))}
                                        </TabsList>
                                      </Tabs>
                                    )}
                                    {currentSchedule && (
                                      <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <Icon name="calendar_today" size={16} className="text-muted-foreground" />
                                          <span className="font-medium">{formatDays(currentSchedule.days)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Icon name="schedule" size={16} className="text-muted-foreground" />
                                          <span className="font-medium">{currentSchedule.allDay ? 'All day' : `${formatTime(currentSchedule.startTime)} – ${formatTime(currentSchedule.endTime)}`}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Alert when...</h4>
                                    <div className="rounded-lg border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="px-4">KPI</TableHead>
                                            <TableHead className="px-4">Type</TableHead>
                                            <TableHead className="px-4">Condition</TableHead>
                                            <TableHead className="px-4">Samples</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {profile.rules.map((rule, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="px-4">{rule.kpi}</TableCell>
                                              <TableCell className="px-4 text-muted-foreground">{rule.type}</TableCell>
                                              <TableCell className="px-4 text-muted-foreground">{rule.condition}</TableCell>
                                              <TableCell className="px-4 text-muted-foreground">{rule.samples}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>

                                <SheetFooter className="shrink-0 flex flex-row gap-2 sm:justify-end border-t pt-6 mt-auto">
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      setTcProfiles((prev) => prev.filter((p) => p.name !== profile.name));
                                      setTcProfileSheetOpen(false);
                                      setTcSelectedProfileName(null);
                                    }}
                                  >
                                    <Icon name="delete" size={16} className="mr-1.5" />
                                    Remove profile
                                  </Button>
                                </SheetFooter>
                              </>
                            );
                          })()}
                        </SheetContent>
                      </Sheet>
                    </TabsContent>

                    <TabsContent value="threshold-history" className="mt-6 flex flex-col min-h-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                        <div className="relative w-full sm:max-w-[240px] shrink-0">
                          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Search devices, KPIs..."
                            value={tcHistSearch}
                            onChange={(e) => setTcHistSearch(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">
                          <FilterSelect value={tcHistKpiFilter} onValueChange={setTcHistKpiFilter} label="KPI" options={THRESHOLD_KPI_OPTIONS} className="w-[200px] shrink-0" />
                          <div className="inline-flex items-center rounded-md border border-input bg-transparent shadow-sm">
                            {(['All', 'Active', 'Cleared'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTcHistStateFilter(s)}
                                className={`px-3 h-9 text-sm font-medium transition-colors first:rounded-l-md last:rounded-r-md ${tcHistStateFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto shrink-0">
                          <Button variant="outline">
                            <Icon name="download" size={16} className="mr-1.5" />
                            Export
                          </Button>
                        </div>
                      </div>
                      {(() => {
                        const count = getFilteredThresholdCount({ search: tcHistSearch, kpiFilter: tcHistKpiFilter, stateFilter: tcHistStateFilter, deviceId: device.device });
                        const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
                        if (tcHistKpiFilter !== 'All') activeFilters.push({ key: 'kpi', label: `KPI: ${tcHistKpiFilter}`, onClear: () => setTcHistKpiFilter('All') });
                        if (tcHistStateFilter !== 'All') activeFilters.push({ key: 'state', label: `State: ${tcHistStateFilter}`, onClear: () => setTcHistStateFilter('All') });
                        if (tcHistSearch) activeFilters.push({ key: 'search', label: `"${tcHistSearch}"`, onClear: () => setTcHistSearch('') });
                        const hasActive = activeFilters.length > 0;
                        return (
                          <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                            <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'result' : 'results'}</span>
                            {activeFilters.map((f) => (
                              <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                                {f.label}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                                  onClick={f.onClear}
                                  aria-label={`Clear ${f.label}`}
                                >
                                  <Icon name="close" size={12} aria-hidden />
                                </Button>
                              </Badge>
                            ))}
                            {hasActive && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => { setTcHistSearch(''); setTcHistKpiFilter('All'); setTcHistStateFilter('All'); }}>Clear all</Button>
                            )}
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <ThresholdCrossingAlertsDataTable deviceId={device.device} hideDeviceColumn search={tcHistSearch} kpiFilter={tcHistKpiFilter} stateFilter={tcHistStateFilter} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'files' && (
            <Card>
              <CardContent className="pt-6">
                <Tabs value={filesTab} onValueChange={setFilesTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                    <TabsTrigger value="debug-logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      Debug logs
                    </TabsTrigger>
                    <TabsTrigger value="pm-files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      PM files
                    </TabsTrigger>
                    <TabsTrigger value="error-bundles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      Error bundles
                    </TabsTrigger>
                    <TabsTrigger value="cper" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      CPER
                    </TabsTrigger>
                    <TabsTrigger value="db-backups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                      DB backups
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="debug-logs" className="mt-6">
                    <DebugLogsDataTable />
                  </TabsContent>

                  <TabsContent value="pm-files" className="mt-6">
                    <p className="text-muted-foreground">PM files will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="error-bundles" className="mt-6">
                    <p className="text-muted-foreground">Error bundles will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="cper" className="mt-6">
                    <p className="text-muted-foreground">CPER files will be displayed here.</p>
                  </TabsContent>

                  <TabsContent value="db-backups" className="mt-6">
                    <p className="text-muted-foreground">DB backups will be displayed here.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {activeSection === 'ssh-terminal' && (
            <SshTerminal device={device} />
          )}

          {activeSection === 'inventory' && (() => {
            const DAS_INVENTORY = getDasTopologyInventoryRows();
            const dasTableStatusOptions = ['All', ...Array.from(new Set(DAS_INVENTORY.map((item) => item.status)))];
            const dasTableTypeOptions = ['All', ...Array.from(new Set(DAS_INVENTORY.map((item) => item.type)))];

            const filteredDasInventory = DAS_INVENTORY.filter((item) => {
              if (dasTableStatusFilter !== 'All' && item.status !== dasTableStatusFilter) return false;
              if (dasTableTypeFilter !== 'All' && item.type !== dasTableTypeFilter) return false;
              if (dasTableSearch.trim()) {
                const q = dasTableSearch.trim().toLowerCase();
                return (
                  item.name.toLowerCase().includes(q) ||
                  item.type.toLowerCase().includes(q) ||
                  item.status.toLowerCase().includes(q) ||
                  item.serial.toLowerCase().includes(q)
                );
              }
              return true;
            });

            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {dasInventoryView === 'map' ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-full sm:max-w-[240px] shrink-0">
                      <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by label, band, location..."
                        value={dasTopologySearch}
                        onChange={(e) => setDasTopologySearch(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <FilterSelect
                      value={dasTopologyStatusFilter}
                      onValueChange={setDasTopologyStatusFilter}
                      label="Status"
                      options={['All', 'Online', 'Degraded', 'Offline']}
                      className="w-[140px] shrink-0"
                    />
                    <FilterSelect
                      value={dasTopologyTypeFilter}
                      onValueChange={setDasTopologyTypeFilter}
                      label="Type"
                      options={['All', 'RIU', 'DCU', 'DEU', 'dLRU', 'dMRU', 'dHRU', 'AUC', 'EU', 'EUG', 'N2RU', 'M2RU', 'H2RU', 'N3RU', 'M3RU']}
                      className="w-[170px] shrink-0"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-full sm:max-w-[240px] shrink-0">
                      <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search name, type, status..."
                        value={dasTableSearch}
                        onChange={(e) => setDasTableSearch(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 pl-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <FilterSelect
                      value={dasTableStatusFilter}
                      onValueChange={setDasTableStatusFilter}
                      label="Status"
                      options={dasTableStatusOptions}
                      className="w-[150px] shrink-0"
                    />
                    <FilterSelect
                      value={dasTableTypeFilter}
                      onValueChange={setDasTableTypeFilter}
                      label="Type"
                      options={dasTableTypeOptions}
                      className="w-[180px] shrink-0"
                    />
                  </div>
                )}
                <ToggleGroup type="single" value={dasInventoryView} onValueChange={(v) => v && setDasInventoryView(v as 'list' | 'map')} size="sm" variant="outline">
                  <ToggleGroupItem value="list" aria-label="Table view" title="Table view">
                    <Icon name="view_list" size={16} />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="map" aria-label="Graph view" title="Graph view">
                    <Icon name="account_tree" size={16} />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {dasInventoryView === 'list' && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-hidden rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Name</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Type</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Status</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Serial number</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDasInventory.map((item) => (
                            <TableRow key={item.serial}>
                              <TableCell className="px-4 py-3 font-medium">
                                <DeviceLink
                                  value={item.name}
                                  maxLength={28}
                                  onClick={() => {
                                    handleDasTopologyNodeSelect({
                                      id: item.id,
                                      label: item.name,
                                      status: item.status.toLowerCase(),
                                      type: item.type,
                                      model: item.serial,
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-muted-foreground">{item.type}</TableCell>
                              <TableCell className="px-4 py-3">
                                <DeviceStatus status={item.status} iconSize={14} />
                              </TableCell>
                              <TableCell className="px-4 py-3 font-mono text-sm text-muted-foreground">{item.serial}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {dasInventoryView === 'map' && (
                <DasTopology
                  searchQuery={dasTopologySearch}
                  statusFilter={dasTopologyStatusFilter}
                  typeFilter={dasTopologyTypeFilter}
                  onNodeSelect={handleDasTopologyNodeSelect}
                />
              )}
            </div>
            );
          })()}

          {activeSection === 'snmp-details' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleOpenSnmpEdit}>
                    <Icon name="edit" size={16} />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">IP address</span>
                      <span className="font-medium">{snmpValues.ipAddress || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">SNMP port</span>
                      <span className="font-medium">{snmpValues.snmpPort || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Timeout</span>
                      <span className="font-medium">{snmpValues.timeout || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">SNMP version</span>
                      <span className="font-medium">{snmpValues.snmpVersion || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Read community</span>
                      <span className="font-medium font-mono text-sm">{snmpValues.readCommunity || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Write community</span>
                      <span className="font-medium font-mono text-sm">{snmpValues.writeCommunity || '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alarms, Events, Conditions, Notes */}
              <Card>
                <CardContent className="pt-6">
                  <Tabs value={alarmsEventsTab} onValueChange={setAlarmsEventsTab}>
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="alarms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Alarms
                      </TabsTrigger>
                      <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Events
                      </TabsTrigger>
                      <TabsTrigger value="conditions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Conditions
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Notes
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {notes.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="alarms" className="mt-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                          <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Search alarms..." className="pl-9 w-full" />
                        </div>
                        <Select>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Alarms" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALARMS_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="min-h-[200px]">
                        <AlarmsDataTable />
                      </div>
                    </TabsContent>

                    <TabsContent value="events" className="mt-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                          <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Search events..." className="pl-9 w-full" />
                        </div>
                        <Select>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENTS_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Severity" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENTS_SEVERITY_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Source" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENTS_SOURCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="min-h-[200px]">
                        <EventsDataTable />
                      </div>
                    </TabsContent>

                    <TabsContent value="conditions" className="mt-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                          <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Search conditions..." className="pl-9 w-full" />
                        </div>
                      </div>
                      <div className="min-h-[200px]">
                        <ThresholdCrossingAlertsDataTable deviceId={device.device} hideDeviceColumn />
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-6">
                      <div className="flex flex-col min-h-[320px]">
                        <div ref={notesScrollRef} className="flex-1 min-h-0 overflow-x-auto overflow-y-auto space-y-4 pb-3 pr-1">
                          {notes.map((note) => {
                            const isMine = note.author === 'You';
                            return (
                              <div key={note.id} className={`group flex flex-col gap-1 w-full ${isMine ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-1.5 w-2/3 min-w-0 ${isMine ? 'ml-auto justify-end' : ''}`}>
                                  {isMine && (
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        aria-label="Edit note"
                                        onClick={() => {
                                          setNoteInput(note.content);
                                          setNotes((prev) => prev.filter((n) => n.id !== note.id));
                                        }}
                                      >
                                        <Icon name="edit" size={18} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Delete note"
                                        onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                                      >
                                        <Icon name="delete" size={18} />
                                      </Button>
                                    </div>
                                  )}
                                  <div
                                    className={
                                      isMine
                                        ? 'rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-base w-max max-w-full break-words shrink-0 min-w-0'
                                        : 'rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2 text-base text-foreground w-max max-w-full break-words shrink-0 min-w-0'
                                    }
                                  >
                                    {note.content}
                                  </div>
                                </div>
                                <div className={`w-2/3 min-w-0 ${isMine ? 'ml-auto text-right pr-3' : 'text-left pl-3'}`}>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">
                                    {note.author} · {note.datetime}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-end gap-2 pt-3 border-t shrink-0">
                          <div className="flex-1 flex items-end gap-2 rounded-2xl border bg-muted/30 px-3 py-2 min-h-[44px]">
                            <Textarea
                              placeholder="Add a note..."
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              onKeyDown={handleNoteKeyDown}
                              className="min-h-[36px] max-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-0 py-1.5 text-base"
                              rows={1}
                            />
                            <Button
                              type="button"
                              size="icon"
                              className="h-9 w-9 shrink-0 rounded-full bg-primary hover:bg-primary/90"
                              aria-label="Send note"
                              onClick={handleSendNote}
                            >
                              <Icon name="arrow_upward" size={18} className="text-primary-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Sheet
                open={snmpEditDrawerOpen}
                onOpenChange={(open) => {
                  if (!open) setSnmpEditDraft(snmpValues);
                  setSnmpEditDrawerOpen(open);
                }}
              >
                <SheetContent side="right" className="sm:max-w-md flex flex-col h-full">
                  <SheetHeader className="shrink-0">
                    <SheetTitle>Edit SNMP configuration</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-auto min-h-0 space-y-6 py-6">
                    <div className="space-y-2">
                      <label htmlFor="snmp-ip" className="text-sm font-medium text-foreground">
                        IP address
                      </label>
                      <Input
                        id="snmp-ip"
                        value={snmpEditDraft.ipAddress}
                        onChange={(e) => setSnmpEditDraft((s) => ({ ...s, ipAddress: e.target.value }))}
                        placeholder="10.0.0.1"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="snmp-port" className="text-sm font-medium text-foreground">
                        SNMP port
                      </label>
                      <Input
                        id="snmp-port"
                        value={snmpEditDraft.snmpPort}
                        onChange={(e) => setSnmpEditDraft((s) => ({ ...s, snmpPort: e.target.value }))}
                        placeholder="161"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="snmp-timeout" className="text-sm font-medium text-foreground">
                        Timeout
                      </label>
                      <Input
                        id="snmp-timeout"
                        value={snmpEditDraft.timeout}
                        onChange={(e) => setSnmpEditDraft((s) => ({ ...s, timeout: e.target.value }))}
                        placeholder="5"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="snmp-version" className="text-sm font-medium text-foreground">
                        SNMP version
                      </label>
                      <Select
                        value={snmpEditDraft.snmpVersion}
                        onValueChange={(v) => setSnmpEditDraft((s) => ({ ...s, snmpVersion: v }))}
                      >
                        <SelectTrigger id="snmp-version">
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v1">v1</SelectItem>
                          <SelectItem value="v2c">v2c</SelectItem>
                          <SelectItem value="v3">v3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="snmp-read" className="text-sm font-medium text-foreground">
                        Read community
                      </label>
                      <Input
                        id="snmp-read"
                        value={snmpEditDraft.readCommunity}
                        onChange={(e) => setSnmpEditDraft((s) => ({ ...s, readCommunity: e.target.value }))}
                        placeholder="public"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="snmp-write" className="text-sm font-medium text-foreground">
                        Write community
                      </label>
                      <Input
                        id="snmp-write"
                        value={snmpEditDraft.writeCommunity}
                        onChange={(e) => setSnmpEditDraft((s) => ({ ...s, writeCommunity: e.target.value }))}
                        placeholder="private"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <SheetFooter className="shrink-0 flex flex-row gap-2 sm:justify-end border-t pt-6 mt-auto">
                    <Button variant="outline" onClick={handleCancelSnmpEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSnmpEdit}>Save</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          )}
          </div>
        </div>
      </main>
      <AddRadioNodeSheet
        open={addRadioNodeSheetOpen}
        onOpenChange={setAddRadioNodeSheetOpen}
        onSubmit={(data: AddRadioNodeFormData) => {
          toast.success(data.mode === 'upload' ? 'Radio node(s) added from configuration file' : 'Radio node added');
        }}
      />
      <ConfigMismatchSheet
        open={configMismatchSheetOpen}
        deviceName={device.device}
        mismatchCount={device.configMismatch ?? 0}
        onOpenChange={setConfigMismatchSheetOpen}
        onNavigateToCommissioning={() => {
          setActiveSection('commissioning');
          setCommissioningSubTab('local-templates');
        }}
        onTemplateCreated={() => setCreatedTemplateName(`${device.device}-mismatch-fix`)}
      />
      <Sheet open={!!expandedSiteChart} onOpenChange={(open) => !open && setExpandedSiteChart(null)}>
        <SheetContent side="right" className="w-[94vw] sm:max-w-5xl lg:max-w-6xl flex flex-col h-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>{expandedSiteChartTitle}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto min-h-0 py-6">
            {expandedSiteChart === 'erab-establishment' && (
              <ChartContainer config={{ day: { label: 'Day' }, erabEstablishmentSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' }, erabEstablishmentAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[97, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="sr" type="monotone" dataKey="erabEstablishmentSr" stroke="var(--color-erabEstablishmentSr)" strokeWidth={2} dot={false} />
                  <Line yAxisId="attempts" type="monotone" dataKey="erabEstablishmentAttempts" stroke="var(--color-erabEstablishmentAttempts)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'volte-establishment' && (
              <ChartContainer config={{ day: { label: 'Day' }, volteEstablishmentSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' }, volteEstablishmentAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[98.5, 99.6]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="sr" type="monotone" dataKey="volteEstablishmentSr" stroke="var(--color-volteEstablishmentSr)" strokeWidth={2} dot={false} />
                  <Line yAxisId="attempts" type="monotone" dataKey="volteEstablishmentAttempts" stroke="var(--color-volteEstablishmentAttempts)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'rrc-success-rate' && (
              <ChartContainer config={{ day: { label: 'Day' }, rrcSr: { label: 'RRC SR (%)', color: 'var(--chart-1, #38BDF8)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="rrcSr" stroke="var(--color-rrcSr)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'erab-drop-rate' && (
              <ChartContainer config={{ day: { label: 'Day' }, erabDropRate: { label: 'Drop rate (%)', color: 'var(--chart-1, #38BDF8)' }, erabDropCount: { label: 'Drop count', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 1.2]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="rate" type="monotone" dataKey="erabDropRate" stroke="var(--color-erabDropRate)" strokeWidth={2} dot={false} />
                  <Line yAxisId="count" type="monotone" dataKey="erabDropCount" stroke="var(--color-erabDropCount)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'volte-drop-rate' && (
              <ChartContainer config={{ day: { label: 'Day' }, volteDropRate: { label: 'Drop rate (%)', color: 'var(--chart-1, #38BDF8)' }, volteDropCount: { label: 'Drop count', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 0.7]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="rate" type="monotone" dataKey="volteDropRate" stroke="var(--color-volteDropRate)" strokeWidth={2} dot={false} />
                  <Line yAxisId="count" type="monotone" dataKey="volteDropCount" stroke="var(--color-volteDropCount)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 's1-ho' && (
              <ChartContainer config={{ day: { label: 'Day' }, s1HoSuccessRate: { label: 'Success rate (%)', color: 'var(--chart-1, #38BDF8)' }, s1HoAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[96.5, 99]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="sr" type="monotone" dataKey="s1HoSuccessRate" stroke="var(--color-s1HoSuccessRate)" strokeWidth={2} dot={false} />
                  <Line yAxisId="attempts" type="monotone" dataKey="s1HoAttempts" stroke="var(--color-s1HoAttempts)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'handin-intra' && (
              <ChartContainer config={{ day: { label: 'Day' }, handInIntra: { label: 'HandIn Intra', color: 'var(--chart-2, #2DD4BF)' }, handInIntraAttempts: { label: 'Intra attempts', color: 'var(--chart-4, #A78BFA)' }, handInIntraSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 99]} tickFormatter={(v) => `${v}%`} />
                  <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line yAxisId="count" type="monotone" dataKey="handInIntra" stroke="var(--color-handInIntra)" strokeWidth={2} dot={false} />
                  <Line yAxisId="count" type="monotone" dataKey="handInIntraAttempts" stroke="var(--color-handInIntraAttempts)" strokeWidth={2} dot={false} />
                  <Line yAxisId="sr" type="monotone" dataKey="handInIntraSr" stroke="var(--color-handInIntraSr)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'gtp-data-volume' && (
              <ChartContainer config={{ day: { label: 'Day' }, gtpDlNumBytes: { label: 'SCE_LTE_GTP.DL.NumBytes', color: 'var(--chart-1, #38BDF8)' }, gtpUlNumBytes: { label: 'SCE_LTE_GTP.UL.NumBytes', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${(Number(v) / 1_000_000_000).toFixed(0)} GB`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="gtpDlNumBytes" stroke="var(--color-gtpDlNumBytes)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gtpUlNumBytes" stroke="var(--color-gtpUlNumBytes)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
            {expandedSiteChart === 'hw-memory-usage' && (
              <ChartContainer config={{ day: { label: 'Day' }, memory: { label: 'Memory usage (%)', color: 'var(--chart-2, #2DD4BF)' } } satisfies ChartConfig} className="h-[420px] min-h-[420px] w-full">
                <LineChart accessibilityLayer data={RESOURCES_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="memory" stroke="var(--color-memory)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={cellDetailSheetOpen} onOpenChange={setCellDetailSheetOpen}>
        <SheetContent side="right" className="w-[94vw] sm:max-w-5xl lg:max-w-6xl flex flex-col h-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>{selectedCell?.name ?? 'Cell details'}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-6 py-6">
            {selectedCell ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Cell ID</span>
                        <span className="font-medium">{selectedCell.cellId}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Status</span>
                        <DeviceStatus status={selectedCell.status === 'good' ? 'Connected' : 'Disconnected'} iconSize={14} className="text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Enabled</span>
                        <span className="font-medium">{selectedCell.enabled ? 'Y' : 'N'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Zones</span>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto w-fit p-0 text-sm font-medium tabular-nums"
                          onClick={() => {
                            setActiveSection('zones');
                            setCellDetailSheetOpen(false);
                          }}
                        >
                          {selectedCell.zones}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Radio nodes</span>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto w-fit p-0 text-sm font-medium tabular-nums"
                          onClick={() => {
                            setActiveSection(radioNodesSectionKey);
                            setCellDetailSheetOpen(false);
                          }}
                        >
                          {selectedCell.radioNodes}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">DL bandwidth</span>
                        <span className="font-medium">{selectedCell.dlBandwidth}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Time interval</span>
                  <Select value={cellDetailInterval} onValueChange={(v) => setCellDetailInterval(v as (typeof CELL_DETAIL_INTERVALS)[number])}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {CELL_DETAIL_INTERVALS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">Accessibility</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ERAB Establishment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            erabEstablishmentSr: { label: 'ERAB Establishment SR (%)', color: 'var(--chart-1, #38BDF8)' },
                            erabEstablishmentAttempts: { label: 'ERAB Establishment Attempts', color: 'var(--chart-2, #2DD4BF)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="sr" type="monotone" dataKey="erabEstablishmentSr" stroke="var(--color-erabEstablishmentSr)" strokeWidth={2} dot={false} />
                            <Line yAxisId="attempts" type="monotone" dataKey="erabEstablishmentAttempts" stroke="var(--color-erabEstablishmentAttempts)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>VoLTE Establishment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            volteEstablishmentSr: { label: 'VoLTE Establishment SR (%)', color: 'var(--chart-1, #38BDF8)' },
                            volteEstablishmentAttempts: { label: 'VoLTE Establishment Attempts', color: 'var(--chart-2, #2DD4BF)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="sr" type="monotone" dataKey="volteEstablishmentSr" stroke="var(--color-volteEstablishmentSr)" strokeWidth={2} dot={false} />
                            <Line yAxisId="attempts" type="monotone" dataKey="volteEstablishmentAttempts" stroke="var(--color-volteEstablishmentAttempts)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">Retainability</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>ERABs drop</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            erabsDropRate: { label: 'ERABs Drop Rate (%)', color: 'var(--chart-1, #38BDF8)' },
                            erabsDrops: { label: 'ERABs Drops', color: 'var(--chart-4, #A78BFA)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 2]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="drops" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="rate" type="monotone" dataKey="erabsDropRate" stroke="var(--color-erabsDropRate)" strokeWidth={2} dot={false} />
                            <Line yAxisId="drops" type="monotone" dataKey="erabsDrops" stroke="var(--color-erabsDrops)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>VoLTE drop</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            volteDropRate: { label: 'VoLTE Drop Rate (%)', color: 'var(--chart-1, #38BDF8)' },
                            volteDropCount: { label: 'VoLTE Drop Count', color: 'var(--chart-4, #A78BFA)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="rate" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 2]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="rate" type="monotone" dataKey="volteDropRate" stroke="var(--color-volteDropRate)" strokeWidth={2} dot={false} />
                            <Line yAxisId="count" type="monotone" dataKey="volteDropCount" stroke="var(--color-volteDropCount)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">Data volume</h4>
                  <Card>
                    <CardHeader>
                      <CardTitle>SCE_LTECell_GTP.DL.NumBytes + SCE_LTECell_GTP.UL.NumBytes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ChartContainer
                        config={{
                          time: { label: 'Time' },
                          sceLteCellGtpDlNumBytes: { label: 'SCE_LTECell_GTP.DL.NumBytes', color: 'var(--chart-1, #38BDF8)' },
                          sceLteCellGtpUlNumBytes: { label: 'SCE_LTECell_GTP.UL.NumBytes', color: 'var(--chart-2, #2DD4BF)' },
                        } satisfies ChartConfig}
                        className="h-[220px] min-h-[220px] w-full"
                      >
                        <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(0)} MB`} />
                          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line type="monotone" dataKey="sceLteCellGtpDlNumBytes" stroke="var(--color-sceLteCellGtpDlNumBytes)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="sceLteCellGtpUlNumBytes" stroke="var(--color-sceLteCellGtpUlNumBytes)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </section>
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">Handover</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>S1 HO</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            s1HoSuccessRate: { label: 'S1 HO Success Rate (%)', color: 'var(--chart-1, #38BDF8)' },
                            s1HoAttempts: { label: 'Attempts', color: 'var(--chart-2, #2DD4BF)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="attempts" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="sr" type="monotone" dataKey="s1HoSuccessRate" stroke="var(--color-s1HoSuccessRate)" strokeWidth={2} dot={false} />
                            <Line yAxisId="attempts" type="monotone" dataKey="s1HoAttempts" stroke="var(--color-s1HoAttempts)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>HandIn Intra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            time: { label: 'Time' },
                            handInIntra: { label: 'HandIn Intra', color: 'var(--chart-2, #2DD4BF)' },
                            handInIntraAttempts: { label: 'Intra Attempts', color: 'var(--chart-4, #A78BFA)' },
                            handInIntraSr: { label: 'SR (%)', color: 'var(--chart-1, #38BDF8)' },
                          } satisfies ChartConfig}
                          className="min-h-[220px] w-full"
                        >
                          <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis yAxisId="sr" tickLine={false} axisLine={false} tickMargin={8} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                            <YAxis yAxisId="count" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line yAxisId="count" type="monotone" dataKey="handInIntra" stroke="var(--color-handInIntra)" strokeWidth={2} dot={false} />
                            <Line yAxisId="count" type="monotone" dataKey="handInIntraAttempts" stroke="var(--color-handInIntraAttempts)" strokeWidth={2} dot={false} />
                            <Line yAxisId="sr" type="monotone" dataKey="handInIntraSr" stroke="var(--color-handInIntraSr)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-base font-semibold">Availability</h4>
                  <Card>
                    <CardHeader>
                      <CardTitle>LTE Cell Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ChartContainer
                        config={{
                          time: { label: 'Time' },
                          availabilityPct: { label: 'LTE Cell Availability (%)', color: 'var(--chart-1, #38BDF8)' },
                        } satisfies ChartConfig}
                        className="h-[220px] min-h-[220px] w-full"
                      >
                        <LineChart accessibilityLayer data={cellDetailChartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={10} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[96, 100]} tickFormatter={(v) => `${v}%`} />
                          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Line type="monotone" dataKey="availabilityPct" name="LTE Cell Availability" stroke="var(--color-availabilityPct)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </section>
                <Card>
                  <CardHeader>
                    <CardTitle>Alarms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border bg-card overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Severity</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCellAlarms.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No alarms for this cell.
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedCellAlarms.map((row, index) => (
                              <TableRow key={`${row.cellName}-${row.timestamp}-${index}`}>
                                <TableCell>
                                  <span className="inline-flex items-center gap-1.5">
                                    <Icon name={CELL_ALARM_SEVERITY_ICON[row.severity].name} size={16} className={CELL_ALARM_SEVERITY_ICON[row.severity].className} />
                                    <span>{row.severity}</span>
                                  </span>
                                </TableCell>
                                <TableCell>{row.timestamp}</TableCell>
                                <TableCell>{row.updated}</TableCell>
                                <TableCell>{row.source}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={remoteMapSheetOpen} onOpenChange={setRemoteMapSheetOpen}>
        <SheetContent side="right" className="w-[94vw] sm:max-w-5xl lg:max-w-6xl flex flex-col h-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {selectedRemoteRow ? `${selectedRemoteRow.index} - ${selectedRemoteRow.name}` : 'Details'}
            </SheetTitle>
            {selectedRemoteRow && (
              <div className="flex items-center gap-2 text-sm">
                <DeviceStatus
                  status={selectedRemoteRow.status === 'Up' ? 'Connected' : 'Disconnected'}
                  iconSize={14}
                  className="text-sm"
                />
                <span className="text-muted-foreground">•</span>
                <Icon
                  name={selectedRemoteRow.enabled ? 'check_circle' : 'cancel'}
                  size={16}
                  className={selectedRemoteRow.enabled ? 'text-success' : 'text-muted-foreground'}
                  aria-label={selectedRemoteRow.enabled ? 'Enabled' : 'Disabled'}
                />
              </div>
            )}
          </SheetHeader>
          <div className="flex-1 min-h-0 pt-4 space-y-4 overflow-y-auto">
            {remoteSheetHydrated ? (
              <>
            {selectedRemoteRow && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{selectedRemoteRow.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{selectedRemoteRow.description}</span>
                    </div>
                    {remoteSummaryExpanded && (
                      <>
                        <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Managed object</span>
                      <span className="font-medium font-mono">{`${device.id}/radio-units/${selectedRemoteRow.index}`}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Equipment type</span>
                      <span className="font-medium">{selectedRemoteRow.role}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Band</span>
                      <span className="font-medium">{REMOTE_RF_TABLE_COLUMNS.join(', ')}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Equipment index</span>
                      <span className="font-medium tabular-nums">{selectedRemoteRow.index}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-medium tabular-nums">{(35.2 + selectedRemoteRow.index * 0.6).toFixed(1)} C</span>
                    </div>
                        <div className="sm:col-span-3">
                          <div className="my-2 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                        </div>
                        <div className="sm:col-span-3">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Network information</h4>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">IP address</span>
                          <span className="font-medium font-mono">{device.ipAddress}</span>
                        </div>
                        <div className="sm:col-span-3">
                          <div className="my-2 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                        </div>
                        <div className="sm:col-span-3">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Hardware information</h4>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Model</span>
                          <span className="font-medium">{selectedRemoteRow.model}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Serial number</span>
                          <span className="font-medium font-mono">{selectedRemoteRow.serialNumber}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Software version</span>
                          <span className="font-medium">{device.version}</span>
                        </div>
                        <div className="sm:col-span-3">
                          <div className="my-2 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                        </div>
                        <div className="sm:col-span-3">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Maintenance information</h4>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Last update</span>
                          <span className="font-medium">Feb 27, 2026 10:12</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Uptime (seconds)</span>
                          <span className="font-medium tabular-nums">{(86400 + (selectedRemoteRow.index * 7200)).toLocaleString()}</span>
                        </div>
                        <div className="sm:col-span-3">
                          <div className="my-2 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                        </div>
                        <div className="sm:col-span-3">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Version information</h4>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Software version</span>
                          <span className="font-medium">{device.version}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-7 text-xs w-full justify-center"
                    onClick={() => setRemoteSummaryExpanded((prev) => !prev)}
                  >
                    {remoteSummaryExpanded ? 'Show less' : 'See more'}
                    <Icon name={remoteSummaryExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
            {selectedRemoteRow && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">Topology</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <div className="inline-flex min-w-full items-center gap-2">
                      {selectedRemoteTopologyDisplayChain.map((node, index) => {
                        const isCurrentDevice = index === selectedRemoteTopologyDisplayChain.length - 1;
                        return (
                          <React.Fragment key={`${node.label}-${index}`}>
                            <div
                              ref={isCurrentDevice ? currentTopologyNodeRef : null}
                              className={`${node.compact ? 'min-w-[130px]' : 'min-w-[170px]'} rounded-md border px-3 py-2 ${
                                isCurrentDevice
                                  ? 'border-primary/90 bg-primary/15 ring-2 ring-primary/30 shadow-md'
                                  : node.compact
                                    ? 'bg-muted/40 border-dashed'
                                    : 'bg-card'
                              }`}
                            >
                              <div className="inline-flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${isCurrentDevice ? 'bg-primary' : 'bg-success'}`} />
                                <span className={`${node.compact ? 'max-w-[90px] truncate' : ''} text-sm font-medium`}>{node.label}</span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{node.subtitle}</p>
                            </div>
                            {index < selectedRemoteTopologyDisplayChain.length - 1 && (
                              <div className="inline-flex items-center text-muted-foreground">
                                <Icon name="chevron_right" size={18} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedRemoteRow && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">Band information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-3 py-2 text-xs">Parameter</TableHead>
                          {REMOTE_RF_TABLE_COLUMNS.map((column) => (
                            <TableHead key={column} className="px-2 py-2 text-xs">{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRemoteRfRows.map((row) => (
                          <TableRow key={row.parameter}>
                            <TableCell className="px-3 py-2 text-xs font-medium">
                              <span>{row.parameter}</span>
                            </TableCell>
                            {row.values.map((value, index) => (
                              <TableCell key={`${row.parameter}-${index}`} className="px-2 py-2 text-xs">
                                {row.showDot ? (
                                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                    <span>{value}</span>
                                  </span>
                                ) : (
                                  <span className="tabular-nums">{value}</span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">DL power</p>
                    <ChartContainer
                      config={{
                        time: { label: 'Time' },
                        band700: { label: '700', color: 'var(--chart-1)' },
                        cellEsmr: { label: 'CELL/ESMR', color: 'var(--chart-2)' },
                        pcs: { label: 'PCS', color: 'var(--chart-3)' },
                        aw53: { label: 'AWS3', color: 'var(--chart-4)' },
                      } satisfies ChartConfig}
                      className="h-[200px] min-h-[200px] w-full"
                    >
                      <LineChart accessibilityLayer data={selectedRemoteBandPowerData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={renderBandStatsLegend} />
                        <Line name="700" dataKey="band700" type="monotone" stroke="var(--color-band700)" strokeWidth={2} dot={false} />
                        <Line name="CELL/ESMR" dataKey="cellEsmr" type="monotone" stroke="var(--color-cellEsmr)" strokeWidth={2} dot={false} />
                        <Line name="PCS" dataKey="pcs" type="monotone" stroke="var(--color-pcs)" strokeWidth={2} dot={false} />
                        <Line name="AWS3" dataKey="aw53" type="monotone" stroke="var(--color-aw53)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">UL power</p>
                    <ChartContainer
                      config={{
                        time: { label: 'Time' },
                        ulBand700: { label: '700', color: 'var(--chart-1)' },
                        ulCellEsmr: { label: 'CELL/ESMR', color: 'var(--chart-2)' },
                        ulPcs: { label: 'PCS', color: 'var(--chart-3)' },
                        ulAw53: { label: 'AWS3', color: 'var(--chart-4)' },
                      } satisfies ChartConfig}
                      className="h-[200px] min-h-[200px] w-full"
                    >
                      <LineChart accessibilityLayer data={selectedRemoteBandPowerData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={renderBandStatsLegend} />
                        <Line name="700" dataKey="ulBand700" type="monotone" stroke="var(--color-ulBand700)" strokeWidth={2} dot={false} />
                        <Line name="CELL/ESMR" dataKey="ulCellEsmr" type="monotone" stroke="var(--color-ulCellEsmr)" strokeWidth={2} dot={false} />
                        <Line name="PCS" dataKey="ulPcs" type="monotone" stroke="var(--color-ulPcs)" strokeWidth={2} dot={false} />
                        <Line name="AWS3" dataKey="ulAw53" type="monotone" stroke="var(--color-ulAw53)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedRemoteRow && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">MRU Alarms</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[44px] px-3 py-2 text-xs">Status</TableHead>
                          <TableHead className="px-3 py-2 text-xs">Alarm</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRemoteMruAlarmRows.map((alarm) => (
                          <TableRow key={alarm.name}>
                            <TableCell className="px-3 py-2">{renderRemoteAlarmDot(alarm.status)}</TableCell>
                            <TableCell className="px-3 py-2 text-xs">{alarm.name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedRemoteRow && (
              <Card>
                <CardContent className="pt-4">
                  <Tabs value={remoteModuleTab} onValueChange={(value) => setRemoteModuleTab(value as (typeof REMOTE_MODULE_TABS)[number])}>
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      {REMOTE_MODULE_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="Module Info" className="m-0 pt-3">
                      <div className="rounded-md border p-3 text-xs space-y-1">
                        <div><span className="text-muted-foreground">Label:</span> {selectedRemoteRow.name}</div>
                        <div><span className="text-muted-foreground">Type:</span> {selectedRemoteRow.role}</div>
                        <div><span className="text-muted-foreground">Status:</span> {selectedRemoteRow.status === 'Up' ? 'Online' : 'Offline'}</div>
                        <div><span className="text-muted-foreground">Band:</span> {selectedRemoteRow.supportBands}</div>
                        <div><span className="text-muted-foreground">Model:</span> {selectedRemoteRow.model}</div>
                        <div><span className="text-muted-foreground">Serial:</span> {selectedRemoteRow.serialNumber}</div>
                      </div>
                    </TabsContent>

                    <TabsContent value="PAM Alarms" className="m-0 pt-3">
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-3 py-2 text-xs">Alarm</TableHead>
                              <TableHead className="px-2 py-2 text-xs text-center">700</TableHead>
                              <TableHead className="px-2 py-2 text-xs text-center">CELL/ESMR AWS3</TableHead>
                              <TableHead className="px-2 py-2 text-xs text-center">PCS</TableHead>
                              <TableHead className="px-2 py-2 text-xs text-center">WCS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRemotePamAlarmRows.map((row) => (
                              <TableRow key={row.alarm}>
                                <TableCell className="px-3 py-2 text-xs">{row.alarm}</TableCell>
                                {row.cols.map((status, idx) => (
                                  <TableCell key={`${row.alarm}-${idx}`} className="px-2 py-2 text-center">
                                    <div className="inline-flex items-center justify-center">{renderRemoteAlarmDot(status as 'ok' | 'warning' | 'critical')}</div>
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="Alarms" className="m-0 pt-3">
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[44px] px-3 py-2 text-xs">Status</TableHead>
                              <TableHead className="px-3 py-2 text-xs">Physical alarm</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRemoteMruAlarmRows.map((alarm) => (
                              <TableRow key={`module-${alarm.name}`}>
                                <TableCell className="px-3 py-2">{renderRemoteAlarmDot(alarm.status)}</TableCell>
                                <TableCell className="px-3 py-2 text-xs">{alarm.name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="RF Parameters" className="m-0 pt-3">
                      <div className="rounded-md border p-3 text-xs space-y-1">
                        <div><span className="text-muted-foreground">DL output power:</span> 34 dBm</div>
                        <div><span className="text-muted-foreground">UL input power:</span> 12 dBm</div>
                        <div><span className="text-muted-foreground">Service state:</span> On</div>
                        <div><span className="text-muted-foreground">Limiter:</span> Enabled</div>
                      </div>
                    </TabsContent>

                    <TabsContent value="Comment(N/A)" className="m-0 pt-3">
                      <div className="rounded-md border p-3 text-xs text-muted-foreground">No comments available.</div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Location</CardTitle>
                {selectedRemoteRow && (
                  <p className="text-xs text-muted-foreground">{selectedRemoteRow.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative h-[360px] min-h-[360px] w-full overflow-hidden bg-white p-3">
                  <img
                    src={remoteUnitMapBackgroundSrc}
                    alt="Radio unit floor plan map background"
                    className="h-full w-full object-contain"
                  />
                  {selectedRemoteRow && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={selectedRemoteFloorplanMarkerStyle}
                    >
                      <div className="inline-flex items-center gap-1 rounded-full border bg-background/95 px-2 py-0.5 shadow-sm">
                        <Icon name="place" size={16} className="text-destructive" />
                        <span className="text-[11px] font-medium leading-none">{selectedRemoteRow.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </>
            ) : (
              <div className="space-y-4 pr-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-24 animate-pulse rounded-md bg-muted/40" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-40 animate-pulse rounded-md bg-muted/40" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-72 animate-pulse rounded-md bg-muted/40" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </TooltipProvider>
  );
}

export default DeviceDetailPage;

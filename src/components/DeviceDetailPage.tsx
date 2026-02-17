'use client';

import React, { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { DeviceStatus } from './ui/device-status';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { FilterSelect } from './ui/filter-select';
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
import { ThresholdCrossingAlertsDataTable } from './threshold-crossing-alerts-data-table';
import { IpInterfacesDataTable } from './ip-interfaces-data-table';
import { RadioNodesDataTable, RADIO_NODES_STATUS_OPTIONS, RADIO_NODES_MODEL_OPTIONS, RADIO_NODES_DATA, filterRadioNodes } from './radio-nodes-data-table';
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
  { day: 'Jan 20', erabEstablishmentSr: 98.2, erabEstablishmentAttempts: 12400, volteEstablishmentSr: 99.1, volteEstablishmentAttempts: 3200, rrcSr: 99.5 },
  { day: 'Jan 21', erabEstablishmentSr: 97.8, erabEstablishmentAttempts: 13100, volteEstablishmentSr: 98.8, volteEstablishmentAttempts: 3100, rrcSr: 99.3 },
  { day: 'Jan 22', erabEstablishmentSr: 98.5, erabEstablishmentAttempts: 11900, volteEstablishmentSr: 99.2, volteEstablishmentAttempts: 3400, rrcSr: 99.6 },
  { day: 'Jan 23', erabEstablishmentSr: 97.9, erabEstablishmentAttempts: 12800, volteEstablishmentSr: 98.9, volteEstablishmentAttempts: 3050, rrcSr: 99.4 },
  { day: 'Jan 24', erabEstablishmentSr: 98.8, erabEstablishmentAttempts: 11500, volteEstablishmentSr: 99.4, volteEstablishmentAttempts: 3300, rrcSr: 99.7 },
  { day: 'Jan 25', erabEstablishmentSr: 98.1, erabEstablishmentAttempts: 12200, volteEstablishmentSr: 99.0, volteEstablishmentAttempts: 3180, rrcSr: 99.5 },
  { day: 'Jan 26', erabEstablishmentSr: 98.6, erabEstablishmentAttempts: 12000, volteEstablishmentSr: 99.3, volteEstablishmentAttempts: 3250, rrcSr: 99.6 },
  { day: 'Jan 27', erabEstablishmentSr: 98.3, erabEstablishmentAttempts: 12600, volteEstablishmentSr: 99.1, volteEstablishmentAttempts: 3150, rrcSr: 99.4 },
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
] as const;

const CELL_TIME_RANGES = ['Last 7 days'] as const;
const CELL_STATUS_OPTIONS = ['all', 'good', 'bad'] as const;

const CELL_PERFORMANCE_ROWS = [
  {
    name: 'Cell-1',
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
  },
  {
    name: 'Cell-2',
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
  },
  {
    name: 'Cell-3',
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
  },
  {
    name: 'Cell-4',
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
  },
  {
    name: 'Cell-5',
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
  },
] as const;

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
  const isDas = device.type === 'DAS';
  const SIDEBAR_ITEMS = isDas
    ? (['Summary', 'Radio nodes', 'Web terminal', 'SNMP details'] as const)
    : ([
        'Summary',
        'Commissioning',
        'IP interfaces',
        'Radio nodes',
        'NR cells',
        'Zones',
        'X2 connections',
        'Performance',
        'Files',
        'SSH terminal',
      ] as const);
  const toKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const [activeSection, setActiveSection] = useState(initialSection ?? toKey(SIDEBAR_ITEMS[0]));

  React.useEffect(() => {
    const keys = SIDEBAR_ITEMS.map(toKey);
    if (!keys.includes(activeSection)) {
      setActiveSection(toKey(SIDEBAR_ITEMS[0]));
    }
  }, [device.id, isDas]);
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const [alarmsEventsTab, setAlarmsEventsTab] = React.useState('alarms');
  const [performanceTab, setPerformanceTab] = React.useState('site');
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
  const [radioNodesStatusFilter, setRadioNodesStatusFilter] = useState('All');
  const [radioNodesModelFilter, setRadioNodesModelFilter] = useState('All');
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
  const SIDEBAR_BADGE_COUNTS = React.useMemo<Record<string, number>>(() => ({
    'ip-interfaces': IP_INTERFACES_DATA.length,
    'radio-nodes': filterRadioNodes(RADIO_NODES_DATA, radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter).length,
    'nr-cells': NR_CELLS_DATA.length,
    'zones': ZONES_DATA.length,
  }), [radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter]);
  const [noteInput, setNoteInput] = useState('');
  const notesScrollRef = React.useRef<HTMLDivElement>(null);
  const notesCardRef = React.useRef<HTMLDivElement>(null);
  const alarmsCardRef = React.useRef<HTMLDivElement>(null);

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
  const [tcProfile, setTcProfile] = useState<ProfileData | null>(PERF_PROFILES_INIT['LTE Throughput Baseline']);
  const [tcProfileScheduleTab, setTcProfileScheduleTab] = useState('1');
  const [removeTcProfileOpen, setRemoveTcProfileOpen] = useState(false);
  const [addTcProfileOpen, setAddTcProfileOpen] = useState(false);
  const [addTcProfileSelection, setAddTcProfileSelection] = useState('');

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
    location: device.deviceGroup,
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
      location: device.deviceGroup,
      description: device.notes || '',
      clusterId: device.id.padStart(3, '0'),
      groupName: device.deviceGroup,
      labels: device.labels ?? [],
    }));
  }, [device.device, device.deviceGroup, device.notes, device.id, device.labels]);

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
                  <span className="text-sm text-gray-400">
                    {device.location}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
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
                  <p className="text-gray-400 mb-0.5">Radio nodes</p>
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
            {/* Name/value pair section from device drawer */}
            <Card>
              <CardContent className="pt-6 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                  </div>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                  </div>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
                    <NameValueField
                      label="Group name"
                      value={summaryValues.groupName}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, groupName: v }))}
                      placeholder="—"
                    />
                    <EditableLabelsField
                      label="Labels"
                      value={summaryValues.labels}
                      onSave={(v) => setSummaryValues((s) => ({ ...s, labels: v }))}
                      placeholder="—"
                    />
                  </div>
                </div>
                <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Status</h4>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                  <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                    <div className="my-8 h-px w-full rounded-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground">Hardware</h4>
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                      </div>
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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
                      <div className="grid grid-cols-3 gap-x-3 gap-y-6 text-sm">
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

          {activeSection === 'radio-nodes' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4 flex-wrap">
                <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search radio nodes..."
                      className="pl-9 w-full"
                      value={radioNodesSearch}
                      onChange={(e) => setRadioNodesSearch(e.target.value)}
                    />
                  </div>
                  <FilterSelect value={radioNodesStatusFilter} onValueChange={setRadioNodesStatusFilter} label="Status" options={[...RADIO_NODES_STATUS_OPTIONS]} className="w-[130px]" />
                  <FilterSelect value={radioNodesModelFilter} onValueChange={setRadioNodesModelFilter} label="Model" options={[...RADIO_NODES_MODEL_OPTIONS]} className="w-[120px]" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="shrink-0 gap-1" onClick={() => setAddRadioNodeSheetOpen(true)}>
                      <Icon name="add" size={18} />
                      Add radio node
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add radio node</TooltipContent>
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
                      <TabsTrigger value="threshold-profiles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Threshold crossing profiles
                      </TabsTrigger>
                      <TabsTrigger value="threshold-history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Threshold crossing history
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="site" className="mt-6">
                      <section className="space-y-6">
                        <h3 className="text-lg font-semibold">Accessibility</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Chart 1: ERAB establishment */}
                          <Card>
                            <CardHeader>
                              <CardTitle>ERAB establishment</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  erabEstablishmentSr: { label: 'SR (%)', color: 'hsl(var(--chart-1, 214 95% 50%))' },
                                  erabEstablishmentAttempts: { label: 'Attempts', color: 'hsl(var(--chart-2, 173 58% 39%))' },
                                } satisfies ChartConfig}
                                className="min-h-[200px] w-full"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line type="monotone" dataKey="erabEstablishmentSr" stroke="var(--color-erabEstablishmentSr)" strokeWidth={2} dot={false} />
                                  <Line type="monotone" dataKey="erabEstablishmentAttempts" stroke="var(--color-erabEstablishmentAttempts)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          {/* Chart 2: VoLTE establishment */}
                          <Card>
                            <CardHeader>
                              <CardTitle>VoLTE establishment</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  volteEstablishmentSr: { label: 'SR (%)', color: 'hsl(var(--chart-1, 214 95% 50%))' },
                                  volteEstablishmentAttempts: { label: 'Attempts', color: 'hsl(var(--chart-2, 173 58% 39%))' },
                                } satisfies ChartConfig}
                                className="min-h-[200px] w-full"
                              >
                                <LineChart accessibilityLayer data={ACCESSIBILITY_CHART_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
                                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                  <ChartLegend content={<ChartLegendContent />} />
                                  <Line type="monotone" dataKey="volteEstablishmentSr" stroke="var(--color-volteEstablishmentSr)" strokeWidth={2} dot={false} />
                                  <Line type="monotone" dataKey="volteEstablishmentAttempts" stroke="var(--color-volteEstablishmentAttempts)" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ChartContainer>
                            </CardContent>
                          </Card>
                          {/* Chart 3: RRC SR */}
                          <Card>
                            <CardHeader>
                              <CardTitle>RRC success rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ChartContainer
                                config={{
                                  day: { label: 'Day' },
                                  rrcSr: { label: 'RRC SR (%)', color: 'hsl(var(--chart-1, 214 95% 50%))' },
                                } satisfies ChartConfig}
                                className="min-h-[200px] w-full"
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-4 py-3 h-11">Cell name</TableHead>
                              <TableHead className="px-4 py-3 h-11">Call setup success rate added ERAB</TableHead>
                              <TableHead className="px-4 py-3 h-11">ERABs</TableHead>
                              <TableHead className="px-4 py-3 h-11">RRC establishment success rate</TableHead>
                              <TableHead className="px-4 py-3 h-11">SCE_LTE_RRC_Cell.ConnEstabAtt.Sum</TableHead>
                              <TableHead className="px-4 py-3 h-11">LTE_MAX_RRC_CONNECTED_USERS_Cell</TableHead>
                              <TableHead className="px-4 py-3 h-11">ERABs drop rate</TableHead>
                              <TableHead className="px-4 py-3 h-11">ERABs drops</TableHead>
                              <TableHead className="px-4 py-3 h-11">SCE_LTECell_GTP.DL.NumBytes</TableHead>
                              <TableHead className="px-4 py-3 h-11">SCE_LTECell_GTP.UL.NumBytes</TableHead>
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
                              <TableRow key={row.name}>
                                <TableCell className="px-4 py-3 font-medium">{row.name}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.callSetupSuccessRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.erabs}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.rrcSuccessRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.connEstabAttSum}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.maxRrcUsers}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.erabDropRate.toFixed(2)}%</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{row.erabDrops}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{formatBytes(row.dlBytes)}</TableCell>
                                <TableCell className="px-4 py-3 tabular-nums">{formatBytes(row.ulBytes)}</TableCell>
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
                                cpu: { label: 'CPU (%)', color: 'hsl(var(--chart-1, 214 95% 50%))' },
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
                                memory: { label: 'Memory (%)', color: 'hsl(var(--chart-2, 173 58% 39%))' },
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
                      {!tcProfile ? (
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
                                      {Object.values(PERF_PROFILES_INIT).map((p) => (
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
                                      setTcProfile(structuredClone(selected));
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
                        </div>
                      ) : (() => {
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
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          const hr = h % 12 || 12;
                          return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
                        };

                        return (
                          <Card>
                            <CardContent className="pt-6 space-y-6">
                              {/* Profile + enabled status + remove */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-medium text-muted-foreground">Profile</h4>
                                  <p className="text-sm">{profile.name}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <Badge variant={profile.enabled ? 'default' : 'secondary'}>
                                    {profile.enabled ? 'Enabled' : 'Disabled'}
                                  </Badge>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setRemoveTcProfileOpen(true)}>
                                    <Icon name="delete" size={18} />
                                  </Button>
                                </div>
                              </div>

                              {/* Remove profile confirmation */}
                              <AlertDialog open={removeTcProfileOpen} onOpenChange={setRemoveTcProfileOpen}>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove profile</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove <span className="font-medium text-foreground">{profile.name}</span> from this device? Threshold-based alerting will be disabled until a new profile is assigned.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => setTcProfile(null)}
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              {/* Description */}
                              <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                <p className="text-sm text-foreground">{profile.description}</p>
                              </div>

                              <Separator />

                              {/* Actions */}
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
                                          <TableCell className="px-4 text-muted-foreground truncate max-w-[300px]">
                                            {act.detailType === 'badge' ? <Badge variant="secondary">{act.details}</Badge> : act.details}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              <Separator />

                              {/* Schedule */}
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
                                  <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-6">
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

                              {/* Alert rules */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground">Alert when...</h4>
                                <div className="rounded-lg border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="px-4">KPI</TableHead>
                                        <TableHead className="px-4">KPI type</TableHead>
                                        <TableHead className="px-4">Alert when...</TableHead>
                                        <TableHead className="px-4">Consecutive samples</TableHead>
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
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </TabsContent>

                    <TabsContent value="threshold-history" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
                          <div className="relative w-full md:max-w-[280px]">
                            <Icon
                              name="search"
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                              placeholder="Search history..."
                              className="pl-9 w-full"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Select value="Rule">
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Rule" />
                              </SelectTrigger>
                              <SelectContent>
                                {['Rule', 'CPU spike', 'Memory saturation', 'ERAB drop rate', 'RRC failures'].map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value="Status">
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {['All', 'Open', 'Acknowledged', 'Cleared'].map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="rounded-lg border bg-card overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-4 py-3 h-11 w-10">
                                  <Checkbox aria-label="Select all" />
                                </TableHead>
                                <TableHead className="px-4 py-3 h-11">Rule</TableHead>
                                <TableHead className="px-4 py-3 h-11">Timestamp</TableHead>
                                <TableHead className="px-4 py-3 h-11">Actions</TableHead>
                                <TableHead className="px-4 py-3 h-11">Cleared</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[
                                { rule: 'CPU spike', timestamp: '2025-01-27 09:12', actions: ['Investigate'], cleared: '—' },
                                { rule: 'Memory saturation', timestamp: '2025-01-27 08:45', actions: ['Acknowledge'], cleared: '2025-01-27 09:10' },
                                { rule: 'ERAB drop rate', timestamp: '2025-01-27 07:58', actions: ['Escalate', 'Send email'], cleared: '—' },
                                { rule: 'RRC failures', timestamp: '2025-01-27 06:30', actions: ['Investigate'], cleared: '2025-01-27 06:55' },
                              ].map((row) => (
                                <TableRow key={`${row.rule}-${row.timestamp}`}>
                                  <TableCell className="px-4 py-3">
                                    <Checkbox aria-label="Select row" />
                                  </TableCell>
                                  <TableCell className="px-4 py-3 font-medium">{row.rule}</TableCell>
                                  <TableCell className="px-4 py-3 tabular-nums">{row.timestamp}</TableCell>
                                  <TableCell className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {row.actions.map((a) => (
                                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 tabular-nums">{row.cleared}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
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
    </div>
    </TooltipProvider>
  );
}

export default DeviceDetailPage;

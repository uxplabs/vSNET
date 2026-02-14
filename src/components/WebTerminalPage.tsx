'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import type { DeviceRow } from './devices-data-table';

/* ─── Terminal line types ─────────────────────────── */
interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error' | 'banner';
  text: string;
}

/* ─── Command responses ──────────────────────────── */
function getCommandResponse(cmd: string, device: DeviceRow): string | null {
  const trimmed = cmd.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed === 'exit' || trimmed === 'logout') return '__EXIT__';
  const hostname = device.device.toLowerCase().replace(/\s+/g, '-');

  const commands: Record<string, string> = {
    help: [
      '',
      '  \x1b[1mAvailable Commands\x1b[0m',
      '  ─────────────────────────────────────────────────',
      '  show status          Display device status summary',
      '  show interfaces      Display network interface table',
      '  show config          Display running configuration',
      '  show alarms          Display active alarm list',
      '  show version         Display software version info',
      '  show uptime          Display system uptime',
      '  show neighbors       Display connected neighbor devices',
      '  show routes          Display IP routing table',
      '  show logs            Display recent system logs',
      '  ping <host>          Send ICMP echo to host',
      '  traceroute <host>    Trace packet route to host',
      '  cat <file>           Display file contents',
      '  ls [-la]             List directory contents',
      '  whoami               Display current username',
      '  hostname             Display system hostname',
      '  date                 Display current date/time',
      '  uptime               Display system uptime',
      '  df -h                Display disk usage',
      '  free -h              Display memory usage',
      '  top                  Display process summary',
      '  clear                Clear terminal screen',
      '  exit                 Close terminal session',
      '',
    ].join('\n'),
    'show status': [
      '',
      '  \x1b[1mDevice Status\x1b[0m',
      '  ─────────────────────────────────────────────────',
      `  Device:          ${device.device}`,
      `  Status:          ${device.status === 'Connected' ? '\x1b[32m● Connected\x1b[0m' : device.status === 'Disconnected' ? '\x1b[31m● Disconnected\x1b[0m' : '\x1b[33m● ' + device.status + '\x1b[0m'}`,
      `  IP Address:      ${device.ipAddress || '10.12.1.42'}`,
      `  Type:            ${device.type}`,
      `  Config Status:   ${device.configStatus}`,
      `  Active Alarms:   ${device.alarms}`,
      `  Device Group:    ${device.deviceGroup}`,
      `  Region:          ${device.region}`,
      '',
    ].join('\n'),
    'show interfaces': [
      '',
      '  \x1b[1mNetwork Interfaces\x1b[0m',
      '  Interface     Status    IP Address           Speed      MTU',
      '  ───────────────────────────────────────────────────────────────',
      `  eth0          \x1b[32mup\x1b[0m        ${(device.ipAddress || '10.12.1.42').padEnd(20)} 1000Mbps   1500`,
      '  eth1          \x1b[32mup\x1b[0m        10.12.2.1/24         1000Mbps   1500',
      '  lo            \x1b[32mup\x1b[0m        127.0.0.1/8          —          65536',
      '  mgmt0         \x1b[32mup\x1b[0m        192.168.1.1/24       100Mbps    1500',
      '',
    ].join('\n'),
    'show config': [
      `! Running configuration for ${device.device}`,
      `! Last modified: ${new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]}`,
      '!',
      `hostname ${hostname}`,
      '!',
      'interface eth0',
      `  ip address ${device.ipAddress || '10.12.1.42'} 255.255.255.0`,
      '  no shutdown',
      '!',
      'interface eth1',
      '  ip address 10.12.2.1 255.255.255.0',
      '  no shutdown',
      '!',
      'logging server 10.0.0.100',
      'logging level informational',
      'ntp server 10.0.0.50',
      'ntp server 10.0.0.51 prefer',
      'snmp-server community public RO',
      'snmp-server location ' + device.region,
      '!',
      'end',
    ].join('\n'),
    'show alarms': device.alarms === 0
      ? '\n  No active alarms.\n'
      : [
          '',
          `  \x1b[1mActive Alarms: ${device.alarms}\x1b[0m`,
          '  ─────────────────────────────────────────────────',
          `  ${device.alarmType === 'Critical' ? '\x1b[31m' : device.alarmType === 'Major' ? '\x1b[33m' : '\x1b[36m'}[${device.alarmType?.toUpperCase()}]\x1b[0m  Link flap detected on eth1`,
          device.alarms > 1 ? '  \x1b[36m[MINOR]\x1b[0m   NTP sync drift > 500ms' : '',
          device.alarms > 2 ? '  \x1b[33m[MAJOR]\x1b[0m   CPU utilization > 85%' : '',
          '',
        ].filter(Boolean).join('\n'),
    'show version': [
      '',
      `  \x1b[1mSystem Information\x1b[0m`,
      '  ─────────────────────────────────────────────────',
      `  Software Version:  ${device.version || 'v3.0'}`,
      '  Build:             20250120.1',
      '  Kernel:            Linux 5.15.0-92-generic',
      '  Uptime:            42 days, 7:23:15',
      '  Hardware:           vSNET-5000',
      '  Serial:            VSN-2024-00842',
      `  Last Reboot:       ${new Date(Date.now() - 86400000 * 42).toISOString().split('T')[0]}`,
      '',
    ].join('\n'),
    'show uptime': ' 14:23:15 up 42 days,  7:23,  1 user,  load average: 0.12, 0.08, 0.05',
    uptime: ' 14:23:15 up 42 days,  7:23,  1 user,  load average: 0.12, 0.08, 0.05',
    'show neighbors': [
      '',
      '  \x1b[1mNeighbor Devices\x1b[0m',
      '  Neighbor ID      Interface   Hold Time   Capability    State',
      '  ───────────────────────────────────────────────────────────────',
      '  10.12.1.1        eth0        120s        Router        \x1b[32mFull\x1b[0m',
      '  10.12.2.5        eth1        120s        Switch        \x1b[32mFull\x1b[0m',
      '  10.12.1.10       eth0        90s         Radio node    \x1b[32mFull\x1b[0m',
      '',
    ].join('\n'),
    'show routes': [
      '',
      '  \x1b[1mIP Routing Table\x1b[0m',
      '  Destination        Gateway          Interface   Metric   Proto',
      '  ───────────────────────────────────────────────────────────────',
      '  0.0.0.0/0          10.12.1.1        eth0        100      static',
      '  10.12.1.0/24       directly         eth0        0        connected',
      '  10.12.2.0/24       directly         eth1        0        connected',
      '  192.168.1.0/24     directly         mgmt0       0        connected',
      '',
    ].join('\n'),
    'show logs': [
      '',
      '  \x1b[1mRecent System Logs\x1b[0m',
      '  ─────────────────────────────────────────────────',
      '  Feb 11 14:20:01 systemd[1]: Started Daily apt activities.',
      '  Feb 11 14:15:33 snmpd[842]: Connection from UDP: [10.0.0.100]:44721',
      '  Feb 11 14:10:12 ntpd[501]: synchronized to 10.0.0.50, stratum 2',
      '  Feb 11 14:05:00 CRON[12842]: (root) CMD (/usr/bin/health-check)',
      '  Feb 11 14:00:01 systemd[1]: logrotate.service: Succeeded.',
      '  Feb 11 13:55:22 kernel: [3643522.115] eth0: link up 1000Mbps',
      '  Feb 11 13:45:18 sshd[13201]: Accepted publickey for admin from 10.0.1.100',
      '',
    ].join('\n'),
    ls: 'config.cfg  logs/  backup/  scripts/  firmware/  .ssh/',
    'ls -la': [
      'total 48',
      'drwxr-xr-x  8 admin admin 4096 Feb 11 14:20 .',
      'drwxr-xr-x  3 root  root  4096 Jan 15 10:30 ..',
      '-rw-------  1 admin admin  842 Feb 11 14:20 .bash_history',
      '-rw-r--r--  1 admin admin  220 Jan 15 10:30 .bash_logout',
      '-rw-r--r--  1 admin admin 3771 Jan 15 10:30 .bashrc',
      'drwx------  2 admin admin 4096 Jan 15 10:30 .ssh',
      '-rw-r--r--  1 admin admin 4218 Feb  8 09:15 config.cfg',
      'drwxr-xr-x  2 admin admin 4096 Feb 10 16:42 logs',
      'drwxr-xr-x  2 admin admin 4096 Feb  5 03:00 backup',
      'drwxr-xr-x  2 admin admin 4096 Jan 20 11:22 scripts',
      'drwxr-xr-x  2 admin admin 4096 Jan 28 08:45 firmware',
    ].join('\n'),
    'ls -l': [
      'total 28',
      '-rw-r--r--  1 admin admin 4218 Feb  8 09:15 config.cfg',
      'drwxr-xr-x  2 admin admin 4096 Feb 10 16:42 logs',
      'drwxr-xr-x  2 admin admin 4096 Feb  5 03:00 backup',
      'drwxr-xr-x  2 admin admin 4096 Jan 20 11:22 scripts',
      'drwxr-xr-x  2 admin admin 4096 Jan 28 08:45 firmware',
    ].join('\n'),
    whoami: 'admin',
    hostname: hostname,
    date: new Date().toString(),
    'df -h': [
      'Filesystem      Size  Used Avail Use% Mounted on',
      '/dev/sda1        50G   12G   36G  25% /',
      'tmpfs           2.0G     0  2.0G   0% /dev/shm',
      '/dev/sda2       200G   45G  145G  24% /var/log',
    ].join('\n'),
    'free -h': [
      '              total        used        free      shared  buff/cache   available',
      'Mem:          3.8Gi       1.2Gi       1.4Gi        42Mi       1.2Gi       2.3Gi',
      'Swap:         2.0Gi          0B       2.0Gi',
    ].join('\n'),
    top: [
      `top - 14:23:15 up 42 days,  7:23,  1 user,  load average: 0.12, 0.08, 0.05`,
      'Tasks:  98 total,   1 running,  97 sleeping,   0 stopped,   0 zombie',
      '%Cpu(s):  2.3 us,  0.8 sy,  0.0 ni, 96.5 id,  0.2 wa,  0.0 hi,  0.2 si',
      'MiB Mem :  3891.2 total,  1434.8 free,  1228.4 used,  1228.0 buff/cache',
      '',
      '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
      '  842 snmpd     20   0  125432  18924  12844 S   0.3   0.5   8:42.15 snmpd',
      '  501 ntp       20   0   98204  12284   9128 S   0.0   0.3   2:15.33 ntpd',
      '    1 root      20   0  169492  13288   8424 S   0.0   0.3  12:05.18 systemd',
      '  623 root      20   0   72304   6148   5264 S   0.0   0.2   0:42.07 sshd',
      ' 1284 admin     20   0   21472   5248   3388 S   0.0   0.1   0:00.05 bash',
    ].join('\n'),
  };

  if (commands[trimmed]) return commands[trimmed];
  if (trimmed.startsWith('ping ')) {
    const host = trimmed.slice(5).trim() || 'unknown';
    const ip = host === 'localhost' ? '127.0.0.1' : '10.12.1.' + ((host.charCodeAt(0) % 250) + 1);
    return [
      `PING ${host} (${ip}) 56(84) bytes of data.`,
      `64 bytes from ${ip}: icmp_seq=1 ttl=64 time=1.${Math.floor(Math.random() * 9)}2 ms`,
      `64 bytes from ${ip}: icmp_seq=2 ttl=64 time=0.${Math.floor(Math.random() * 9)}8 ms`,
      `64 bytes from ${ip}: icmp_seq=3 ttl=64 time=1.${Math.floor(Math.random() * 9)}1 ms`,
      '',
      `--- ${host} ping statistics ---`,
      '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
      'rtt min/avg/max/mdev = 0.82/1.10/1.42/0.245 ms',
    ].join('\n');
  }
  if (trimmed.startsWith('traceroute ')) {
    const host = trimmed.slice(11).trim() || 'unknown';
    return [
      `traceroute to ${host}, 30 hops max, 60 byte packets`,
      ' 1  gateway (10.12.1.1)  1.234 ms  0.987 ms  1.102 ms',
      ' 2  core-rtr (172.16.0.1)  3.456 ms  3.201 ms  3.512 ms',
      ` 3  ${host}  5.123 ms  4.891 ms  5.334 ms`,
    ].join('\n');
  }
  if (trimmed.startsWith('cat ')) {
    const file = trimmed.slice(4).trim();
    if (file === 'config.cfg') return commands['show config'];
    if (file === '/etc/hostname') return hostname;
    if (file === '/proc/uptime') return '3643395.12 7125412.48';
    return `cat: ${file}: No such file or directory`;
  }
  return `bash: ${trimmed.split(' ')[0]}: command not found`;
}

/* ─── ANSI color parser ──────────────────────────── */
function parseAnsi(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\x1b\[(\d+)m/g;
  let lastIndex = 0;
  let currentClass = '';
  let match;

  const colorMap: Record<string, string> = {
    '0': '',
    '1': 'font-bold',
    '31': 'text-red-400',
    '32': 'text-green-400',
    '33': 'text-yellow-400',
    '34': 'text-blue-400',
    '35': 'text-purple-400',
    '36': 'text-cyan-400',
  };

  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) {
      parts.push(
        currentClass
          ? <span key={parts.length} className={currentClass}>{before}</span>
          : before
      );
    }
    currentClass = colorMap[match[1]] ?? '';
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex);
  if (remaining) {
    parts.push(
      currentClass
        ? <span key={parts.length} className={currentClass}>{remaining}</span>
        : remaining
    );
  }

  return parts.length > 0 ? parts : [text];
}

/* ─── Props ───────────────────────────────────────── */
interface WebTerminalPageProps {
  device: DeviceRow;
  appName?: string;
}

export default function WebTerminalPage({
  device,
  appName = 'AMS',
}: WebTerminalPageProps) {
  const hostname = device.device.toLowerCase().replace(/\s+/g, '-');
  const prompt = `admin@${hostname}:~$`;
  const ip = device.ipAddress || '10.12.1.42';

  const [fontSize, setFontSize] = useState(13);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [sessionTime, setSessionTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Session timer
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const formatSessionTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulated connection sequence
  const runConnectionSequence = useCallback(() => {
    setConnecting(true);
    setConnected(false);
    setLines([]);
    setSessionTime(0);

    const connectionLines: Array<{ delay: number; line: TerminalLine }> = [
      { delay: 0, line: { type: 'banner', text: `Connecting to ${device.device} (${ip})...` } },
      { delay: 400, line: { type: 'banner', text: `SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6` } },
      { delay: 700, line: { type: 'banner', text: `Authenticating with public key "admin@ams-console"...` } },
      { delay: 1100, line: { type: 'banner', text: `Authenticated to ${ip} ([${ip}]:22) using "publickey".` } },
      { delay: 1500, line: { type: 'banner', text: '' } },
      { delay: 1600, line: { type: 'system', text: '╔══════════════════════════════════════════════════════════════╗' } },
      { delay: 1600, line: { type: 'system', text: `║  ${device.device.padEnd(28)} ${device.type.padStart(28)}  ║` } },
      { delay: 1600, line: { type: 'system', text: '╠══════════════════════════════════════════════════════════════╣' } },
      { delay: 1600, line: { type: 'system', text: `║  IP: ${ip.padEnd(22)} Region: ${device.region.padEnd(20)} ║` } },
      { delay: 1600, line: { type: 'system', text: `║  Version: ${(device.version || 'v3.0').padEnd(17)} Group: ${device.deviceGroup.padEnd(21)} ║` } },
      { delay: 1600, line: { type: 'system', text: '╚══════════════════════════════════════════════════════════════╝' } },
      { delay: 1800, line: { type: 'banner', text: '' } },
      { delay: 1900, line: { type: 'banner', text: `Last login: ${new Date(Date.now() - 7200000).toLocaleString()} from 10.0.1.100` } },
      { delay: 2000, line: { type: 'banner', text: '' } },
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    connectionLines.forEach(({ delay, line }) => {
      timeouts.push(setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, delay));
    });

    timeouts.push(setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2100));

    return () => timeouts.forEach(clearTimeout);
  }, [device, ip]);

  // Run connection on mount
  useEffect(() => {
    const cleanup = runConnectionSequence();
    return cleanup;
  }, [runConnectionSequence]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when connected
  useEffect(() => {
    if (connected) inputRef.current?.focus();
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
      newLines.push({ type: 'system', text: '' });
      newLines.push({ type: 'banner', text: 'Connection to ' + ip + ' closed.' });
      setLines((prev) => [...prev, ...newLines]);
      setConnected(false);
      setConnecting(false);
      return;
    }
    if (response) {
      const lineType = response.startsWith('bash:') || response.startsWith('cat:') ? 'error' as const : 'output' as const;
      newLines.push({ type: lineType, text: response });
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
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setLines((prev) => [...prev, { type: 'input', text: `${prompt} ${input}^C` }]);
      setInput('');
    }
  };

  const handleReconnect = () => {
    setHistory([]);
    setHistoryIdx(-1);
    setInput('');
    runConnectionSequence();
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '';
      case 'output': return '';
      case 'system': return 'text-emerald-400';
      case 'banner': return 'text-[#6A9955]';
      case 'error': return 'text-red-400';
    }
  };

  // Update the browser tab title
  useEffect(() => {
    document.title = `${device.device} — Terminal | ${appName}`;
    return () => { document.title = appName; };
  }, [device.device, appName]);

  const canIncrease = fontSize < 20;
  const canDecrease = fontSize > 10;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="h-screen flex flex-col bg-[#0c0c0c] overflow-hidden select-none">
      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#181818] border-b border-[#2a2a2a] shrink-0">
        {/* Left: session info */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-[7px] h-[7px] rounded-full ${
              connected ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]' 
              : connecting ? 'bg-yellow-500 animate-pulse shadow-[0_0_4px_rgba(234,179,8,0.6)]' 
              : 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]'
            }`} />
            <span className="text-[#808080]">
              {connected ? 'SSH Connected' : connecting ? 'Connecting…' : 'Disconnected'}
            </span>
          </div>
          <span className="text-[#333]">│</span>
          <span className="text-[#cccccc]">{device.device}</span>
          <span className="text-[#555]">@</span>
          <span className="text-[#808080]">{ip}</span>
          {connected && (
            <>
              <span className="text-[#333]">│</span>
              <span className="text-[#555]">{formatSessionTime(sessionTime)}</span>
            </>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => canDecrease && setFontSize((s) => s - 1)}
                className={`w-6 h-6 flex items-center justify-center rounded text-[11px] transition-colors ${
                  canDecrease ? 'text-[#808080] hover:text-[#ccc] hover:bg-[#2a2a2a]' : 'text-[#333] cursor-not-allowed'
                }`}
                disabled={!canDecrease}
              >
                <Icon name="remove" size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Decrease font size</TooltipContent>
          </Tooltip>
          <span className="text-[10px] text-[#555] w-6 text-center tabular-nums">{fontSize}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => canIncrease && setFontSize((s) => s + 1)}
                className={`w-6 h-6 flex items-center justify-center rounded text-[11px] transition-colors ${
                  canIncrease ? 'text-[#808080] hover:text-[#ccc] hover:bg-[#2a2a2a]' : 'text-[#333] cursor-not-allowed'
                }`}
                disabled={!canIncrease}
              >
                <Icon name="add" size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Increase font size</TooltipContent>
          </Tooltip>

          <span className="w-px h-4 bg-[#2a2a2a] mx-1.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setLines([])}
                className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-[#ccc] hover:bg-[#2a2a2a] transition-colors"
              >
                <Icon name="delete_sweep" size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Clear terminal</TooltipContent>
          </Tooltip>

          {!connected && !connecting && (
            <>
              <span className="w-px h-4 bg-[#2a2a2a] mx-1.5" />
              <button
                onClick={handleReconnect}
                className="h-6 px-2 flex items-center gap-1 rounded text-[11px] font-mono text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Icon name="refresh" size={13} />
                Reconnect
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Terminal viewport ───────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto cursor-text"
        style={{
          fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          padding: '12px 16px',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className={`${lineColor(line.type)}`} style={{ minHeight: `${fontSize * 1.5}px` }}>
            {line.text === '' ? '\u00A0' : line.type === 'input' ? (
              <>
                <span className="text-[#569CD6]">{line.text.split(' ')[0]}</span>
                <span className="text-[#DCDCAA]">@</span>
                <span className="text-[#4EC9B0]">{line.text.split('@')[1]?.split(':')[0] ?? ''}</span>
                <span className="text-[#d4d4d4]">:</span>
                <span className="text-[#569CD6]">~</span>
                <span className="text-[#d4d4d4]">$ </span>
                <span className="text-[#d4d4d4]">{line.text.slice(prompt.length + 1)}</span>
              </>
            ) : (
              parseAnsi(line.text)
            )}
          </div>
        ))}

        {/* Active prompt */}
        {connected && (
          <div className="flex items-center" style={{ minHeight: `${fontSize * 1.5}px` }}>
            <span className="text-[#569CD6]">admin</span>
            <span className="text-[#DCDCAA]">@</span>
            <span className="text-[#4EC9B0]">{hostname}</span>
            <span className="text-[#d4d4d4]">:</span>
            <span className="text-[#569CD6]">~</span>
            <span className="text-[#d4d4d4]">$ </span>
            <span className="text-[#d4d4d4] relative">
              {input}
              <span className="inline-block w-[0.6em] h-[1.15em] bg-[#aeafad] ml-px align-middle animate-[blink_1s_step-end_infinite] opacity-80" />
            </span>
          </div>
        )}

        {/* Disconnected state */}
        {!connected && !connecting && (
          <div className="mt-4 text-[#808080] text-center">
            <span className="text-[#555]">Session ended. Press </span>
            <button onClick={handleReconnect} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              Reconnect
            </button>
            <span className="text-[#555]"> or close this tab.</span>
          </div>
        )}
      </div>

      {/* ── Hidden input for capturing keystrokes ───── */}
      {connected && (
        <form onSubmit={handleSubmit} className="absolute opacity-0 pointer-events-none">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setHistoryIdx(-1); }}
            onKeyDown={handleKeyDown}
            aria-label="Terminal input"
            autoFocus
          />
        </form>
      )}

      {/* ── Status bar ──────────────────────────────── */}
      <div className="flex items-center justify-between h-[22px] px-3 bg-[#007acc] text-white text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span>SSH: {ip}:22</span>
          <span>Shell: /bin/bash</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>LF</span>
          <span>Lines: {lines.length}</span>
        </div>
      </div>
    </div>

    {/* Blink cursor animation */}
    <style>{`
      @keyframes blink {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 0; }
      }
    `}</style>
    </TooltipProvider>
  );
}

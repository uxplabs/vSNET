'use client';

import { useMemo, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Icon } from './Icon';
import { DataTable } from './ui/data-table';
import { SortableHeader } from './ui/sortable-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

type ClusterState = 'healthy' | 'failover' | 'disconnected' | 'standalone';
type FocusedNode = 'active' | 'standby' | 'observer' | 'standalone';

interface ActivityRow {
  id: string;
  severity: 'Major' | 'Warning' | 'Info';
  event: string;
  timestamp: string;
  source: string;
}

const ACTIVITY_ROWS: ActivityRow[] = [
  { id: 'EV-89421', severity: 'Major', event: 'Replication lag exceeded threshold', timestamp: '2026-04-28 14:32:08', source: 'vSNET-WEST-02' },
  { id: 'EV-89418', severity: 'Info', event: 'Heartbeat resumed', timestamp: '2026-04-28 14:18:50', source: 'vSNET-WEST-02' },
  { id: 'EV-89417', severity: 'Warning', event: 'Standby promoted to active', timestamp: '2026-04-28 14:18:12', source: 'vSNET-WEST-01' },
  { id: 'EV-89416', severity: 'Major', event: 'Active server unreachable', timestamp: '2026-04-28 14:17:48', source: 'vSNET-WEST-01' },
  { id: 'EV-89380', severity: 'Info', event: 'Configuration saved', timestamp: '2026-04-28 11:02:15', source: 'admin@corning' },
];

function StatusDot({ tone }: { tone: 'success' | 'warning' | 'destructive' | 'muted' }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-500'
      : tone === 'warning'
        ? 'bg-amber-500'
        : tone === 'destructive'
          ? 'bg-red-500'
          : 'bg-muted-foreground';
  return <span className={cn('inline-block h-2 w-2 rounded-full', cls)} aria-hidden />;
}

function TopologyCanvas({
  state,
  focused,
  onFocus,
}: {
  state: ClusterState;
  focused: FocusedNode;
  onFocus: (node: FocusedNode) => void;
}) {
  if (state === 'standalone') {
    return (
      <div className="rounded-lg border border-border p-6 h-[420px] flex items-center justify-center">
        <button
          type="button"
          className={cn(
            'w-[280px] rounded-lg border bg-card p-4 text-left shadow-sm transition',
            focused === 'standalone' ? 'ring-2 ring-primary/40 border-primary/60' : 'hover:bg-muted/30',
          )}
          onClick={() => onFocus('standalone')}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="dns" size={16} />
            <div className="font-medium">vSNET-PRIMARY</div>
          </div>
          <div className="text-xs text-muted-foreground mb-1">Standalone</div>
          <div className="font-mono text-xs text-muted-foreground">2001:4883:236::160:0:1</div>
        </button>
      </div>
    );
  }

  const nodes = {
    active: { x: 70, y: 70, title: 'vSNET-WEST-01', role: 'Primary', ip: '2001:4883:236::160:0:1' },
    standby: { x: 70, y: 250, title: 'vSNET-WEST-02', role: 'Standby', ip: '2001:4883:236::160:0:2' },
    observer: { x: 520, y: 160, title: 'observer.corning.net', role: 'Observer', ip: 'observer.corning.net' },
  } as const;
  const nodeW = 280;
  const nodeH = 120;
  const c = (n: keyof typeof nodes) => ({
    x: nodes[n].x + nodeW / 2,
    y: nodes[n].y + nodeH / 2,
  });
  const a = c('active');
  const s = c('standby');
  const o = c('observer');

  const asColor = state === 'disconnected' ? 'hsl(var(--destructive))' : state === 'failover' ? 'hsl(var(--warning))' : 'hsl(var(--success))';
  const soColor = state === 'disconnected' ? 'hsl(var(--destructive))' : 'hsl(var(--success))';
  const aoColor = 'hsl(var(--success))';

  return (
    <div className="relative h-[420px] rounded-lg border border-border bg-muted/10 overflow-hidden">
      <svg viewBox="0 0 900 420" className="absolute inset-0 w-full h-full">
        <line x1={a.x} y1={a.y} x2={s.x} y2={s.y} stroke={asColor} strokeWidth="2" />
        <line x1={a.x} y1={a.y} x2={o.x} y2={o.y} stroke={aoColor} strokeWidth="2" />
        <line
          x1={s.x}
          y1={s.y}
          x2={o.x}
          y2={o.y}
          stroke={soColor}
          strokeWidth="2"
          strokeDasharray={state === 'disconnected' ? '6 6' : undefined}
        />
      </svg>

      {(Object.keys(nodes) as Array<keyof typeof nodes>).map((key) => {
        const n = nodes[key];
        const status =
          key === 'active'
            ? 'Active'
            : key === 'standby'
              ? state === 'disconnected'
                ? 'Disconnected'
                : state === 'failover'
                  ? 'Resyncing'
                  : 'Ready'
              : 'Online';
        const tone = status === 'Disconnected' ? 'destructive' : status === 'Resyncing' ? 'warning' : 'success';

        return (
          <button
            key={key}
            type="button"
            className={cn(
              'absolute w-[280px] rounded-lg border bg-card p-4 text-left shadow-sm transition',
              focused === key ? 'ring-2 ring-primary/40 border-primary/60' : 'hover:bg-muted/30',
            )}
            style={{ left: n.x, top: n.y, height: nodeH }}
            onClick={() => onFocus(key)}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="font-medium text-sm">{n.title}</div>
              <Badge variant="secondary">{status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-1">{n.role}</div>
            <div className="font-mono text-xs text-muted-foreground truncate">{n.ip}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <StatusDot tone={tone} />
              {status}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function RedundancyPage() {
  const [clusterState, setClusterState] = useState<ClusterState>('healthy');
  const [showBanner, setShowBanner] = useState(true);
  const [heartbeatMs, setHeartbeatMs] = useState('100');
  const [missThreshold, setMissThreshold] = useState('40');
  const [autoFailover, setAutoFailover] = useState(true);
  const [search, setSearch] = useState('');
  const [focusedNode, setFocusedNode] = useState<FocusedNode>('active');
  const topologyKpis = useMemo(() => {
    if (clusterState === 'standalone') {
      return [
        { label: 'Mode', value: 'Standalone', tone: 'muted' as const },
        { label: 'Quorum', value: 'N/A', tone: 'muted' as const },
        { label: 'Replication lag', value: 'N/A', tone: 'muted' as const },
        { label: 'Inter-node latency', value: 'N/A', tone: 'muted' as const },
      ];
    }
    if (clusterState === 'disconnected') {
      return [
        { label: 'Mode', value: 'Degraded', tone: 'destructive' as const },
        { label: 'Quorum', value: '2 / 3', tone: 'warning' as const },
        { label: 'Replication lag', value: 'Unavailable', tone: 'destructive' as const },
        { label: 'Inter-node latency', value: 'Down', tone: 'destructive' as const },
      ];
    }
    if (clusterState === 'failover') {
      return [
        { label: 'Mode', value: 'Failover', tone: 'warning' as const },
        { label: 'Quorum', value: '3 / 3', tone: 'success' as const },
        { label: 'Replication lag', value: '240 MB', tone: 'warning' as const },
        { label: 'Inter-node latency', value: '26 ms', tone: 'warning' as const },
      ];
    }
    return [
      { label: 'Mode', value: 'Healthy', tone: 'success' as const },
      { label: 'Quorum', value: '3 / 3', tone: 'success' as const },
      { label: 'Replication lag', value: '12 ms', tone: 'success' as const },
      { label: 'Inter-node latency', value: '8 ms', tone: 'success' as const },
    ];
  }, [clusterState]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ACTIVITY_ROWS;
    return ACTIVITY_ROWS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.event.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q),
    );
  }, [search]);

  const columns: ColumnDef<ActivityRow>[] = useMemo(
    () => [
      {
        accessorKey: 'severity',
        header: ({ column }) => <SortableHeader column={column}>Severity</SortableHeader>,
        cell: ({ row }) => {
          const sev = row.original.severity;
          const variant = sev === 'Major' ? 'destructive' : sev === 'Warning' ? 'secondary' : 'outline';
          return <Badge variant={variant}>{sev}</Badge>;
        },
      },
      {
        accessorKey: 'id',
        header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      {
        accessorKey: 'event',
        header: ({ column }) => <SortableHeader column={column}>Event</SortableHeader>,
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => <SortableHeader column={column}>Timestamp</SortableHeader>,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.timestamp}</span>,
      },
      {
        accessorKey: 'source',
        header: ({ column }) => <SortableHeader column={column}>Source</SortableHeader>,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.source}</span>,
      },
    ],
    [],
  );

  const statusLabel =
    clusterState === 'healthy'
      ? 'Healthy'
      : clusterState === 'failover'
        ? 'Failover in progress'
        : clusterState === 'disconnected'
          ? 'Standby down'
          : 'Standalone';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Redundancy</CardTitle>
              <CardDescription>High-availability cluster configuration and monitoring.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={clusterState === 'healthy' ? 'outline' : 'secondary'}>{statusLabel}</Badge>
              <Select value={clusterState} onValueChange={(v) => setClusterState(v as ClusterState)}>
                <SelectTrigger className="w-[170px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="failover">Failover</SelectItem>
                  <SelectItem value="disconnected">Standby down</SelectItem>
                  <SelectItem value="standalone">Standalone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {showBanner && clusterState !== 'healthy' && clusterState !== 'standalone' && (
        <Card className="border-warning/40">
          <CardContent className="py-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Icon name="warning" size={18} className="text-warning mt-0.5" />
              <div className="text-sm text-muted-foreground">
                {clusterState === 'disconnected'
                  ? 'Standby server is disconnected. Data is not synchronizing.'
                  : 'Server switched to standby. Replication is catching up.'}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowBanner(false)}>
              <Icon name="close" size={16} />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cluster topology</CardTitle>
            <CardDescription>Primary, standby, and observer health. Click a node for details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              {topologyKpis.map((kpi) => (
                <div key={kpi.label} className="rounded-md border bg-muted/10 p-2.5">
                  <div className="text-[11px] text-muted-foreground mb-1">{kpi.label}</div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone={kpi.tone} />
                    <div className="text-sm font-medium">{kpi.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <TopologyCanvas state={clusterState} focused={focusedNode} onFocus={setFocusedNode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Node details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-1">
                {focusedNode === 'active'
                  ? 'vSNET-WEST-01'
                  : focusedNode === 'standby'
                    ? 'vSNET-WEST-02'
                    : focusedNode === 'observer'
                      ? 'observer.corning.net'
                      : 'vSNET-PRIMARY'}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {focusedNode === 'active'
                  ? 'Primary node'
                  : focusedNode === 'standby'
                    ? 'Standby node'
                    : focusedNode === 'observer'
                      ? 'Quorum observer'
                      : 'Standalone node'}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {focusedNode === 'observer'
                  ? 'observer.corning.net'
                  : focusedNode === 'standalone'
                    ? '2001:4883:236::160:0:1'
                    : focusedNode === 'active'
                      ? '2001:4883:236::160:0:1'
                      : '2001:4883:236::160:0:2'}
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-3">Heartbeat & failover</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hb-freq">Heartbeat frequency (ms)</Label>
              <Input id="hb-freq" value={heartbeatMs} onChange={(e) => setHeartbeatMs(e.target.value)} className="w-32 font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hb-thresh">Missed heartbeat threshold</Label>
              <Input id="hb-thresh" value={missThreshold} onChange={(e) => setMissThreshold(e.target.value)} className="w-32 font-mono" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Automatic failover</div>
                <div className="text-xs text-muted-foreground">Promote standby when active is unreachable.</div>
              </div>
              <Switch checked={autoFailover} onCheckedChange={setAutoFailover} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save changes</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button size="sm" variant="outline">
                <Icon name="history" size={14} className="mr-1.5" />
                View logs
              </Button>
              {focusedNode !== 'observer' && focusedNode !== 'standalone' && (
                <Button size="sm" variant="outline">
                  <Icon name="sync" size={14} className="mr-1.5" />
                  Force resync
                </Button>
              )}
              {focusedNode === 'active' && (
                <Button size="sm" variant="outline">
                  <Icon name="swap_horiz" size={14} className="mr-1.5" />
                  Manual failover
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <CardTitle className="text-base">Activity log</CardTitle>
              <CardDescription>Recent cluster and replication events.</CardDescription>
            </div>
            <div className="sm:ml-auto w-full sm:w-auto">
              <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredRows} getRowId={(r) => r.id} />
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Icon } from './Icon';

const TYPES = {
  SWITCH: 'switch',
  ENDPOINT: 'endpoint',
  AUXILIARY: 'auxiliary',
  NON_STANDARD: 'non_standard',
} as const;

const STATUS = { ONLINE: 'online', WARNING: 'warning', OFFLINE: 'offline' } as const;

type NodeType = (typeof TYPES)[keyof typeof TYPES];
type StatusType = (typeof STATUS)[keyof typeof STATUS];

interface TopoNode {
  id: string;
  type: NodeType;
  label: string;
  sub: string;
  status: StatusType;
  serial: string;
  detail?: string;
}

interface TopoLink {
  source: string;
  target: string;
  speed?: string;
}

const DAS_NODES: TopoNode[] = [
  { id: 'heu', type: TYPES.SWITCH, label: 'HEU-400-A', sub: 'Head-end unit', status: STATUS.ONLINE, serial: 'HEU-2024-00147', detail: '10G fiber uplink' },
  { id: 'ps', type: TYPES.AUXILIARY, label: 'PS-48V-R-01', sub: 'Power supply', status: STATUS.ONLINE, serial: 'PS-2024-10044' },
  { id: 'sfp', type: TYPES.NON_STANDARD, label: 'SFP-10G-SR-01', sub: 'Optical transceiver', status: STATUS.WARNING, serial: 'OT-2024-44210', detail: 'In maintenance' },
  { id: 'eh', type: TYPES.SWITCH, label: 'EH-100-A', sub: 'Expansion hub', status: STATUS.ONLINE, serial: 'EH-2024-00512' },
  { id: 'ru1', type: TYPES.ENDPOINT, label: 'RU-200-01', sub: 'Remote unit', status: STATUS.ONLINE, serial: 'RU-2024-03281' },
  { id: 'ru2', type: TYPES.ENDPOINT, label: 'RU-200-02', sub: 'Remote unit', status: STATUS.ONLINE, serial: 'RU-2024-03282' },
  { id: 'ru3', type: TYPES.ENDPOINT, label: 'RU-200-03', sub: 'Remote unit', status: STATUS.OFFLINE, serial: 'RU-2024-03290', detail: 'Disconnected' },
];

const DAS_LINKS: TopoLink[] = [
  { source: 'heu', target: 'ps', speed: 'DC power' },
  { source: 'heu', target: 'sfp', speed: '10G fiber' },
  { source: 'heu', target: 'eh', speed: '10 Gbps' },
  { source: 'eh', target: 'ru1', speed: '1 Gbps' },
  { source: 'eh', target: 'ru2', speed: '1 Gbps' },
  { source: 'eh', target: 'ru3', speed: '1 Gbps' },
];

function buildAdjacency(nodes: TopoNode[], links: TopoLink[]) {
  const children: Record<string, string[]> = {};
  const parents: Record<string, string | null> = {};
  nodes.forEach((n) => { children[n.id] = []; parents[n.id] = null; });
  links.forEach((l) => { children[l.source].push(l.target); parents[l.target] = l.source; });
  return { children, parents };
}

function computeLayout(nodes: TopoNode[], links: TopoLink[]) {
  const { children, parents } = buildAdjacency(nodes, links);
  const root = nodes.find((n) => parents[n.id] === null);
  if (!root) return { positions: {} as Record<string, { x: number; y: number }>, children, parents };
  const positions: Record<string, { x: number; y: number }> = {};
  const XGAP = 160;
  const YGAP = 36;

  function layout(id: string, depth: number, yOffset: number): number {
    const kids = children[id];
    if (!kids.length) {
      positions[id] = { x: depth * XGAP, y: yOffset };
      return yOffset + YGAP;
    }
    const startY = yOffset;
    let cur = yOffset;
    kids.forEach((kid) => { cur = layout(kid, depth + 1, cur); });
    positions[id] = { x: depth * XGAP, y: (startY + cur - YGAP) / 2 };
    return cur;
  }
  layout(root.id, 0, 20);
  return { positions, children, parents };
}

function useColors() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return useMemo(() => ({
    online: isDark ? '#4ADE80' : '#009B3A',
    onlineStroke: isDark ? '#22C55E' : '#007A2E',
    warning: isDark ? '#FACC15' : '#EAB308',
    warningStroke: isDark ? '#EAB308' : '#CA8A04',
    offline: isDark ? '#94A3B8' : '#9CA3AF',
    offlineStroke: isDark ? '#64748B' : '#6B7280',
    link: isDark ? '#475569' : '#CBD5E1',
    linkHover: isDark ? '#38BDF8' : '#3498db',
    bg: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#F8FAFC' : '#1E293B',
    textMuted: isDark ? '#94A3B8' : '#64748B',
    tooltipBg: isDark ? '#0F172A' : '#1E293B',
    tooltipText: isDark ? '#E2E8F0' : '#E2E8F0',
  }), [isDark]);
}

function getStatusColors(status: StatusType, colors: ReturnType<typeof useColors>) {
  if (status === STATUS.ONLINE) return { fill: colors.online, stroke: colors.onlineStroke };
  if (status === STATUS.WARNING) return { fill: colors.warning, stroke: colors.warningStroke };
  return { fill: colors.offline, stroke: colors.offlineStroke };
}

function NodeShape({ node, pos, colors, hovered, onHover, onLeave, showLabels }: {
  node: TopoNode; pos: { x: number; y: number }; colors: ReturnType<typeof useColors>;
  hovered: string | null; onHover: (id: string) => void; onLeave: () => void; showLabels: boolean;
}) {
  const { fill, stroke } = getStatusColors(node.status, colors);
  const isHovered = hovered === node.id;
  const showLabel = showLabels || isHovered;

  const shape = (() => {
    switch (node.type) {
      case TYPES.SWITCH:
        return <rect x={-18} y={-7} width={36} height={14} rx={2} fill={fill} stroke={stroke} strokeWidth={1.5} />;
      case TYPES.ENDPOINT:
        return <circle r={8} fill={node.status === STATUS.OFFLINE ? 'none' : fill} stroke={stroke} strokeWidth={1.5} />;
      case TYPES.AUXILIARY:
        return <rect x={-8} y={-8} width={16} height={16} fill={fill} stroke={stroke} strokeWidth={1.5} />;
      case TYPES.NON_STANDARD:
        return <polygon points="0,-10 10,0 0,10 -10,0" fill={colors.bg} stroke={stroke} strokeWidth={1.5} />;
      default:
        return null;
    }
  })();

  const labelX = node.type === TYPES.SWITCH ? 22 : node.type === TYPES.ENDPOINT ? 12 : 14;

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      style={{ cursor: 'default' }}
    >
      {isHovered && <circle r={16} fill={colors.linkHover} opacity={0.12} />}
      {shape}
      {showLabel && (
        <text
          x={labelX} y={4}
          fontSize={9} fontFamily="var(--font-sans, system-ui, sans-serif)"
          fill={isHovered ? colors.text : colors.textMuted}
          fontWeight={isHovered ? 600 : 400}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {node.label}
        </text>
      )}
    </g>
  );
}

function NodeTooltip({ node, colors }: { node: TopoNode | null; colors: ReturnType<typeof useColors> }) {
  if (!node) return null;
  const { fill } = getStatusColors(node.status, colors);
  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'absolute', bottom: 12, left: 12,
        background: colors.tooltipBg, color: colors.tooltipText,
        borderRadius: 6, padding: '8px 12px', fontSize: 11,
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        lineHeight: 1.7, minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{node.label}</div>
      <div>{node.sub}</div>
      <div>Status: <span style={{ color: fill }}>● {node.status}</span></div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, opacity: 0.7 }}>{node.serial}</div>
      {node.detail && <div style={{ marginTop: 2, opacity: 0.7 }}>{node.detail}</div>}
    </div>
  );
}

export function DasTopology() {
  const colors = useColors();
  const [showLabels, setShowLabels] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 40, y: 20, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { positions } = useMemo(() => computeLayout(DAS_NODES, DAS_LINKS), []);
  const nodeMap = useMemo(() => Object.fromEntries(DAS_NODES.map((n) => [n.id, n])), []);
  const hoveredNode = hovered ? nodeMap[hovered] ?? null : null;

  const bounds = useMemo(() => {
    const xs = Object.values(positions).map((p) => p.x);
    const ys = Object.values(positions).map((p) => p.y);
    const pad = 40;
    return {
      minX: Math.min(...xs) - pad,
      minY: Math.min(...ys) - pad,
      maxX: Math.max(...xs) + pad + 80,
      maxY: Math.max(...ys) + pad + 20,
    };
  }, [positions]);

  const initialTransform = useMemo(() => {
    if (!size.width || !size.height) return { x: 40, y: 20, scale: 1 };
    const contentW = bounds.maxX - bounds.minX;
    const contentH = bounds.maxY - bounds.minY;
    const scale = Math.min(size.width / contentW, size.height / contentH, 2);
    const x = (size.width - contentW * scale) / 2 - bounds.minX * scale;
    const y = (size.height - contentH * scale) / 2 - bounds.minY * scale;
    return { x, y, scale };
  }, [size, bounds]);

  const fitToView = useCallback(() => {
    setTransform(initialTransform);
  }, [initialTransform]);

  const hasAutoFit = useRef(false);
  useEffect(() => {
    if (size.width > 0 && size.height > 0 && !hasAutoFit.current) {
      hasAutoFit.current = true;
      setTransform(initialTransform);
    }
  }, [size, initialTransform]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);
  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTransform((t) => ({ ...t, scale: Math.max(0.3, Math.min(3, t.scale * (e.deltaY < 0 ? 1.1 : 0.9))) }));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 'calc(100vh - 320px)', minHeight: 260 }}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch id="das-labels" checked={showLabels} onCheckedChange={setShowLabels} className="scale-90" />
          <Label htmlFor="das-labels" className="text-xs text-muted-foreground cursor-pointer">Labels</Label>
        </div>
        <Button variant="outline" size="sm" onClick={fitToView}>
          <Icon name="fit_screen" size={14} className="mr-1" />
          Reset
        </Button>
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Links */}
          {DAS_LINKS.map((l) => {
            const s = positions[l.source];
            const t = positions[l.target];
            if (!s || !t) return null;
            const mx = (s.x + t.x) / 2;
            const targetNode = nodeMap[l.target];
            const isDown = targetNode?.status === STATUS.OFFLINE;
            const isLinkHovered = hovered === l.source || hovered === l.target;
            return (
              <path
                key={`${l.source}-${l.target}`}
                d={`M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${t.x} ${t.y}`}
                fill="none"
                stroke={isDown ? colors.offline : isLinkHovered ? colors.linkHover : colors.link}
                strokeWidth={isLinkHovered ? 1.5 : 0.9}
                strokeDasharray={isDown ? '3 2' : 'none'}
                style={{ pointerEvents: 'none' }}
              />
            );
          })}

          {/* Nodes */}
          {DAS_NODES.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            return (
              <NodeShape
                key={node.id}
                node={node}
                pos={pos}
                colors={colors}
                hovered={hovered}
                onHover={setHovered}
                onLeave={() => setHovered(null)}
                showLabels={showLabels}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      <NodeTooltip node={hoveredNode} colors={colors} />

      {/* Legend */}
      <div className="absolute top-3 left-3 rounded-lg border bg-card text-card-foreground shadow-sm px-3 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">Legend</p>
        <div className="flex flex-col gap-2">
          {[
            { shape: <rect x={1} y={2} width={20} height={10} rx={2} fill={colors.online} stroke={colors.onlineStroke} strokeWidth={1} />, label: 'Switch / Hub' },
            { shape: <circle cx={7} cy={7} r={6} fill={colors.online} stroke={colors.onlineStroke} strokeWidth={1} />, label: 'Remote unit' },
            { shape: <rect x={1} y={1} width={12} height={12} fill={colors.online} stroke={colors.onlineStroke} strokeWidth={1} />, label: 'Auxiliary' },
            { shape: <polygon points="7,0 14,7 7,14 0,7" fill={colors.bg} stroke={colors.warningStroke} strokeWidth={1.5} />, label: 'Alerting' },
            { shape: <circle cx={7} cy={7} r={6} fill="none" stroke={colors.offlineStroke} strokeWidth={1.5} strokeDasharray="3 2" />, label: 'Offline' },
          ].map(({ shape, label }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <svg width={22} height={14} className="shrink-0">{shape}</svg>
              <span className="text-xs text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

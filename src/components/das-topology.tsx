// @ts-nocheck
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Airspan DAS Device Types ─────────────────────────────────────────────────
// MA 6000: RIU → DCU → DEU → dLRU / dMRU / dHRU
// MA 6200: AUC (+ACM) → EU / EUG → N2RU / M2RU / H2RU / N3RU / M3RU
const T = {
  // MA 6000 head-end
  RIU:   "riu",
  DCU:   "dcu",
  DEU:   "deu",
  // MA 6000 remotes
  dLRU:  "dlru",
  dMRU:  "dmru",
  dHRU:  "dhru",

  // MA 6200 head-end
  AUC:   "auc",
  EU:    "eu",
  EUG:   "eug",
  // MA 6200 remotes
  N2RU:  "n2ru",
  M2RU:  "m2ru",
  H2RU:  "h2ru",
  N3RU:  "n3ru",
  M3RU:  "m3ru",
};

const STATUS = { ONLINE: "online", DEGRADED: "degraded", OFFLINE: "offline" };

const TYPE_META = {
  [T.RIU]:  { label: "RIU",   desc: "Radio Interface Unit",       family: "MA6000", tier: "head-end",    color: "var(--chart-1)",  glow: "var(--chart-1)" },
  [T.DCU]:  { label: "DCU",   desc: "Digital Conversion Unit",    family: "MA6000", tier: "head-end",    color: "var(--chart-1)",  glow: "var(--chart-1)" },
  [T.DEU]:  { label: "DEU",   desc: "Distributed Extension Unit", family: "MA6000", tier: "distribution",color: "var(--chart-2)",  glow: "var(--chart-2)" },
  [T.dLRU]: { label: "dLRU",  desc: "Digital Low-Power Remote",   family: "MA6000", tier: "remote",      color: "var(--chart-3)",  glow: "var(--chart-3)" },
  [T.dMRU]: { label: "dMRU",  desc: "Digital Mid-Power Remote",   family: "MA6000", tier: "remote",      color: "var(--chart-4)",  glow: "var(--chart-4)" },
  [T.dHRU]: { label: "dHRU",  desc: "Digital High-Power Remote",  family: "MA6000", tier: "remote",      color: "var(--chart-5)",  glow: "var(--chart-5)" },
  [T.AUC]:  { label: "AUC",   desc: "Access Unit Chassis",        family: "MA6200", tier: "head-end",    color: "var(--chart-6)",  glow: "var(--chart-6)" },
  [T.EU]:   { label: "EU",    desc: "Expansion Unit",             family: "MA6200", tier: "distribution",color: "var(--chart-7)",  glow: "var(--chart-7)" },
  [T.EUG]:  { label: "EUG",   desc: "Expansion Unit Gateway",     family: "MA6200", tier: "distribution",color: "var(--chart-8)",  glow: "var(--chart-8)" },
  [T.N2RU]: { label: "N2RU",  desc: "Low-Power Remote (2nd gen)", family: "MA6200", tier: "remote",      color: "var(--chart-9)",  glow: "var(--chart-9)" },
  [T.M2RU]: { label: "M2RU",  desc: "Mid-Power Remote (2nd gen)", family: "MA6200", tier: "remote",      color: "var(--chart-10)", glow: "var(--chart-10)" },
  [T.H2RU]: { label: "H2RU",  desc: "High-Power Remote (2nd gen)",family: "MA6200", tier: "remote",      color: "var(--chart-4)",  glow: "var(--chart-4)" },
  [T.N3RU]: { label: "N3RU",  desc: "Low-Power Remote (3rd gen)", family: "MA6200", tier: "remote",      color: "var(--chart-3)",  glow: "var(--chart-3)" },
  [T.M3RU]: { label: "M3RU",  desc: "Mid-Power Remote (3rd gen)", family: "MA6200", tier: "remote",      color: "var(--chart-5)",  glow: "var(--chart-5)" },
};

const S_COLOR = {
  online: "var(--success)",
  degraded: "var(--warning)",
  offline: "var(--destructive)",
};

function mapStatusToInventory(status) {
  if (status === STATUS.ONLINE) return "Connected";
  if (status === STATUS.OFFLINE) return "Disconnected";
  return "In maintenance";
}

function generateTopology() {
  let id = 1;
  const mkId = () => `n${id++}`;
  const nodes = [], links = [];

  const add  = (n) => { nodes.push(n); return n; };
  const link = (s, t, extra = {}) => links.push({ source: s.id, target: t.id, medium: "fiber", ...extra });

  const riu1 = add({ id: mkId(), type: T.RIU, label: "RIU-A1", status: STATUS.ONLINE, model: "RIU-700/AWS", band: "700 MHz / AWS", protocol: "RF → CPRI", location: "Head-end rack", txPower: "—" });
  const riu2 = add({ id: mkId(), type: T.RIU, label: "RIU-A2", status: STATUS.ONLINE, model: "RIU-2500",    band: "2500 MHz TDD",  protocol: "RF → CPRI", location: "Head-end rack", txPower: "—" });

  const dcu  = add({ id: mkId(), type: T.DCU, label: "DCU-01",  status: STATUS.ONLINE, model: "DCU-6000", band: "600–4000 MHz", protocol: "CPRI", location: "Head-end rack", txPower: "—" });
  link(riu1, dcu, { medium: "RF coax",  label: "RF" });
  link(riu2, dcu, { medium: "RF coax",  label: "RF" });

  const deu1 = add({ id: mkId(), type: T.DEU, label: "DEU-FL1", status: STATUS.ONLINE, model: "DEU-6000-G2", location: "Floor 1 IDF", protocol: "CPRI", txPower: "—", ports: "8× fiber" });
  const deu2 = add({ id: mkId(), type: T.DEU, label: "DEU-FL2", status: STATUS.DEGRADED, model: "DEU-6000-G2", location: "Floor 2 IDF", protocol: "CPRI", txPower: "—", ports: "8× fiber" });
  const deu3 = add({ id: mkId(), type: T.DEU, label: "DEU-FL3", status: STATUS.ONLINE, model: "DEU-6000-G2", location: "Floor 3 IDF", protocol: "CPRI", txPower: "—", ports: "8× fiber" });
  link(dcu, deu1, { medium: "fiber", label: "CPRI" });
  link(dcu, deu2, { medium: "fiber", label: "CPRI" });
  link(dcu, deu3, { medium: "fiber", label: "CPRI" });

  [
    { type: T.dLRU, label: "dLRU-101", txPower: "27 dBm", mimo: "2×2", band: "700 MHz", location: "Rm 101" },
    { type: T.dLRU, label: "dLRU-102", txPower: "27 dBm", mimo: "2×2", band: "700 MHz", location: "Rm 102" },
    { type: T.dMRU, label: "dMRU-103", txPower: "38 dBm", mimo: "2×2", band: "AWS",     location: "Lobby A" },
    { type: T.dHRU, label: "dHRU-104", txPower: "45 dBm", mimo: "2×2", band: "Multi",   location: "Atrium" },
  ].forEach(r => { const n = add({ id: mkId(), status: STATUS.ONLINE, model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(deu1, n, { medium: "fiber" }); });

  [
    { type: T.dLRU, label: "dLRU-201", txPower: "27 dBm", mimo: "2×2", band: "700 MHz", location: "Rm 201", status: STATUS.OFFLINE },
    { type: T.dMRU, label: "dMRU-202", txPower: "38 dBm", mimo: "2×2", band: "AWS",     location: "Rm 202", status: STATUS.DEGRADED },
    { type: T.dHRU, label: "dHRU-203", txPower: "45 dBm", mimo: "2×2", band: "Multi",   location: "Hall B",  status: STATUS.ONLINE },
  ].forEach(r => { const n = add({ id: mkId(), model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(deu2, n, { medium: "fiber" }); });

  [
    { type: T.dLRU, label: "dLRU-301", txPower: "27 dBm", mimo: "2×2", band: "700 MHz", location: "Rm 301" },
    { type: T.dMRU, label: "dMRU-302", txPower: "38 dBm", mimo: "2×2", band: "2500",    location: "Rm 302" },
    { type: T.dMRU, label: "dMRU-303", txPower: "38 dBm", mimo: "2×2", band: "2500",    location: "Conf C" },
    { type: T.dHRU, label: "dHRU-304", txPower: "45 dBm", mimo: "2×2", band: "Multi",   location: "Lobby B" },
  ].forEach(r => { const n = add({ id: mkId(), status: STATUS.ONLINE, model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(deu3, n, { medium: "fiber" }); });

  const auc = add({ id: mkId(), type: T.AUC, label: "AUC-01", status: STATUS.ONLINE, model: "MA6200-AUC", location: "MDF / Head-end", protocol: "CPRI", txPower: "—", slots: "16-slot chassis" });

  const eu1 = add({ id: mkId(), type: T.EU,  label: "EU-FL4",  status: STATUS.ONLINE,   model: "EU-6200",  location: "Floor 4 IDF", protocol: "CPRI", txPower: "—", ports: "4× fiber" });
  const eug = add({ id: mkId(), type: T.EUG, label: "EUG-FL5", status: STATUS.ONLINE,   model: "EUG-6200", location: "Floor 5 IDF", protocol: "CPRI", txPower: "—", ports: "10G/25G optical" });
  const eu2 = add({ id: mkId(), type: T.EU,  label: "EU-FL6",  status: STATUS.DEGRADED, model: "EU-6200",  location: "Floor 6 IDF", protocol: "CPRI", txPower: "—", ports: "4× fiber" });
  link(auc, eu1, { medium: "fiber", label: "CPRI" });
  link(auc, eug, { medium: "fiber", label: "CPRI 25G" });
  link(auc, eu2, { medium: "fiber", label: "CPRI" });

  [
    { type: T.N2RU, label: "N2RU-401", txPower: "24 dBm", mimo: "2×2", band: "700/AWS", location: "Rm 401" },
    { type: T.M2RU, label: "M2RU-402", txPower: "33 dBm", mimo: "2×2", band: "AWS/2500",location: "Rm 402" },
    { type: T.N2RU, label: "N2RU-403", txPower: "24 dBm", mimo: "2×2", band: "700",     location: "Rm 403" },
  ].forEach(r => { const n = add({ id: mkId(), status: STATUS.ONLINE, model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(eu1, n, { medium: "fiber" }); });

  [
    { type: T.H2RU, label: "H2RU-501", txPower: "43 dBm", mimo: "SISO", band: "Low/Mid",  location: "Concourse" },
    { type: T.N3RU, label: "N3RU-502", txPower: "24 dBm", mimo: "2×2",  band: "3.5 TDD",  location: "Rm 501" },
    { type: T.N3RU, label: "N3RU-503", txPower: "24 dBm", mimo: "2×2",  band: "3.7 TDD",  location: "Rm 502" },
    { type: T.M3RU, label: "M3RU-504", txPower: "33 dBm", mimo: "SISO", band: "Low/Mid",  location: "Lobby C" },
    { type: T.H2RU, label: "H2RU-505", txPower: "43 dBm", mimo: "SISO", band: "Multi",    location: "Arena" },
  ].forEach(r => { const n = add({ id: mkId(), status: STATUS.ONLINE, model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(eug, n, { medium: "fiber 25G" }); });

  [
    { type: T.N2RU, label: "N2RU-601", txPower: "24 dBm", mimo: "2×2",  band: "700", location: "Rm 601", status: STATUS.OFFLINE },
    { type: T.M3RU, label: "M3RU-602", txPower: "33 dBm", mimo: "SISO", band: "Mid", location: "Rm 602", status: STATUS.DEGRADED },
    { type: T.N3RU, label: "N3RU-603", txPower: "24 dBm", mimo: "2×2",  band: "3.5", location: "Rm 603", status: STATUS.ONLINE },
  ].forEach(r => { const n = add({ id: mkId(), model: TYPE_META[r.type].label, protocol: "CPRI", ...r }); link(eu2, n, { medium: "fiber" }); });

  return { nodes, links };
}

export function getDasTopologyInventoryRows() {
  const { nodes } = generateTopology();
  return nodes.map((n) => ({
    id: n.id,
    name: n.label,
    type: TYPE_META[n.type]?.desc || n.type,
    status: mapStatusToInventory(n.status),
    serial: n.model || n.id.toUpperCase(),
  }));
}

function buildAdj(nodes, links) {
  const children = {}, parents = {};
  nodes.forEach(n => { children[n.id] = []; parents[n.id] = null; });
  links.forEach(l => { children[l.source].push(l.target); parents[l.target] = l.source; });
  return { children, parents };
}

function getDescendants(id, children) {
  const r = new Set(), s = [...(children[id]||[])];
  while (s.length) { const c = s.pop(); r.add(c); (children[c]||[]).forEach(x => s.push(x)); }
  return r;
}

function computeLayout(nodes, links, collapsed) {
  const { children, parents } = buildAdj(nodes, links);
  const positions = {};
  const XGAP = 195, YGAP = 36;
  const roots = nodes.filter(n => parents[n.id] === null);
  let y = 20;
  function layout(id, depth) {
    const kids = collapsed.has(id) ? [] : children[id];
    if (!kids.length) { positions[id] = { x: depth * XGAP, y }; y += YGAP; return; }
    const sy = y;
    kids.forEach(k => layout(k, depth + 1));
    positions[id] = { x: depth * XGAP, y: (sy + y - YGAP) / 2 };
  }
  roots.forEach(r => layout(r.id, 0));
  return { positions, children, parents };
}

function DasNodeShape({ node, pos, showLabel, onHover, onLeave, hovered, collapsed, hasChildren, onClick, animatingIds }) {
  const meta = TYPE_META[node.type] || {};
  const fill   = meta.color  || "#94a3b8";
  const stroke = meta.glow   || "#64748b";
  const isHov  = hovered === node.id;
  const isColl = collapsed.has(node.id);
  const isAnim = animatingIds.has(node.id);
  const sc     = S_COLOR[node.status] || "#6b7280";

  const shape = () => {
    if (node.type === T.RIU)
      return <rect x={-13} y={-13} width={26} height={26} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.DCU)
      return <rect x={-24} y={-8} width={48} height={16} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.AUC)
      return <g>
        <rect x={-22} y={-14} width={44} height={28} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />
        {[1,2,3].map(i => <line key={i} x1={-18} y1={-9+i*7} x2={18} y2={-9+i*7} stroke={stroke} strokeWidth={0.6} opacity={0.5} />)}
      </g>;
    if (node.type === T.DEU || node.type === T.EU || node.type === T.EUG)
      return <rect x={-20} y={-9} width={40} height={18} rx={9} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    const r = node.type===T.dHRU||node.type===T.H2RU ? 13 : node.type===T.dMRU||node.type===T.M2RU||node.type===T.M3RU ? 10 : 8;
    return <circle r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  };

  const isCircle = [T.dLRU,T.dMRU,T.dHRU,T.N2RU,T.M2RU,T.H2RU,T.N3RU,T.M3RU].includes(node.type);
  const r = node.type===T.dHRU||node.type===T.H2RU ? 13 : node.type===T.dMRU||node.type===T.M2RU||node.type===T.M3RU ? 10 : 8;
  const lx = isCircle ? r + 4 : node.type===T.DCU ? 28 : node.type===T.AUC ? 26 : 24;

  return (
    <g transform={`translate(${pos.x},${pos.y})`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      onClick={e => { e.stopPropagation(); if (hasChildren) onClick(node.id); }}
      style={{ cursor: hasChildren ? "pointer" : "default" }}>

      {isHov && <circle r={22} fill={`${fill}20`} />}

      {isAnim && (
        <circle r={20} fill="none" stroke={fill} strokeWidth={2} opacity={0.6}>
          <animate attributeName="r" values="16;28;16" dur="0.5s" repeatCount="2" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="0.5s" repeatCount="2" />
        </circle>
      )}

      {shape()}

      <circle cx={isCircle ? r-2 : 14} cy={isCircle ? -r+2 : -10} r={3.5} fill={sc} stroke="#0f172a" strokeWidth={1} />

      {isColl && hasChildren && (
        <g transform="translate(18,-16)">
          <circle r={8} fill="#6366f1" stroke="#4338ca" strokeWidth={1} />
          <text x={0} y={3.5} fontSize={11} fill="#fff" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700">+</text>
        </g>
      )}
      {!isColl && hasChildren && isHov && (
        <g transform="translate(18,-16)">
          <circle r={8} fill="#334155" stroke="#475569" strokeWidth={1} opacity={0.9} />
          <text x={0} y={3.5} fontSize={10} fill="#94a3b8" textAnchor="middle" fontFamily="monospace">−</text>
        </g>
      )}

      {showLabel && (
        <text x={lx} y={4} fontSize={9.5} fontFamily="ui-monospace, monospace"
          fill={isHov ? "#f1f5f9" : "#94a3b8"} fontWeight={isHov ? "600" : "400"}
          style={{ userSelect: "none", pointerEvents: "none" }}>
          {node.label}{isColl ? " ▶" : ""}
        </text>
      )}
    </g>
  );
}

export function DasTopology({ searchQuery = "", statusFilter = "All", typeFilter = "All" }: { searchQuery?: string; statusFilter?: string; typeFilter?: string }) {
  const { nodes, links } = useMemo(() => generateTopology(), []);
  const [collapsed, setCollapsed]   = useState(new Set());
  const [animating, setAnimating]   = useState(new Set());
  const [showLabels, setShowLabels] = useState(false);
  const search = searchQuery.trim();
  const [hovered, setHovered]       = useState(null);
  const [hovLink, setHovLink]       = useState(null);
  const [linkPos, setLinkPos]       = useState(null);
  const [xf, setXf]                 = useState({ x: 70, y: 30, scale: 1 });
  const svgRef  = useRef(null);
  const panning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const { positions, children } = useMemo(() => computeLayout(nodes, links, collapsed), [nodes, links, collapsed]);
  const hiddenIds = useMemo(() => { const h = new Set(); collapsed.forEach(id => getDescendants(id, children).forEach(d => h.add(d))); return h; }, [collapsed, children]);
  const visNodes  = useMemo(() => nodes.filter(n => !hiddenIds.has(n.id)), [nodes, hiddenIds]);
  const visLinks  = useMemo(() => links.filter(l => !hiddenIds.has(l.source) && !hiddenIds.has(l.target)), [links, hiddenIds]);

  const filterMatchIds = useMemo(() => {
    const q = search.toLowerCase();
    const normalizedStatus = statusFilter.toLowerCase();
    return new Set(visNodes.filter((n) => {
      const matchesSearch = !q ||
        n.label.toLowerCase().includes(q) ||
        n.location?.toLowerCase().includes(q) ||
        n.band?.toLowerCase().includes(q) ||
        TYPE_META[n.type]?.desc?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || n.status === normalizedStatus;
      const matchesType = typeFilter === "All" || TYPE_META[n.type]?.label === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    }).map((n) => n.id));
  }, [search, statusFilter, typeFilter, visNodes]);

  const filteredNodes = useMemo(
    () => visNodes.filter((n) => filterMatchIds.has(n.id)),
    [visNodes, filterMatchIds]
  );
  const nodeById = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const filteredLinks = useMemo(
    () => visLinks.filter((l) => filterMatchIds.has(l.source) && filterMatchIds.has(l.target)),
    [visLinks, filterMatchIds]
  );

  const toggleCollapse = useCallback((id) => {
    setAnimating(p => { const n = new Set(p); n.add(id); return n; });
    setTimeout(() => setAnimating(p => { const n = new Set(p); n.delete(id); return n; }), 700);
    setCollapsed(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const hovNode = useMemo(() => hovered ? nodes.find(n => n.id === hovered) : null, [hovered, nodes]);

  const total   = filteredNodes.length;
  const hidden  = hiddenIds.size;
  const online  = filteredNodes.filter(n => n.status === STATUS.ONLINE).length;
  const degraded= filteredNodes.filter(n => n.status === STATUS.DEGRADED).length;
  const offline = filteredNodes.filter(n => n.status === STATUS.OFFLINE).length;

  const onMD = useCallback(e => { if (e.button!==0) return; panning.current=true; lastMouse.current={x:e.clientX,y:e.clientY}; }, []);
  const onMM = useCallback(e => {
    if (!panning.current) return;
    const dx=e.clientX-lastMouse.current.x, dy=e.clientY-lastMouse.current.y;
    lastMouse.current={x:e.clientX,y:e.clientY};
    setXf(t=>({...t,x:t.x+dx,y:t.y+dy}));
  }, []);
  const onMU = useCallback(() => { panning.current=false; }, []);
  const onWheel = useCallback(e => { e.preventDefault(); setXf(t=>({...t,scale:Math.max(0.15,Math.min(4,t.scale*(e.deltaY<0?1.1:0.9)))})); }, []);
  useEffect(() => { const svg=svgRef.current; if(!svg) return; svg.addEventListener("wheel",onWheel,{passive:false}); return ()=>svg.removeEventListener("wheel",onWheel); }, [onWheel]);

  return (
    <TooltipProvider>
    <div className="bg-slate-950 text-slate-100 flex flex-col h-[calc(100vh-320px)] min-h-[420px]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div className="flex items-center gap-5 px-4 py-2 bg-slate-900 border-b border-slate-800 flex-wrap shadow-xl">
        <span className="text-xs text-slate-400">
          {total} devices {hidden>0 && <span className="text-indigo-400">· {hidden} hidden</span>}
        </span>

        <div className="flex gap-3 text-xs">
          <span style={{ color: S_COLOR.online }}>● {online} online</span>
          <span style={{ color: S_COLOR.degraded }}>● {degraded} degraded</span>
          <span style={{ color: S_COLOR.offline }}>● {offline} offline</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {collapsed.size > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCollapsed(new Set())}
              className="h-7 text-xs">
              Expand all ({collapsed.size})
            </Button>
          )}
          <div className="flex items-center gap-2.5">
            <Switch id="labels" checked={showLabels} onCheckedChange={setShowLabels} className="scale-75 data-[state=checked]:bg-indigo-500" />
            <Label htmlFor="labels" className="text-xs text-slate-400 cursor-pointer">Labels</Label>
          </div>
          <div className="flex gap-2">
          <div className="inline-flex items-center rounded-md border border-input bg-transparent shadow-sm">
            {[0.5, 1, 1.5, 2].map((s) => {
              const isActive = Math.abs(xf.scale - s) < 0.01;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setXf((t) => ({ ...t, scale: s }))}
                  className={`h-7 w-9 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {s}x
                </button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => setXf({x:70,y:30,scale:1})} className="h-7 text-xs">
            Reset
          </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <svg ref={svgRef} style={{ width:"100%", height:"100%", cursor:"grab" }}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>

          <defs>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${xf.x},${xf.y}) scale(${xf.scale})`}>
            {filteredLinks.map((l, i) => {
              const s = positions[l.source], t = positions[l.target];
              if (!s||!t) return null;
              const isHovSrc = hovered===l.source||hovered===l.target;
              const isLH  = hovLink===i;
              const mx    = (s.x+t.x)/2;
              const d     = `M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${t.x} ${t.y}`;
              const sourceStatus = nodeById[l.source]?.status;
              const targetStatus = nodeById[l.target]?.status;
              const baseLinkColor =
                sourceStatus === STATUS.OFFLINE || targetStatus === STATUS.OFFLINE
                  ? S_COLOR.offline
                  : sourceStatus === STATUS.DEGRADED || targetStatus === STATUS.DEGRADED
                    ? S_COLOR.degraded
                    : S_COLOR.online;
              const lc = isLH || isHovSrc ? "var(--primary)" : baseLinkColor;
              const isDashed = l.medium?.includes("25G");
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={14}
                    onMouseEnter={e=>{setHovLink(i);setLinkPos({x:e.clientX,y:e.clientY});}}
                    onMouseMove={e=>setLinkPos({x:e.clientX,y:e.clientY})}
                    onMouseLeave={()=>{setHovLink(null);setLinkPos(null);}}
                    style={{cursor:"crosshair"}}/>
                  <path d={d} fill="none" stroke={lc}
                    strokeWidth={isLH?2.5:isHovSrc?2:1.2}
                    strokeDasharray={isDashed?"6 3":undefined}
                    opacity={isLH?1:0.65}
                    style={{pointerEvents:"none",transition:"stroke 0.2s, stroke-width 0.2s"}}/>
                </g>
              );
            })}

            {filteredNodes.map(node => {
              const pos=positions[node.id]; if(!pos) return null;
              const hasKids=(children[node.id]||[]).length>0;
              return (
                <g key={node.id} opacity={1} style={{transition:"opacity 0.3s"}}>
                  <DasNodeShape node={node} pos={pos} showLabel={showLabels}
                    onHover={setHovered} onLeave={()=>setHovered(null)}
                    hovered={hovered} collapsed={collapsed}
                    hasChildren={hasKids} onClick={toggleCollapse}
                    animatingIds={animating}/>
                </g>
              );
            })}
          </g>
        </svg>

        {hovNode && (() => {
          const meta = TYPE_META[hovNode.type] || {};
          const hasKids = (children[hovNode.id]||[]).length > 0;
          return (
            <Card className="absolute bottom-4 left-4 bg-slate-900 border-slate-700 shadow-2xl w-72 pointer-events-none">
              <CardContent className="p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{hovNode.label}</span>
                  <Badge className="text-[9px] px-1.5 h-4 border-0"
                    style={{ background: meta.color+"22", color: meta.color, border: `1px solid ${meta.color}44` }}>
                    {meta.label}
                  </Badge>
                  <Badge
                    className="text-[9px] px-1.5 h-4 border-0 ml-auto"
                    style={{
                      color: S_COLOR[hovNode.status] || "var(--muted-foreground)",
                      backgroundColor: `color-mix(in srgb, ${S_COLOR[hovNode.status] || "var(--muted-foreground)"} 18%, transparent)`,
                    }}
                  >
                    {hovNode.status}
                  </Badge>
                </div>

                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-200">{meta.desc}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Family</span>
                  <span style={{color: meta.color}}>{meta.family} · {meta.tier}</span>
                </div>
                {hovNode.model    && <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="font-mono text-slate-200">{hovNode.model}</span></div>}
                {hovNode.location && <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="text-slate-200">{hovNode.location}</span></div>}
                {hovNode.band     && <div className="flex justify-between"><span className="text-slate-500">Band</span><span className="text-indigo-300 font-mono">{hovNode.band}</span></div>}
                {hovNode.txPower && hovNode.txPower!=="—" && <div className="flex justify-between"><span className="text-slate-500">Tx Power</span><span className="text-slate-200">{hovNode.txPower}</span></div>}
                {hovNode.mimo     && <div className="flex justify-between"><span className="text-slate-500">MIMO</span><span className="text-slate-200">{hovNode.mimo}</span></div>}
                {hovNode.protocol && <div className="flex justify-between"><span className="text-slate-500">Protocol</span><span className="font-mono text-cyan-400">{hovNode.protocol}</span></div>}
                {hovNode.ports    && <div className="flex justify-between"><span className="text-slate-500">Ports</span><span className="text-slate-200">{hovNode.ports}</span></div>}
                {hovNode.slots    && <div className="flex justify-between"><span className="text-slate-500">Chassis</span><span className="text-slate-200">{hovNode.slots}</span></div>}

                {hasKids && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div className="text-indigo-400 text-[10px]">
                      {collapsed.has(hovNode.id)
                        ? `▶ Click to expand (${getDescendants(hovNode.id,children).size} hidden)`
                        : "▾ Click to collapse branch"}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {hovLink!==null && linkPos && visLinks[hovLink] && (
          <Card className="fixed bg-slate-900 border-slate-700 shadow-2xl pointer-events-none z-50"
            style={{left:linkPos.x+14,top:linkPos.y-12}}>
            <CardContent className="p-2.5 text-xs text-slate-200 space-y-1 min-w-36">
              <div className="text-indigo-400 font-semibold mb-1">Link</div>
              <div className="flex justify-between gap-4"><span className="text-slate-500">Medium</span><span className="font-mono">{visLinks[hovLink].medium||"fiber"}</span></div>
              {visLinks[hovLink].label && <div className="flex justify-between gap-4"><span className="text-slate-500">Protocol</span><span className="font-mono text-cyan-400">{visLinks[hovLink].label}</span></div>}
            </CardContent>
          </Card>
        )}

        <Card className="absolute bottom-4 right-4 bg-slate-900 border-slate-700 shadow-2xl">
          <CardContent className="p-3 text-xs">
            <div className="font-bold text-white text-[11px] mb-3">Device Types</div>

            <div className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider mb-1.5">MA 6000</div>
            <div className="space-y-1.5 mb-3">
              {[
                { type: T.RIU,  svg: <rect x={1} y={1} width={18} height={18} rx={3} fill={TYPE_META[T.RIU].color} stroke={TYPE_META[T.RIU].glow} strokeWidth={1.5}/> },
                { type: T.DCU,  svg: <rect x={0} y={5} width={30} height={12} rx={3} fill={TYPE_META[T.DCU].color} stroke={TYPE_META[T.DCU].glow} strokeWidth={1.5}/> },
                { type: T.DEU,  svg: <rect x={0} y={5} width={30} height={12} rx={6} fill={TYPE_META[T.DEU].color} stroke={TYPE_META[T.DEU].glow} strokeWidth={1.5}/> },
                { type: T.dLRU, svg: <circle cx={10} cy={10} r={7} fill={TYPE_META[T.dLRU].color} stroke={TYPE_META[T.dLRU].glow} strokeWidth={1.5}/> },
                { type: T.dMRU, svg: <circle cx={10} cy={10} r={9} fill={TYPE_META[T.dMRU].color} stroke={TYPE_META[T.dMRU].glow} strokeWidth={1.5}/> },
                { type: T.dHRU, svg: <circle cx={10} cy={10} r={11} fill={TYPE_META[T.dHRU].color} stroke={TYPE_META[T.dHRU].glow} strokeWidth={1.5}/> },
              ].map(({type, svg}) => (
                <div key={type} className="flex items-center gap-2">
                  <svg width={30} height={22} className="shrink-0">{svg}</svg>
                  <div>
                    <span style={{color: TYPE_META[type].color}} className="font-mono font-semibold">{TYPE_META[type].label}</span>
                    <span className="text-slate-500 ml-1.5 text-[9px]">{TYPE_META[type].desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-slate-800 mb-2" />

            <div className="text-[9px] text-purple-400 font-semibold uppercase tracking-wider mb-1.5">MA 6200</div>
            <div className="space-y-1.5 mb-3">
              {[
                { type: T.AUC,  svg: <rect x={1} y={1} width={28} height={20} rx={3} fill={TYPE_META[T.AUC].color} stroke={TYPE_META[T.AUC].glow} strokeWidth={1.5}/> },
                { type: T.EU,   svg: <rect x={0} y={5} width={30} height={12} rx={6} fill={TYPE_META[T.EU].color}  stroke={TYPE_META[T.EU].glow}  strokeWidth={1.5}/> },
                { type: T.EUG,  svg: <rect x={0} y={5} width={30} height={12} rx={6} fill={TYPE_META[T.EUG].color} stroke={TYPE_META[T.EUG].glow} strokeWidth={1.5}/> },
                { type: T.N2RU, svg: <circle cx={10} cy={11} r={7}  fill={TYPE_META[T.N2RU].color} stroke={TYPE_META[T.N2RU].glow} strokeWidth={1.5}/> },
                { type: T.M2RU, svg: <circle cx={10} cy={11} r={9}  fill={TYPE_META[T.M2RU].color} stroke={TYPE_META[T.M2RU].glow} strokeWidth={1.5}/> },
                { type: T.H2RU, svg: <circle cx={11} cy={11} r={11} fill={TYPE_META[T.H2RU].color} stroke={TYPE_META[T.H2RU].glow} strokeWidth={1.5}/> },
                { type: T.N3RU, svg: <circle cx={10} cy={11} r={7}  fill={TYPE_META[T.N3RU].color} stroke={TYPE_META[T.N3RU].glow} strokeWidth={1.5}/> },
                { type: T.M3RU, svg: <circle cx={10} cy={11} r={9}  fill={TYPE_META[T.M3RU].color} stroke={TYPE_META[T.M3RU].glow} strokeWidth={1.5}/> },
              ].map(({type, svg}) => (
                <div key={type} className="flex items-center gap-2">
                  <svg width={30} height={22} className="shrink-0">{svg}</svg>
                  <div>
                    <span style={{color: TYPE_META[type].color}} className="font-mono font-semibold">{TYPE_META[type].label}</span>
                    <span className="text-slate-500 ml-1.5 text-[9px]">{TYPE_META[type].desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-slate-800 mb-2" />
            <div className="space-y-1 text-[9px] text-slate-500">
              <div className="flex gap-2"><span style={{ color: S_COLOR.online }}>●</span> Online</div>
              <div className="flex gap-2"><span style={{ color: S_COLOR.degraded }}>●</span> Degraded</div>
              <div className="flex gap-2"><span style={{ color: S_COLOR.offline }}>●</span> Offline</div>
              <div className="flex gap-2 mt-1"><span>- - -</span> 25G fiber link</div>
            </div>
            <Separator className="bg-slate-800 mt-2 mb-1.5" />
            <p className="text-[9px] text-slate-600 italic">Click to collapse · Drag to pan · Scroll to zoom</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
}

export default DasTopology;


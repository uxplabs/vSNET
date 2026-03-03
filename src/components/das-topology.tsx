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
import { Tree, type TreeNode } from "@/components/ui/tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ─── DAS hierarchy types (Inventory-aligned) ──────────────────────────────────
const T = {
  STACK: "stack",
  EXTENSION: "extension",
  IHU: "ihu",
  HCM: "hcm",
  RIM: "rim",
  FMM: "fmm",
  OIM: "oim",
  MRU: "mru",
  OCH_UNIT: "och-unit",
  OCH_BANK: "och-bank",
  INFO: "info",
};

const STATUS = { ONLINE: "online", DEGRADED: "degraded", OFFLINE: "offline" };

const TYPE_META = {
  [T.STACK]: { label: "Stack", desc: "Management Stack", family: "DAS", tier: "root", color: "var(--chart-1)", glow: "var(--chart-1)" },
  [T.EXTENSION]: { label: "Extension", desc: "Secondary Head End", family: "DAS", tier: "head-end", color: "var(--chart-2)", glow: "var(--chart-2)" },
  [T.IHU]: { label: "IHU", desc: "Indoor Head Unit Chassis", family: "DAS", tier: "head-end", color: "var(--chart-3)", glow: "var(--chart-3)" },
  [T.HCM]: { label: "HCM", desc: "Host Controller Module", family: "DAS", tier: "module", color: "var(--chart-4)", glow: "var(--chart-4)" },
  [T.RIM]: { label: "RIM", desc: "Radio Interface Module", family: "DAS", tier: "module", color: "var(--chart-5)", glow: "var(--chart-5)" },
  [T.FMM]: { label: "FMM", desc: "Fiber Matrix Module", family: "DAS", tier: "module", color: "var(--chart-6)", glow: "var(--chart-6)" },
  [T.OIM]: { label: "OIM", desc: "Optical Interface Module", family: "DAS", tier: "module", color: "var(--chart-7)", glow: "var(--chart-7)" },
  [T.MRU]: { label: "MRU", desc: "Remote Unit", family: "DAS", tier: "remote", color: "var(--chart-8)", glow: "var(--chart-8)" },
  [T.OCH_UNIT]: { label: "OCH Unit", desc: "Optical Channel Unit", family: "DAS", tier: "distribution", color: "var(--chart-9)", glow: "var(--chart-9)" },
  [T.OCH_BANK]: { label: "OCH", desc: "Optical Channels", family: "DAS", tier: "distribution", color: "var(--chart-10)", glow: "var(--chart-10)" },
  [T.INFO]: { label: "Info", desc: "Telemetry/Alarm detail", family: "DAS", tier: "detail", color: "#64748b", glow: "#64748b" },
};

const MODULE_TABS = ["MRU Alarms", "Module Info", "PAM Alarms", "Alarms", "RF Parameters", "Comment(N/A)"] as const;

const historyAlarms = [
  { label: "Inconsistent Version", status: "ok" },
  { label: "Over Temperature", status: "ok" },
  { label: "Service 700", status: "critical" },
  { label: "Service CELL/ESMR", status: "critical" },
  { label: "Service AWS3", status: "critical" },
  { label: "Service PCS", status: "critical" },
  { label: "Service WCS", status: "critical" },
  { label: "Adjustment Fault", status: "ok" },
  { label: "HW Failure", status: "ok" },
];

const pamRows = [
  { label: "DL Out Pwr Low", cols: ["critical", "critical", "ok", "ok"] },
  { label: "UL In Pwr High", cols: ["ok", "ok", "ok", "ok"] },
  { label: "Service Off", cols: ["ok", "ok", "ok", "ok"] },
  { label: "VSWR", cols: ["ok", "ok", "ok", "ok"] },
  { label: "Shut Down", cols: ["ok", "ok", "ok", "ok"] },
];

const pamBands = ["700", "CELL/ESMR AWS3", "PCS", "WCS"];

const physicalAlarms = [
  "Door Open",
  "FAM Velocity",
  "Power Supply Problem",
  "Low Optical Power",
  "Cabinet Door Alarm",
  "Heat Exchanger Failure",
];

function AlarmDot({ status = "ok" }: { status?: string }) {
  const color =
    status === "critical"
      ? "var(--destructive)"
      : status === "warning"
        ? "var(--warning)"
        : "var(--success)";
  return <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-900/40" style={{ backgroundColor: color }} />;
}

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

  const stack = add({
    id: mkId(),
    type: T.STACK,
    label: "Stack - HCM",
    status: STATUS.ONLINE,
    model: "Management Stack",
    location: "Core head-end",
    protocol: "Control",
  });
  const extension = add({
    id: mkId(),
    type: T.EXTENSION,
    label: "Extension - ONE Class March",
    status: STATUS.ONLINE,
    model: "Secondary Head End",
    location: "Head-end room",
    protocol: "Control/Fiber",
  });
  link(stack, extension, { medium: "management", label: "Control bus" });

  const ihu = add({
    id: mkId(),
    type: T.IHU,
    label: "IHU-22-20-49-0201",
    status: STATUS.ONLINE,
    model: "IHU Chassis",
    location: "Head-end room",
    protocol: "Backplane",
  });
  link(extension, ihu, { medium: "backplane", label: "Chassis uplink" });

  const hcm = add({ id: mkId(), type: T.HCM, label: "HCM", status: STATUS.ONLINE, model: "HCM", protocol: "Control", location: "Slot 1" });
  link(ihu, hcm, { medium: "backplane" });

  const rim1 = add({ id: mkId(), type: T.RIM, label: "RIM1 - VZW 700 Path A LTE", status: STATUS.ONLINE, model: "RIM1", band: "700 Path A LTE", location: "Slot 2", protocol: "RF" });
  const rim2 = add({ id: mkId(), type: T.RIM, label: "RIM2 - VZW 850", status: STATUS.ONLINE, model: "RIM2", band: "850", location: "Slot 3", protocol: "RF" });
  const rim3 = add({ id: mkId(), type: T.RIM, label: "RIM3 - VZW 1900 PCS", status: STATUS.ONLINE, model: "RIM3", band: "1900 PCS", location: "Slot 4", protocol: "RF" });
  const rim4 = add({ id: mkId(), type: T.RIM, label: "RIM4 - TDD", status: STATUS.ONLINE, model: "RIM4", band: "TDD", location: "Slot 5", protocol: "RF" });
  const rim5 = add({ id: mkId(), type: T.RIM, label: "RIM5 - PCS", status: STATUS.ONLINE, model: "RIM5", band: "PCS", location: "Slot 6", protocol: "RF" });
  const rim6 = add({ id: mkId(), type: T.RIM, label: "RIM6", status: STATUS.ONLINE, model: "RIM6", location: "Slot 7", protocol: "RF" });
  const rim8 = add({ id: mkId(), type: T.RIM, label: "RIM8", status: STATUS.ONLINE, model: "RIM8", location: "Slot 8", protocol: "RF" });
  [rim1, rim2, rim3, rim4, rim5, rim6, rim8].forEach((rim) => link(ihu, rim, { medium: "backplane" }));

  const fmm9 = add({ id: mkId(), type: T.FMM, label: "FMM9", status: STATUS.ONLINE, model: "FMM9", location: "Slot 9", protocol: "Fiber matrix" });
  link(ihu, fmm9, { medium: "backplane" });

  const oim10 = add({ id: mkId(), type: T.OIM, label: "OIM10", status: STATUS.ONLINE, model: "OIM10", location: "Slot 10", protocol: "Optical" });
  const oim11 = add({ id: mkId(), type: T.OIM, label: "OIM11", status: STATUS.ONLINE, model: "OIM11", location: "Slot 11", protocol: "Optical" });
  const oim12 = add({ id: mkId(), type: T.OIM, label: "OIM12", status: STATUS.ONLINE, model: "OIM12", location: "Slot 12", protocol: "Optical" });
  [oim10, oim11, oim12].forEach((oim) => link(ihu, oim, { medium: "backplane" }));

  const mru1 = add({ id: mkId(), type: T.MRU, label: "MRU1", status: STATUS.ONLINE, model: "MRU1", protocol: "Optical", location: "Coverage zone A" });
  const mru2 = add({ id: mkId(), type: T.MRU, label: "MRU2", status: STATUS.ONLINE, model: "MRU2", protocol: "Optical", location: "Coverage zone B" });
  link(oim10, mru1, { medium: "fiber", label: "Optical transport" });
  link(mru1, mru2, { medium: "fiber", label: "Daisy-chain" });

  const ochUnit = add({
    id: mkId(),
    type: T.OCH_UNIT,
    label: "OCH UNIT P1",
    status: STATUS.ONLINE,
    model: "OCH Unit P1",
    location: "Secondary head-end",
    protocol: "Optical channels",
  });
  link(extension, ochUnit, { medium: "optical backplane" });
  const och14 = add({ id: mkId(), type: T.OCH_BANK, label: "OCH 1-4", status: STATUS.ONLINE, model: "OCH 1-4", protocol: "Optical", location: "P1 bank A" });
  const och58 = add({ id: mkId(), type: T.OCH_BANK, label: "OCH 5-8", status: STATUS.ONLINE, model: "OCH 5-8", protocol: "Optical", location: "P1 bank B" });
  link(ochUnit, och14, { medium: "optical channels" });
  link(ochUnit, och58, { medium: "optical channels" });

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

function DasNodeShape({ node, pos, showLabel, onHover, onLeave, hovered, collapsed, hasChildren, onSelect, selected, animatingIds }) {
  const fill = "#334155";
  const stroke = "#64748b";
  const isHov  = hovered === node.id;
  const isSelected = selected === node.id;
  const isColl = collapsed.has(node.id);
  const isAnim = animatingIds.has(node.id);
  const statusDotColor =
    node.status === STATUS.ONLINE
      ? "var(--success)"
      : node.status === STATUS.DEGRADED
        ? "var(--warning)"
        : "var(--destructive)";

  const shape = () => {
    if (node.type === T.STACK) return <rect x={-26} y={-10} width={52} height={20} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.EXTENSION) return <rect x={-30} y={-10} width={60} height={20} rx={10} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.IHU) return <rect x={-24} y={-12} width={48} height={24} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.OCH_UNIT) return <rect x={-22} y={-9} width={44} height={18} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.OCH_BANK) return <rect x={-18} y={-8} width={36} height={16} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.HCM || node.type === T.RIM || node.type === T.FMM || node.type === T.OIM)
      return <rect x={-18} y={-8} width={36} height={16} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    if (node.type === T.INFO)
      return <rect x={-16} y={-7} width={32} height={14} rx={7} fill={fill} stroke={stroke} strokeWidth={1.2} opacity={0.9} />;
    if (node.type === T.MRU) return <circle r={10} fill={fill} stroke={stroke} strokeWidth={1.5} />;
    return <circle r={8} fill={fill} stroke={stroke} strokeWidth={1.5} />;
  };

  const isCircle = node.type === T.MRU;
  const r = isCircle ? 10 : 8;
  const lx = isCircle ? r + 4 : node.type === T.EXTENSION ? 34 : node.type === T.STACK ? 30 : 24;

  return (
    <g transform={`translate(${pos.x},${pos.y})`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={onLeave}
      onClick={e => { e.stopPropagation(); onSelect(node.id); }}
      style={{ cursor: "pointer" }}>

      {(isHov || isSelected) && <circle r={isSelected ? 30 : 26} fill={isSelected ? "rgba(59, 130, 246, 0.22)" : "rgba(241, 245, 249, 0.18)"} />}

      {isAnim && (
        <circle r={22} fill="none" stroke="#f8fafc" strokeWidth={2.5} opacity={0.85}>
          <animate attributeName="r" values="16;28;16" dur="0.5s" repeatCount="2" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="0.5s" repeatCount="2" />
        </circle>
      )}

      {shape()}

      <circle cx={isCircle ? r-2 : 14} cy={isCircle ? -r+2 : -10} r={3.5} fill={statusDotColor} stroke="#0f172a" strokeWidth={1} />

      {isColl && hasChildren && (
        <g transform="translate(18,-16)">
          <circle r={8} fill="#475569" stroke="#64748b" strokeWidth={1} />
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
          fill={isHov ? "#ffffff" : "#94a3b8"} fontWeight={isHov ? "700" : "400"}
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    const stackNode = nodes.find((n) => n.type === T.STACK);
    return stackNode?.id ?? nodes[0]?.id ?? null;
  });
  const [moduleTab, setModuleTab] = useState<(typeof MODULE_TABS)[number]>("MRU Alarms");
  const search = searchQuery.trim();
  const [hovered, setHovered]       = useState(null);
  const [hovLink, setHovLink]       = useState(null);
  const [linkPos, setLinkPos]       = useState(null);
  const [xf, setXf]                 = useState({ x: 70, y: 30, scale: 1 });
  const svgRef  = useRef(null);
  const panning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const { positions, children, parents } = useMemo(() => computeLayout(nodes, links, collapsed), [nodes, links, collapsed]);
  const hiddenIds = useMemo(() => { const h = new Set(); collapsed.forEach(id => getDescendants(id, children).forEach(d => h.add(d))); return h; }, [collapsed, children]);
  const visNodes  = useMemo(() => nodes.filter(n => !hiddenIds.has(n.id)), [nodes, hiddenIds]);
  const visLinks  = useMemo(() => links.filter(l => !hiddenIds.has(l.source) && !hiddenIds.has(l.target)), [links, hiddenIds]);
  const allNodeIdSet = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);

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
  const treeRootIds = useMemo(
    () =>
      nodes
        .filter((n) => !parents[n.id] || !allNodeIdSet.has(parents[n.id]))
        .map((n) => n.id),
    [nodes, parents, allNodeIdSet],
  );

  const toggleCollapse = useCallback((id) => {
    setAnimating(p => { const n = new Set(p); n.add(id); return n; });
    setTimeout(() => setAnimating(p => { const n = new Set(p); n.delete(id); return n; }), 700);
    setCollapsed(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const hovNode = useMemo(() => hovered ? nodes.find(n => n.id === hovered) : null, [hovered, nodes]);
  const selectedNode = useMemo(() => selectedNodeId ? nodes.find(n => n.id === selectedNodeId) ?? null : null, [selectedNodeId, nodes]);

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

  const treeNodes = useMemo<TreeNode[]>(() => {
    const buildTree = (nodeId: string): TreeNode | null => {
      const node = nodeById[nodeId];
      if (!node || !allNodeIdSet.has(nodeId)) return null;
      const childNodes = (children[nodeId] || [])
        .map((childId) => buildTree(childId))
        .filter((item): item is TreeNode => item !== null);
      return {
        id: node.id,
        badgeText: TYPE_META[node.type]?.label ?? node.type,
        label: node.label,
        children: childNodes.length > 0 ? childNodes : undefined,
        matched: filterMatchIds.has(node.id),
        active: selectedNodeId === node.id,
        statusText: node.status,
        statusColor:
          node.status === STATUS.ONLINE
            ? "var(--success)"
            : node.status === STATUS.DEGRADED
              ? "var(--warning)"
              : "var(--destructive)",
      };
    };
    return treeRootIds
      .map((rootId) => buildTree(rootId))
      .filter((item): item is TreeNode => item !== null);
  }, [treeRootIds, nodeById, allNodeIdSet, children, filterMatchIds, selectedNodeId]);

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-6" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <Card className="bg-slate-950 text-slate-100 border-slate-800 flex flex-col h-[680px] overflow-hidden">
      <div className="flex items-center gap-5 px-4 py-2 bg-slate-900 border-b border-slate-800 flex-wrap shadow-xl">
        <span className="text-xs text-slate-400">
          {total} devices {hidden>0 && <span className="text-indigo-400">· {hidden} hidden</span>}
        </span>

        <div className="flex gap-3 text-xs">
          <span style={{ color: "var(--success)" }}>● {online} online</span>
          <span style={{ color: "var(--warning)" }}>● {degraded} degraded</span>
          <span style={{ color: "var(--destructive)" }}>● {offline} offline</span>
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

      <div className="flex-1 min-h-0 overflow-hidden flex">
        <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/70 overflow-auto">
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur px-3 py-2 border-b border-slate-800">
            <div className="text-xs font-semibold text-slate-200">Topology tree</div>
            <div className="text-[11px] text-slate-500">Hierarchy module</div>
          </div>
          <div className="p-2 space-y-0.5">
            <Tree
              nodes={treeNodes}
              isCollapsed={(id) => collapsed.has(id)}
              onToggle={toggleCollapse}
              onNodeClick={(node) => {
                setSelectedNodeId(node.id);
              }}
              onNodeMouseEnter={(node) => setHovered(node.id)}
              onNodeMouseLeave={() => setHovered(null)}
            />
          </div>
        </aside>

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
              const lc = isLH || isHovSrc ? "#f8fafc" : "#64748b";
              const isDashed = l.medium?.includes("25G");
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth={14}
                    onMouseEnter={e=>{setHovLink(i);setLinkPos({x:e.clientX,y:e.clientY});}}
                    onMouseMove={e=>setLinkPos({x:e.clientX,y:e.clientY})}
                    onMouseLeave={()=>{setHovLink(null);setLinkPos(null);}}
                    style={{cursor:"crosshair"}}/>
                  <path d={d} fill="none" stroke={lc}
                    strokeWidth={isLH?3.6:isHovSrc?3.1:1.2}
                    strokeDasharray={isDashed?"6 3":undefined}
                    opacity={isLH?1:isHovSrc?0.98:0.62}
                    style={{pointerEvents:"none",transition:"stroke 0.2s, stroke-width 0.2s"}}/>
                </g>
              );
            })}

            {filteredNodes.map(node => {
              const pos=positions[node.id]; if(!pos) return null;
              const hasKids=(children[node.id]||[]).length>0;
              return (
                <g key={node.id} opacity={1} style={{transition:"opacity 0.2s, filter 0.2s", filter: hovered===node.id ? "drop-shadow(0 0 8px rgba(248,250,252,0.55))" : "none"}}>
                  <DasNodeShape node={node} pos={pos} showLabel={showLabels}
                    onHover={setHovered} onLeave={()=>setHovered(null)}
                    hovered={hovered} collapsed={collapsed}
                    hasChildren={hasKids} onSelect={setSelectedNodeId} selected={selectedNodeId}
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
            <Card className="absolute top-4 right-4 bg-slate-900 border-slate-700 shadow-2xl w-72 pointer-events-none">
              <CardContent className="p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{hovNode.label}</span>
                  <Badge className="text-[9px] px-1.5 h-4 border border-slate-600 bg-slate-800 text-slate-200">
                    {meta.label}
                  </Badge>
                  <Badge
                    className="text-[9px] px-1.5 h-4 border border-slate-600 bg-slate-800 text-slate-200 ml-auto"
                  >
                    {hovNode.status}
                  </Badge>
                </div>

                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-200">{meta.desc}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Family</span>
                  <span className="text-slate-300">{meta.family} · {meta.tier}</span>
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
                        ? `▶ Expand from tree chevron (${getDescendants(hovNode.id,children).size} hidden)`
                        : "▾ Collapse from tree chevron"}
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

        </div>
      </div>
      </Card>
      <Card className="overflow-hidden">
          <Tabs value={moduleTab} onValueChange={(v) => setModuleTab(v as (typeof MODULE_TABS)[number])}>
            <div className="px-3 pt-3 pb-2 border-b bg-muted/30 text-xs text-muted-foreground">
              {selectedNode ? (
                <span className="inline-flex items-center gap-2">
                  <Badge className="text-[10px] px-1.5 h-4 border border-slate-600 bg-slate-800 text-slate-200">
                    {TYPE_META[selectedNode.type]?.label ?? selectedNode.type}
                  </Badge>
                  <span className="font-semibold text-foreground">{selectedNode.label}</span>
                </span>
              ) : (
                <span>Select a topology module to view alarms and module cards.</span>
              )}
            </div>
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              {MODULE_TABS.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-xs">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="p-3">
              <TabsContent value="MRU Alarms" className="m-0">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[44px] px-3 py-2 text-xs">Status</TableHead>
                        <TableHead className="px-3 py-2 text-xs">Alarm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyAlarms.map((alarm) => (
                        <TableRow key={alarm.label}>
                          <TableCell className="px-3 py-2"><AlarmDot status={alarm.status} /></TableCell>
                          <TableCell className="px-3 py-2 text-xs">{alarm.label}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="PAM Alarms" className="m-0">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-3 py-2 text-xs">Alarm</TableHead>
                        {pamBands.map((band) => (
                          <TableHead key={band} className="px-2 py-2 text-xs text-center">{band}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pamRows.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell className="px-3 py-2 text-xs">{row.label}</TableCell>
                          {row.cols.map((status, idx) => (
                            <TableCell key={`${row.label}-${idx}`} className="px-2 py-2 text-center">
                              <div className="inline-flex items-center justify-center"><AlarmDot status={status} /></div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="Alarms" className="m-0">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-3 py-2 text-xs">Physical alarm</TableHead>
                        <TableHead className="px-3 py-2 text-xs text-center w-[120px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {physicalAlarms.map((alarm) => (
                        <TableRow key={alarm}>
                          <TableCell className="px-3 py-2 text-xs">{alarm}</TableCell>
                          <TableCell className="px-3 py-2 text-center">
                            <div className="inline-flex items-center justify-center"><AlarmDot status="ok" /></div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="Module Info" className="m-0">
                {selectedNode ? (
                  <div className="rounded-md border p-3 text-xs space-y-1">
                    <div><span className="text-muted-foreground">Label:</span> {selectedNode.label}</div>
                    <div><span className="text-muted-foreground">Type:</span> {TYPE_META[selectedNode.type]?.desc ?? selectedNode.type}</div>
                    <div><span className="text-muted-foreground">Status:</span> {selectedNode.status}</div>
                    {selectedNode.location && <div><span className="text-muted-foreground">Location:</span> {selectedNode.location}</div>}
                    {selectedNode.protocol && <div><span className="text-muted-foreground">Protocol:</span> {selectedNode.protocol}</div>}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No module selected.</div>
                )}
              </TabsContent>
              <TabsContent value="RF Parameters" className="m-0">
                <div className="text-xs text-muted-foreground">RF Parameters content placeholder.</div>
              </TabsContent>
              <TabsContent value="Comment(N/A)" className="m-0">
                <div className="text-xs text-muted-foreground">Comment(N/A) content placeholder.</div>
              </TabsContent>
            </div>
          </Tabs>
      </Card>
    </div>
    </TooltipProvider>
  );
}

export default DasTopology;


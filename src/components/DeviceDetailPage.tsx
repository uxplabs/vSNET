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
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import type { DeviceRow } from './devices-data-table';
import { AlarmsDataTable } from './alarms-data-table';
import { EventsDataTable } from './events-data-table';
import { ThresholdCrossingAlertsDataTable } from './threshold-crossing-alerts-data-table';
import { IpInterfacesDataTable } from './ip-interfaces-data-table';
import { RadioNodesDataTable, RADIO_NODES_STATUS_OPTIONS, RADIO_NODES_MODEL_OPTIONS, RADIO_NODES_DATA, filterRadioNodes } from './radio-nodes-data-table';
import { NrCellsDataTable, NR_CELLS_DATA } from './nr-cells-data-table';
import { ZonesDataTable, ZONES_DATA } from './zones-data-table';
import { X2ConnectionsDataTable } from './x2-connections-data-table';
import { DebugLogsDataTable } from './debug-logs-data-table';
import { IP_INTERFACES_DATA } from './ip-interfaces-data-table';
import { NameValueField, EditableLabelsField } from './ui/editable-value';
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
  region?: string;
  onRegionChange?: (region: string) => void;
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

function DeviceDetailPage({
  device,
  appName = 'vSNET',
  onSignOut,
  onBack,
  onNavigate,
  region,
  onRegionChange,
  scrollToNotes,
  onScrollToNotesDone,
}: DeviceDetailPageProps) {
  const SIDEBAR_ITEMS = [
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
    'SNMP details',
  ] as const;
  const toKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const [activeSection, setActiveSection] = useState(toKey(SIDEBAR_ITEMS[0]));
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const [alarmsEventsTab, setAlarmsEventsTab] = React.useState('alarms');
  const [performanceTab, setPerformanceTab] = React.useState('site');
  const [filesTab, setFilesTab] = React.useState('debug-logs');
  const ALARMS_OPTIONS = ['Alarms', 'Critical', 'Major', 'Minor', 'None'] as const;
  const EVENTS_TYPE_OPTIONS = ['Type', 'Configuration change', 'Connection', 'Performance', 'Security', 'System'] as const;
  const EVENTS_SEVERITY_OPTIONS = ['Severity', 'Critical', 'Major', 'Minor', 'Info'] as const;
  const EVENTS_SOURCE_OPTIONS = ['Source', 'All sources', 'eNB', 'RN'] as const;

  const INITIAL_NOTES = [
    { id: '1', author: 'J. Smith', content: 'Scheduled maintenance completed. All systems nominal.', datetime: 'Jan 25, 2025 at 2:34 PM' },
    { id: '2', author: 'A. Jones', content: 'Radio config updated per change request #2841.', datetime: 'Jan 26, 2025 at 9:15 AM' },
    { id: '3', author: 'M. Lee', content: 'Site visit completed. No issues found.', datetime: 'Jan 27, 2025 at 11:42 AM' },
  ] as const;

  const [notes, setNotes] = useState<Array<{ id: string; author: string; content: string; datetime: string }>>([...INITIAL_NOTES]);
  const [radioNodesSearch, setRadioNodesSearch] = useState('');
  const [radioNodesStatusFilter, setRadioNodesStatusFilter] = useState('Status');
  const [radioNodesModelFilter, setRadioNodesModelFilter] = useState('Model');
  const SIDEBAR_BADGE_COUNTS = React.useMemo<Record<string, number>>(() => ({
    'ip-interfaces': IP_INTERFACES_DATA.length,
    'radio-nodes': filterRadioNodes(RADIO_NODES_DATA, radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter).length,
    'nr-cells': NR_CELLS_DATA.length,
    'zones': ZONES_DATA.length,
  }), [radioNodesSearch, radioNodesStatusFilter, radioNodesModelFilter]);
  const [noteInput, setNoteInput] = useState('');
  const notesScrollRef = React.useRef<HTMLDivElement>(null);
  const notesCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!scrollToNotes) return;
    setAlarmsEventsTab('notes');
    const t = setTimeout(() => {
      notesCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        onRegionChange={onRegionChange}
      />
      <main className="flex-1 w-full px-4 py-6 md:px-6 lg:px-8 min-h-0 flex flex-col overflow-hidden">
        {/* Header - fixed at top of main */}
        <div className="shrink-0 bg-gray-900 -mx-4 -mt-6 mb-6 px-4 py-6 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 rounded-b-lg">
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
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10 shrink-0">
              {/* Name/value pairs */}
              <div className="flex items-center gap-10 text-sm">
                <div>
                  <p className="text-gray-400 mb-0.5">IP interfaces</p>
                  <div className="flex items-center gap-1.5 text-white">
                    <Icon name="arrow_upward" size={14} className="text-green-400" />
                    <span className="font-semibold tabular-nums">12</span>
                    <Icon name="arrow_downward" size={14} className="text-destructive" />
                    <span className="font-semibold tabular-nums">2</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Radio nodes</p>
                  <div className="flex items-center gap-1.5 text-white">
                    <Icon name="arrow_upward" size={14} className="text-green-400" />
                    <span className="font-semibold tabular-nums">12</span>
                    <Icon name="arrow_downward" size={14} className="text-destructive" />
                    <span className="font-semibold tabular-nums">2</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">UE sessions</p>
                  <span className="font-semibold tabular-nums text-white">
                    {Math.floor(Math.random() * 400 + 100)}
                  </span>
                </div>
              </div>
              {/* Major and Critical alarms */}
              <div className="flex items-center gap-10 text-sm">
                <div>
                  <p className="text-gray-400 mb-0.5">Critical</p>
                  <div className="flex items-center gap-1.5">
                    <Icon name="error" size={14} className="text-red-400" />
                    <span className="font-semibold tabular-nums text-white">{Math.ceil(device.alarms * 0.4)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Major</p>
                  <div className="flex items-center gap-1.5">
                    <Icon name="error_outline" size={14} className="text-amber-400" />
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

        <div className="flex gap-8 flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar - fixed, only content area scrolls */}
          <Card className="w-48 shrink-0 p-2 h-fit self-start">
            <nav className="flex flex-col gap-0.5">
            {SIDEBAR_ITEMS.map((label) => {
              const key = toKey(label);
              const isActive = activeSection === key;
              const count = SIDEBAR_BADGE_COUNTS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-muted font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  {count != null && (
                    <Badge variant="secondary" className="shrink-0 h-5 min-w-5 px-1.5 text-xs tabular-nums">
                      {count}
                    </Badge>
                  )}
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
                          <span className="font-medium">SN-LTE-2000</span>
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
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

          {activeSection === 'commissioning' && (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableBody>
                    {[
                      { step: 1, name: 'Upgrade', col2: [{ label: 'Current version', value: 'v2.1' }, { label: 'New version', value: 'v2.2' }], actions: ['Download', 'Upgrade'] },
                      { step: 2, name: 'Global template', col2: [{ label: 'Current version', value: 'v1.0' }], actions: ['Choose templates', 'Start'] },
                      { step: 3, name: 'Loca/bulk template', col2: [{ label: 'Template', value: 'default' }, { label: 'Version', value: 'v3.2' }], actions: ['Start'] },
                      { step: 4, name: 'Start rem scan', col2: [], actions: ['Start'] },
                    ].map((row) => (
                      <TableRow key={row.step}>
                        <TableCell className="py-3 align-top">
                          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1.5 text-sm font-medium">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium">
                              {row.step}
                            </span>
                            {row.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 align-top">
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
                        <TableCell className="py-3 text-right">
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
          )}

          {activeSection === 'ip-interfaces' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
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
                  <Select value={radioNodesStatusFilter} onValueChange={setRadioNodesStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {RADIO_NODES_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={radioNodesModelFilter} onValueChange={setRadioNodesModelFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {RADIO_NODES_MODEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1">
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

                    <TabsContent value="cell" className="mt-6">
                      <p className="text-muted-foreground">Cell performance metrics will be displayed here.</p>
                    </TabsContent>

                    <TabsContent value="resources" className="mt-6">
                      <p className="text-muted-foreground">Resources performance metrics will be displayed here.</p>
                    </TabsContent>

                    <TabsContent value="threshold-profiles" className="mt-6">
                      <p className="text-muted-foreground">Threshold crossing profiles will be displayed here.</p>
                    </TabsContent>

                    <TabsContent value="threshold-history" className="mt-6">
                      <p className="text-muted-foreground">Threshold crossing history will be displayed here.</p>
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
            <Card className="overflow-hidden">
              <div className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm min-h-[320px] flex flex-col">
                <div className="flex-1 p-4 overflow-auto whitespace-pre-wrap break-all">
                  <div className="text-green-400">Last login: Mon Jan 27 14:32:18 2025 from 10.0.1.100</div>
                  <div className="mt-1 text-muted-foreground">Welcome to {device.device}</div>
                  <div className="mt-2 text-muted-foreground">Type &apos;help&apos; for available commands.</div>
                  <div className="mt-4">
                    <span className="text-green-400">admin@{device.device.toLowerCase().replace(/\s+/g, '-')}</span>
                    <span className="text-muted-foreground">:~$ </span>
                    <span className="animate-pulse">▌</span>
                  </div>
                </div>
                <div className="border-t border-white/10 px-4 py-3 flex items-center gap-2">
                  <span className="text-green-400 shrink-0">admin@{device.device.toLowerCase().replace(/\s+/g, '-')}:~$</span>
                  <input
                    type="text"
                    placeholder="Enter command..."
                    className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] placeholder:text-muted-foreground font-mono text-sm"
                    aria-label="Terminal input"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'snmp-details' && (
            <Card>
              <CardHeader>
                <CardTitle>SNMP Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">SNMP configuration and trap details will be displayed here.</p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </main>
    </div>
    </TooltipProvider>
  );
}

export default DeviceDetailPage;

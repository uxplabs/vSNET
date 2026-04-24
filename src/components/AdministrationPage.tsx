'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { endOfDay, format, isAfter, isBefore, startOfDay, subDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { DeviceStatus } from './ui/device-status';
import { DeviceLink } from './ui/device-link';
import { NodeTypeBadge } from './ui/node-type-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AccessControlUsersDataTable,
  ACCESS_CONTROL_USERS_DATA,
  type AccessControlUserRow,
} from './access-control-users-data-table';
import { AccessControlUserSheet } from './access-control-user-sheet';
import { AccessControlProfilesDataTable } from './access-control-profiles-data-table';
import { ProfileRegionsField } from './profile-regions-field';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { InternalSidebarList } from './ui/internal-sidebar-list';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import FaultManagementPage from './FaultManagementPage';
import LabelManagementPage from './LabelManagementPage';
import FileManagementPage from './FileManagementPage';
import { createInitialFileManagementPersisted, type FileManagementPersisted } from './file-management-users-data-table';
import DeviceMigrationPage from './DeviceMigrationPage';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const SIDEBAR_ITEMS = [
  { label: 'Access control', icon: 'admin_panel_settings' },
  { label: 'Audit trail', icon: 'history' },
  { label: 'Northbound interface', icon: 'api' },
  { label: 'Email', icon: 'mail' },
  { label: 'File management', icon: 'folder' },
  { label: 'Fault management', icon: 'error' },
  { label: 'Server settings', icon: 'settings' },
  { label: 'Device migration', icon: 'swap_horiz' },
  { label: 'Redundancy', icon: 'sync' },
  { label: 'Performance', icon: 'speed' },
  { label: 'Label management', icon: 'label' },
] as const;

const PROFILE_OPTIONS = ['All', 'Administrator', 'Operator', 'Viewer'] as const;
const ADMIN_OPERATION_OPTIONS = ['Configure Profile', 'System Administration', 'User Management'] as const;
const AUDIT_DATE_RANGE_OPTIONS = ['All', 'Today', 'Last 7 days', 'Last 30 days', 'Custom'] as const;
const APPLICATION_OPERATION_OPTIONS = [
  'Manage Label Management',
  'Manage Node',
  'Manage Topology',
  'Manage Performance',
  'Manage Tasks',
  'View Events',
  'View Label Management',
  'View Performance',
  'View Profile',
  'View Node',
  'View Tasks',
  'View Topology',
] as const;
interface AuditTrailRow {
  seqNo: number;
  operationDateTime: string;
  username: string;
  operationName: string;
  operationStatus: 'Allowed' | 'Denied';
  ageDays: number;
}

const AUDIT_TRAIL_ROWS: AuditTrailRow[] = [
  {
    seqNo: 1,
    operationDateTime: 'Mar 05, 2026 09:12',
    username: 'admin@acme.com',
    operationName:
      'Update region display name and metadata for Pacific Northwest (ID pnw-01): validate uniqueness against existing regions, propagate the change to all northbound inventory exports, refresh cached topology labels served to the operator console, write an immutable configuration revision with rollback pointer, enqueue background sync to redundant management pairs (ams-west-02, ams-west-03), and emit structured audit fields including previous label, new label, actor session ID, and client IP 10.12.44.18',
    operationStatus: 'Allowed',
    ageDays: 0,
  },
  {
    seqNo: 2,
    operationDateTime: 'Mar 04, 2026 16:48',
    username: 'operator@acme.com',
    operationName:
      'Modify profile permissions across all assigned regions, reconcile admin and application operation lists with the identity provider (Okta app vSNET-AMS-prod), diff the resulting capability matrix against the last approved baseline commit 9f3c2a1, stage the update in pending state for secondary approver workflow, publish the resulting access matrix to the audit subsystem for SOC2 evidence bundle export, and attach correlation token corr-20260304-164812-aa7f to downstream task queue ams.tasks.profile-publish',
    operationStatus: 'Allowed',
    ageDays: 1,
  },
  {
    seqNo: 3,
    operationDateTime: 'Mar 03, 2026 11:02',
    username: 'viewer@acme.com',
    operationName:
      'Attempt user management: createUser denied because principal lacks AMS:Users:Write; requested payload included email jnewman@vendor.example, temporary MFA enrollment, and assignment to profile "Field engineer — read only"; evaluated policy bundle revision 2026-03-01.3 with explicit deny on role elevation paths; client reported User-Agent Mozilla/5.0 (compatible; scripted-check/1.4)',
    operationStatus: 'Denied',
    ageDays: 2,
  },
  {
    seqNo: 4,
    operationDateTime: 'Mar 01, 2026 14:35',
    username: 'admin@acme.com',
    operationName:
      'Enable login banner: set bannerTitle to "Authorized use only", messageOfDay to rotating compliance text block (UTF-8, 2.1 KB), enableLegalAcknowledgement=true, requireAckBeforeSession=true, apply banner to Web UI + REST session establishment paths, invalidate existing sessions without ack where policy version bumped from v14 to v15, and schedule nightly reminder job cron "0 45 6 * * ?" on management cluster job-runner-ams-01',
    operationStatus: 'Allowed',
    ageDays: 4,
  },
  {
    seqNo: 5,
    operationDateTime: 'Feb 18, 2026 08:21',
    username: 'operator@acme.com',
    operationName:
      'Change authentication mode from local-only to hybrid SAML (IdP https://idp.acme.com/realms/noc): import SP metadata, rotate signing certificates with 48h overlap, map IdP groups to AMS roles, disable legacy local admin except break-glass acct bg-admin@acme.com, update session TTL and idle timeout per security bulletin SB-2026-02-09, run smoke login against staging IdP mirror, and record pre/post fingerprint hashes for configuration drift detection',
    operationStatus: 'Allowed',
    ageDays: 16,
  },
];
interface AlarmForwardingRow {
  name: string;
  hostName: string;
}

const ALARM_FORWARDING_INITIAL: AlarmForwardingRow[] = [
  { name: 'Primary NMS', hostName: 'nms-core-01.acme.net' },
  { name: 'Backup NMS', hostName: 'nms-dr-01.acme.net' },
];

type SnmpManagersGroupVersion = 'v2c' | 'v3';

interface SnmpManagersGroupFormValues {
  name: string;
  port: string;
  enable: boolean;
  hostName: string;
  enableHeartbeatTrap: boolean;
  heartbeatIntervalMinutes: string;
  snmpVersion: SnmpManagersGroupVersion;
  community: string;
  v3UserName: string;
}

const DEFAULT_SNMP_MANAGERS_GROUP_FORM: SnmpManagersGroupFormValues = {
  name: '',
  port: '162',
  enable: true,
  hostName: '',
  enableHeartbeatTrap: false,
  heartbeatIntervalMinutes: '5',
  snmpVersion: 'v2c',
  community: 'public',
  v3UserName: '',
};
interface SyslogForwardingRow {
  hostName: string;
  port: string;
  enabled: boolean;
  enableAuditTrail: boolean;
  enableSystemEvent: boolean;
  description: string;
}

const SYSLOG_FORWARDING_INITIAL: SyslogForwardingRow[] = [
  {
    hostName: 'syslog-west-01.acme.net',
    port: '514',
    enabled: true,
    enableAuditTrail: true,
    enableSystemEvent: true,
    description: 'Primary west-region syslog collector',
  },
  {
    hostName: 'syslog-central-01.acme.net',
    port: '1514',
    enabled: false,
    enableAuditTrail: true,
    enableSystemEvent: true,
    description: 'Secondary collector for compliance logging',
  },
];

interface SyslogForwardingFormValues {
  hostName: string;
  port: string;
  enabled: boolean;
  enableAuditTrail: boolean;
  enableSystemEvent: boolean;
  description: string;
}

const DEFAULT_SYSLOG_FORWARDING_FORM: SyslogForwardingFormValues = {
  hostName: '',
  port: '514',
  enabled: true,
  enableAuditTrail: true,
  enableSystemEvent: true,
  description: '',
};

function syslogEventLabels(row: SyslogForwardingRow): string[] {
  const labels: string[] = [];
  if (row.enableAuditTrail) labels.push('Audit trail');
  if (row.enableSystemEvent) labels.push('System event');
  return labels;
}
interface EmailGroupSettings {
  name: string;
  emailAddresses: string[];
}

function parseEmailAddressesText(text: string): string[] {
  const parts = text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

export interface ProfileSchedule { days: string[]; allDay: boolean; startTime: string; endTime: string }
export interface ProfileAction { action: string; details: string; detailType?: 'badge' }
export interface ProfileRule { kpi: string; type: string; condition: string; samples: number }
export interface ProfileData {
  name: string;
  devices: number;
  description: string;
  enabled: boolean;
  actions: ProfileAction[];
  schedules: Record<string, ProfileSchedule>;
  rules: ProfileRule[];
}
interface AccessControlProfileAccess {
  regions: string[];
  adminOperations: string[];
  applicationOperations: string[];
}

interface ProfileEditorSessionSnapshot {
  access: AccessControlProfileAccess;
  label: string;
}

type AdministrationNavigationIntent =
  | { kind: 'sidebar'; sectionKey: string }
  | { kind: 'accessControlTab'; tab: string }
  | { kind: 'app'; page: string; tab?: string };

/** Serializable snapshot of administration configuration (in-page state only). */
interface AdministrationPersistedSnapshot {
  accessControlUsers: AccessControlUserRow[];
  authSidebarSection: 'general' | 'radius' | 'tacacs' | 'saml';
  authMode: 'vsnet-only' | 'external-only' | 'combined';
  externalAuthType: 'radius' | 'tacacs' | 'saml';
  profilesSidebarItems: Array<{ id: string; label: string }>;
  profileAccessById: Record<string, AccessControlProfileAccess>;
  regionSidebarItems: Array<{ id: string; label: string }>;
  selectedRegionSidebarId: string;
  regionNameValue: string;
  accessControlSettings: AccessControlSettingsFormValues;
  alarmForwardingRows: AlarmForwardingRow[];
  syslogForwardingRows: SyslogForwardingRow[];
  emailGroupSidebarItems: Array<{ id: string; label: string }>;
  emailGroupById: Record<string, EmailGroupSettings>;
  smtp: {
    smtpEnabled: boolean;
    smtpFromEmail: string;
    smtpEmailKey: string;
    smtpServer: string;
    smtpPort: string;
    smtpSecurityMode: 'none' | 'starttls' | 'ssl';
    smtpUseAuthentication: boolean;
    smtpUserName: string;
    smtpPassword: string;
    smtpTestEmail: string;
  };
  snmp: {
    snmpEnableInternalAgent: boolean;
    snmpEnableV2c: boolean;
    snmpReadCommunity: string;
    snmpWriteCommunity: string;
    snmpEnableV3: boolean;
    snmpEngineId: string;
    snmpUserName: string;
    snmpAuthenticationProtocol: string;
    snmpChangeAuthenticationPassword: boolean;
    snmpPrivacyProtocol: string;
    snmpChangePrivacyPassword: boolean;
  };
  profileData: Record<string, ProfileData>;
  /** Present in new snapshots; absent in older serialized state. */
  fileManagement?: FileManagementPersisted;
}

export const PERF_PROFILES_INIT: Record<string, ProfileData> = {
  'LTE Throughput Baseline': {
    name: 'LTE Throughput Baseline', devices: 124,
    description: 'Monitors key LTE performance indicators including throughput, latency, and call quality metrics. Alerts are triggered when thresholds are exceeded for the configured number of consecutive samples.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'lkrug@acme.com, dkoons@acme.com, gsalaslzquiel...' },
      { action: 'Send SNMP notifications', details: 'Notification group', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'CS_RCESR', type: 'LTE', condition: '< 1000', samples: 5 },
      { kpi: 'CS_RCESR', type: 'LTE', condition: '> 500', samples: 5 },
      { kpi: 'CS_RCESR', type: 'LTE', condition: '> 5000', samples: 5 },
      { kpi: 'DL_THRP', type: 'LTE', condition: '< 2000', samples: 3 },
      { kpi: 'UL_THRP', type: 'LTE', condition: '< 1000', samples: 3 },
    ],
  },
  'NR Cell Availability': {
    name: 'NR Cell Availability', devices: 87,
    description: 'Tracks NR cell availability and service continuity. Monitors cell downtime events and triggers alerts when availability drops below defined thresholds.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'noc-team@acme.com, rgarcia@acme.com' },
      { action: 'Create incident ticket', details: 'ServiceNow integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'CELL_AVAIL', type: 'NR', condition: '< 99.5%', samples: 4 },
      { kpi: 'CELL_AVAIL', type: 'NR', condition: '< 95%', samples: 2 },
      { kpi: 'CELL_DOWNTIME', type: 'NR', condition: '> 300s', samples: 1 },
    ],
  },
  'ERAB Drop Rate': {
    name: 'ERAB Drop Rate', devices: 56,
    description: 'Monitors E-RAB (E-UTRAN Radio Access Bearer) drop rates across the network. Excessive drops indicate radio resource management issues or coverage gaps.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'ran-ops@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '06:00', endTime: '22:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '09:00', endTime: '17:00' },
    },
    rules: [
      { kpi: 'ERAB_DROP', type: 'LTE', condition: '> 2%', samples: 5 },
      { kpi: 'ERAB_DROP', type: 'LTE', condition: '> 5%', samples: 3 },
      { kpi: 'ERAB_SETUP_FAIL', type: 'LTE', condition: '> 1%', samples: 4 },
    ],
  },
  'RRC Setup Success': {
    name: 'RRC Setup Success', devices: 93,
    description: 'Evaluates RRC (Radio Resource Control) connection setup success rates. Low success rates may indicate congestion, interference, or parameter misconfiguration.',
    enabled: false,
    actions: [
      { action: 'Send email', details: 'performance@acme.com, jnelson@acme.com' },
      { action: 'Send SNMP notifications', details: 'Critical alerts', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'RRC_SETUP_SR', type: 'LTE', condition: '< 98%', samples: 4 },
      { kpi: 'RRC_SETUP_SR', type: 'LTE', condition: '< 95%', samples: 2 },
      { kpi: 'RRC_CONN_MAX', type: 'LTE', condition: '> 900', samples: 3 },
      { kpi: 'RRC_SETUP_TIME', type: 'LTE', condition: '> 500ms', samples: 5 },
      { kpi: 'RRC_REEST_SR', type: 'LTE', condition: '< 90%', samples: 3 },
    ],
  },
  'Handover Success Rate': {
    name: 'Handover Success Rate', devices: 71,
    description: 'Tracks inter-cell and inter-RAT handover success rates. Failed handovers lead to dropped calls and degraded user experience in mobility scenarios.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'mobility-team@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '07:00', endTime: '21:00' },
    },
    rules: [
      { kpi: 'HO_SUCCESS', type: 'LTE', condition: '< 97%', samples: 4 },
      { kpi: 'HO_SUCCESS', type: 'LTE', condition: '< 93%', samples: 2 },
      { kpi: 'INTER_RAT_HO', type: 'LTE', condition: '< 90%', samples: 3 },
      { kpi: 'HO_PING_PONG', type: 'LTE', condition: '> 5%', samples: 4 },
    ],
  },
  'VoLTE Call Drop': {
    name: 'VoLTE Call Drop', devices: 42,
    description: 'Monitors VoLTE call drop rates and voice quality indicators. Ensures voice service quality meets operator SLA requirements.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'volte-ops@acme.com, quality@acme.com' },
      { action: 'Send SNMP notifications', details: 'VoLTE alerts', detailType: 'badge' },
      { action: 'Create incident ticket', details: 'PagerDuty integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'VOLTE_DROP', type: 'LTE', condition: '> 1%', samples: 3 },
      { kpi: 'VOLTE_MOS', type: 'LTE', condition: '< 3.5', samples: 5 },
      { kpi: 'VOLTE_SETUP_TIME', type: 'LTE', condition: '> 3s', samples: 4 },
    ],
  },
  'Latency SLA': {
    name: 'Latency SLA', devices: 38,
    description: 'Ensures network latency remains within SLA-defined bounds. Monitors round-trip times and jitter for compliance reporting.',
    enabled: false,
    actions: [
      { action: 'Send email', details: 'sla-mgmt@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '08:00', endTime: '20:00' },
    },
    rules: [
      { kpi: 'RTT_AVG', type: 'NR', condition: '> 20ms', samples: 5 },
      { kpi: 'RTT_P95', type: 'NR', condition: '> 50ms', samples: 3 },
    ],
  },
  'CPU Utilization': {
    name: 'CPU Utilization', devices: 65,
    description: 'Monitors baseband and control-plane CPU utilization across network elements. High CPU usage can lead to processing delays and degraded service.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'infra-team@acme.com, capacity@acme.com' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
      '2': { days: ['sat', 'sun'], allDay: true, startTime: '08:00', endTime: '18:00' },
    },
    rules: [
      { kpi: 'CPU_LOAD', type: 'System', condition: '> 80%', samples: 5 },
      { kpi: 'CPU_LOAD', type: 'System', condition: '> 95%', samples: 2 },
    ],
  },
  'Packet Loss': {
    name: 'Packet Loss', devices: 51,
    description: 'Tracks packet loss rates on user-plane and transport interfaces. Excessive packet loss degrades throughput and impacts real-time services.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'transport@acme.com' },
      { action: 'Send SNMP notifications', details: 'Transport group', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], allDay: true, startTime: '00:00', endTime: '23:59' },
    },
    rules: [
      { kpi: 'PKT_LOSS_DL', type: 'NR', condition: '> 0.5%', samples: 4 },
      { kpi: 'PKT_LOSS_UL', type: 'NR', condition: '> 0.5%', samples: 4 },
      { kpi: 'PKT_LOSS_DL', type: 'NR', condition: '> 2%', samples: 2 },
    ],
  },
  'UL/DL Throughput': {
    name: 'UL/DL Throughput', devices: 110,
    description: 'Monitors uplink and downlink throughput per cell and per device. Ensures capacity targets are met and identifies underperforming sectors.',
    enabled: true,
    actions: [
      { action: 'Send email', details: 'capacity-plan@acme.com, rops@acme.com' },
      { action: 'Create incident ticket', details: 'ServiceNow integration', detailType: 'badge' },
    ],
    schedules: {
      '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: false, startTime: '06:00', endTime: '23:00' },
      '2': { days: ['sat', 'sun'], allDay: false, startTime: '08:00', endTime: '22:00' },
    },
    rules: [
      { kpi: 'DL_THRP', type: 'NR', condition: '< 100 Mbps', samples: 4 },
      { kpi: 'UL_THRP', type: 'NR', condition: '< 20 Mbps', samples: 4 },
      { kpi: 'DL_THRP', type: 'NR', condition: '< 50 Mbps', samples: 2 },
      { kpi: 'UL_THRP', type: 'NR', condition: '< 10 Mbps', samples: 2 },
      { kpi: 'DL_PRB_UTIL', type: 'NR', condition: '> 85%', samples: 5 },
    ],
  },
};

export interface AdministrationPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

type AccessControlSettingsFormValues = {
  passwordAgeDays: string;
  passwordExpiryWarningDays: string;
  passwordMinLength: string;
  passwordReusePreventionCount: string;
  passwordReusePreventionDays: string;
  accountLockoutEnabled: boolean;
  accountLockoutThreshold: string;
  inactivityLogoutDurationMinutes: string;
  loginBannerEnabled: boolean;
  bannerTitle: string;
  messageOfDay: string;
};

const DEFAULT_ACCESS_CONTROL_SETTINGS: AccessControlSettingsFormValues = {
  passwordAgeDays: '90',
  passwordExpiryWarningDays: '14',
  passwordMinLength: '12',
  passwordReusePreventionCount: '5',
  passwordReusePreventionDays: '365',
  accountLockoutEnabled: true,
  accountLockoutThreshold: '5',
  inactivityLogoutDurationMinutes: '15',
  loginBannerEnabled: true,
  bannerTitle: 'Authorized Access Only',
  messageOfDay: 'Maintenance window every Sunday 02:00-04:00 UTC.',
};

export default function AdministrationPage({
  appName = 'AMS',
  onSignOut,
  onNavigate,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
}: AdministrationPageProps) {
  const toKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const [activeSection, setActiveSection] = useState(toKey(SIDEBAR_ITEMS[0].label));
  const [accessControlTab, setAccessControlTab] = useState('users');
  const [authSidebarSection, setAuthSidebarSection] = useState<'general' | 'radius' | 'tacacs' | 'saml'>('general');
  const [authMode, setAuthMode] = useState<'vsnet-only' | 'external-only' | 'combined'>('combined');
  const [externalAuthType, setExternalAuthType] = useState<'radius' | 'tacacs' | 'saml'>('radius');
  const [profilesSidebarItems, setProfilesSidebarItems] = useState<Array<{ id: string; label: string }>>([
    { id: 'administrator', label: 'Administrator' },
    { id: 'operator', label: 'Operator' },
    { id: 'viewer', label: 'Viewer' },
  ]);
  const [profileEditorId, setProfileEditorId] = useState<string | null>(null);
  const [profileSheetMode, setProfileSheetMode] = useState<'add' | 'edit' | null>(null);
  const [accessProfileDeleteTarget, setAccessProfileDeleteTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [regionDeleteTarget, setRegionDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [profileEditorBaseline, setProfileEditorBaseline] = useState<ProfileEditorSessionSnapshot | null>(null);
  const profileEditorIdRef = useRef<string | null>(null);
  const skipRevertOnNextOverlayCloseRef = useRef(false);
  const profileEditorCloseReasonRef = useRef<'cancel' | 'save' | 'overlay' | null>(null);
  const bumpCommittedAdministrationRef = useRef<() => void>(() => {});
  const [profileAccessById, setProfileAccessById] = useState<Record<string, AccessControlProfileAccess>>({
    administrator: {
      regions: (regions && regions.length > 0)
        ? [...regions]
        : (region ? [region] : ['Pacific Northwest']),
      adminOperations: ['Configure Profile', 'System Administration', 'User Management'],
      applicationOperations: [...APPLICATION_OPERATION_OPTIONS],
    },
    operator: {
      regions: ['Pacific Northwest'],
      adminOperations: ['Configure Profile'],
      applicationOperations: ['Manage Node', 'Manage Topology', 'Manage Performance', 'Manage Tasks', 'View Events'],
    },
    viewer: {
      regions: ['Pacific Northwest'],
      adminOperations: [],
      applicationOperations: ['View Events', 'View Label Management', 'View Performance', 'View Profile', 'View Node', 'View Tasks', 'View Topology'],
    },
  });
  const [regionSidebarItems, setRegionSidebarItems] = useState<Array<{ id: string; label: string }>>(() => {
    const initialRegions = (regions && regions.length > 0)
      ? regions
      : (region ? [region] : ['Pacific Northwest']);
    return initialRegions.map((regionName, index) => ({
      id: `${regionName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      label: regionName,
    }));
  });
  const [selectedRegionSidebarId, setSelectedRegionSidebarId] = useState(() => {
    const initialRegions = (regions && regions.length > 0)
      ? regions
      : (region ? [region] : ['Pacific Northwest']);
    return `${initialRegions[0].toLowerCase().replace(/\s+/g, '-')}-0`;
  });
  const [regionNameValue, setRegionNameValue] = useState(() => {
    const initialRegions = (regions && regions.length > 0)
      ? regions
      : (region ? [region] : ['Pacific Northwest']);
    const initialItems = initialRegions.map((regionName, index) => ({
      id: `${regionName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      label: regionName,
    }));
    const initialSelectedId = `${initialRegions[0].toLowerCase().replace(/\s+/g, '-')}-0`;
    return initialItems.find((item) => item.id === initialSelectedId)?.label ?? initialRegions[0] ?? '';
  });
  const [passwordAgeDays, setPasswordAgeDays] = useState(DEFAULT_ACCESS_CONTROL_SETTINGS.passwordAgeDays);
  const [passwordExpiryWarningDays, setPasswordExpiryWarningDays] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.passwordExpiryWarningDays,
  );
  const [passwordMinLength, setPasswordMinLength] = useState(DEFAULT_ACCESS_CONTROL_SETTINGS.passwordMinLength);
  const [passwordReusePreventionCount, setPasswordReusePreventionCount] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.passwordReusePreventionCount,
  );
  const [passwordReusePreventionDays, setPasswordReusePreventionDays] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.passwordReusePreventionDays,
  );
  const [accountLockoutEnabled, setAccountLockoutEnabled] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.accountLockoutEnabled,
  );
  const [accountLockoutThreshold, setAccountLockoutThreshold] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.accountLockoutThreshold,
  );
  const [inactivityLogoutDurationMinutes, setInactivityLogoutDurationMinutes] = useState(
    DEFAULT_ACCESS_CONTROL_SETTINGS.inactivityLogoutDurationMinutes,
  );
  const [loginBannerEnabled, setLoginBannerEnabled] = useState(DEFAULT_ACCESS_CONTROL_SETTINGS.loginBannerEnabled);
  const [bannerTitle, setBannerTitle] = useState(DEFAULT_ACCESS_CONTROL_SETTINGS.bannerTitle);
  const [messageOfDay, setMessageOfDay] = useState(DEFAULT_ACCESS_CONTROL_SETTINGS.messageOfDay);
  const [, setAccessControlSettingsBaseline] = useState<AccessControlSettingsFormValues>(() => ({
    ...DEFAULT_ACCESS_CONTROL_SETTINGS,
  }));
  const [search, setSearch] = useState('');
  const [northboundTab, setNorthboundTab] = useState('alarm-forwarding');
  const [alarmForwardingRows, setAlarmForwardingRows] = useState<AlarmForwardingRow[]>(() => [...ALARM_FORWARDING_INITIAL]);
  const [snmpManagersGroupSheetOpen, setSnmpManagersGroupSheetOpen] = useState(false);
  const [snmpManagersGroupEditIndex, setSnmpManagersGroupEditIndex] = useState<number | null>(null);
  const [alarmForwardingDeleteIndex, setAlarmForwardingDeleteIndex] = useState<number | null>(null);
  const [snmpManagersGroupForm, setSnmpManagersGroupForm] = useState<SnmpManagersGroupFormValues>(() => ({
    ...DEFAULT_SNMP_MANAGERS_GROUP_FORM,
  }));
  const [syslogForwardingRows, setSyslogForwardingRows] = useState<SyslogForwardingRow[]>(() =>
    SYSLOG_FORWARDING_INITIAL.map((r) => ({ ...r })),
  );
  const [syslogSheetOpen, setSyslogSheetOpen] = useState(false);
  const [syslogEditIndex, setSyslogEditIndex] = useState<number | null>(null);
  const [syslogDeleteIndex, setSyslogDeleteIndex] = useState<number | null>(null);
  const [syslogForm, setSyslogForm] = useState<SyslogForwardingFormValues>(() => ({ ...DEFAULT_SYSLOG_FORWARDING_FORM }));
  const [emailTab, setEmailTab] = useState('email-groups');
  const [emailGroupSidebarItems, setEmailGroupSidebarItems] = useState<Array<{ id: string; label: string }>>([
    { id: 'noc-primary', label: 'NOC Primary' },
    { id: 'operations-managers', label: 'Operations Managers' },
  ]);
  const [emailGroupById, setEmailGroupById] = useState<Record<string, EmailGroupSettings>>({
    'noc-primary': {
      name: 'NOC Primary',
      emailAddresses: ['noc@acme.com', 'oncall@acme.com'],
    },
    'operations-managers': {
      name: 'Operations Managers',
      emailAddresses: ['ops-managers@acme.com'],
    },
  });
  const [emailGroupSheetOpen, setEmailGroupSheetOpen] = useState(false);
  const [emailGroupSheetEditId, setEmailGroupSheetEditId] = useState<string | null>(null);
  const [emailGroupSheetName, setEmailGroupSheetName] = useState('');
  const [emailGroupSheetAddressesText, setEmailGroupSheetAddressesText] = useState('');
  const [emailGroupDeleteId, setEmailGroupDeleteId] = useState<string | null>(null);
  const [fileMgmt, setFileMgmt] = useState<FileManagementPersisted>(() => createInitialFileManagementPersisted());
  const [smtpEnabled, setSmtpEnabled] = useState(true);
  const [smtpFromEmail, setSmtpFromEmail] = useState('alerts@acme.com');
  const [smtpEmailKey, setSmtpEmailKey] = useState('AMS-ALERTS');
  const [smtpServer, setSmtpServer] = useState('smtp.acme.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecurityMode, setSmtpSecurityMode] = useState<'none' | 'starttls' | 'ssl'>('starttls');
  const [smtpUseAuthentication, setSmtpUseAuthentication] = useState(true);
  const [smtpUserName, setSmtpUserName] = useState('alerts-service');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpTestEmail, setSmtpTestEmail] = useState('noc@acme.com');
  const [snmpEnableInternalAgent, setSnmpEnableInternalAgent] = useState(true);
  const [snmpEnableV2c, setSnmpEnableV2c] = useState(true);
  const [snmpReadCommunity, setSnmpReadCommunity] = useState('public');
  const [snmpWriteCommunity, setSnmpWriteCommunity] = useState('private');
  const [snmpEnableV3, setSnmpEnableV3] = useState(false);
  const [snmpEngineId, setSnmpEngineId] = useState('80000009030000254A4D5E');
  const [snmpUserName, setSnmpUserName] = useState('snmp-admin');
  const [snmpAuthenticationProtocol, setSnmpAuthenticationProtocol] = useState('SHA-256');
  const [snmpChangeAuthenticationPassword, setSnmpChangeAuthenticationPassword] = useState(false);
  const [snmpPrivacyProtocol, setSnmpPrivacyProtocol] = useState('AES-256');
  const [snmpChangePrivacyPassword, setSnmpChangePrivacyPassword] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditUsernameFilter, setAuditUsernameFilter] = useState('All');
  const [auditStatusFilter, setAuditStatusFilter] = useState('All');
  const [auditDateRangeFilter, setAuditDateRangeFilter] = useState<(typeof AUDIT_DATE_RANGE_OPTIONS)[number]>('All');
  const [auditCustomApplied, setAuditCustomApplied] = useState<DateRange | undefined>();
  const [auditCustomDraft, setAuditCustomDraft] = useState<DateRange | undefined>();
  const [auditCustomOpen, setAuditCustomOpen] = useState(false);
  const [auditDetailRow, setAuditDetailRow] = useState<AuditTrailRow | null>(null);
  const auditCustomAppliedRef = useRef<DateRange | undefined>(undefined);
  useEffect(() => {
    auditCustomAppliedRef.current = auditCustomApplied;
  }, [auditCustomApplied]);
  const [profileFilter, setProfileFilter] = useState<string>('All');
  const [accessControlUsers, setAccessControlUsers] = useState<AccessControlUserRow[]>(() => [...ACCESS_CONTROL_USERS_DATA]);
  const [accessControlUserSheetOpen, setAccessControlUserSheetOpen] = useState(false);
  const [accessControlUserEditing, setAccessControlUserEditing] = useState<AccessControlUserRow | null>(null);
  const [perfSearch, setPerfSearch] = useState('');
  const [_perfLteFilter, _setPerfLteFilter] = useState<string>('All');
  const [_perfTimeFilter, _setPerfTimeFilter] = useState<string>('All');
  const [_perfStatusFilter, _setPerfStatusFilter] = useState<'all' | 'degraded' | 'optimal'>('all');
  const [perfProfileSearch, setPerfProfileSearch] = useState('');
  const [selectedPerfProfile, setSelectedPerfProfile] = useState('LTE Throughput Baseline');
  const [perfTab, setPerfTab] = useState<'thresholds' | 'devices'>('thresholds');
  const [perfScheduleTab, setPerfScheduleTab] = useState('1');
  const [perfNameEditing, setPerfNameEditing] = useState(false);
  const [perfDescEditing, setPerfDescEditing] = useState(false);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState<ProfileSchedule>({ days: [], allDay: true, startTime: '08:00', endTime: '18:00' });
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [profileData, setProfileData] = useState<Record<string, ProfileData>>(() => structuredClone(PERF_PROFILES_INIT));

  // Derived helpers for the currently selected profile
  const currentProfileData = profileData[selectedPerfProfile] ?? PERF_PROFILES_INIT['LTE Throughput Baseline'];
  const perfName = currentProfileData.name;
  const perfDescription = currentProfileData.description;
  const schedules = currentProfileData.schedules;
  const scheduleKeys = Object.keys(schedules).sort((a, b) => Number(a) - Number(b));
  const currentSchedule = schedules[perfScheduleTab] ?? { days: [], allDay: true, startTime: '08:00', endTime: '18:00' };

  const updateProfile = (patch: Partial<ProfileData>) => {
    setProfileData((prev) => ({ ...prev, [selectedPerfProfile]: { ...prev[selectedPerfProfile], ...patch } }));
  };
  const setPerfName = (name: string) => updateProfile({ name });
  const setPerfDescription = (description: string) => updateProfile({ description });
  const setSchedules = (updater: Record<string, ProfileSchedule> | ((prev: Record<string, ProfileSchedule>) => Record<string, ProfileSchedule>)) => {
    setProfileData((prev) => {
      const curr = prev[selectedPerfProfile];
      const newSchedules = typeof updater === 'function' ? updater(curr.schedules) : updater;
      return { ...prev, [selectedPerfProfile]: { ...curr, schedules: newSchedules } };
    });
  };
  const updateCurrentSchedule = (patch: Partial<ProfileSchedule>) => {
    setSchedules((prev) => ({ ...prev, [perfScheduleTab]: { ...prev[perfScheduleTab], ...patch } }));
  };

  const activeLabel = SIDEBAR_ITEMS.find((item) => toKey(item.label) === activeSection)?.label ?? activeSection;
  const accountRegions = (regions && regions.length > 0)
    ? regions
    : (region ? [region] : ['Pacific Northwest']);
  const selectedRegionLabel = regionSidebarItems.find((item) => item.id === selectedRegionSidebarId)?.label ?? '';
  useEffect(() => {
    setRegionNameValue(selectedRegionLabel);
  }, [selectedRegionLabel]);

  const patchProfileAccess = (profileId: string, patch: Partial<AccessControlProfileAccess>) => {
    setProfileAccessById((prev) => {
      const current = prev[profileId] ?? { regions: [], adminOperations: [], applicationOperations: [] };
      return { ...prev, [profileId]: { ...current, ...patch } };
    });
  };

  const applyEditorAccessPatch = (patch: Partial<AccessControlProfileAccess>) => {
    if (profileEditorId) patchProfileAccess(profileEditorId, patch);
  };

  const editorAccess = useMemo(() => {
    if (!profileEditorId) {
      return { regions: [] as string[], adminOperations: [] as string[], applicationOperations: [] as string[] };
    }
    return profileAccessById[profileEditorId] ?? { regions: [], adminOperations: [], applicationOperations: [] };
  }, [profileEditorId, profileAccessById]);

  const editorLabel = useMemo(
    () => (profileEditorId ? profilesSidebarItems.find((p) => p.id === profileEditorId)?.label ?? 'Profile' : ''),
    [profileEditorId, profilesSidebarItems],
  );

  profileEditorIdRef.current = profileEditorId;

  useLayoutEffect(() => {
    if (!profileEditorId) {
      setProfileEditorBaseline(null);
      return;
    }
    const current = profileAccessById[profileEditorId] ?? {
      regions: [],
      adminOperations: [],
      applicationOperations: [],
    };
    const label = profilesSidebarItems.find((p) => p.id === profileEditorId)?.label ?? '';
    setProfileEditorBaseline({
      access: structuredClone(current),
      label,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseline only when opening a profile id, not on each edit
  }, [profileEditorId]);

  const administrationPersistedJson = useMemo(() => {
    const snapshot: AdministrationPersistedSnapshot = {
      accessControlUsers,
      authSidebarSection,
      authMode,
      externalAuthType,
      profilesSidebarItems,
      profileAccessById,
      regionSidebarItems,
      selectedRegionSidebarId,
      regionNameValue,
      accessControlSettings: {
        passwordAgeDays,
        passwordExpiryWarningDays,
        passwordMinLength,
        passwordReusePreventionCount,
        passwordReusePreventionDays,
        accountLockoutEnabled,
        accountLockoutThreshold,
        inactivityLogoutDurationMinutes,
        loginBannerEnabled,
        bannerTitle,
        messageOfDay,
      },
      alarmForwardingRows,
      syslogForwardingRows,
      emailGroupSidebarItems,
      emailGroupById,
      smtp: {
        smtpEnabled,
        smtpFromEmail,
        smtpEmailKey,
        smtpServer,
        smtpPort,
        smtpSecurityMode,
        smtpUseAuthentication,
        smtpUserName,
        smtpPassword,
        smtpTestEmail,
      },
      snmp: {
        snmpEnableInternalAgent,
        snmpEnableV2c,
        snmpReadCommunity,
        snmpWriteCommunity,
        snmpEnableV3,
        snmpEngineId,
        snmpUserName,
        snmpAuthenticationProtocol,
        snmpChangeAuthenticationPassword,
        snmpPrivacyProtocol,
        snmpChangePrivacyPassword,
      },
      profileData,
      fileManagement: fileMgmt,
    };
    return JSON.stringify(snapshot);
  }, [
    accessControlUsers,
    authSidebarSection,
    authMode,
    externalAuthType,
    profilesSidebarItems,
    profileAccessById,
    regionSidebarItems,
    selectedRegionSidebarId,
    regionNameValue,
    passwordAgeDays,
    passwordExpiryWarningDays,
    passwordMinLength,
    passwordReusePreventionCount,
    passwordReusePreventionDays,
    accountLockoutEnabled,
    accountLockoutThreshold,
    inactivityLogoutDurationMinutes,
    loginBannerEnabled,
    bannerTitle,
    messageOfDay,
    alarmForwardingRows,
    syslogForwardingRows,
    emailGroupSidebarItems,
    emailGroupById,
    smtpEnabled,
    smtpFromEmail,
    smtpEmailKey,
    smtpServer,
    smtpPort,
    smtpSecurityMode,
    smtpUseAuthentication,
    smtpUserName,
    smtpPassword,
    smtpTestEmail,
    snmpEnableInternalAgent,
    snmpEnableV2c,
    snmpReadCommunity,
    snmpWriteCommunity,
    snmpEnableV3,
    snmpEngineId,
    snmpUserName,
    snmpAuthenticationProtocol,
    snmpChangeAuthenticationPassword,
    snmpPrivacyProtocol,
    snmpChangePrivacyPassword,
    profileData,
    fileMgmt,
  ]);

  const [committedAdministrationJson, setCommittedAdministrationJson] = useState<string | null>(null);
  useLayoutEffect(() => {
    setCommittedAdministrationJson((prev) => (prev === null ? administrationPersistedJson : prev));
  }, [administrationPersistedJson]);

  const administrationPageDirty =
    committedAdministrationJson !== null && administrationPersistedJson !== committedAdministrationJson;

  bumpCommittedAdministrationRef.current = () => {
    setCommittedAdministrationJson(administrationPersistedJson);
  };

  const applyAdministrationPersistedSnapshot = useCallback((s: AdministrationPersistedSnapshot) => {
    setAccessControlUsers(s.accessControlUsers);
    setAuthSidebarSection(s.authSidebarSection);
    setAuthMode(s.authMode);
    setExternalAuthType(s.externalAuthType);
    setProfilesSidebarItems(s.profilesSidebarItems);
    setProfileAccessById(s.profileAccessById);
    setRegionSidebarItems(s.regionSidebarItems);
    setSelectedRegionSidebarId(s.selectedRegionSidebarId);
    setRegionNameValue(s.regionNameValue);
    const ac = s.accessControlSettings;
    setPasswordAgeDays(ac.passwordAgeDays);
    setPasswordExpiryWarningDays(ac.passwordExpiryWarningDays);
    setPasswordMinLength(ac.passwordMinLength);
    setPasswordReusePreventionCount(ac.passwordReusePreventionCount);
    setPasswordReusePreventionDays(ac.passwordReusePreventionDays);
    setAccountLockoutEnabled(ac.accountLockoutEnabled);
    setAccountLockoutThreshold(ac.accountLockoutThreshold);
    setInactivityLogoutDurationMinutes(ac.inactivityLogoutDurationMinutes);
    setLoginBannerEnabled(ac.loginBannerEnabled);
    setBannerTitle(ac.bannerTitle);
    setMessageOfDay(ac.messageOfDay);
    setAccessControlSettingsBaseline({ ...ac });
    setAlarmForwardingRows(s.alarmForwardingRows);
    setSyslogForwardingRows(s.syslogForwardingRows);
    setEmailGroupSidebarItems(s.emailGroupSidebarItems);
    setEmailGroupById(s.emailGroupById);
    setSmtpEnabled(s.smtp.smtpEnabled);
    setSmtpFromEmail(s.smtp.smtpFromEmail);
    setSmtpEmailKey(s.smtp.smtpEmailKey);
    setSmtpServer(s.smtp.smtpServer);
    setSmtpPort(s.smtp.smtpPort);
    setSmtpSecurityMode(s.smtp.smtpSecurityMode);
    setSmtpUseAuthentication(s.smtp.smtpUseAuthentication);
    setSmtpUserName(s.smtp.smtpUserName);
    setSmtpPassword(s.smtp.smtpPassword);
    setSmtpTestEmail(s.smtp.smtpTestEmail);
    setSnmpEnableInternalAgent(s.snmp.snmpEnableInternalAgent);
    setSnmpEnableV2c(s.snmp.snmpEnableV2c);
    setSnmpReadCommunity(s.snmp.snmpReadCommunity);
    setSnmpWriteCommunity(s.snmp.snmpWriteCommunity);
    setSnmpEnableV3(s.snmp.snmpEnableV3);
    setSnmpEngineId(s.snmp.snmpEngineId);
    setSnmpUserName(s.snmp.snmpUserName);
    setSnmpAuthenticationProtocol(s.snmp.snmpAuthenticationProtocol);
    setSnmpChangeAuthenticationPassword(s.snmp.snmpChangeAuthenticationPassword);
    setSnmpPrivacyProtocol(s.snmp.snmpPrivacyProtocol);
    setSnmpChangePrivacyPassword(s.snmp.snmpChangePrivacyPassword);
    setProfileData(structuredClone(s.profileData));
    if (s.fileManagement) {
      setFileMgmt({
        ...s.fileManagement,
        fileUsers: s.fileManagement.fileUsers.map((u) => ({ ...u })),
      });
    } else {
      setFileMgmt(createInitialFileManagementPersisted());
    }
  }, []);

  const handleAdministrationSaveAll = useCallback(() => {
    if (selectedRegionSidebarId && regionSidebarItems.length > 0) {
      const nextLabel = regionNameValue.trim();
      const prevLabel = selectedRegionLabel;
      if (nextLabel && nextLabel !== prevLabel) {
        setRegionSidebarItems((prev) =>
          prev.map((item) =>
            item.id === selectedRegionSidebarId ? { ...item, label: nextLabel } : item,
          ),
        );
        setProfileAccessById((prev) => {
          const out: Record<string, AccessControlProfileAccess> = {};
          for (const [pid, access] of Object.entries(prev)) {
            out[pid] = {
              ...access,
              regions: access.regions.map((r) => (r === prevLabel ? nextLabel : r)),
            };
          }
          return out;
        });
        setRegionNameValue(nextLabel);
        const nextRegionNames = regionSidebarItems.map((item) =>
          item.id === selectedRegionSidebarId ? nextLabel : item.label,
        );
        onRegionsChange?.(nextRegionNames);
      }
    }

    setAccessControlSettingsBaseline({
      passwordAgeDays,
      passwordExpiryWarningDays,
      passwordMinLength,
      passwordReusePreventionCount,
      passwordReusePreventionDays,
      accountLockoutEnabled,
      accountLockoutThreshold,
      inactivityLogoutDurationMinutes,
      loginBannerEnabled,
      bannerTitle,
      messageOfDay,
    });
    if (profileEditorId) {
      setProfileSheetMode(null);
      setProfileEditorId(null);
      setProfileEditorBaseline(null);
    }
    toast.success('All changes saved');
    setTimeout(() => {
      bumpCommittedAdministrationRef.current();
    }, 0);
  }, [
    selectedRegionSidebarId,
    regionSidebarItems,
    regionNameValue,
    selectedRegionLabel,
    onRegionsChange,
    passwordAgeDays,
    passwordExpiryWarningDays,
    passwordMinLength,
    passwordReusePreventionCount,
    passwordReusePreventionDays,
    accountLockoutEnabled,
    accountLockoutThreshold,
    inactivityLogoutDurationMinutes,
    loginBannerEnabled,
    bannerTitle,
    messageOfDay,
    profileEditorId,
  ]);

  const handleAdministrationCancelAll = useCallback(() => {
    if (committedAdministrationJson === null) return;
    const data = JSON.parse(committedAdministrationJson) as AdministrationPersistedSnapshot;
    applyAdministrationPersistedSnapshot(data);
    if (profileEditorId) {
      setProfileSheetMode(null);
      setProfileEditorId(null);
      setProfileEditorBaseline(null);
    }
  }, [committedAdministrationJson, applyAdministrationPersistedSnapshot, profileEditorId]);

  const dismissProfileEditor = useCallback(
    (reason: 'save' | 'cancel' | 'overlay') => {
      profileEditorCloseReasonRef.current = reason;
      const id = profileEditorIdRef.current;
      if (reason === 'overlay' && skipRevertOnNextOverlayCloseRef.current) {
        skipRevertOnNextOverlayCloseRef.current = false;
        setProfileSheetMode(null);
        setProfileEditorId(null);
        setProfileEditorBaseline(null);
        profileEditorCloseReasonRef.current = null;
        return;
      }
      if (reason === 'save') {
        skipRevertOnNextOverlayCloseRef.current = true;
        if (id) {
          let labelForToast = 'Profile';
          setProfilesSidebarItems((prev) => {
            const trimmed = (prev.find((p) => p.id === id)?.label ?? '').trim() || 'Profile';
            labelForToast = trimmed;
            return prev.map((p) => (p.id === id ? { ...p, label: trimmed } : p));
          });
          toast.success(`Saved permissions for ${labelForToast}`);
        }
        bumpCommittedAdministrationRef.current();
      } else if (id && profileEditorBaseline) {
        const snap = profileEditorBaseline;
        setProfileAccessById((prev) => ({
          ...prev,
          [id]: structuredClone(snap.access),
        }));
        setProfilesSidebarItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, label: snap.label } : p)),
        );
      }
      setProfileSheetMode(null);
      setProfileEditorId(null);
      setProfileEditorBaseline(null);
      if (reason === 'overlay') {
        profileEditorCloseReasonRef.current = null;
      }
    },
    [profileEditorBaseline],
  );

  const editorLabelTrimmed = editorLabel.trim();

  const [adminNavigationBlockerOpen, setAdminNavigationBlockerOpen] = useState(false);
  const pendingAdminNavigationRef = useRef<AdministrationNavigationIntent | null>(null);

  const hasUnsavedAdministrationChanges = administrationPageDirty;

  useEffect(() => {
    if (!hasUnsavedAdministrationChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedAdministrationChanges]);

  const flushAdministrationNavigation = useCallback((intent: AdministrationNavigationIntent) => {
    if (intent.kind === 'sidebar') setActiveSection(intent.sectionKey);
    else if (intent.kind === 'accessControlTab') setAccessControlTab(intent.tab);
    else onNavigate?.(intent.page, intent.tab);
  }, [onNavigate]);

  const discardUnsavedAndNavigate = useCallback(() => {
    const intent = pendingAdminNavigationRef.current;
    if (!intent) return;
    if (committedAdministrationJson !== null) {
      const data = JSON.parse(committedAdministrationJson) as AdministrationPersistedSnapshot;
      applyAdministrationPersistedSnapshot(data);
    }
    if (profileEditorId) {
      setProfileSheetMode(null);
      setProfileEditorId(null);
      setProfileEditorBaseline(null);
    }
    flushAdministrationNavigation(intent);
    pendingAdminNavigationRef.current = null;
    setAdminNavigationBlockerOpen(false);
  }, [committedAdministrationJson, applyAdministrationPersistedSnapshot, profileEditorId, flushAdministrationNavigation]);

  const requestSidebarSection = useCallback(
    (sectionKey: string) => {
      if (sectionKey === activeSection) return;
      if (hasUnsavedAdministrationChanges) {
        pendingAdminNavigationRef.current = { kind: 'sidebar', sectionKey };
        setAdminNavigationBlockerOpen(true);
        return;
      }
      setActiveSection(sectionKey);
    },
    [activeSection, hasUnsavedAdministrationChanges],
  );

  const requestAccessControlTab = useCallback(
    (tab: string) => {
      if (tab === accessControlTab) return;
      if (hasUnsavedAdministrationChanges) {
        pendingAdminNavigationRef.current = { kind: 'accessControlTab', tab };
        setAdminNavigationBlockerOpen(true);
        return;
      }
      setAccessControlTab(tab);
    },
    [accessControlTab, hasUnsavedAdministrationChanges],
  );

  const requestAppNavigation = useCallback(
    (page: string, tab?: string) => {
      if (hasUnsavedAdministrationChanges) {
        pendingAdminNavigationRef.current = { kind: 'app', page, tab };
        setAdminNavigationBlockerOpen(true);
        return;
      }
      onNavigate?.(page, tab);
    },
    [hasUnsavedAdministrationChanges, onNavigate],
  );

  const profileTableRows = useMemo(
    () =>
      profilesSidebarItems.map((item) => {
        const a = profileAccessById[item.id] ?? { regions: [], adminOperations: [], applicationOperations: [] };
        const regionsAll =
          accountRegions.length > 0 && accountRegions.every((regionName) => a.regions.includes(regionName));
        const regionsList = [...a.regions].sort((x, y) => x.localeCompare(y, undefined, { sensitivity: 'base' }));
        const adminOperationsList = [...a.adminOperations].sort((x, y) =>
          x.localeCompare(y, undefined, { sensitivity: 'base' }),
        );
        const applicationOperationsList = [...a.applicationOperations].sort((x, y) =>
          x.localeCompare(y, undefined, { sensitivity: 'base' }),
        );
        return {
          id: item.id,
          name: item.label,
          regionsAll,
          regionsCount: accountRegions.length,
          regionsList,
          adminOperationsList,
          applicationOperationsList,
        };
      }),
    [profilesSidebarItems, profileAccessById, accountRegions],
  );

  const auditUsernameOptions = ['All', ...Array.from(new Set(AUDIT_TRAIL_ROWS.map((row) => row.username)))];
  const handleAuditDatePresetChange = useCallback((value: string) => {
    const v = value as (typeof AUDIT_DATE_RANGE_OPTIONS)[number];
    setAuditDateRangeFilter(v);
    if (v === 'Custom') {
      setAuditCustomDraft(auditCustomAppliedRef.current);
      setAuditCustomOpen(true);
    } else {
      setAuditCustomApplied(undefined);
      setAuditCustomDraft(undefined);
      setAuditCustomOpen(false);
    }
  }, []);

  const filteredAuditRows = useMemo(() => {
    const auditRowDay = (ageDays: number) => startOfDay(subDays(new Date(), ageDays));
    return AUDIT_TRAIL_ROWS.filter((row) => {
      const searchTerm = auditSearch.trim().toLowerCase();
      if (searchTerm) {
        const searchable = `${row.seqNo} ${row.operationDateTime} ${row.username} ${row.operationName} ${row.operationStatus}`.toLowerCase();
        if (!searchable.includes(searchTerm)) return false;
      }
      if (auditUsernameFilter !== 'All' && row.username !== auditUsernameFilter) return false;
      if (auditStatusFilter !== 'All' && row.operationStatus !== auditStatusFilter) return false;
      if (auditDateRangeFilter === 'Today' && row.ageDays > 0) return false;
      if (auditDateRangeFilter === 'Last 7 days' && row.ageDays > 7) return false;
      if (auditDateRangeFilter === 'Last 30 days' && row.ageDays > 30) return false;
      if (auditDateRangeFilter === 'Custom') {
        const from = auditCustomApplied?.from;
        const to = auditCustomApplied?.to;
        if (from && to) {
          const fromS = startOfDay(from);
          const toE = endOfDay(to);
          const rowD = auditRowDay(row.ageDays);
          if (isBefore(rowD, fromS) || isAfter(rowD, toE)) return false;
        }
      }
      return true;
    });
  }, [
    auditSearch,
    auditUsernameFilter,
    auditStatusFilter,
    auditDateRangeFilter,
    auditCustomApplied,
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={requestAppNavigation}
        currentSection="administration"
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
      />
      <SidebarProvider className="flex-1 min-h-0 overflow-hidden">
        <Sidebar
          variant="inset"
          collapsible="offcanvas"
          style={{ top: '3.5rem', height: 'calc(100vh - 3.5rem)', width: 'var(--sidebar-width)' }}
        >
          <SidebarHeader className="border-b border-sidebar-border h-16 justify-center">
            <div className="px-1 flex items-center gap-2">
              <Icon name="settings" size={18} className="text-sidebar-foreground" />
              <span className="text-sm font-bold text-sidebar-foreground">Administration</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SIDEBAR_ITEMS.map((item) => {
                    const key = toKey(item.label);
                    return (
                      <SidebarMenuItem key={key}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeSection === key}
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2"
                            onClick={() => requestSidebarSection(key)}
                          >
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
            {activeSection === 'access-control' && (
              <div className="space-y-6">
                <Tabs value={accessControlTab} onValueChange={requestAccessControlTab}>
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Users
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {accessControlUsers.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="authentication" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Authentication
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          3
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="profiles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Profiles
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {profilesSidebarItems.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="domains" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Regions
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {regionSidebarItems.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="users" className="mt-6 space-y-4">
                    {/* Search and filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 w-full"
                        />
                      </div>
                      <FilterSelect value={profileFilter} onValueChange={setProfileFilter} label="Profile" options={[...PROFILE_OPTIONS]} className="w-[130px]" />
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          variant="default"
                          aria-label="Add user"
                          onClick={() => {
                            setAccessControlUserEditing(null);
                            setAccessControlUserSheetOpen(true);
                          }}
                        >
                          <Icon name="add" size={16} />
                          Add user
                        </Button>
                      </div>
                    </div>
                    <AccessControlUsersDataTable
                      data={accessControlUsers}
                      onEditUser={(row) => {
                        setAccessControlUserEditing(row);
                        setAccessControlUserSheetOpen(true);
                      }}
                    />
                    <AccessControlUserSheet
                      open={accessControlUserSheetOpen}
                      onOpenChange={(open) => {
                        setAccessControlUserSheetOpen(open);
                        if (!open) setAccessControlUserEditing(null);
                      }}
                      user={accessControlUserEditing}
                      onSave={(row) => {
                        setAccessControlUsers((prev) => {
                          const exists = prev.some((u) => u.id === row.id);
                          if (exists) return prev.map((u) => (u.id === row.id ? row : u));
                          return [...prev, row];
                        });
                        toast.success('User saved');
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="authentication" className="mt-6">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <InternalSidebarList
                        title="Authentication"
                        items={[
                          { id: 'general', label: 'General' },
                          { id: 'radius', label: 'RADIUS' },
                          { id: 'tacacs', label: 'TACACS+' },
                          { id: 'saml', label: 'SAML' },
                        ]}
                        selectedId={authSidebarSection}
                        onSelect={(id) => setAuthSidebarSection(id as typeof authSidebarSection)}
                      />
                      <div className="flex-1 space-y-4">
                        {authSidebarSection === 'general' && (
                          <Card>
                            <CardContent className="pt-6 space-y-5">
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">General settings</h3>
                              </div>
                              <div className="rounded-md border p-3">
                                <RadioGroup value={authMode} onValueChange={(value) => setAuthMode(value as typeof authMode)} className="gap-3">
                                  <Label
                                    htmlFor="auth-vsnet-only"
                                    className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/40"
                                  >
                                    <RadioGroupItem id="auth-vsnet-only" value="vsnet-only" className="mt-0.5" />
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-medium text-foreground">VSNET only</p>
                                      <p className="text-sm text-muted-foreground">
                                        Users will be authenticated against VSNET&apos;s internal database.
                                      </p>
                                    </div>
                                  </Label>
                                  <Label
                                    htmlFor="auth-external-only"
                                    className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/40"
                                  >
                                    <RadioGroupItem id="auth-external-only" value="external-only" className="mt-0.5" />
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-medium text-foreground">External only</p>
                                      <p className="text-sm text-muted-foreground">
                                        Users will be authenticated against an external AAA server.
                                      </p>
                                    </div>
                                  </Label>
                                  <Label
                                    htmlFor="auth-combined"
                                    className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/40"
                                  >
                                    <RadioGroupItem id="auth-combined" value="combined" className="mt-0.5" />
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-medium text-foreground">Combined</p>
                                      <p className="text-sm text-muted-foreground">
                                        If external authentication fails, users will be authenticated against VSNET&apos;s internal database.
                                      </p>
                                    </div>
                                  </Label>
                                </RadioGroup>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="external-auth-type">External authentication type</Label>
                                <Select value={externalAuthType} onValueChange={(value) => setExternalAuthType(value as typeof externalAuthType)}>
                                  <SelectTrigger id="external-auth-type" className="max-w-[280px]">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="radius">RADIUS</SelectItem>
                                    <SelectItem value="tacacs">TACACS+</SelectItem>
                                    <SelectItem value="saml">SAML</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {authSidebarSection === 'radius' && (
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-muted-foreground">RADIUS settings will be displayed here.</p>
                            </CardContent>
                          </Card>
                        )}
                        {authSidebarSection === 'tacacs' && (
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-muted-foreground">TACACS+ settings will be displayed here.</p>
                            </CardContent>
                          </Card>
                        )}
                        {authSidebarSection === 'saml' && (
                          <Card>
                            <CardContent className="pt-6">
                              <p className="text-muted-foreground">SAML settings will be displayed here.</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="profiles" className="mt-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          variant="default"
                          aria-label="Add profile"
                          onClick={() => {
                            const nextId = `profile-${profilesSidebarItems.length + 1}`;
                            const nextLabel = `Profile ${profilesSidebarItems.length + 1}`;
                            setProfilesSidebarItems((prev) => [...prev, { id: nextId, label: nextLabel }]);
                            setProfileAccessById((prev) => ({
                              ...prev,
                              [nextId]: {
                                regions: accountRegions.length > 0 ? [accountRegions[0]] : [],
                                adminOperations: [],
                                applicationOperations: [],
                              },
                            }));
                            setProfileSheetMode('add');
                            setProfileEditorId(nextId);
                          }}
                        >
                          <Icon name="add" size={16} />
                          Add profile
                        </Button>
                      </div>
                    </div>

                    <AccessControlProfilesDataTable
                      data={profileTableRows}
                      onEdit={(id) => {
                        setProfileSheetMode('edit');
                        setProfileEditorId(id);
                      }}
                      onDelete={(id) => {
                        const name = profilesSidebarItems.find((p) => p.id === id)?.label ?? id;
                        setAccessProfileDeleteTarget({ id, name });
                      }}
                    />

                    <AlertDialog
                      open={accessProfileDeleteTarget !== null}
                      onOpenChange={(open) => {
                        if (!open) setAccessProfileDeleteTarget(null);
                      }}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete profile</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-medium text-foreground">
                              {accessProfileDeleteTarget?.name ?? 'this profile'}
                            </span>
                            ? This cannot be undone. Users assigned to this profile may need to be reassigned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              const target = accessProfileDeleteTarget;
                              if (!target) return;
                              const { id, name } = target;
                              if (profileEditorIdRef.current === id) {
                                setProfileSheetMode(null);
                                setProfileEditorId(null);
                              }
                              setProfilesSidebarItems((prev) => prev.filter((p) => p.id !== id));
                              setProfileAccessById((prev) => {
                                const next = { ...prev };
                                delete next[id];
                                return next;
                              });
                              setAccessProfileDeleteTarget(null);
                              toast.success(`Deleted profile "${name}"`);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Sheet
                      open={profileEditorId !== null}
                      onOpenChange={(open) => {
                        if (!open) {
                          const r = profileEditorCloseReasonRef.current;
                          if (r === 'cancel' || r === 'save') {
                            profileEditorCloseReasonRef.current = null;
                            return;
                          }
                          profileEditorCloseReasonRef.current = null;
                          dismissProfileEditor('overlay');
                        }
                      }}
                    >
                      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg md:max-w-xl">
                        <SheetHeader className="shrink-0 space-y-1.5 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
                          <SheetTitle>
                            {profileSheetMode === 'add' ? 'Add profile' : 'Edit profile'}
                          </SheetTitle>
                          <SheetDescription>
                            {profileSheetMode === 'add'
                              ? 'Name this profile and choose which regions and operations it may use.'
                              : 'Update the profile name, regions, and operations for this access profile.'}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        <div className="space-y-5">
                                <div className="space-y-2">
                                  <Label htmlFor="access-control-profile-name">Profile name</Label>
                                  <Input
                                    id="access-control-profile-name"
                                    value={editorLabel}
                                    onChange={(e) => {
                                      if (!profileEditorId) return;
                                      const v = e.target.value;
                                      setProfilesSidebarItems((prev) =>
                                        prev.map((p) =>
                                          p.id === profileEditorId ? { ...p, label: v } : p,
                                        ),
                                      );
                                    }}
                                    placeholder="Profile name"
                                    autoComplete="off"
                                  />
                                </div>
                                <ProfileRegionsField
                                  accountRegions={accountRegions}
                                  selectedRegions={editorAccess.regions}
                                  onRegionsChange={(regions) => applyEditorAccessPatch({ regions })}
                                />
                                <div>
                                  <Label>Admin operations</Label>
                                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                                    {ADMIN_OPERATION_OPTIONS.map((operation) => (
                                      <label
                                        key={`${profileEditorId}-admin-op-${operation}`}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={editorAccess.adminOperations.includes(operation)}
                                          onCheckedChange={(checked) => {
                                            const on = Boolean(checked);
                                            applyEditorAccessPatch({
                                              adminOperations: on
                                                ? [...editorAccess.adminOperations, operation]
                                                : editorAccess.adminOperations.filter((o) => o !== operation),
                                            });
                                          }}
                                        />
                                        <span>{operation}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>Application operations</Label>
                                  <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                                    {APPLICATION_OPERATION_OPTIONS.map((operation) => (
                                      <label
                                        key={`${profileEditorId}-app-op-${operation}`}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                      >
                                        <Checkbox
                                          checked={editorAccess.applicationOperations.includes(operation)}
                                          onCheckedChange={(checked) => {
                                            const on = Boolean(checked);
                                            applyEditorAccessPatch({
                                              applicationOperations: on
                                                ? [...editorAccess.applicationOperations, operation]
                                                : editorAccess.applicationOperations.filter((o) => o !== operation),
                                            });
                                          }}
                                        />
                                        <span>{operation}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                        </div>
                        </div>
                        <SheetFooter className="mt-auto shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-4">
                          <div className="flex min-w-0 flex-1">
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                if (!profileEditorId) return;
                                const name =
                                  profilesSidebarItems.find((p) => p.id === profileEditorId)?.label?.trim() ||
                                  editorLabelTrimmed ||
                                  'Profile';
                                setAccessProfileDeleteTarget({ id: profileEditorId, name });
                              }}
                            >
                              <Icon name="delete" size={18} />
                              Delete profile
                            </Button>
                          </div>
                          <div className="flex flex-row gap-2">
                            <Button type="button" variant="outline" onClick={() => dismissProfileEditor('cancel')}>
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              disabled={!editorLabelTrimmed}
                              onClick={() => dismissProfileEditor('save')}
                            >
                              Save
                            </Button>
                          </div>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </TabsContent>

                  <TabsContent value="domains" className="mt-6 space-y-4">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <InternalSidebarList
                        title="Regions"
                        items={regionSidebarItems}
                        selectedId={selectedRegionSidebarId}
                        onSelect={setSelectedRegionSidebarId}
                        showAddAction
                        addAriaLabel="Add region"
                        addButtonLabel="Add region"
                        onAddAction={() => {
                          const nextId = `region-${regionSidebarItems.length + 1}`;
                          const nextLabel = `Region ${regionSidebarItems.length + 1}`;
                          setRegionSidebarItems((prev) => [...prev, { id: nextId, label: nextLabel }]);
                          setSelectedRegionSidebarId(nextId);
                          toast.success(`Added ${nextLabel}`);
                        }}
                      />
                      <div className="flex-1 space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="max-w-md">
                              <Label htmlFor="region-name-field">Region name</Label>
                              <Input
                                id="region-name-field"
                                className="mt-3"
                                value={regionNameValue}
                                onChange={(e) => setRegionNameValue(e.target.value)}
                                placeholder="Enter region name"
                                disabled={regionSidebarItems.length === 0}
                              />
                              {selectedRegionSidebarId !== '' && regionSidebarItems.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {
                                      setRegionDeleteTarget({
                                        id: selectedRegionSidebarId,
                                        name: selectedRegionLabel,
                                      });
                                    }}
                                  >
                                    <Icon name="delete" size={18} />
                                    Delete region
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <AlertDialog
                          open={regionDeleteTarget !== null}
                          onOpenChange={(open) => {
                            if (!open) setRegionDeleteTarget(null);
                          }}
                        >
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete region</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{' '}
                                <span className="font-medium text-foreground">
                                  {regionDeleteTarget?.name ?? 'this region'}
                                </span>
                                ? It will be removed from the catalog and unselected from any access profiles that
                                included it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => {
                                  const target = regionDeleteTarget;
                                  if (!target) return;
                                  const { id: deleteId, name: deletedLabel } = target;
                                  const idx = regionSidebarItems.findIndex((x) => x.id === deleteId);
                                  const nextItems = regionSidebarItems.filter((x) => x.id !== deleteId);
                                  const nextSelectedId =
                                    nextItems.length === 0
                                      ? ''
                                      : nextItems[Math.min(idx, nextItems.length - 1)]!.id;

                                  setRegionSidebarItems(nextItems);
                                  setSelectedRegionSidebarId(nextSelectedId);
                                  setProfileAccessById((prev) => {
                                    const out: Record<string, AccessControlProfileAccess> = {};
                                    for (const [pid, access] of Object.entries(prev)) {
                                      out[pid] = {
                                        ...access,
                                        regions: access.regions.filter((r) => r !== deletedLabel),
                                      };
                                    }
                                    return out;
                                  });
                                  onRegionsChange?.(nextItems.map((item) => item.label));
                                  setRegionDeleteTarget(null);
                                  toast.success(`Deleted region "${deletedLabel}"`);
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <Label htmlFor="password-age-days">Password age (days)*</Label>
                            <Input id="password-age-days" className="mt-3" type="number" value={passwordAgeDays} onChange={(e) => setPasswordAgeDays(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-expiry-warning-days">Password expiry warning (days)*</Label>
                            <Input id="password-expiry-warning-days" className="mt-3" type="number" value={passwordExpiryWarningDays} onChange={(e) => setPasswordExpiryWarningDays(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-min-length">Password minimum length*</Label>
                            <Input id="password-min-length" className="mt-3" type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-reuse-prevention-count">Password reuse prevention count*</Label>
                            <Input id="password-reuse-prevention-count" className="mt-3" type="number" value={passwordReusePreventionCount} onChange={(e) => setPasswordReusePreventionCount(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-reuse-prevention-days">Password reuse prevention (days)*</Label>
                            <Input id="password-reuse-prevention-days" className="mt-3" type="number" value={passwordReusePreventionDays} onChange={(e) => setPasswordReusePreventionDays(e.target.value)} />
                          </div>
                          <div className="flex items-center gap-2 self-end md:col-span-2">
                            <Checkbox id="account-lockout-enabled" checked={accountLockoutEnabled} onCheckedChange={(checked) => setAccountLockoutEnabled(Boolean(checked))} />
                            <Label htmlFor="account-lockout-enabled">Account lockout</Label>
                          </div>
                          {accountLockoutEnabled && (
                            <div className="md:col-span-2 rounded-md border p-4">
                              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                  <Label htmlFor="account-lockout-threshold">Account lockout threshold*</Label>
                                  <Input id="account-lockout-threshold" className="mt-3" type="number" value={accountLockoutThreshold} onChange={(e) => setAccountLockoutThreshold(e.target.value)} />
                                </div>
                                <div>
                                  <Label htmlFor="inactivity-logout-duration">Inactivity logout duration (minutes)*</Label>
                                  <Input id="inactivity-logout-duration" className="mt-3" type="number" value={inactivityLogoutDurationMinutes} onChange={(e) => setInactivityLogoutDurationMinutes(e.target.value)} />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 self-end md:col-span-2">
                            <Checkbox id="login-banner-enabled" checked={loginBannerEnabled} onCheckedChange={(checked) => setLoginBannerEnabled(Boolean(checked))} />
                            <Label htmlFor="login-banner-enabled">Login banner enabled</Label>
                          </div>
                          {loginBannerEnabled && (
                            <div className="md:col-span-2 rounded-md border p-4">
                              <div>
                                <Label htmlFor="banner-title">Banner title*</Label>
                                <Input id="banner-title" className="mt-3" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
                              </div>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <Label htmlFor="message-of-day">Message of day</Label>
                            <Textarea id="message-of-day" className="mt-3 min-h-24" value={messageOfDay} onChange={(e) => setMessageOfDay(e.target.value)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeSection === 'audit-trail' && (
              <>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:min-w-[220px] sm:max-w-[320px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search audit trail..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <FilterSelect value={auditUsernameFilter} onValueChange={setAuditUsernameFilter} label="Username" options={auditUsernameOptions} className="w-[220px]" />
                  <FilterSelect value={auditStatusFilter} onValueChange={setAuditStatusFilter} label="Status" options={['All', 'Allowed', 'Denied']} className="w-[150px]" />
                  <Popover
                    modal={false}
                    open={auditDateRangeFilter === 'Custom' && auditCustomOpen}
                    onOpenChange={(open) => {
                      if (auditDateRangeFilter !== 'Custom') {
                        setAuditCustomOpen(false);
                        return;
                      }
                      setAuditCustomOpen(open);
                      setAuditCustomDraft(auditCustomAppliedRef.current);
                    }}
                  >
                    <PopoverAnchor asChild>
                      <div
                        className={cn(
                          'flex min-w-[170px] max-w-[min(320px,calc(100vw-2rem))] items-stretch overflow-hidden rounded-md border border-input bg-background shadow-sm transition-[color,box-shadow]',
                          'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring',
                        )}
                      >
                        <Select value={auditDateRangeFilter} onValueChange={handleAuditDatePresetChange}>
                          <SelectTrigger
                            className={cn(
                              'h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0',
                              auditDateRangeFilter === 'Custom'
                                ? 'rounded-l-md rounded-r-none pr-1'
                                : 'rounded-md',
                            )}
                          >
                            <span
                              className={cn(
                                'truncate',
                                auditDateRangeFilter === 'All' && 'text-muted-foreground',
                              )}
                            >
                              {auditDateRangeFilter === 'All'
                                ? 'Date range'
                                : auditDateRangeFilter === 'Custom' &&
                                    auditCustomApplied?.from &&
                                    auditCustomApplied?.to
                                  ? `${format(auditCustomApplied.from, 'MMM d, yyyy')} – ${format(auditCustomApplied.to, 'MMM d, yyyy')}`
                                  : auditDateRangeFilter}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIT_DATE_RANGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {auditDateRangeFilter === 'Custom' ? (
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 rounded-none rounded-r-md border-l border-input hover:bg-accent"
                              aria-label="Open custom date range"
                            >
                              <Icon name="date_range" size={18} />
                            </Button>
                          </PopoverTrigger>
                        ) : null}
                      </div>
                    </PopoverAnchor>
                    {auditDateRangeFilter === 'Custom' ? (
                      <PopoverContent
                        className="w-max min-w-0 max-w-[calc(100vw-1rem)] border-border p-0"
                        align="start"
                        sideOffset={6}
                      >
                        <div className="flex flex-col">
                          <Calendar
                            mode="range"
                            numberOfMonths={2}
                            className="rounded-md [--cell-size:2rem]"
                            defaultMonth={auditCustomDraft?.from ?? auditCustomDraft?.to ?? new Date()}
                            selected={auditCustomDraft}
                            onSelect={setAuditCustomDraft}
                          />
                          <div className="flex justify-end gap-2 border-t border-border px-3 py-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAuditCustomDraft(auditCustomAppliedRef.current);
                                setAuditCustomOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              disabled={!auditCustomDraft?.from || !auditCustomDraft?.to}
                              onClick={() => {
                                setAuditCustomApplied(auditCustomDraft);
                                setAuditCustomOpen(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    ) : null}
                  </Popover>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:ml-auto shrink-0 gap-1.5"
                    aria-label="Export audit trail"
                    onClick={() => {
                      const escapeCsv = (value: string | number) => {
                        const s = String(value);
                        if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                        return s;
                      };
                      const header = [
                        'Seq no.',
                        'Operation time/date',
                        'Username',
                        'Operation name',
                        'Operation status',
                      ];
                      const lines = [
                        header.join(','),
                        ...filteredAuditRows.map((row) =>
                          [
                            row.seqNo,
                            row.operationDateTime,
                            row.username,
                            row.operationName,
                            row.operationStatus,
                          ]
                            .map(escapeCsv)
                            .join(','),
                        ),
                      ];
                      const blob = new Blob([`\ufeff${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success(
                        filteredAuditRows.length === 0
                          ? 'Exported audit trail (no rows matched filters)'
                          : `Exported ${filteredAuditRows.length} row${filteredAuditRows.length === 1 ? '' : 's'}`,
                      );
                    }}
                  >
                    <Icon name="download" size={16} />
                    Export
                  </Button>
                </div>
                <div className="overflow-hidden rounded-lg border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Seq no.</TableHead>
                        <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Operation time/date</TableHead>
                        <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Username</TableHead>
                        <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Operation name</TableHead>
                        <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Operation status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditRows.length > 0 ? (
                        filteredAuditRows.map((row) => (
                          <TableRow
                            key={`audit-${row.seqNo}`}
                            className="cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            tabIndex={0}
                            role="button"
                            aria-label={`View audit entry ${row.seqNo}`}
                            onClick={() => setAuditDetailRow(row)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setAuditDetailRow(row);
                              }
                            }}
                          >
                            <TableCell className="px-4 py-3 tabular-nums">{row.seqNo}</TableCell>
                            <TableCell className="px-4 py-3 whitespace-nowrap">{row.operationDateTime}</TableCell>
                            <TableCell className="px-4 py-3">{row.username}</TableCell>
                            <TableCell
                              className="max-w-[min(280px,40vw)] px-4 py-3 truncate"
                              title={row.operationName}
                            >
                              {row.operationName}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge variant={row.operationStatus === 'Allowed' ? 'secondary' : 'destructive'} className="font-normal">
                                {row.operationStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                            No audit records match the current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Sheet
                open={auditDetailRow !== null}
                onOpenChange={(open) => {
                  if (!open) setAuditDetailRow(null);
                }}
              >
                <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl">
                  {auditDetailRow ? (
                    <>
                      <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
                        <SheetTitle>Audit details</SheetTitle>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                        <div className="divide-y divide-border">
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-x-6">
                            <span className="text-muted-foreground text-sm">Seq no.</span>
                            <span className="min-w-0 text-sm tabular-nums text-foreground">{auditDetailRow.seqNo}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-x-6">
                            <span className="text-muted-foreground text-sm">Operation time & date</span>
                            <span className="min-w-0 text-sm text-foreground">{auditDetailRow.operationDateTime}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-x-6">
                            <span className="text-muted-foreground text-sm">User name</span>
                            <span className="min-w-0 break-all text-sm text-foreground">{auditDetailRow.username}</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-x-6">
                            <span className="text-muted-foreground text-sm">Operation name</span>
                            <p className="min-w-0 text-sm font-normal leading-relaxed text-foreground break-words [overflow-wrap:anywhere]">
                              {auditDetailRow.operationName}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(10rem,12rem)_1fr] sm:items-start sm:gap-x-6">
                            <span className="text-muted-foreground text-sm">Operation status</span>
                            <span className="min-w-0 text-sm text-foreground">{auditDetailRow.operationStatus}</span>
                          </div>
                        </div>
                      </div>
                      <SheetFooter className="mt-auto shrink-0 flex justify-end border-t border-border px-4 py-4">
                        <Button type="button" onClick={() => setAuditDetailRow(null)}>
                          OK
                        </Button>
                      </SheetFooter>
                    </>
                  ) : null}
                </SheetContent>
              </Sheet>
              </>
            )}

            {activeSection === 'northbound-interface' && (
              <div className="space-y-6">
                <Tabs value={northboundTab} onValueChange={setNorthboundTab}>
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="alarm-forwarding" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Alarm forwarding
                      </TabsTrigger>
                      <TabsTrigger value="snmp-agent" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        SNMP agent
                      </TabsTrigger>
                      <TabsTrigger value="syslog-forwarding" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Syslog forwarding
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="alarm-forwarding" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="default"
                        aria-label="Add new SNMP managers group"
                        onClick={() => {
                          setSnmpManagersGroupEditIndex(null);
                          setSnmpManagersGroupForm({ ...DEFAULT_SNMP_MANAGERS_GROUP_FORM });
                          setSnmpManagersGroupSheetOpen(true);
                        }}
                      >
                        <Icon name="add" size={16} />
                        Add new snmp managers group
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-lg border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Name</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Host name</TableHead>
                            <TableHead className="w-14 px-2 py-3 text-right">
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alarmForwardingRows.map((row, idx) => (
                            <TableRow key={`${row.hostName}-${idx}`}>
                              <TableCell className="px-4 py-3">{row.name}</TableCell>
                              <TableCell className="px-4 py-3 font-mono text-sm">{row.hostName}</TableCell>
                              <TableCell className="px-2 py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      aria-label={`Actions for ${row.name}`}
                                    >
                                      <Icon name="more_vert" size={18} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        setSnmpManagersGroupEditIndex(idx);
                                        setSnmpManagersGroupForm({
                                          ...DEFAULT_SNMP_MANAGERS_GROUP_FORM,
                                          name: row.name,
                                          hostName: row.hostName,
                                        });
                                        setSnmpManagersGroupSheetOpen(true);
                                      }}
                                    >
                                      <Icon name="edit" size={16} className="mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={() => setAlarmForwardingDeleteIndex(idx)}
                                    >
                                      <Icon name="delete" size={16} className="mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Sheet
                      open={snmpManagersGroupSheetOpen}
                      onOpenChange={(open) => {
                        setSnmpManagersGroupSheetOpen(open);
                        if (!open) {
                          setSnmpManagersGroupForm({ ...DEFAULT_SNMP_MANAGERS_GROUP_FORM });
                          setSnmpManagersGroupEditIndex(null);
                        }
                      }}
                    >
                      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
                        <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
                          <SheetTitle>
                            {snmpManagersGroupEditIndex !== null ? 'Edit SNMP managers group' : 'Add SNMP managers group'}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                          <div className="space-y-5">
                              <div>
                                <Label htmlFor="snmp-group-name">
                                  Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="snmp-group-name"
                                  className="mt-3"
                                  required
                                  autoComplete="off"
                                  value={snmpManagersGroupForm.name}
                                  onChange={(e) =>
                                    setSnmpManagersGroupForm((f) => ({ ...f, name: e.target.value }))
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="snmp-group-port">
                                  Port <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="snmp-group-port"
                                  className="mt-3"
                                  required
                                  inputMode="numeric"
                                  autoComplete="off"
                                  value={snmpManagersGroupForm.port}
                                  onChange={(e) =>
                                    setSnmpManagersGroupForm((f) => ({ ...f, port: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="snmp-group-enable"
                                  checked={snmpManagersGroupForm.enable}
                                  onCheckedChange={(checked) =>
                                    setSnmpManagersGroupForm((f) => ({ ...f, enable: Boolean(checked) }))
                                  }
                                />
                                <Label htmlFor="snmp-group-enable" className="cursor-pointer font-normal">
                                  Enable
                                </Label>
                              </div>
                              <div>
                                <Label htmlFor="snmp-group-hostname">
                                  Host name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="snmp-group-hostname"
                                  className="mt-3 font-mono"
                                  required
                                  autoComplete="off"
                                  value={snmpManagersGroupForm.hostName}
                                  onChange={(e) =>
                                    setSnmpManagersGroupForm((f) => ({ ...f, hostName: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="snmp-group-heartbeat-trap"
                                  checked={snmpManagersGroupForm.enableHeartbeatTrap}
                                  onCheckedChange={(checked) =>
                                    setSnmpManagersGroupForm((f) => ({
                                      ...f,
                                      enableHeartbeatTrap: Boolean(checked),
                                    }))
                                  }
                                />
                                <Label htmlFor="snmp-group-heartbeat-trap" className="cursor-pointer font-normal">
                                  Enable heartbeat trap
                                </Label>
                              </div>
                              <div>
                                <Label htmlFor="snmp-group-heartbeat-interval">
                                  Heartbeat interval (minutes) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="snmp-group-heartbeat-interval"
                                  className="mt-3"
                                  required
                                  inputMode="numeric"
                                  autoComplete="off"
                                  value={snmpManagersGroupForm.heartbeatIntervalMinutes}
                                  onChange={(e) =>
                                    setSnmpManagersGroupForm((f) => ({
                                      ...f,
                                      heartbeatIntervalMinutes: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <Label>SNMP version</Label>
                                <RadioGroup
                                  value={snmpManagersGroupForm.snmpVersion}
                                  onValueChange={(v) =>
                                    setSnmpManagersGroupForm((f) => ({
                                      ...f,
                                      snmpVersion: v as SnmpManagersGroupVersion,
                                    }))
                                  }
                                  className="mt-3 flex flex-wrap gap-6"
                                >
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem id="snmp-group-v2c" value="v2c" />
                                    <Label htmlFor="snmp-group-v2c" className="cursor-pointer font-normal">
                                      V2C
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem id="snmp-group-v3" value="v3" />
                                    <Label htmlFor="snmp-group-v3" className="cursor-pointer font-normal">
                                      V3
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                              {snmpManagersGroupForm.snmpVersion === 'v2c' ? (
                                <div>
                                  <Label htmlFor="snmp-group-community">
                                    Community <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="snmp-group-community"
                                    className="mt-3 font-mono"
                                    required
                                    autoComplete="off"
                                    value={snmpManagersGroupForm.community}
                                    onChange={(e) =>
                                      setSnmpManagersGroupForm((f) => ({ ...f, community: e.target.value }))
                                    }
                                  />
                                </div>
                              ) : (
                                <div>
                                  <Label htmlFor="snmp-group-v3-user">
                                    User name <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    id="snmp-group-v3-user"
                                    className="mt-3"
                                    required
                                    autoComplete="off"
                                    value={snmpManagersGroupForm.v3UserName}
                                    onChange={(e) =>
                                      setSnmpManagersGroupForm((f) => ({ ...f, v3UserName: e.target.value }))
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                        <SheetFooter className="mt-auto shrink-0 flex flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-4">
                          <div className="min-w-0">
                            {snmpManagersGroupEditIndex !== null ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  if (snmpManagersGroupEditIndex !== null) {
                                    setAlarmForwardingDeleteIndex(snmpManagersGroupEditIndex);
                                  }
                                }}
                              >
                                <Icon name="delete" size={16} />
                                Delete
                              </Button>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSnmpManagersGroupSheetOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              const name = snmpManagersGroupForm.name.trim();
                              const hostName = snmpManagersGroupForm.hostName.trim();
                              const port = snmpManagersGroupForm.port.trim();
                              const heartbeat = snmpManagersGroupForm.heartbeatIntervalMinutes.trim();
                              if (!name || !hostName || !port || !heartbeat) {
                                toast.error('Enter name, host name, port, and heartbeat interval.');
                                return;
                              }
                              if (snmpManagersGroupForm.snmpVersion === 'v2c') {
                                if (!snmpManagersGroupForm.community.trim()) {
                                  toast.error('Enter community for SNMP V2C.');
                                  return;
                                }
                              } else if (!snmpManagersGroupForm.v3UserName.trim()) {
                                toast.error('Enter user name for SNMP V3.');
                                return;
                              }
                              const editIdx = snmpManagersGroupEditIndex;
                              setAlarmForwardingRows((prev) => {
                                if (editIdx !== null) {
                                  return prev.map((r, i) => (i === editIdx ? { name, hostName } : r));
                                }
                                return [...prev, { name, hostName }];
                              });
                              setSnmpManagersGroupSheetOpen(false);
                              setSnmpManagersGroupForm({ ...DEFAULT_SNMP_MANAGERS_GROUP_FORM });
                              setSnmpManagersGroupEditIndex(null);
                              toast.success(
                                editIdx !== null ? 'SNMP managers group updated' : 'SNMP managers group added',
                              );
                            }}
                          >
                            Save
                          </Button>
                          </div>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    <AlertDialog
                      open={alarmForwardingDeleteIndex !== null}
                      onOpenChange={(open) => {
                        if (!open) setAlarmForwardingDeleteIndex(null);
                      }}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete SNMP managers group?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {(() => {
                              const i = alarmForwardingDeleteIndex;
                              if (i === null) {
                                return 'Remove this SNMP managers group from alarm forwarding?';
                              }
                              const r = alarmForwardingRows[i];
                              return `This will remove "${r?.name ?? ''}" (${r?.hostName ?? ''}) from alarm forwarding.`;
                            })()}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              const i = alarmForwardingDeleteIndex;
                              if (i === null) return;
                              setAlarmForwardingRows((prev) => prev.filter((_, idx) => idx !== i));
                              setAlarmForwardingDeleteIndex(null);
                              setSnmpManagersGroupSheetOpen(false);
                              setSnmpManagersGroupForm({ ...DEFAULT_SNMP_MANAGERS_GROUP_FORM });
                              setSnmpManagersGroupEditIndex(null);
                              toast.success('SNMP managers group removed');
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>

                  <TabsContent value="snmp-agent" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="snmp-enable-internal-agent" checked={snmpEnableInternalAgent} onCheckedChange={(checked) => setSnmpEnableInternalAgent(Boolean(checked))} />
                            <Label htmlFor="snmp-enable-internal-agent">Enable internal SNMP agent</Label>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="snmp-enable-v2c" checked={snmpEnableV2c} onCheckedChange={(checked) => setSnmpEnableV2c(Boolean(checked))} />
                            <Label htmlFor="snmp-enable-v2c">SNMP v2c</Label>
                          </div>
                          <div>
                            <Label htmlFor="snmp-read-community">Read community</Label>
                            <Input id="snmp-read-community" className="mt-3" value={snmpReadCommunity} onChange={(e) => setSnmpReadCommunity(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="snmp-write-community">Write community</Label>
                            <Input id="snmp-write-community" className="mt-3" value={snmpWriteCommunity} onChange={(e) => setSnmpWriteCommunity(e.target.value)} />
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="snmp-enable-v3" checked={snmpEnableV3} onCheckedChange={(checked) => setSnmpEnableV3(Boolean(checked))} />
                            <Label htmlFor="snmp-enable-v3">SNMP v3</Label>
                          </div>
                          <div className="md:col-span-2 space-y-5">
                            <div>
                              <Label htmlFor="snmp-engine-id">SNMP engine ID</Label>
                              <Input id="snmp-engine-id" className="mt-3" value={snmpEngineId} onChange={(e) => setSnmpEngineId(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="snmp-user-name">Username</Label>
                              <Input id="snmp-user-name" className="mt-3" value={snmpUserName} onChange={(e) => setSnmpUserName(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="snmp-authentication-protocol">Authentication protocol</Label>
                              <Input id="snmp-authentication-protocol" className="mt-3" value={snmpAuthenticationProtocol} onChange={(e) => setSnmpAuthenticationProtocol(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="snmp-change-auth-password" checked={snmpChangeAuthenticationPassword} onCheckedChange={(checked) => setSnmpChangeAuthenticationPassword(Boolean(checked))} />
                              <Label htmlFor="snmp-change-auth-password">Change authentication protocol password</Label>
                            </div>
                            <div>
                              <Label htmlFor="snmp-privacy-protocol">Privacy protocol</Label>
                              <Input id="snmp-privacy-protocol" className="mt-3" value={snmpPrivacyProtocol} onChange={(e) => setSnmpPrivacyProtocol(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="snmp-change-privacy-password" checked={snmpChangePrivacyPassword} onCheckedChange={(checked) => setSnmpChangePrivacyPassword(Boolean(checked))} />
                              <Label htmlFor="snmp-change-privacy-password">Change privacy protocol password</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="syslog-forwarding" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="default"
                        aria-label="Add syslog collector"
                        onClick={() => {
                          setSyslogEditIndex(null);
                          setSyslogForm({ ...DEFAULT_SYSLOG_FORWARDING_FORM });
                          setSyslogSheetOpen(true);
                        }}
                      >
                        <Icon name="add" size={16} />
                        Add syslog collector
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-lg border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Host name</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Port</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Enable</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">List of enabled events</TableHead>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Description</TableHead>
                            <TableHead className="w-14 px-2 py-3 text-right">
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {syslogForwardingRows.map((row, idx) => (
                            <TableRow key={`${row.hostName}-${row.port}-${idx}`}>
                              <TableCell className="px-4 py-3 font-mono text-sm">{row.hostName}</TableCell>
                              <TableCell className="px-4 py-3">{row.port}</TableCell>
                              <TableCell className="px-4 py-3">
                                <Switch
                                  checked={row.enabled}
                                  onCheckedChange={(checked) =>
                                    setSyslogForwardingRows((prev) =>
                                      prev.map((r, i) => (i === idx ? { ...r, enabled: Boolean(checked) } : r)),
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                {syslogEventLabels(row).length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {syslogEventLabels(row).map((eventName) => (
                                      <Badge key={`${row.hostName}-${eventName}-${idx}`} variant="secondary" className="font-normal">
                                        {eventName}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-muted-foreground">{row.description}</TableCell>
                              <TableCell className="px-2 py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      aria-label={`Actions for ${row.hostName}`}
                                    >
                                      <Icon name="more_vert" size={18} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        setSyslogEditIndex(idx);
                                        setSyslogForm({
                                          hostName: row.hostName,
                                          port: row.port,
                                          enabled: row.enabled,
                                          enableAuditTrail: row.enableAuditTrail,
                                          enableSystemEvent: row.enableSystemEvent,
                                          description: row.description,
                                        });
                                        setSyslogSheetOpen(true);
                                      }}
                                    >
                                      <Icon name="edit" size={16} className="mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={() => setSyslogDeleteIndex(idx)}
                                    >
                                      <Icon name="delete" size={16} className="mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Sheet
                      open={syslogSheetOpen}
                      onOpenChange={(open) => {
                        setSyslogSheetOpen(open);
                        if (!open) {
                          setSyslogForm({ ...DEFAULT_SYSLOG_FORWARDING_FORM });
                          setSyslogEditIndex(null);
                        }
                      }}
                    >
                      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
                        <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
                          <SheetTitle>
                            {syslogEditIndex !== null ? 'Edit syslog collector' : 'Add syslog collector'}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                          <div className="rounded-lg border border-border bg-muted/10 p-4 md:p-5">
                            <div className="space-y-5">
                              <div>
                                <Label htmlFor="syslog-form-host">
                                  Host name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="syslog-form-host"
                                  className="mt-3 font-mono"
                                  required
                                  autoComplete="off"
                                  value={syslogForm.hostName}
                                  onChange={(e) => setSyslogForm((f) => ({ ...f, hostName: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="syslog-form-port">
                                  Port <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="syslog-form-port"
                                  className="mt-3"
                                  required
                                  inputMode="numeric"
                                  autoComplete="off"
                                  value={syslogForm.port}
                                  onChange={(e) => setSyslogForm((f) => ({ ...f, port: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="syslog-form-enabled"
                                    checked={syslogForm.enabled}
                                    onCheckedChange={(checked) =>
                                      setSyslogForm((f) => ({ ...f, enabled: Boolean(checked) }))
                                    }
                                  />
                                  <Label htmlFor="syslog-form-enabled" className="cursor-pointer font-normal">
                                    Enable
                                  </Label>
                                </div>
                                <div className="ml-6 space-y-3 border-l border-border pl-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="syslog-form-audit-trail"
                                      disabled={!syslogForm.enabled}
                                      checked={syslogForm.enableAuditTrail}
                                      onCheckedChange={(checked) =>
                                        setSyslogForm((f) => ({ ...f, enableAuditTrail: Boolean(checked) }))
                                      }
                                    />
                                    <Label
                                      htmlFor="syslog-form-audit-trail"
                                      className={cn(
                                        'cursor-pointer font-normal',
                                        !syslogForm.enabled && 'cursor-not-allowed opacity-50',
                                      )}
                                    >
                                      Enable audit trail
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="syslog-form-system-event"
                                      disabled={!syslogForm.enabled}
                                      checked={syslogForm.enableSystemEvent}
                                      onCheckedChange={(checked) =>
                                        setSyslogForm((f) => ({ ...f, enableSystemEvent: Boolean(checked) }))
                                      }
                                    />
                                    <Label
                                      htmlFor="syslog-form-system-event"
                                      className={cn(
                                        'cursor-pointer font-normal',
                                        !syslogForm.enabled && 'cursor-not-allowed opacity-50',
                                      )}
                                    >
                                      Enable system event
                                    </Label>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="syslog-form-description">
                                  Description <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="syslog-form-description"
                                  className="mt-3"
                                  required
                                  autoComplete="off"
                                  value={syslogForm.description}
                                  onChange={(e) => setSyslogForm((f) => ({ ...f, description: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <SheetFooter className="mt-auto shrink-0 flex flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-4">
                          <div className="min-w-0">
                            {syslogEditIndex !== null ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  if (syslogEditIndex !== null) {
                                    setSyslogDeleteIndex(syslogEditIndex);
                                  }
                                }}
                              >
                                <Icon name="delete" size={16} />
                                Delete
                              </Button>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setSyslogSheetOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                const hostName = syslogForm.hostName.trim();
                                const port = syslogForm.port.trim();
                                const description = syslogForm.description.trim();
                                if (!hostName || !port || !description) {
                                  toast.error('Enter host name, port, and description.');
                                  return;
                                }
                                if (
                                  syslogForm.enabled &&
                                  !syslogForm.enableAuditTrail &&
                                  !syslogForm.enableSystemEvent
                                ) {
                                  toast.error('When the collector is enabled, select audit trail, system event, or both.');
                                  return;
                                }
                                const row: SyslogForwardingRow = {
                                  hostName,
                                  port,
                                  enabled: syslogForm.enabled,
                                  enableAuditTrail: syslogForm.enableAuditTrail,
                                  enableSystemEvent: syslogForm.enableSystemEvent,
                                  description,
                                };
                                const editIdx = syslogEditIndex;
                                setSyslogForwardingRows((prev) => {
                                  if (editIdx !== null) {
                                    return prev.map((r, i) => (i === editIdx ? row : r));
                                  }
                                  return [...prev, row];
                                });
                                setSyslogSheetOpen(false);
                                setSyslogForm({ ...DEFAULT_SYSLOG_FORWARDING_FORM });
                                setSyslogEditIndex(null);
                                toast.success(
                                  editIdx !== null ? 'Syslog collector updated' : 'Syslog collector added',
                                );
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    <AlertDialog
                      open={syslogDeleteIndex !== null}
                      onOpenChange={(open) => {
                        if (!open) setSyslogDeleteIndex(null);
                      }}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete syslog collector?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {(() => {
                              const i = syslogDeleteIndex;
                              if (i === null) {
                                return 'Remove this syslog collector from the list?';
                              }
                              const r = syslogForwardingRows[i];
                              return `This will remove "${r?.hostName ?? ''}" (port ${r?.port ?? ''}) from syslog forwarding.`;
                            })()}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              const i = syslogDeleteIndex;
                              if (i === null) return;
                              setSyslogForwardingRows((prev) => prev.filter((_, idx) => idx !== i));
                              setSyslogDeleteIndex(null);
                              setSyslogSheetOpen(false);
                              setSyslogForm({ ...DEFAULT_SYSLOG_FORWARDING_FORM });
                              setSyslogEditIndex(null);
                              toast.success('Syslog collector removed');
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="space-y-6">
                <Tabs value={emailTab} onValueChange={setEmailTab}>
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="email-groups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        Email groups
                      </TabsTrigger>
                      <TabsTrigger value="smtp" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                        SMTP
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="email-groups" className="mt-6 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="default"
                        aria-label="Add email group"
                        onClick={() => {
                          setEmailGroupSheetEditId(null);
                          setEmailGroupSheetName('');
                          setEmailGroupSheetAddressesText('');
                          setEmailGroupSheetOpen(true);
                        }}
                      >
                        <Icon name="add" size={16} />
                        Add email group
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-lg border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Name</TableHead>
                            <TableHead className="px-4 py-3 h-10">Email addresses</TableHead>
                            <TableHead className="w-14 px-2 py-3 text-right">
                              <span className="sr-only">Actions</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {emailGroupSidebarItems.map((item) => {
                            const group = emailGroupById[item.id] ?? { name: item.label, emailAddresses: [] as string[] };
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="px-4 py-3 font-medium">{group.name}</TableCell>
                                <TableCell className="px-4 py-3">
                                  {group.emailAddresses.length > 0 ? (
                                    <div className="flex max-w-xl flex-wrap gap-1.5">
                                      {group.emailAddresses.map((address) => (
                                        <Badge key={`${item.id}-${address}`} variant="secondary" className="font-normal">
                                          {address}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="px-2 py-3 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label={`Actions for ${group.name}`}
                                      >
                                        <Icon name="more_vert" size={18} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onSelect={() => {
                                          setEmailGroupSheetEditId(item.id);
                                          setEmailGroupSheetName(group.name);
                                          setEmailGroupSheetAddressesText(group.emailAddresses.join('\n'));
                                          setEmailGroupSheetOpen(true);
                                        }}
                                      >
                                        <Icon name="edit" size={16} className="mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        disabled={emailGroupSidebarItems.length <= 1}
                                        onSelect={() => {
                                          if (emailGroupSidebarItems.length <= 1) {
                                            toast.error('Keep at least one email group.');
                                            return;
                                          }
                                          setEmailGroupDeleteId(item.id);
                                        }}
                                      >
                                        <Icon name="delete" size={16} className="mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <Sheet
                      open={emailGroupSheetOpen}
                      onOpenChange={(open) => {
                        setEmailGroupSheetOpen(open);
                        if (!open) {
                          setEmailGroupSheetEditId(null);
                          setEmailGroupSheetName('');
                          setEmailGroupSheetAddressesText('');
                        }
                      }}
                    >
                      <SheetContent side="right" className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
                        <SheetHeader className="shrink-0 space-y-0 border-b border-border px-4 pb-4 pt-4 pr-12 text-left">
                          <SheetTitle>
                            {emailGroupSheetEditId !== null ? 'Edit email group' : 'Add email group'}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                          <div className="space-y-5">
                            <div>
                              <Label htmlFor="email-group-sheet-name">
                                Name <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="email-group-sheet-name"
                                className="mt-3"
                                autoComplete="off"
                                value={emailGroupSheetName}
                                onChange={(e) => setEmailGroupSheetName(e.target.value)}
                                placeholder="Enter group name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email-group-sheet-addresses">
                                Email addresses
                              </Label>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Enter one address per line, or separate with commas or semicolons.
                              </p>
                              <Textarea
                                id="email-group-sheet-addresses"
                                className="mt-2 min-h-32 font-mono text-sm"
                                value={emailGroupSheetAddressesText}
                                onChange={(e) => setEmailGroupSheetAddressesText(e.target.value)}
                                placeholder={'noc@acme.com\noncall@acme.com'}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Plain div: SheetFooter defaults (flex-col-reverse sm:justify-end) hide the left Delete action on some breakpoints. */}
                        <div className="mt-auto flex shrink-0 flex-row flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-4">
                          <div className="flex min-w-0 flex-1">
                            {emailGroupSheetEditId !== null ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                disabled={emailGroupSidebarItems.length <= 1}
                                onClick={() => {
                                  if (emailGroupSheetEditId !== null) {
                                    if (emailGroupSidebarItems.length <= 1) {
                                      toast.error('Keep at least one email group.');
                                      return;
                                    }
                                    setEmailGroupDeleteId(emailGroupSheetEditId);
                                  }
                                }}
                              >
                                <Icon name="delete" size={16} />
                                Delete group
                              </Button>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEmailGroupSheetOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                const name = emailGroupSheetName.trim();
                                if (!name) {
                                  toast.error('Enter a group name.');
                                  return;
                                }
                                const emailAddresses = parseEmailAddressesText(emailGroupSheetAddressesText);
                                const editId = emailGroupSheetEditId;
                                if (editId !== null) {
                                  setEmailGroupById((prev) => ({
                                    ...prev,
                                    [editId]: { name, emailAddresses },
                                  }));
                                  setEmailGroupSidebarItems((prev) =>
                                    prev.map((it) => (it.id === editId ? { ...it, label: name } : it)),
                                  );
                                  toast.success('Email group updated');
                                } else {
                                  const nextNum =
                                    emailGroupSidebarItems.reduce((acc, it) => {
                                      const m = /^email-group-(\d+)$/.exec(it.id);
                                      return m ? Math.max(acc, Number(m[1])) : acc;
                                    }, 0) + 1;
                                  const newId = `email-group-${nextNum}`;
                                  setEmailGroupSidebarItems((prev) => [...prev, { id: newId, label: name }]);
                                  setEmailGroupById((prev) => ({
                                    ...prev,
                                    [newId]: { name, emailAddresses },
                                  }));
                                  toast.success('Email group added');
                                }
                                setEmailGroupSheetOpen(false);
                                setEmailGroupSheetEditId(null);
                                setEmailGroupSheetName('');
                                setEmailGroupSheetAddressesText('');
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <AlertDialog
                      open={emailGroupDeleteId !== null}
                      onOpenChange={(open) => {
                        if (!open) setEmailGroupDeleteId(null);
                      }}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete email group?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {(() => {
                              const id = emailGroupDeleteId;
                              if (id === null) return 'Remove this email group?';
                              const g = emailGroupById[id];
                              return `This will remove “${g?.name ?? id}” and its saved addresses.`;
                            })()}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              const id = emailGroupDeleteId;
                              if (id === null) return;
                              setEmailGroupSidebarItems((prev) => prev.filter((it) => it.id !== id));
                              setEmailGroupById((prev) => {
                                const next = { ...prev };
                                delete next[id];
                                return next;
                              });
                              setEmailGroupDeleteId(null);
                              setEmailGroupSheetOpen(false);
                              setEmailGroupSheetEditId(null);
                              setEmailGroupSheetName('');
                              setEmailGroupSheetAddressesText('');
                              toast.success('Email group removed');
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>

                  <TabsContent value="smtp" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-5 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <Checkbox id="smtp-enabled" checked={smtpEnabled} onCheckedChange={(checked) => setSmtpEnabled(Boolean(checked))} />
                            <Label htmlFor="smtp-enabled">Enable</Label>
                          </div>
                          <div>
                            <Label htmlFor="smtp-from-email">From email</Label>
                            <Input id="smtp-from-email" className="mt-3" value={smtpFromEmail} onChange={(e) => setSmtpFromEmail(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="smtp-email-key">Email key</Label>
                            <Input id="smtp-email-key" className="mt-3" value={smtpEmailKey} onChange={(e) => setSmtpEmailKey(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="smtp-server">SMTP server</Label>
                            <Input id="smtp-server" className="mt-3" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="smtp-port">SMTP port*</Label>
                            <Input id="smtp-port" className="mt-3" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                          </div>
                          <div>
                            <Label>Security</Label>
                            <RadioGroup
                              value={smtpSecurityMode}
                              onValueChange={(value) => setSmtpSecurityMode(value as 'none' | 'starttls' | 'ssl')}
                              className="mt-3 flex flex-wrap gap-6"
                            >
                              <label className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem id="smtp-security-none" value="none" />
                                <Label htmlFor="smtp-security-none">None</Label>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem id="smtp-security-starttls" value="starttls" />
                                <Label htmlFor="smtp-security-starttls">STARTTLS</Label>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <RadioGroupItem id="smtp-security-ssl" value="ssl" />
                                <Label htmlFor="smtp-security-ssl">SSL</Label>
                              </label>
                            </RadioGroup>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="smtp-use-auth" checked={smtpUseAuthentication} onCheckedChange={(checked) => setSmtpUseAuthentication(Boolean(checked))} />
                            <Label htmlFor="smtp-use-auth">Use authentication</Label>
                          </div>
                          {smtpUseAuthentication ? (
                            <div className="space-y-5 rounded-lg border border-border bg-muted/10 p-4 md:p-5">
                              <div>
                                <Label htmlFor="smtp-user-name">Username</Label>
                                <Input id="smtp-user-name" className="mt-3" value={smtpUserName} onChange={(e) => setSmtpUserName(e.target.value)} />
                              </div>
                              <div>
                                <Label htmlFor="smtp-password">Password</Label>
                                <Input id="smtp-password" className="mt-3" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <Label htmlFor="smtp-test-email">Send test email</Label>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Input id="smtp-test-email" className="max-w-md" value={smtpTestEmail} onChange={(e) => setSmtpTestEmail(e.target.value)} />
                              <Button type="button" onClick={() => toast.success(`Test email sent to ${smtpTestEmail}`)}>
                                Send
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeSection === 'fault-management' && (
              <FaultManagementPage />
            )}

            {activeSection === 'label-management' && (
              <LabelManagementPage />
            )}

            {activeSection === 'file-management' && (
              <FileManagementPage fileMgmt={fileMgmt} setFileMgmt={setFileMgmt} />
            )}

            {activeSection === 'device-migration' && (
              <DeviceMigrationPage />
            )}

            {activeSection === 'performance' && (() => {
              const allProfiles = Object.values(profileData);
              const filteredProfiles = perfProfileSearch.trim()
                ? allProfiles.filter((p) => p.name.toLowerCase().includes(perfProfileSearch.toLowerCase().trim()))
                : allProfiles;

              return (
                <div className="flex gap-6">
                  {/* Profiles sidebar */}
                  <aside className="w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden flex flex-col max-h-[calc(100vh-12rem)] self-start">
                    <div className="p-3 border-b border-border/80 bg-muted/20">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">TCA profiles</h3>
                      </div>
                      <Button
                        type="button"
                        variant="default"
                        className="mt-2 w-full justify-center"
                        aria-label="Add profile"
                        onClick={() => {
                          setNewProfileName('');
                          setNewProfileDesc('');
                          setAddProfileOpen(true);
                        }}
                      >
                        <Icon name="add" size={16} className="shrink-0" />
                        <span className="truncate">Add profile</span>
                      </Button>
                      <div className="relative mt-3">
                        <Icon name="search" size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Search profiles..."
                          value={perfProfileSearch}
                          onChange={(e) => setPerfProfileSearch(e.target.value)}
                          className="h-8 pl-8 pr-2 w-full text-sm rounded-md bg-background border-border/80"
                        />
                      </div>
                    </div>
                    <nav className="p-2 flex-1 min-h-0 overflow-y-auto">
                      {filteredProfiles.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No profiles match</p>
                      ) : (
                        filteredProfiles.map((profile) => {
                          const isSelected = selectedPerfProfile === profile.name;
                          return (
                            <button
                              key={profile.name}
                              type="button"
                              onClick={() => { setSelectedPerfProfile(profile.name); setPerfNameEditing(false); setPerfDescEditing(false); setPerfScheduleTab('1'); }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-sm transition-colors ${
                                isSelected
                                  ? 'bg-accent text-accent-foreground font-medium'
                                  : 'hover:bg-muted/60 text-foreground'
                              }`}
                            >
                              <span className="truncate min-w-0">{profile.name}</span>
                            </button>
                          );
                        })
                      )}
                    </nav>
                  </aside>

                  {/* Main content */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Profile-specific pill tabs */}
                    {(() => {
                      const deviceCount = currentProfileData.devices;
                      return (
                        <Tabs value={perfTab} onValueChange={(v) => setPerfTab(v as 'thresholds' | 'devices')}>
                          <TabsList>
                            <TabsTrigger value="thresholds">Threshold crossing settings</TabsTrigger>
                            <TabsTrigger value="devices" className="gap-1.5">
                              Devices
                              <Badge variant="secondary" className="ml-0.5 px-1.5 min-w-[20px] justify-center text-xs">{deviceCount}</Badge>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      );
                    })()}

                    {perfTab === 'thresholds' && (
                      <div className="space-y-6">
                          {/* Name */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                              {perfNameEditing ? (
                                <Input
                                  autoFocus
                                  value={perfName}
                                  onChange={(e) => setPerfName(e.target.value)}
                                  onBlur={() => setPerfNameEditing(false)}
                                  onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setPerfNameEditing(false); }}
                                  className="h-8 text-sm w-64"
                                />
                              ) : (
                                <div
                                  className="group/name relative inline-flex items-center gap-1.5 rounded-md px-2 py-1 -mx-2 -my-1 cursor-pointer transition-colors hover:bg-muted/60"
                                  onClick={() => setPerfNameEditing(true)}
                                >
                                  <p className="text-sm">{perfName}</p>
                                  <Icon name="edit" size={14} className="text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-2">
                                <Switch id="perf-enabled" checked={currentProfileData.enabled} onCheckedChange={(v) => updateProfile({ enabled: v })} />
                                <Label htmlFor="perf-enabled" className="cursor-pointer select-none text-sm">Enabled</Label>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={Object.keys(profileData).length <= 1} onClick={() => setDeleteProfileOpen(true)}>
                                <Icon name="delete" size={18} />
                              </Button>
                            </div>
                          </div>

                          {/* Delete profile confirmation */}
                          <AlertDialog open={deleteProfileOpen} onOpenChange={setDeleteProfileOpen}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete profile</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <span className="font-medium text-foreground">{perfName}</span>? This action will remove all threshold crossing settings, actions, schedules, and alert rules associated with this profile.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    const deletedKey = selectedPerfProfile;
                                    const deletedData = structuredClone(profileData[deletedKey]);
                                    // Remove from state
                                    setProfileData((prev) => {
                                      const next = { ...prev };
                                      delete next[deletedKey];
                                      return next;
                                    });
                                    // Select next available profile
                                    const remaining = Object.keys(profileData).filter((k) => k !== deletedKey);
                                    if (remaining.length > 0) {
                                      setSelectedPerfProfile(remaining[0]);
                                      setPerfScheduleTab('1');
                                    }
                                    toast(`"${deletedData.name}" has been deleted`, {
                                      action: {
                                        label: 'Undo',
                                        onClick: () => {
                                          setProfileData((prev) => ({ ...prev, [deletedKey]: deletedData }));
                                          setSelectedPerfProfile(deletedKey);
                                          setPerfScheduleTab('1');
                                          toast.success(`"${deletedData.name}" has been restored`);
                                        },
                                      },
                                    });
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Add profile dialog */}
                          <Dialog open={addProfileOpen} onOpenChange={setAddProfileOpen}>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Add profile</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                  <Label htmlFor="new-profile-name" className="text-sm font-medium">Name</Label>
                                  <Input
                                    id="new-profile-name"
                                    autoFocus
                                    placeholder="e.g. DL Throughput SLA"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    className="h-9"
                                  />
                                  {newProfileName.trim() && profileData[newProfileName.trim()] && (
                                    <p className="text-xs text-destructive">A profile with this name already exists.</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-profile-desc" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                  <Textarea
                                    id="new-profile-desc"
                                    placeholder="Describe the purpose of this profile..."
                                    value={newProfileDesc}
                                    onChange={(e) => setNewProfileDesc(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setAddProfileOpen(false)}>Cancel</Button>
                                <Button
                                  disabled={!newProfileName.trim() || !!profileData[newProfileName.trim()]}
                                  onClick={() => {
                                    const name = newProfileName.trim();
                                    const newProfile: ProfileData = {
                                      name,
                                      devices: 0,
                                      description: newProfileDesc.trim(),
                                      enabled: true,
                                      actions: [],
                                      schedules: {
                                        '1': { days: ['mon', 'tue', 'wed', 'thu', 'fri'], allDay: true, startTime: '08:00', endTime: '18:00' },
                                      },
                                      rules: [],
                                    };
                                    setProfileData((prev) => ({ ...prev, [name]: newProfile }));
                                    setSelectedPerfProfile(name);
                                    setPerfScheduleTab('1');
                                    setPerfNameEditing(false);
                                    setPerfDescEditing(false);
                                    setAddProfileOpen(false);
                                    toast.success(`"${name}" has been created`);
                                  }}
                                >
                                  Add
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Description */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                            {perfDescEditing ? (
                              <textarea
                                autoFocus
                                value={perfDescription}
                                onChange={(e) => setPerfDescription(e.target.value)}
                                onBlur={() => setPerfDescEditing(false)}
                                onKeyDown={(e) => { if (e.key === 'Escape') setPerfDescEditing(false); }}
                                className="w-full text-sm text-foreground bg-background border border-input rounded-md px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                rows={3}
                              />
                            ) : (
                              <div
                                className="group/desc inline-flex items-start gap-1.5 rounded-md px-2 py-1.5 -mx-2 -my-1.5 cursor-pointer transition-colors hover:bg-muted/60"
                                onClick={() => setPerfDescEditing(true)}
                              >
                                <p className="text-sm text-foreground">{perfDescription}</p>
                                <Icon name="edit" size={14} className="shrink-0 mt-0.5 text-muted-foreground opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Actions</h4>
                              <Button type="button" variant="default">
                                <Icon name="add" size={16} />
                                Add action
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">What actions should this profile take when triggered?</p>
                            <div className="overflow-hidden rounded-lg border bg-card">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="px-4">Action</TableHead>
                                    <TableHead className="px-4">Details</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentProfileData.actions.map((act, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="px-4">{act.action}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground truncate max-w-[300px]">
                                        {act.detailType === 'badge' ? <Badge variant="secondary">{act.details}</Badge> : act.details}
                                      </TableCell>
                                      <TableCell className="px-2 text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Icon name="more_vert" size={16} /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Icon name="edit" size={16} className="mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Icon name="delete" size={16} className="mr-2" />Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
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
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Schedule</h4>
                              <Button type="button" variant="default" disabled={scheduleKeys.length >= 2} onClick={() => { setNewSchedule({ days: [], allDay: true, startTime: '08:00', endTime: '18:00' }); setAddScheduleOpen(true); }}>
                                <Icon name="add" size={16} />
                                Add schedule
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Set when alerts should be active for this profile. (Create up to 2)</p>
                            <Tabs value={perfScheduleTab} onValueChange={setPerfScheduleTab}>
                              <TabsList>
                                {scheduleKeys.map((k) => (
                                  <TabsTrigger key={k} value={k}>{k}</TabsTrigger>
                                ))}
                              </TabsList>
                            </Tabs>
                            {(() => {
                              const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
                              const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
                              const weekend = ['sat', 'sun'];
                              const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                              const sorted = allDays.filter((d) => currentSchedule.days.includes(d));
                              let daysLabel: string;
                              if (sorted.length === 7) daysLabel = 'Every day';
                              else if (sorted.length === 5 && weekdays.every((d) => sorted.includes(d))) daysLabel = 'Weekdays';
                              else if (sorted.length === 2 && weekend.every((d) => sorted.includes(d))) daysLabel = 'Weekends';
                              else daysLabel = sorted.map((d) => DAY_LABELS[d]).join(', ');
                              const daysShort = sorted.map((d) => DAY_LABELS[d]).join(', ');

                              const formatTime = (t: string) => {
                                const [h, m] = t.split(':').map(Number);
                                const ampm = h >= 12 ? 'PM' : 'AM';
                                const hr = h % 12 || 12;
                                return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
                              };
                              const timeLabel = currentSchedule.allDay ? 'All day' : `${formatTime(currentSchedule.startTime)} – ${formatTime(currentSchedule.endTime)}`;

                              return (
                                <div className="mt-3 rounded-lg border bg-muted/30 p-4 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon name="calendar_today" size={16} className="text-muted-foreground" />
                                      <span className="font-medium">{daysLabel}</span>
                                      {daysLabel !== daysShort && <span className="text-muted-foreground">{daysShort}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Icon name="schedule" size={16} className="text-muted-foreground" />
                                      <span className="font-medium">{timeLabel}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditScheduleOpen(true)}>
                                      <Icon name="edit" size={16} className="text-muted-foreground" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      disabled={scheduleKeys.length <= 1}
                                      onClick={() => {
                                        const keyToDelete = perfScheduleTab;
                                        const remaining = scheduleKeys.filter((k) => k !== keyToDelete);
                                        setSchedules((prev) => {
                                          const next = { ...prev };
                                          delete next[keyToDelete];
                                          return next;
                                        });
                                        setPerfScheduleTab(remaining[0]);
                                        toast.success(`Schedule ${keyToDelete} deleted`);
                                      }}
                                    >
                                      <Icon name="delete" size={16} className="text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Edit schedule dialog */}
                            <Dialog open={editScheduleOpen} onOpenChange={setEditScheduleOpen}>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit schedule {perfScheduleTab}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 py-2">
                                  {/* Days */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Days</Label>
                                    <div className="flex gap-1.5">
                                      {([
                                        { value: 'mon', label: 'M' },
                                        { value: 'tue', label: 'T' },
                                        { value: 'wed', label: 'W' },
                                        { value: 'thu', label: 'T' },
                                        { value: 'fri', label: 'F' },
                                        { value: 'sat', label: 'S' },
                                        { value: 'sun', label: 'S' },
                                      ]).map((day) => {
                                        const isActive = currentSchedule.days.includes(day.value);
                                        return (
                                          <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => updateCurrentSchedule({
                                              days: isActive ? currentSchedule.days.filter((d) => d !== day.value) : [...currentSchedule.days, day.value]
                                            })}
                                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                                              isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                          >
                                            {day.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {/* All day toggle */}
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="schedule-all-day" className="text-sm font-medium cursor-pointer">All day</Label>
                                    <Switch id="schedule-all-day" checked={currentSchedule.allDay} onCheckedChange={(v) => updateCurrentSchedule({ allDay: v })} />
                                  </div>
                                  {/* Time range */}
                                  {!currentSchedule.allDay && (
                                    <div className="flex items-center gap-3">
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">Start time</Label>
                                        <Input type="time" value={currentSchedule.startTime} onChange={(e) => updateCurrentSchedule({ startTime: e.target.value })} className="h-9" />
                                      </div>
                                      <span className="text-muted-foreground mt-5">–</span>
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">End time</Label>
                                        <Input type="time" value={currentSchedule.endTime} onChange={(e) => updateCurrentSchedule({ endTime: e.target.value })} className="h-9" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setEditScheduleOpen(false)}>Cancel</Button>
                                  <Button onClick={() => { setEditScheduleOpen(false); toast.success('Schedule updated'); }}>Save</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Add schedule dialog */}
                            <Dialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen}>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Add schedule</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 py-2">
                                  {/* Days */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Days</Label>
                                    <div className="flex gap-1.5">
                                      {([
                                        { value: 'mon', label: 'M' },
                                        { value: 'tue', label: 'T' },
                                        { value: 'wed', label: 'W' },
                                        { value: 'thu', label: 'T' },
                                        { value: 'fri', label: 'F' },
                                        { value: 'sat', label: 'S' },
                                        { value: 'sun', label: 'S' },
                                      ]).map((day) => {
                                        const isActive = newSchedule.days.includes(day.value);
                                        return (
                                          <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => setNewSchedule((prev) => ({
                                              ...prev,
                                              days: isActive ? prev.days.filter((d) => d !== day.value) : [...prev.days, day.value]
                                            }))}
                                            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                                              isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            }`}
                                          >
                                            {day.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {/* All day toggle */}
                                  <div className="flex items-center justify-between">
                                    <Label htmlFor="new-schedule-all-day" className="text-sm font-medium cursor-pointer">All day</Label>
                                    <Switch id="new-schedule-all-day" checked={newSchedule.allDay} onCheckedChange={(v) => setNewSchedule((prev) => ({ ...prev, allDay: v }))} />
                                  </div>
                                  {/* Time range */}
                                  {!newSchedule.allDay && (
                                    <div className="flex items-center gap-3">
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">Start time</Label>
                                        <Input type="time" value={newSchedule.startTime} onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))} className="h-9" />
                                      </div>
                                      <span className="text-muted-foreground mt-5">–</span>
                                      <div className="space-y-1.5 flex-1">
                                        <Label className="text-xs text-muted-foreground">End time</Label>
                                        <Input type="time" value={newSchedule.endTime} onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))} className="h-9" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setAddScheduleOpen(false)}>Cancel</Button>
                                  <Button
                                    disabled={newSchedule.days.length === 0}
                                    onClick={() => {
                                      const nextKey = String(Math.max(...scheduleKeys.map(Number)) + 1);
                                      setSchedules((prev) => ({ ...prev, [nextKey]: newSchedule }));
                                      setPerfScheduleTab(nextKey);
                                      setAddScheduleOpen(false);
                                      toast.success(`Schedule ${nextKey} added`);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>

                          <Separator />

                          {/* Alert when... */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h4 className="text-sm font-semibold text-foreground">Alert when...</h4>
                              <Button type="button" variant="default">
                                <Icon name="add" size={16} />
                                Add rule
                              </Button>
                            </div>
                            <div className="overflow-hidden rounded-lg border bg-card">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="px-4">KPI</TableHead>
                                    <TableHead className="px-4">KPI type</TableHead>
                                    <TableHead className="px-4">Alert when...</TableHead>
                                    <TableHead className="px-4">Consecutive samples</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {currentProfileData.rules.map((rule, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="px-4">{rule.kpi}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.type}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.condition}</TableCell>
                                      <TableCell className="px-4 text-muted-foreground">{rule.samples}</TableCell>
                                      <TableCell className="px-2 text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Icon name="more_vert" size={16} /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Icon name="edit" size={16} className="mr-2" />Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Icon name="delete" size={16} className="mr-2" />Delete</DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                      </div>
                    )}

                    {perfTab === 'devices' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search devices..."
                              value={perfSearch}
                              onChange={(e) => setPerfSearch(e.target.value)}
                              className="pl-9 w-full"
                            />
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <Button type="button" variant="default">
                              <Icon name="add" size={16} />
                              Add device
                            </Button>
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border bg-card">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-4">Device</TableHead>
                                <TableHead className="px-4">Type</TableHead>
                                <TableHead className="px-4">Region</TableHead>
                                <TableHead className="px-4">Status</TableHead>
                                <TableHead className="w-14"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const count = currentProfileData.devices;
                                const DEVICE_NAMES = ['SEA-SN-4012','PDX-CU-2201','VAN-RCP-1180','SEA-SN-4055','PDX-SN-3312','VAN-SN-1022','SEA-CU-4088','PDX-RCP-2150','VAN-SN-1045','SEA-SN-4101','PDX-SN-3400','VAN-CU-1090','SEA-RCP-4200','PDX-SN-3201','VAN-SN-1067'];
                                const DEVICE_TYPES = ['SN','CU','RCP','SN','SN','SN','CU','RCP','SN','SN','SN','CU','RCP','SN','SN'];
                                const DEVICE_REGIONS = ['Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest','Pacific Northwest'];
                                const DEVICE_STATUSES = ['Connected','Connected','Connected','Connected','Disconnected','Connected','Connected','Connected','Connected','Connected','Connected','In maintenance','Connected','Connected','Connected'];
                                const rows = Array.from({ length: Math.min(count, 15) }, (_, i) => ({
                                  name: DEVICE_NAMES[i % DEVICE_NAMES.length],
                                  type: DEVICE_TYPES[i % DEVICE_TYPES.length],
                                  region: DEVICE_REGIONS[i % DEVICE_REGIONS.length],
                                  status: DEVICE_STATUSES[i % DEVICE_STATUSES.length],
                                }));
                                return rows.map((row, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="px-4"><DeviceLink value={row.name} maxLength={24} /></TableCell>
                                    <TableCell className="px-4"><NodeTypeBadge type={row.type} /></TableCell>
                                    <TableCell className="px-4 text-muted-foreground">{row.region}</TableCell>
                                    <TableCell className="px-4">
                                      <DeviceStatus status={row.status} />
                                    </TableCell>
                                    <TableCell className="px-4 text-right">
                                      <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <Icon name="delete" size={16} className="text-muted-foreground" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {activeSection !== 'access-control' && activeSection !== 'audit-trail' && activeSection !== 'northbound-interface' && activeSection !== 'email' && activeSection !== 'fault-management' && activeSection !== 'label-management' && activeSection !== 'file-management' && activeSection !== 'device-migration' && activeSection !== 'performance' && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {activeLabel} content will be displayed here.
                </p>
              </div>
            )}
            </div>
            {administrationPageDirty ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-4 py-3">
                <Button type="button" variant="outline" onClick={handleAdministrationCancelAll}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAdministrationSaveAll}>
                  Save
                </Button>
              </div>
            ) : null}
          </div>
        </SidebarInset>
      </SidebarProvider>

      <AlertDialog
        open={adminNavigationBlockerOpen}
        onOpenChange={(open) => {
          if (!open) {
            pendingAdminNavigationRef.current = null;
            setAdminNavigationBlockerOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                discardUnsavedAndNavigate();
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { DeviceStatus } from './ui/device-status';
import { DeviceLink } from './ui/device-link';
import { NodeTypeBadge } from './ui/node-type-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AccessControlUsersDataTable, ACCESS_CONTROL_USERS_DATA } from './access-control-users-data-table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { InternalSidebarList } from './ui/internal-sidebar-list';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import FaultManagementPage from './FaultManagementPage';
import LabelManagementPage from './LabelManagementPage';
import FileManagementPage from './FileManagementPage';
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
  { label: 'Service settings', icon: 'settings' },
  { label: 'Device migration', icon: 'swap_horiz' },
  { label: 'Performance', icon: 'speed' },
  { label: 'Label management', icon: 'label' },
] as const;

const PROFILE_OPTIONS = ['All', 'Administrator', 'Operator', 'Viewer'] as const;
const DEPARTMENT_OPTIONS = ['All', 'Engineering', 'Operations', 'Support', 'Management'] as const;
const LOCATION_OPTIONS = ['All', 'Seattle', 'Portland', 'San Francisco', 'Phoenix', 'New York'] as const;
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
const AUDIT_TRAIL_ROWS = [
  { seqNo: 1, operationDateTime: 'Mar 05, 2026 09:12', username: 'admin@acme.com', operationName: 'Update region name', operationStatus: 'Allowed', ageDays: 0 },
  { seqNo: 2, operationDateTime: 'Mar 04, 2026 16:48', username: 'operator@acme.com', operationName: 'Modify profile permissions', operationStatus: 'Allowed', ageDays: 1 },
  { seqNo: 3, operationDateTime: 'Mar 03, 2026 11:02', username: 'viewer@acme.com', operationName: 'Attempt user management', operationStatus: 'Denied', ageDays: 2 },
  { seqNo: 4, operationDateTime: 'Mar 01, 2026 14:35', username: 'admin@acme.com', operationName: 'Enable login banner', operationStatus: 'Allowed', ageDays: 4 },
  { seqNo: 5, operationDateTime: 'Feb 18, 2026 08:21', username: 'operator@acme.com', operationName: 'Change authentication mode', operationStatus: 'Allowed', ageDays: 16 },
] as const;
const ALARM_FORWARDING_ROWS = [
  { name: 'Primary NMS', hostName: 'nms-core-01.acme.net' },
  { name: 'Backup NMS', hostName: 'nms-dr-01.acme.net' },
] as const;
const SYSLOG_FORWARDING_ROWS = [
  {
    hostName: 'syslog-west-01.acme.net',
    port: '514',
    enabled: true,
    enabledEvents: ['Critical alarms', 'Major alarms', 'Node status changes'],
    description: 'Primary west-region syslog collector',
  },
  {
    hostName: 'syslog-central-01.acme.net',
    port: '1514',
    enabled: false,
    enabledEvents: ['Authentication events', 'Configuration changes'],
    description: 'Secondary collector for compliance logging',
  },
] as const;
interface EmailGroupSettings {
  name: string;
  emailAddresses: string[];
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
  const [selectedProfileId, setSelectedProfileId] = useState('administrator');
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
  const [pendingProfileRegions, setPendingProfileRegions] = useState<string[]>([]);
  const [pendingAdminOperations, setPendingAdminOperations] = useState<string[]>([]);
  const [pendingApplicationOperations, setPendingApplicationOperations] = useState<string[]>([]);
  const [addRegionDialogOpen, setAddRegionDialogOpen] = useState(false);
  const [addAdminOperationDialogOpen, setAddAdminOperationDialogOpen] = useState(false);
  const [addApplicationOperationDialogOpen, setAddApplicationOperationDialogOpen] = useState(false);
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
  const [regionNameValue, setRegionNameValue] = useState('');
  const [passwordAgeDays, setPasswordAgeDays] = useState('90');
  const [passwordExpiryWarningDays, setPasswordExpiryWarningDays] = useState('14');
  const [passwordMinLength, setPasswordMinLength] = useState('12');
  const [passwordReusePreventionCount, setPasswordReusePreventionCount] = useState('5');
  const [passwordReusePreventionDays, setPasswordReusePreventionDays] = useState('365');
  const [accountLockoutEnabled, setAccountLockoutEnabled] = useState(true);
  const [accountLockoutThreshold, setAccountLockoutThreshold] = useState('5');
  const [inactivityLogoutDurationMinutes, setInactivityLogoutDurationMinutes] = useState('15');
  const [loginBannerEnabled, setLoginBannerEnabled] = useState(true);
  const [bannerTitle, setBannerTitle] = useState('Authorized Access Only');
  const [messageOfDay, setMessageOfDay] = useState('Maintenance window every Sunday 02:00-04:00 UTC.');
  const [search, setSearch] = useState('');
  const [northboundTab, setNorthboundTab] = useState('alarm-forwarding');
  const [emailTab, setEmailTab] = useState('email-groups');
  const [emailGroupSidebarItems, setEmailGroupSidebarItems] = useState<Array<{ id: string; label: string }>>([
    { id: 'noc-primary', label: 'NOC Primary' },
    { id: 'operations-managers', label: 'Operations Managers' },
  ]);
  const [selectedEmailGroupId, setSelectedEmailGroupId] = useState('noc-primary');
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
  const [emailGroupNameValue, setEmailGroupNameValue] = useState('NOC Primary');
  const [addEmailAddressDialogOpen, setAddEmailAddressDialogOpen] = useState(false);
  const [pendingEmailAddress, setPendingEmailAddress] = useState('');
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
  const [profileFilter, setProfileFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
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
  const selectedProfileLabel = profilesSidebarItems.find((item) => item.id === selectedProfileId)?.label ?? 'Profile';
  const accountRegions = (regions && regions.length > 0)
    ? regions
    : (region ? [region] : ['Pacific Northwest']);
  const selectedRegionLabel = regionSidebarItems.find((item) => item.id === selectedRegionSidebarId)?.label ?? '';
  useEffect(() => {
    setRegionNameValue(selectedRegionLabel);
  }, [selectedRegionLabel]);
  const selectedProfileAccess = profileAccessById[selectedProfileId] ?? {
    regions: [],
    adminOperations: [],
    applicationOperations: [],
  };
  const availableProfileRegions = accountRegions.filter((regionName) => !selectedProfileAccess.regions.includes(regionName));
  const availableAdminOperations = ADMIN_OPERATION_OPTIONS.filter((operation) => !selectedProfileAccess.adminOperations.includes(operation));
  const availableApplicationOperations = APPLICATION_OPERATION_OPTIONS.filter((operation) => !selectedProfileAccess.applicationOperations.includes(operation));
  const auditUsernameOptions = ['All', ...Array.from(new Set(AUDIT_TRAIL_ROWS.map((row) => row.username)))];
  const updateSelectedProfileAccess = (patch: Partial<AccessControlProfileAccess>) => {
    setProfileAccessById((prev) => {
      const current = prev[selectedProfileId] ?? { regions: [], adminOperations: [], applicationOperations: [] };
      return { ...prev, [selectedProfileId]: { ...current, ...patch } };
    });
  };
  const selectedEmailGroup = emailGroupById[selectedEmailGroupId] ?? { name: '', emailAddresses: [] };
  useEffect(() => {
    setEmailGroupNameValue(selectedEmailGroup.name);
  }, [selectedEmailGroup.name, selectedEmailGroupId]);
  const filteredAuditRows = AUDIT_TRAIL_ROWS.filter((row) => {
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
    return true;
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
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
                            onClick={() => setActiveSection(key)}
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
        <SidebarInset className="min-w-0 overflow-hidden">
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
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            {activeSection === 'access-control' && (
              <div className="space-y-6">
                <Tabs value={accessControlTab} onValueChange={setAccessControlTab}>
                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                      <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                        Users
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                          {ACCESS_CONTROL_USERS_DATA.length}
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
                          3
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
                      <FilterSelect value={departmentFilter} onValueChange={setDepartmentFilter} label="Department" options={[...DEPARTMENT_OPTIONS]} className="w-[130px]" />
                      <FilterSelect value={locationFilter} onValueChange={setLocationFilter} label="Location" options={[...LOCATION_OPTIONS]} className="w-[130px]" />
                    </div>
                    <AccessControlUsersDataTable />
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
                                      <p className="text-sm font-medium text-foreground">VSNET Only</p>
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
                                      <p className="text-sm font-medium text-foreground">External Only</p>
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
                                <Label htmlFor="external-auth-type">External Authentication Type</Label>
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

                  <TabsContent value="profiles" className="mt-6">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <InternalSidebarList
                        title="Profiles"
                        items={profilesSidebarItems}
                        selectedId={selectedProfileId}
                        onSelect={setSelectedProfileId}
                        showAddAction
                        addAriaLabel="Add profile"
                        onAddAction={() => {
                          const nextId = `profile-${profilesSidebarItems.length + 1}`;
                          const nextLabel = `Profile ${profilesSidebarItems.length + 1}`;
                          setProfilesSidebarItems((prev) => [...prev, { id: nextId, label: nextLabel }]);
                          setSelectedProfileId(nextId);
                          setProfileAccessById((prev) => ({
                            ...prev,
                            [nextId]: {
                              regions: accountRegions.length > 0 ? [accountRegions[0]] : [],
                              adminOperations: [],
                              applicationOperations: [],
                            },
                          }));
                          toast.success(`Added ${nextLabel}`);
                        }}
                      />
                      <div className="flex-1 space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="mb-6 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-foreground">{selectedProfileLabel}</h3>
                            </div>
                            <div className="space-y-5">
                                <div>
                                  <Label>Regions</Label>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedProfileAccess.regions.length > 0 ? (
                                      selectedProfileAccess.regions.map((regionName) => (
                                        <Badge key={`${selectedProfileId}-region-${regionName}`} variant="secondary" className="gap-1 pr-0.5">
                                          {regionName}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-sm"
                                            aria-label={`Remove ${regionName}`}
                                            onClick={() =>
                                              updateSelectedProfileAccess({
                                                regions: selectedProfileAccess.regions.filter((value) => value !== regionName),
                                              })
                                            }
                                          >
                                            <Icon name="close" size={12} />
                                          </Button>
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No regions assigned.</p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="mt-3 h-8 w-8"
                                    aria-label="Add region"
                                    disabled={availableProfileRegions.length === 0}
                                    onClick={() => {
                                      setPendingProfileRegions([]);
                                      setAddRegionDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="add" size={16} />
                                  </Button>
                                </div>
                                <div>
                                  <Label>Admin operations</Label>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedProfileAccess.adminOperations.length > 0 ? (
                                      selectedProfileAccess.adminOperations.map((operation) => (
                                        <Badge key={`${selectedProfileId}-admin-op-${operation}`} variant="secondary" className="gap-1 pr-0.5">
                                          {operation}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-sm"
                                            aria-label={`Remove ${operation}`}
                                            onClick={() =>
                                              updateSelectedProfileAccess({
                                                adminOperations: selectedProfileAccess.adminOperations.filter((value) => value !== operation),
                                              })
                                            }
                                          >
                                            <Icon name="close" size={12} />
                                          </Button>
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No admin operations assigned.</p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="mt-3 h-8 w-8"
                                    aria-label="Add admin operation"
                                    disabled={availableAdminOperations.length === 0}
                                    onClick={() => {
                                      setPendingAdminOperations([]);
                                      setAddAdminOperationDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="add" size={16} />
                                  </Button>
                                </div>
                                <div>
                                  <Label>Application operations</Label>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedProfileAccess.applicationOperations.length > 0 ? (
                                      selectedProfileAccess.applicationOperations.map((operation) => (
                                        <Badge key={`${selectedProfileId}-app-op-${operation}`} variant="secondary" className="gap-1 pr-0.5">
                                          {operation}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 rounded-sm"
                                            aria-label={`Remove ${operation}`}
                                            onClick={() =>
                                              updateSelectedProfileAccess({
                                                applicationOperations: selectedProfileAccess.applicationOperations.filter((value) => value !== operation),
                                              })
                                            }
                                          >
                                            <Icon name="close" size={12} />
                                          </Button>
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No application operations assigned.</p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="mt-3 h-8 w-8"
                                    aria-label="Add application operation"
                                    disabled={availableApplicationOperations.length === 0}
                                    onClick={() => {
                                      setPendingApplicationOperations([]);
                                      setAddApplicationOperationDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="add" size={16} />
                                  </Button>
                                </div>
                              </div>
                          </CardContent>
                        </Card>
                        <Dialog open={addRegionDialogOpen} onOpenChange={setAddRegionDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add region</DialogTitle>
                            </DialogHeader>
                            <div>
                              <Label>Regions</Label>
                              <div className="mt-3 space-y-2 max-h-56 overflow-auto">
                                {availableProfileRegions.map((regionName) => (
                                  <label key={`${selectedProfileId}-dialog-region-${regionName}`} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Checkbox
                                      checked={pendingProfileRegions.includes(regionName)}
                                      onCheckedChange={(checked) => {
                                        setPendingProfileRegions((prev) =>
                                          checked
                                            ? [...prev, regionName]
                                            : prev.filter((value) => value !== regionName),
                                        );
                                      }}
                                    />
                                    <span>{regionName}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddRegionDialogOpen(false)}>Cancel</Button>
                              <Button
                                onClick={() => {
                                  if (pendingProfileRegions.length === 0) return;
                                  updateSelectedProfileAccess({
                                    regions: [...selectedProfileAccess.regions, ...pendingProfileRegions],
                                  });
                                  setPendingProfileRegions([]);
                                  setAddRegionDialogOpen(false);
                                }}
                                disabled={pendingProfileRegions.length === 0}
                              >
                                Add
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={addAdminOperationDialogOpen} onOpenChange={setAddAdminOperationDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add admin operation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <Label>Admin operations</Label>
                              <div className="space-y-2 max-h-56 overflow-auto">
                                {availableAdminOperations.map((operation) => (
                                  <label key={`${selectedProfileId}-dialog-admin-op-${operation}`} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Checkbox
                                      checked={pendingAdminOperations.includes(operation)}
                                      onCheckedChange={(checked) => {
                                        setPendingAdminOperations((prev) =>
                                          checked
                                            ? [...prev, operation]
                                            : prev.filter((value) => value !== operation),
                                        );
                                      }}
                                    />
                                    <span>{operation}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddAdminOperationDialogOpen(false)}>Cancel</Button>
                              <Button
                                onClick={() => {
                                  if (pendingAdminOperations.length === 0) return;
                                  updateSelectedProfileAccess({
                                    adminOperations: [...selectedProfileAccess.adminOperations, ...pendingAdminOperations],
                                  });
                                  setPendingAdminOperations([]);
                                  setAddAdminOperationDialogOpen(false);
                                }}
                                disabled={pendingAdminOperations.length === 0}
                              >
                                Add
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={addApplicationOperationDialogOpen} onOpenChange={setAddApplicationOperationDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add application operation</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <Label>Application operations</Label>
                              <div className="space-y-2 max-h-56 overflow-auto">
                                {availableApplicationOperations.map((operation) => (
                                  <label key={`${selectedProfileId}-dialog-application-op-${operation}`} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <Checkbox
                                      checked={pendingApplicationOperations.includes(operation)}
                                      onCheckedChange={(checked) => {
                                        setPendingApplicationOperations((prev) =>
                                          checked
                                            ? [...prev, operation]
                                            : prev.filter((value) => value !== operation),
                                        );
                                      }}
                                    />
                                    <span>{operation}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddApplicationOperationDialogOpen(false)}>Cancel</Button>
                              <Button
                                onClick={() => {
                                  if (pendingApplicationOperations.length === 0) return;
                                  updateSelectedProfileAccess({
                                    applicationOperations: [...selectedProfileAccess.applicationOperations, ...pendingApplicationOperations],
                                  });
                                  setPendingApplicationOperations([]);
                                  setAddApplicationOperationDialogOpen(false);
                                }}
                                disabled={pendingApplicationOperations.length === 0}
                              >
                                Add
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
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
                              />
                              {selectedRegionLabel !== '' && regionNameValue.trim() !== selectedRegionLabel && (
                                <div className="mt-3 flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRegionNameValue(selectedRegionLabel)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={regionNameValue.trim().length === 0}
                                    onClick={() => {
                                      const nextLabel = regionNameValue.trim();
                                      if (!nextLabel) return;
                                      setRegionSidebarItems((prev) =>
                                        prev.map((item) =>
                                          item.id === selectedRegionSidebarId
                                            ? { ...item, label: nextLabel }
                                            : item,
                                        ),
                                      );
                                      toast.success('Region name updated');
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div>
                            <Label htmlFor="password-age-days">Password Age (Days)*</Label>
                            <Input id="password-age-days" className="mt-3" type="number" value={passwordAgeDays} onChange={(e) => setPasswordAgeDays(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-expiry-warning-days">Password Expiry Warning (Days)*</Label>
                            <Input id="password-expiry-warning-days" className="mt-3" type="number" value={passwordExpiryWarningDays} onChange={(e) => setPasswordExpiryWarningDays(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-min-length">Password Minimum Length*</Label>
                            <Input id="password-min-length" className="mt-3" type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-reuse-prevention-count">Password Reuse Prevention Count*</Label>
                            <Input id="password-reuse-prevention-count" className="mt-3" type="number" value={passwordReusePreventionCount} onChange={(e) => setPasswordReusePreventionCount(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="password-reuse-prevention-days">Password Reuse Prevention (Days)*</Label>
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
                                  <Label htmlFor="account-lockout-threshold">Account Lockout Threshold*</Label>
                                  <Input id="account-lockout-threshold" className="mt-3" type="number" value={accountLockoutThreshold} onChange={(e) => setAccountLockoutThreshold(e.target.value)} />
                                </div>
                                <div>
                                  <Label htmlFor="inactivity-logout-duration">Inactivity Logout Duration (Minutes)*</Label>
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
                                <Label htmlFor="banner-title">Banner Title*</Label>
                                <Input id="banner-title" className="mt-3" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
                              </div>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <Label htmlFor="message-of-day">Message Of Day</Label>
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
                  <FilterSelect value={auditDateRangeFilter} onValueChange={(v) => setAuditDateRangeFilter(v as (typeof AUDIT_DATE_RANGE_OPTIONS)[number])} label="Date range" options={[...AUDIT_DATE_RANGE_OPTIONS]} className="w-[170px]" />
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-hidden rounded-lg border">
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
                              <TableRow key={`audit-${row.seqNo}`}>
                                <TableCell className="px-4 py-3 tabular-nums">{row.seqNo}</TableCell>
                                <TableCell className="px-4 py-3">{row.operationDateTime}</TableCell>
                                <TableCell className="px-4 py-3">{row.username}</TableCell>
                                <TableCell className="px-4 py-3">{row.operationName}</TableCell>
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
                  </CardContent>
                </Card>
              </div>
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
                      <Button type="button" variant="outline" className="gap-1">
                        <Icon name="add" size={16} />
                        Add new snmp managers group
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="overflow-hidden rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Name</TableHead>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Host name</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ALARM_FORWARDING_ROWS.map((row) => (
                                <TableRow key={row.name}>
                                  <TableCell className="px-4 py-3">{row.name}</TableCell>
                                  <TableCell className="px-4 py-3 font-mono text-sm">{row.hostName}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="snmp-agent" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="snmp-enable-internal-agent" checked={snmpEnableInternalAgent} onCheckedChange={(checked) => setSnmpEnableInternalAgent(Boolean(checked))} />
                            <Label htmlFor="snmp-enable-internal-agent">Enable Internal SNMP Agent</Label>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox id="snmp-enable-v2c" checked={snmpEnableV2c} onCheckedChange={(checked) => setSnmpEnableV2c(Boolean(checked))} />
                            <Label htmlFor="snmp-enable-v2c">SNMP V2C</Label>
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
                            <Label htmlFor="snmp-enable-v3">SNMP V3</Label>
                          </div>
                          <div className="md:col-span-2 space-y-5">
                            <div>
                              <Label htmlFor="snmp-engine-id">Engine id</Label>
                              <Input id="snmp-engine-id" className="mt-3" value={snmpEngineId} onChange={(e) => setSnmpEngineId(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="snmp-user-name">User name</Label>
                              <Input id="snmp-user-name" className="mt-3" value={snmpUserName} onChange={(e) => setSnmpUserName(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="snmp-authentication-protocol">Authentication protocol</Label>
                              <Input id="snmp-authentication-protocol" className="mt-3" value={snmpAuthenticationProtocol} onChange={(e) => setSnmpAuthenticationProtocol(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="snmp-change-auth-password" checked={snmpChangeAuthenticationPassword} onCheckedChange={(checked) => setSnmpChangeAuthenticationPassword(Boolean(checked))} />
                              <Label htmlFor="snmp-change-auth-password">Change password authentication protocol</Label>
                            </div>
                            <div>
                              <Label htmlFor="snmp-privacy-protocol">Privacy protocol</Label>
                              <Input id="snmp-privacy-protocol" className="mt-3" value={snmpPrivacyProtocol} onChange={(e) => setSnmpPrivacyProtocol(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="snmp-change-privacy-password" checked={snmpChangePrivacyPassword} onCheckedChange={(checked) => setSnmpChangePrivacyPassword(Boolean(checked))} />
                              <Label htmlFor="snmp-change-privacy-password">Change password privacy protocol</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="syslog-forwarding" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="overflow-hidden rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Host name</TableHead>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Port</TableHead>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Enable</TableHead>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">List of enabled events</TableHead>
                                <TableHead className="px-4 py-3 h-10 whitespace-nowrap">Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {SYSLOG_FORWARDING_ROWS.map((row) => (
                                <TableRow key={`${row.hostName}-${row.port}`}>
                                  <TableCell className="px-4 py-3 font-mono text-sm">{row.hostName}</TableCell>
                                  <TableCell className="px-4 py-3">{row.port}</TableCell>
                                  <TableCell className="px-4 py-3">
                                    <Switch checked={row.enabled} disabled />
                                  </TableCell>
                                  <TableCell className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {row.enabledEvents.map((eventName) => (
                                        <Badge key={`${row.hostName}-${eventName}`} variant="secondary" className="font-normal">
                                          {eventName}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-muted-foreground">{row.description}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
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

                  <TabsContent value="email-groups" className="mt-6">
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <InternalSidebarList
                        title="Email groups"
                        items={emailGroupSidebarItems}
                        selectedId={selectedEmailGroupId}
                        onSelect={setSelectedEmailGroupId}
                        showAddAction
                        addAriaLabel="Add email group"
                        onAddAction={() => {
                          const nextIndex = emailGroupSidebarItems.length + 1;
                          const nextId = `email-group-${nextIndex}`;
                          const nextName = `Email Group ${nextIndex}`;
                          setEmailGroupSidebarItems((prev) => [...prev, { id: nextId, label: nextName }]);
                          setEmailGroupById((prev) => ({
                            ...prev,
                            [nextId]: { name: nextName, emailAddresses: [] },
                          }));
                          setSelectedEmailGroupId(nextId);
                          toast.success(`Added ${nextName}`);
                        }}
                      />
                      <div className="flex-1 space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-5">
                              <div className="max-w-md">
                                <Label htmlFor="email-group-name-field">Name</Label>
                                <Input
                                  id="email-group-name-field"
                                  className="mt-3"
                                  value={emailGroupNameValue}
                                  onChange={(e) => setEmailGroupNameValue(e.target.value)}
                                  placeholder="Enter group name"
                                />
                                {selectedEmailGroup.name !== '' && emailGroupNameValue.trim() !== selectedEmailGroup.name && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setEmailGroupNameValue(selectedEmailGroup.name)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={emailGroupNameValue.trim().length === 0}
                                      onClick={() => {
                                        const nextName = emailGroupNameValue.trim();
                                        if (!nextName) return;
                                        setEmailGroupById((prev) => ({
                                          ...prev,
                                          [selectedEmailGroupId]: {
                                            ...(prev[selectedEmailGroupId] ?? { name: '', emailAddresses: [] }),
                                            name: nextName,
                                          },
                                        }));
                                        setEmailGroupSidebarItems((prev) =>
                                          prev.map((item) => (item.id === selectedEmailGroupId ? { ...item, label: nextName } : item)),
                                        );
                                        toast.success('Email group name updated');
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Label>Email addresses</Label>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {selectedEmailGroup.emailAddresses.length > 0 ? (
                                    selectedEmailGroup.emailAddresses.map((address) => (
                                      <Badge key={`${selectedEmailGroupId}-${address}`} variant="secondary" className="gap-1 pr-0.5">
                                        {address}
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-4 w-4 rounded-sm"
                                          aria-label={`Remove ${address}`}
                                          onClick={() =>
                                            setEmailGroupById((prev) => ({
                                              ...prev,
                                              [selectedEmailGroupId]: {
                                                ...(prev[selectedEmailGroupId] ?? { name: '', emailAddresses: [] }),
                                                emailAddresses: (prev[selectedEmailGroupId]?.emailAddresses ?? []).filter((email) => email !== address),
                                              },
                                            }))
                                          }
                                        >
                                          <Icon name="close" size={12} />
                                        </Button>
                                      </Badge>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No email addresses added.</p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="mt-3 h-8 w-8"
                                  aria-label="Add email address"
                                  onClick={() => {
                                    setPendingEmailAddress('');
                                    setAddEmailAddressDialogOpen(true);
                                  }}
                                >
                                  <Icon name="add" size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Dialog open={addEmailAddressDialogOpen} onOpenChange={setAddEmailAddressDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add email address</DialogTitle>
                            </DialogHeader>
                            <div>
                              <Label htmlFor="email-group-address-input">Email address</Label>
                              <Input
                                id="email-group-address-input"
                                className="mt-3"
                                value={pendingEmailAddress}
                                onChange={(e) => setPendingEmailAddress(e.target.value)}
                                placeholder="name@example.com"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddEmailAddressDialogOpen(false)}>Cancel</Button>
                              <Button
                                disabled={!pendingEmailAddress.trim()}
                                onClick={() => {
                                  const nextEmail = pendingEmailAddress.trim();
                                  if (!nextEmail) return;
                                  setEmailGroupById((prev) => ({
                                    ...prev,
                                    [selectedEmailGroupId]: {
                                      ...(prev[selectedEmailGroupId] ?? { name: '', emailAddresses: [] }),
                                      emailAddresses: [...new Set([...(prev[selectedEmailGroupId]?.emailAddresses ?? []), nextEmail])],
                                    },
                                  }));
                                  setPendingEmailAddress('');
                                  setAddEmailAddressDialogOpen(false);
                                }}
                              >
                                Add
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
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
                            <Label htmlFor="smtp-port">SMTP Port*</Label>
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
                          <div>
                            <Label htmlFor="smtp-user-name">User name</Label>
                            <Input id="smtp-user-name" className="mt-3" value={smtpUserName} onChange={(e) => setSmtpUserName(e.target.value)} />
                          </div>
                          <div>
                            <Label htmlFor="smtp-password">Password</Label>
                            <Input id="smtp-password" className="mt-3" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
                          </div>
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
              <FileManagementPage />
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0 rounded-md" aria-label="Add profile" onClick={() => { setNewProfileName(''); setNewProfileDesc(''); setAddProfileOpen(true); }}>
                              <Icon name="add" size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add profile</TooltipContent>
                        </Tooltip>
                      </div>
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
                      <Card>
                        <CardContent className="pt-6 space-y-6">
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
                              <Button variant="outline" size="sm">
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add action
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">What actions should this profile take when triggered?</p>
                            <div className="rounded-lg border">
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
                              <Button variant="outline" size="sm" disabled={scheduleKeys.length >= 2} onClick={() => { setNewSchedule({ days: [], allDay: true, startTime: '08:00', endTime: '18:00' }); setAddScheduleOpen(true); }}>
                                <Icon name="add" size={16} className="mr-1.5" />
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
                              <Button variant="outline" size="sm">
                                <Icon name="add" size={16} className="mr-1.5" />
                                Add rule
                              </Button>
                            </div>
                            <div className="rounded-lg border">
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
                        </CardContent>
                      </Card>
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
                            <Button variant="outline" size="sm">
                              <Icon name="add" size={16} className="mr-1.5" />
                              Add device
                            </Button>
                          </div>
                        </div>
                        <div className="rounded-lg border">
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
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

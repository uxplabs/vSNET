export const FAULT_CATEGORY_OPTIONS_UI = [
  'Equipment',
  'System',
  'Network',
  'Software',
  'Security',
] as const;

export const SEVERITY_OPTIONS_UI = ['Critical', 'Major', 'Minor', 'Warning', 'Info'] as const;
export const SNMP_FORWARD_OPTIONS_UI = ['None', '162', '164'] as const;
export const EMAIL_FORWARD_OPTIONS_UI = ['None', 'All', 'Filtered'] as const;

/** Events configuration (Fault management) filter toolbar – match `FilterSelect` + Devices list pattern */
export const FAULT_EVENTS_CATEGORY_FILTER_OPTIONS = ['All', ...FAULT_CATEGORY_OPTIONS_UI] as const;
export const FAULT_EVENTS_SEVERITY_FILTER_OPTIONS = ['All', ...SEVERITY_OPTIONS_UI] as const;
export const FAULT_EVENTS_SNMP_FILTER_OPTIONS = ['All', ...SNMP_FORWARD_OPTIONS_UI] as const;
export const FAULT_EVENTS_EMAIL_FILTER_OPTIONS = ['All', 'None', 'All recipients', 'Filtered'] as const;

export type FaultManagementCategory = (typeof FAULT_CATEGORY_OPTIONS_UI)[number];
export type FaultManagementSeverity = (typeof SEVERITY_OPTIONS_UI)[number];
export type FaultManagementSnmpForward = (typeof SNMP_FORWARD_OPTIONS_UI)[number];
export type FaultManagementEmailForward = (typeof EMAIL_FORWARD_OPTIONS_UI)[number];

export interface FaultManagementRow {
  id: string;
  event: string;
  category: FaultManagementCategory;
  severity: FaultManagementSeverity;
  forwardToSnmp: FaultManagementSnmpForward;
  forwardToEmail: FaultManagementEmailForward;
  group: string;
}

const FAULT_ADD_SHEET_DRAFT_ID = '__fault_add_draft__';

export function newFaultEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `faultevt-${crypto.randomUUID()}`;
  }
  return `faultevt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Initial values for the “Add event” sheet for a notification group */
export function createDraftFaultEventRow(notificationGroup: string): FaultManagementRow {
  return {
    id: FAULT_ADD_SHEET_DRAFT_ID,
    event: '',
    category: 'Equipment',
    severity: 'Warning',
    forwardToSnmp: 'None',
    forwardToEmail: 'None',
    group: notificationGroup,
  };
}

export const FAULT_MANAGEMENT_DATA: FaultManagementRow[] = [
  {
    id: '1',
    event: 'Alc Over Range',
    category: 'Equipment',
    severity: 'Critical',
    forwardToSnmp: '164',
    forwardToEmail: 'None',
    group: 'System default',
  },
  {
    id: '2',
    event: 'Authentication Failure',
    category: 'Security',
    severity: 'Major',
    forwardToSnmp: '162',
    forwardToEmail: 'All',
    group: 'System default',
  },
  {
    id: '3',
    event: 'CPRI SFP is not on approval list',
    category: 'Equipment',
    severity: 'Minor',
    forwardToSnmp: 'None',
    forwardToEmail: 'Filtered',
    group: 'System default',
  },
  {
    id: '4',
    event: 'Calibration Invalid',
    category: 'Equipment',
    severity: 'Warning',
    forwardToSnmp: '164',
    forwardToEmail: 'All',
    group: 'System default',
  },
  {
    id: '5',
    event: 'Cell Max Power Delta Exceeded',
    category: 'Network',
    severity: 'Critical',
    forwardToSnmp: '162',
    forwardToEmail: 'None',
    group: 'System default',
  },
  {
    id: '6',
    event: 'Cold Start',
    category: 'System',
    severity: 'Major',
    forwardToSnmp: 'None',
    forwardToEmail: 'Filtered',
    group: 'System default',
  },
  {
    id: '7',
    event: 'VSWR Out of Range',
    category: 'Equipment',
    severity: 'Warning',
    forwardToSnmp: '164',
    forwardToEmail: 'Filtered',
    group: 'Engineering Team',
  },
  {
    id: '8',
    event: 'Sync Reference Lost',
    category: 'System',
    severity: 'Minor',
    forwardToSnmp: '162',
    forwardToEmail: 'None',
    group: 'Support Team',
  },
  {
    id: '9',
    event: 'RF Power Imbalance',
    category: 'Network',
    severity: 'Critical',
    forwardToSnmp: '164',
    forwardToEmail: 'All',
    group: 'Critical Alerts',
  },
  {
    id: '10',
    event: 'Software Download Failed',
    category: 'Software',
    severity: 'Info',
    forwardToSnmp: 'None',
    forwardToEmail: 'Filtered',
    group: 'Management',
  },
];

/** Device groups (column "Group") for devices linked to a notification group */
export const FAULT_DEVICE_GROUP_OPTIONS = [
  'Core network',
  'Radio access',
  'Edge devices',
  'Test environment',
] as const;
export type FaultDeviceGroupOption = (typeof FAULT_DEVICE_GROUP_OPTIONS)[number];

/** Mock devices associated with notification groups (Events configuration → Devices) */
export interface FaultGroupDeviceRow {
  id: string;
  device: string;
  region: string;
  deviceGroup: FaultDeviceGroupOption;
  notificationGroup: string;
}

export const FAULT_GROUP_DEVICE_DATA: FaultGroupDeviceRow[] = [
  {
    id: 'd1',
    device: 'eNB-SEA-001',
    region: 'Pacific Northwest',
    deviceGroup: 'Radio access',
    notificationGroup: 'System default',
  },
  {
    id: 'd2',
    device: 'eNB-PDX-014',
    region: 'Pacific Northwest',
    deviceGroup: 'Radio access',
    notificationGroup: 'System default',
  },
  {
    id: 'd3',
    device: 'RN-SFO-203',
    region: 'Northern California',
    deviceGroup: 'Edge devices',
    notificationGroup: 'System default',
  },
  {
    id: 'd4',
    device: 'Core-GW-WDC-01',
    region: 'Mid-Atlantic',
    deviceGroup: 'Core network',
    notificationGroup: 'System default',
  },
  {
    id: 'd5',
    device: 'eNB-LAX-088',
    region: 'Southern California',
    deviceGroup: 'Radio access',
    notificationGroup: 'System default',
  },
  {
    id: 'd6',
    device: 'RN-DEN-042',
    region: 'Mountain West',
    deviceGroup: 'Radio access',
    notificationGroup: 'System default',
  },
  {
    id: 'd7',
    device: 'Lab-RAN-TEST-01',
    region: 'Texas',
    deviceGroup: 'Test environment',
    notificationGroup: 'System default',
  },
  {
    id: 'd8',
    device: 'eNB-DAL-311',
    region: 'Texas',
    deviceGroup: 'Radio access',
    notificationGroup: 'Engineering Team',
  },
  {
    id: 'd9',
    device: 'RN-AUS-090',
    region: 'Texas',
    deviceGroup: 'Edge devices',
    notificationGroup: 'Engineering Team',
  },
  {
    id: 'd10',
    device: 'Core-AGG-CHI-02',
    region: 'Midwest',
    deviceGroup: 'Core network',
    notificationGroup: 'Support Team',
  },
  {
    id: 'd11',
    device: 'eNB-MIA-045',
    region: 'Florida',
    deviceGroup: 'Radio access',
    notificationGroup: 'Critical Alerts',
  },
  {
    id: 'd12',
    device: 'RN-BOS-017',
    region: 'New England',
    deviceGroup: 'Edge devices',
    notificationGroup: 'Critical Alerts',
  },
  {
    id: 'd13',
    device: 'Mgmt-OOB-NYC-03',
    region: 'Northeast',
    deviceGroup: 'Core network',
    notificationGroup: 'Management',
  },
];

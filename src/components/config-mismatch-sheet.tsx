'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ConfigMismatchItem {
  id: string;
  parameter: string;
  goldStandard: string;
  configured: string;
}

interface MismatchTemplate {
  id: string;
  name: string;
  lastRun: string;
  result: 'Fail' | 'Pass';
  items: ConfigMismatchItem[];
}

// Templates with their associated mismatched parameters
const MISMATCH_TEMPLATES: MismatchTemplate[] = [
  {
    id: 'config-backup',
    name: 'Config backup',
    lastRun: 'Feb 10, 2026 at 3:42 PM',
    result: 'Fail',
    items: [
      { id: '1', parameter: 'System.AdminAAA.User.9000.SNMPPrivProtocol', goldStandard: 'AES', configured: 'DES' },
      { id: '2', parameter: 'System.AdminAAA.User.9000.SNMPAuthProtocol', goldStandard: 'SHA', configured: 'MD5' },
      { id: '3', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.RF.ReferenceSignalPower', goldStandard: '0', configured: '-3' },
      { id: '4', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.RF.PhyCellID', goldStandard: '105', configured: '101' },
      { id: '5', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.RF.EARFCNDL', goldStandard: '55240', configured: '55990' },
      { id: '6', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.RF.DLBandwidth', goldStandard: '50', configured: '100' },
      { id: '7', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.RF.ULBandwidth', goldStandard: '50', configured: '100' },
    ],
  },
  {
    id: 'kpi-sync',
    name: 'KPI sync',
    lastRun: 'Feb 10, 2026 at 3:42 PM',
    result: 'Fail',
    items: [
      { id: '8', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.Mobility.IdleMode.IRAT.UTRA.UTRANFDDFreq.1.Priority', goldStandard: '3', configured: '5' },
      { id: '9', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.A3Offset', goldStandard: '6', configured: '3' },
      { id: '10', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.HysteresisA3', goldStandard: '2', configured: '1' },
      { id: '11', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.TimeToTriggerA3', goldStandard: '480', configured: '320' },
      { id: '12', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.MAC.RACH.PreambleTransMax', goldStandard: '10', configured: '6' },
      { id: '13', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.MAC.RACH.RootSequenceIndex', goldStandard: '22', configured: '0' },
    ],
  },
  {
    id: 'health-check',
    name: 'Health check',
    lastRun: 'Feb 9, 2026 at 11:15 AM',
    result: 'Fail',
    items: [
      { id: '14', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.PHY.PUSCH.Enable64QAM', goldStandard: 'true', configured: 'false' },
      { id: '15', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.PHY.SRS.SRSBandwidthConfig', goldStandard: '7', configured: '3' },
      { id: '16', parameter: 'Services.FAPService.1.CellConfig.LTE.RAN.PHY.AntennaInfo.AntennaPortsCount', goldStandard: '4', configured: '2' },
      { id: '17', parameter: 'Services.FAPService.1.CellConfig.LTE.EPC.TAC', goldStandard: '1001', configured: '1000' },
      { id: '18', parameter: 'Services.FAPService.1.CellConfig.LTE.EPC.PLMNList.1.PLMNID', goldStandard: '310260', configured: '311480' },
    ],
  },
  {
    id: 'firmware-check',
    name: 'Firmware check',
    lastRun: 'Feb 8, 2026 at 9:30 AM',
    result: 'Fail',
    items: [
      { id: '19', parameter: 'Services.FAPService.1.FAPControl.LTE.AdminState', goldStandard: 'Enabled', configured: 'Disabled' },
      { id: '20', parameter: 'Services.FAPService.1.FAPControl.LTE.SelfConfig.SONConfigParam.CellReselectionPriority', goldStandard: '7', configured: '5' },
      { id: '21', parameter: 'Services.FAPService.1.Transport.SCTP.AssocMaxRetrans', goldStandard: '10', configured: '5' },
      { id: '22', parameter: 'Services.FAPService.1.Transport.Security.Secret.1.Type', goldStandard: 'SharedKey', configured: 'PSK' },
      { id: '23', parameter: 'ManagementServer.PeriodicInformInterval', goldStandard: '3600', configured: '900' },
      { id: '24', parameter: 'ManagementServer.CWMPRetryMinimumWaitInterval', goldStandard: '30', configured: '10' },
    ],
  },
];

function generateMismatchData(count: number): MismatchTemplate[] {
  // Distribute the count across templates, returning only templates that have mismatches
  let remaining = count;
  const result: MismatchTemplate[] = [];
  for (const tmpl of MISMATCH_TEMPLATES) {
    if (remaining <= 0) break;
    const take = Math.min(tmpl.items.length, remaining);
    result.push({ ...tmpl, items: tmpl.items.slice(0, take) });
    remaining -= take;
  }
  return result;
}

interface ConfigMismatchSheetProps {
  open: boolean;
  deviceName: string;
  mismatchCount?: number;
  onOpenChange: (open: boolean) => void;
  onMismatchCountChange?: (newCount: number) => void;
  onNavigateToCommissioning?: () => void;
  onTemplateCreated?: () => void;
}

export function ConfigMismatchSheet({
  open,
  deviceName,
  mismatchCount = 3,
  onOpenChange,
  onMismatchCountChange,
  onNavigateToCommissioning,
  onTemplateCreated,
}: ConfigMismatchSheetProps) {
  const [templates, setTemplates] = React.useState<MismatchTemplate[]>(() => generateMismatchData(mismatchCount));
  const [activeTemplate, setActiveTemplate] = React.useState<string | null>(null);

  // Reset templates when mismatchCount or deviceName changes
  React.useEffect(() => {
    const data = generateMismatchData(mismatchCount);
    setTemplates(data);
    setActiveTemplate(data.length > 0 ? data[0].id : null);
  }, [mismatchCount, deviceName]);

  const totalMismatches = templates.reduce((sum, t) => sum + t.items.length, 0);
  const activeTemplateObj = templates.find((t) => t.id === activeTemplate);
  const activeItems = activeTemplateObj?.items ?? [];
  const activeTemplateName = activeTemplateObj?.name ?? null;

  // Notify parent of count
  React.useEffect(() => {
    onMismatchCountChange?.(totalMismatches);
  }, [totalMismatches, onMismatchCountChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Configuration mismatch</SheetTitle>
          <p className="text-sm text-muted-foreground">{deviceName} &middot; {totalMismatches} {totalMismatches === 1 ? 'mismatch' : 'mismatches'}</p>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
          {templates.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No mismatches
            </div>
          ) : (
            <>
              {/* Template pill tabs */}
              <Tabs value={activeTemplate ?? undefined} onValueChange={setActiveTemplate} className="mb-6">
                <TabsList>
                  {templates.map((tmpl) => (
                    <TabsTrigger key={tmpl.id} value={tmpl.id} className="gap-1.5">
                      {tmpl.name}
                      <Badge variant="secondary" className="ml-0.5 px-1.5 min-w-[20px] justify-center text-xs">{tmpl.items.length}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Last run info */}
              {activeTemplateObj && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Last run: <span className="text-foreground">{activeTemplateObj.lastRun}</span>
                </div>
              )}

              {/* Table */}
              <div className="flex-1 min-h-0 flex flex-col rounded-lg border bg-card overflow-hidden">
                {/* Sticky header */}
                <div className="shrink-0 border-b">
                  <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Parameter</th>
                        <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Gold standard</th>
                        <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Configured</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                {/* Scrollable body */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 120 }} />
                    </colgroup>
                    <tbody>
                      {activeItems.map((item) => (
                        <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-2 px-4 align-middle">
                            <span className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{item.parameter}</span>
                          </td>
                          <td className="p-2 px-4 align-middle font-medium">
                            <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded text-sm">{item.goldStandard}</span>
                          </td>
                          <td className="p-2 px-4 align-middle">
                            <span className="inline-block bg-muted px-1.5 py-0.5 rounded text-sm text-muted-foreground dark:text-slate-300">{item.configured}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        {activeTemplateName && (
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Template: <span className="font-medium text-foreground">{activeTemplateName}</span>
                <span className="ml-1.5 text-muted-foreground">&middot; {activeItems.length} {activeItems.length === 1 ? 'mismatch' : 'mismatches'}</span>
              </span>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-1.5">
                  <Icon name="download" size={16} />
                  Export
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Icon name="compare_arrows" size={16} />
                  Compare now
                </Button>
                <Button
                  className="gap-1.5"
                  onClick={() => {
                    const navigateFn = onNavigateToCommissioning;
                    onTemplateCreated?.();
                    onOpenChange(false);
                    setTimeout(() => {
                      toast.success(`Template created from "${activeTemplateName}"`, {
                        ...(navigateFn
                          ? {
                              action: {
                                label: 'View in Commissioning',
                                onClick: () => {
                                  navigateFn();
                                },
                              },
                            }
                          : {}),
                        duration: 6000,
                      });
                    }, 200);
                  }}
                >
                  <Icon name="add" size={16} />
                  Create template
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

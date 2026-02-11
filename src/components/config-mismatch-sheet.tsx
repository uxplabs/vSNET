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

interface ConfigMismatchItem {
  id: string;
  parameter: string;
  goldStandard: string;
  configured: string;
}

// All possible mismatch parameters (TR-069 / device model paths)
const ALL_MISMATCH_PARAMETERS: ConfigMismatchItem[] = [
  { id: '1', parameter: 'InternetGatewayDevice.System.AdminAAA.User.9000.SNMPPrivProtocol', goldStandard: 'AES', configured: 'DES' },
  { id: '2', parameter: 'InternetGatewayDevice.System.AdminAAA.User.9000.SNMPAuthProtocol', goldStandard: 'SHA', configured: 'MD5' },
  { id: '3', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.RF.ReferenceSignalPower', goldStandard: '0', configured: '-3' },
  { id: '4', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.RF.PhyCellID', goldStandard: '105', configured: '101' },
  { id: '5', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.RF.EARFCNDL', goldStandard: '55240', configured: '55990' },
  { id: '6', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.RF.DLBandwidth', goldStandard: '50', configured: '100' },
  { id: '7', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.RF.ULBandwidth', goldStandard: '50', configured: '100' },
  { id: '8', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.Mobility.IdleMode.IRAT.UTRA.UTRANFDDFreq.1.Priority', goldStandard: '3', configured: '5' },
  { id: '9', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.A3Offset', goldStandard: '6', configured: '3' },
  { id: '10', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.HysteresisA3', goldStandard: '2', configured: '1' },
  { id: '11', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.Mobility.ConnMode.EUTRA.TimeToTriggerA3', goldStandard: '480', configured: '320' },
  { id: '12', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.MAC.RACH.PreambleTransMax', goldStandard: '10', configured: '6' },
  { id: '13', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.MAC.RACH.RootSequenceIndex', goldStandard: '22', configured: '0' },
  { id: '14', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.PHY.PUSCH.Enable64QAM', goldStandard: 'true', configured: 'false' },
  { id: '15', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.PHY.SRS.SRSBandwidthConfig', goldStandard: '7', configured: '3' },
  { id: '16', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.RAN.PHY.AntennaInfo.AntennaPortsCount', goldStandard: '4', configured: '2' },
  { id: '17', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.EPC.TAC', goldStandard: '1001', configured: '1000' },
  { id: '18', parameter: 'InternetGatewayDevice.Services.FAPService.1.CellConfig.LTE.EPC.PLMNList.1.PLMNID', goldStandard: '310260', configured: '311480' },
  { id: '19', parameter: 'InternetGatewayDevice.Services.FAPService.1.FAPControl.LTE.AdminState', goldStandard: 'Enabled', configured: 'Disabled' },
  { id: '20', parameter: 'InternetGatewayDevice.Services.FAPService.1.FAPControl.LTE.SelfConfig.SONConfigParam.CellReselectionPriority', goldStandard: '7', configured: '5' },
  { id: '21', parameter: 'InternetGatewayDevice.Services.FAPService.1.Transport.SCTP.AssocMaxRetrans', goldStandard: '10', configured: '5' },
  { id: '22', parameter: 'InternetGatewayDevice.Services.FAPService.1.Transport.Security.Secret.1.Type', goldStandard: 'SharedKey', configured: 'PSK' },
  { id: '23', parameter: 'InternetGatewayDevice.ManagementServer.PeriodicInformInterval', goldStandard: '3600', configured: '900' },
  { id: '24', parameter: 'InternetGatewayDevice.ManagementServer.CWMPRetryMinimumWaitInterval', goldStandard: '30', configured: '10' },
];

function generateMismatchData(count: number): ConfigMismatchItem[] {
  return ALL_MISMATCH_PARAMETERS.slice(0, count);
}

interface ConfigMismatchSheetProps {
  open: boolean;
  deviceName: string;
  mismatchCount?: number;
  onOpenChange: (open: boolean) => void;
  onMismatchCountChange?: (newCount: number) => void;
}

export function ConfigMismatchSheet({
  open,
  deviceName,
  mismatchCount = 3,
  onOpenChange,
  onMismatchCountChange,
}: ConfigMismatchSheetProps) {
  const [items, setItems] = React.useState<ConfigMismatchItem[]>(() => generateMismatchData(mismatchCount));

  // Reset items when mismatchCount or deviceName changes
  React.useEffect(() => {
    setItems(generateMismatchData(mismatchCount));
  }, [mismatchCount, deviceName]);

  // Notify parent of count
  React.useEffect(() => {
    onMismatchCountChange?.(items.length);
  }, [items.length, onMismatchCountChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Configuration mismatch</SheetTitle>
          <p className="text-sm text-muted-foreground">{deviceName} &middot; {items.length} {items.length === 1 ? 'mismatch' : 'mismatches'}</p>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No mismatches
            </div>
          ) : (
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
                    {items.map((item) => (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 px-4 align-middle">
                          <span className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{item.parameter}</span>
                        </td>
                        <td className="p-2 px-4 align-middle font-medium">
                          <span className="inline-block bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-sm">{item.goldStandard}</span>
                        </td>
                        <td className="p-2 px-4 align-middle">
                          <span className="inline-block bg-muted px-1.5 py-0.5 rounded text-sm text-muted-foreground">{item.configured}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Button Bar */}
        <div className="shrink-0 border-t bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="gap-1.5">
              <Icon name="download" size={16} />
              Export template
            </Button>
            <Button variant="outline" className="gap-1.5">
              <Icon name="add" size={16} />
              Create template
            </Button>
            <Button className="gap-1.5">
              <Icon name="compare_arrows" size={16} />
              Compare now
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

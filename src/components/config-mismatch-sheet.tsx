'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConfigMismatchItem {
  id: string;
  parameter: string;
  goldStandard: string;
  configured: string;
  ignored: boolean;
}

// All possible mismatch parameters (TR-069 / device model paths)
const ALL_MISMATCH_PARAMETERS: Omit<ConfigMismatchItem, 'ignored'>[] = [
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
  return ALL_MISMATCH_PARAMETERS.slice(0, count).map((item) => ({
    ...item,
    ignored: false,
  }));
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
  const [activeTab, setActiveTab] = React.useState<'mismatches' | 'ignored'>('mismatches');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [appliedItems, setAppliedItems] = React.useState<Set<string>>(new Set());

  // Reset items when mismatchCount or deviceName changes
  React.useEffect(() => {
    setItems(generateMismatchData(mismatchCount));
    setSelectedRows(new Set());
    setAppliedItems(new Set());
    setActiveTab('mismatches');
  }, [mismatchCount, deviceName]);

  const mismatches = items.filter((item) => !item.ignored);
  const ignored = items.filter((item) => item.ignored);
  const displayedItems = activeTab === 'mismatches' ? mismatches : ignored;

  // Count remaining mismatches (not applied, not ignored)
  const remainingMismatchCount = mismatches.filter((item) => !appliedItems.has(item.id)).length;

  // Notify parent when mismatch count changes
  React.useEffect(() => {
    onMismatchCountChange?.(remainingMismatchCount);
  }, [remainingMismatchCount, onMismatchCountChange]);

  const allSelected = displayedItems.length > 0 && displayedItems.every((item) => selectedRows.has(item.id));
  const someSelected = displayedItems.some((item) => selectedRows.has(item.id)) && !allSelected;
  const hasSelection = selectedRows.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayedItems.map((item) => item.id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplyItem = (id: string) => {
    // Mark the item as applied
    setAppliedItems((prev) => new Set(prev).add(id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleIgnoreItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ignored: true } : item))
    );
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleUnignoreItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ignored: false } : item))
    );
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBulkApply = () => {
    setAppliedItems((prev) => {
      const next = new Set(prev);
      selectedRows.forEach((id) => next.add(id));
      return next;
    });
    setSelectedRows(new Set());
  };

  const handleBulkIgnore = () => {
    setItems((prev) =>
      prev.map((item) => (selectedRows.has(item.id) ? { ...item, ignored: true } : item))
    );
    setSelectedRows(new Set());
  };

  const handleBulkUnignore = () => {
    setItems((prev) =>
      prev.map((item) => (selectedRows.has(item.id) ? { ...item, ignored: false } : item))
    );
    setSelectedRows(new Set());
  };

  // Clear selection when switching tabs
  React.useEffect(() => {
    setSelectedRows(new Set());
  }, [activeTab]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Configuration mismatch</SheetTitle>
          <p className="text-sm text-muted-foreground">{deviceName}</p>
        </SheetHeader>

        {/* Tab Group */}
        <div className="px-6 py-3 shrink-0">
          <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('mismatches')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'mismatches'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Mismatches
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs">
                {mismatches.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ignored')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'ignored'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Ignored
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs">
                {ignored.length}
              </Badge>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="px-6 pt-3 pb-1">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              {activeTab === 'mismatches' ? (
                <>
                  <Button size="sm" onClick={handleBulkApply}>
                    Apply
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkIgnore}>
                    Ignore
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleBulkUnignore}>
                  Unignore
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
          {displayedItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              {activeTab === 'mismatches' ? 'No mismatches' : 'No ignored items'}
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col rounded-lg border bg-card overflow-hidden">
              {/* Sticky header */}
              <div className="shrink-0 border-b">
                <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 44 }} />
                    <col />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 140 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => {
                            if (el) (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                          }}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </th>
                      <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Parameter</th>
                      <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Gold standard</th>
                      <th className="h-10 px-4 py-3 text-left align-middle font-medium text-muted-foreground">Configured</th>
                      <th className="h-10 px-4 py-3" />
                    </tr>
                  </thead>
                </table>
              </div>
              {/* Scrollable body */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: 44 }} />
                    <col />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 120 }} />
                    <col style={{ width: 140 }} />
                  </colgroup>
                  <tbody>
                    {displayedItems.map((item) => (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-2 px-4 align-middle">
                          <Checkbox
                            checked={selectedRows.has(item.id)}
                            onCheckedChange={() => toggleRow(item.id)}
                            aria-label={`Select ${item.parameter}`}
                          />
                        </td>
                        <td className="p-2 px-4 align-middle">
                          <span className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{item.parameter}</span>
                        </td>
                        <td className="p-2 px-4 align-middle font-medium">
                          <span className="inline-block bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-sm">{item.goldStandard}</span>
                        </td>
                        <td className="p-2 px-4 align-middle">
                          <span className="inline-block bg-muted px-1.5 py-0.5 rounded text-sm text-muted-foreground">{item.configured}</span>
                        </td>
                        <td className="p-2 px-4 align-middle">
                          <div className="flex items-center justify-end gap-2">
                            {appliedItems.has(item.id) ? (
                              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                                <Icon name="check_circle" size={16} className="shrink-0" />
                                Applied
                              </span>
                            ) : activeTab === 'mismatches' ? (
                              <>
                                <Button size="sm" className="h-7" onClick={() => handleApplyItem(item.id)}>
                                  Apply
                                </Button>
                                <Button size="sm" variant="outline" className="h-7" onClick={() => handleIgnoreItem(item.id)}>
                                  Ignore
                                </Button>
                              </>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7" onClick={() => handleUnignoreItem(item.id)}>
                                Unignore
                              </Button>
                            )}
                          </div>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => {
              setItems((prev) => prev.map((item) => ({ ...item, ignored: true })));
              setSelectedRows(new Set());
            }}>
              Ignore all
            </Button>
            <Button onClick={() => {
              setAppliedItems(new Set(mismatches.map((item) => item.id)));
              setSelectedRows(new Set());
            }}>
              Apply all
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

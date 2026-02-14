'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NodeTypeBadge } from '@/components/ui/node-type-badge';
import { SelectConfigurationModal } from './select-configuration-modal';
import { toast } from 'sonner';

type DeviceType = 'SN' | 'RCP' | 'DAS';

interface GoldenConfigVersion {
  id: string;
  version: string;
  lastUpdated: string;
  appliedDevices: number;
  deviceMismatches: number;
}

interface GoldenConfigSection {
  deviceType: DeviceType;
  versions: GoldenConfigVersion[];
}

const INITIAL_GOLDEN_CONFIG_DATA: GoldenConfigSection[] = [
  {
    deviceType: 'SN',
    versions: [
      { id: 'snlte-1', version: 'v3.2.1', lastUpdated: 'Jan 28, 2025', appliedDevices: 24, deviceMismatches: 2 },
      { id: 'snlte-2', version: 'v3.1.0', lastUpdated: 'Jan 15, 2025', appliedDevices: 18, deviceMismatches: 0 },
      { id: 'snlte-3', version: 'v3.0.5', lastUpdated: 'Dec 20, 2024', appliedDevices: 12, deviceMismatches: 1 },
    ],
  },
  {
    deviceType: 'RCP',
    versions: [
      { id: 'rcp-1', version: 'v2.4.0', lastUpdated: 'Jan 25, 2025', appliedDevices: 8, deviceMismatches: 0 },
      { id: 'rcp-2', version: 'v2.3.2', lastUpdated: 'Jan 10, 2025', appliedDevices: 6, deviceMismatches: 1 },
    ],
  },
  {
    deviceType: 'DAS',
    versions: [
      { id: 'das-1', version: 'v1.5.0', lastUpdated: 'Jan 22, 2025', appliedDevices: 4, deviceMismatches: 0 },
    ],
  },
];

function SectionRow({ 
  section, 
  isOpen, 
  onToggle,
  onAddVersion,
}: { 
  section: GoldenConfigSection; 
  isOpen: boolean; 
  onToggle: () => void;
  onAddVersion: (deviceType: DeviceType) => void;
}) {
  return (
    <TableRow className="bg-muted/50 hover:bg-muted/70">
      <TableCell className="px-4 py-3 font-medium">
        <button
          type="button"
          className="inline-flex items-center gap-2"
          onClick={onToggle}
        >
          <Icon
            name={isOpen ? 'expand_more' : 'chevron_right'}
            size={18}
            className="text-muted-foreground shrink-0"
          />
          <NodeTypeBadge type={section.deviceType} />
        </button>
      </TableCell>
      <TableCell className="px-4 py-3 tabular-nums">{section.versions.length}</TableCell>
      <TableCell className="px-4 py-3" />
      <TableCell className="px-4 py-3" />
      <TableCell className="px-4 py-3" />
      <TableCell className="px-4 py-3 text-right">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5"
          onClick={() => onAddVersion(section.deviceType)}
        >
          <Icon name="add" size={16} />
          Add version
        </Button>
      </TableCell>
    </TableRow>
  );
}

function VersionRow({ version }: { version: GoldenConfigVersion }) {
  return (
    <TableRow>
      <TableCell className="px-4 py-3 pl-10" />
      <TableCell className="px-4 py-3 font-medium tabular-nums">{version.version}</TableCell>
      <TableCell className="px-4 py-3 text-muted-foreground">{version.lastUpdated}</TableCell>
      <TableCell className="px-4 py-3 tabular-nums">{version.appliedDevices}</TableCell>
      <TableCell className="px-4 py-3">
        {version.deviceMismatches > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-warning">
            <Icon name="difference" size={16} className="shrink-0" />
            <span className="tabular-nums">{version.deviceMismatches}</span>
          </span>
        ) : (
          <span className="text-muted-foreground tabular-nums">0</span>
        )}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Download">
            <Icon name="download" size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Delete">
            <Icon name="delete" size={20} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                <Icon name="more_vert" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Apply to devices</DropdownMenuItem>
              <DropdownMenuItem>Compare versions</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function GoldenConfigDataTable() {
  const [configData, setConfigData] = React.useState<GoldenConfigSection[]>(INITIAL_GOLDEN_CONFIG_DATA);
  const [openSections, setOpenSections] = React.useState<Record<DeviceType, boolean>>({
    'SN': true,
    'RCP': true,
    'DAS': true,
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = React.useState<DeviceType | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [configOption, setConfigOption] = React.useState('airspan');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Configuration modal state
  const [configModalOpen, setConfigModalOpen] = React.useState(false);

  const toggleSection = (deviceType: DeviceType) => {
    setOpenSections((prev) => ({ ...prev, [deviceType]: !prev[deviceType] }));
  };

  const handleAddVersion = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDialogOpen(true);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFile(null);
    setSelectedDeviceType(null);
    setConfigOption('airspan');
  };

  // Extract version from filename (mock logic)
  const extractedVersion = selectedFile?.name.match(/v?\d+\.\d+\.\d+/)?.[0] || 'v1.0.0';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const addVersionToTable = () => {
    if (!selectedDeviceType) return;
    
    const newVersion: GoldenConfigVersion = {
      id: `${selectedDeviceType.toLowerCase()}-${Date.now()}`,
      version: extractedVersion,
      lastUpdated: currentDate,
      appliedDevices: 0,
      deviceMismatches: 0,
    };

    setConfigData((prev) =>
      prev.map((section) =>
        section.deviceType === selectedDeviceType
          ? { ...section, versions: [newVersion, ...section.versions] }
          : section
      )
    );

    toast.success('Version added', {
      description: `${extractedVersion} has been added to ${selectedDeviceType}`,
    });
  };

  const handleContinue = () => {
    // Close the dialog
    setDialogOpen(false);
    
    if (configOption === 'custom') {
      // Open the configuration modal for custom selection
      setConfigModalOpen(true);
    } else {
      // Handle airspan or new config selection - add to table
      addVersionToTable();
      handleDialogClose();
    }
  };

  const handleConfigModalCancel = () => {
    setConfigModalOpen(false);
    // Reset state
    setSelectedFile(null);
    setSelectedDeviceType(null);
    setConfigOption('airspan');
  };

  const handleConfigModalSave = (selections: Record<string, 'airspan' | 'new'>) => {
    addVersionToTable();
    setConfigModalOpen(false);
    // Reset state
    setSelectedFile(null);
    setSelectedDeviceType(null);
    setConfigOption('airspan');
  };

  return (
    <TooltipProvider delayDuration={300}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json,.xml,.cfg,.config,.txt"
        onChange={handleFileChange}
      />

      {/* Add Version Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add version</DialogTitle>
          </DialogHeader>
          
          {/* Info Section */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Device type</div>
              <div className="text-sm font-medium">{selectedDeviceType}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Version</div>
              <div className="text-sm font-medium">{extractedVersion}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Date</div>
              <div className="text-sm font-medium">{currentDate}</div>
            </div>
          </div>

          {/* Body */}
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              There are <span className="font-medium text-warning">20 mismatches</span> between the Corning configuration and the new version.
            </p>
            
            <RadioGroup value={configOption} onValueChange={setConfigOption} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="airspan" id="airspan" />
                <Label htmlFor="airspan" className="text-sm font-normal cursor-pointer">
                  Use the Airspan configuration
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="text-sm font-normal cursor-pointer">
                  Use the new configuration
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm font-normal cursor-pointer">
                  Customize selection
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleContinue}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Configuration Modal */}
      <SelectConfigurationModal
        open={configModalOpen}
        deviceType={selectedDeviceType || ''}
        version={extractedVersion}
        onCancel={handleConfigModalCancel}
        onSave={handleConfigModalSave}
      />

      <div className="flex flex-col flex-1 min-h-0 gap-4 h-full">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 h-12 w-[200px]">Host</TableHead>
                <TableHead className="px-4 py-3 h-12 w-[120px]">Version</TableHead>
                <TableHead className="px-4 py-3 h-12 w-[150px]">Last updated</TableHead>
                <TableHead className="px-4 py-3 h-12 w-[140px]">Applied devices</TableHead>
                <TableHead className="px-4 py-3 h-12 w-[160px]">Device mismatches</TableHead>
                <TableHead className="px-4 py-3 h-12 w-[180px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {configData.map((section) => (
                <React.Fragment key={section.deviceType}>
                  <SectionRow
                    section={section}
                    isOpen={openSections[section.deviceType]}
                    onToggle={() => toggleSection(section.deviceType)}
                    onAddVersion={handleAddVersion}
                  />
                  {openSections[section.deviceType] &&
                    section.versions.map((version) => (
                      <VersionRow key={version.id} version={version} />
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}

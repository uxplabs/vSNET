'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from './ui/sheet';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS = ['Type', 'ABAB123', 'FGH456', 'Standard'] as const;
const LOCATION_TYPE_OPTIONS = ['Location type', 'Indoor', 'Outdoor', 'Rooftop', 'Tower'] as const;
const ZONE_OPTIONS = ['Zone', 'Zone A', 'Zone B', 'Zone C', 'North', 'South'] as const;

export interface AddRadioNodeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddRadioNodeFormData) => void;
}

export interface AddRadioNodeFormData {
  mode: 'manual' | 'upload';
  type: string;
  index: string;
  ethernetId: string;
  name: string;
  description: string;
  addCellInfo: boolean;
  cid: string;
  cellName: string;
  cellDescription: string;
  phyCellIdOrPsc: string;
  locationType: string;
  zone: string;
}

const defaultFormState: AddRadioNodeFormData = {
  mode: 'manual',
  type: 'Type',
  index: '',
  ethernetId: '',
  name: '',
  description: '',
  addCellInfo: false,
  cid: '',
  cellName: '',
  cellDescription: '',
  phyCellIdOrPsc: '',
  locationType: 'Location type',
  zone: 'Zone',
};

export function AddRadioNodeSheet({
  open,
  onOpenChange,
  onSubmit,
}: AddRadioNodeSheetProps) {
  const [form, setForm] = React.useState<AddRadioNodeFormData>(defaultFormState);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const update = React.useCallback((updates: Partial<AddRadioNodeFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) {
        setForm(defaultFormState);
        setUploadFile(null);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const handleSubmit = React.useCallback(() => {
    if (form.mode === 'upload' && !uploadFile) return;
    onSubmit?.(form);
    handleOpenChange(false);
  }, [form, uploadFile, onSubmit, handleOpenChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setUploadFile(file);
  };
  const handleBrowse = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
    e.target.value = '';
  };

  React.useEffect(() => {
    if (!open) setForm(defaultFormState);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl flex flex-col h-full p-0">
        <SheetHeader className="shrink-0 px-4 pt-4 pb-2">
          <SheetTitle>Add radio node</SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-auto px-4 pt-6 pb-4 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h4 className="text-sm font-semibold text-foreground">Configuration</h4>
              <RadioGroup
            value={form.mode}
            onValueChange={(value: 'manual' | 'upload') => update({ mode: value })}
            className="flex flex-row items-center gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="rn-mode-manual" />
              <Label htmlFor="rn-mode-manual" className="font-normal cursor-pointer">
                Add manually
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upload" id="rn-mode-upload" />
              <Label htmlFor="rn-mode-upload" className="font-normal cursor-pointer">
                Upload configuration file
              </Label>
            </div>
          </RadioGroup>

          {form.mode === 'upload' ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="min-h-[140px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".json,.xml,.yaml,.yml,.conf"
                onChange={handleFileChange}
                aria-label="Upload configuration file"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowse}
                className={cn(
                  'w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 px-6 text-center font-normal',
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
                )}
              >
                {uploadFile ? (
                  <>
                    <Icon name="description" size={36} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground truncate max-w-full">{uploadFile.name}</span>
                    <span className="text-xs text-muted-foreground">Click or drag to replace</span>
                  </>
                ) : (
                  <>
                    <Icon name="cloud_upload" size={36} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Drag and drop configuration file</span>
                    <span className="text-xs text-muted-foreground">or click to browse</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rn-type">Type</Label>
                  <Select value={form.type} onValueChange={(v) => update({ type: v })}>
                    <SelectTrigger id="rn-type">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.filter((o) => o !== 'Type').map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rn-index">Index</Label>
                  <Input
                    id="rn-index"
                    type="number"
                    placeholder="Index"
                    value={form.index}
                    onChange={(e) => update({ index: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rn-ethernet">Ethernet ID</Label>
                  <Input
                    id="rn-ethernet"
                    placeholder="e.g. 00:1a:2b:3c:4d:5e"
                    value={form.ethernetId}
                    onChange={(e) => update({ ethernetId: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rn-name">Name</Label>
                  <Input
                    id="rn-name"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rn-description">Description</Label>
                  <Textarea
                    id="rn-description"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => update({ description: e.target.value })}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="rn-add-cell"
                    checked={form.addCellInfo}
                    onCheckedChange={(checked) => update({ addCellInfo: checked === true })}
                  />
                  <Label htmlFor="rn-add-cell" className="cursor-pointer font-normal">
                    Add cell information
                  </Label>
                </div>

                {form.addCellInfo && (
                  <div className="space-y-4 pl-6 border-l-2 border-muted pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="rn-cid">CID</Label>
                      <Input
                        id="rn-cid"
                        placeholder="CID"
                        value={form.cid}
                        onChange={(e) => update({ cid: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rn-cell-name">Cell name</Label>
                      <Input
                        id="rn-cell-name"
                        placeholder="Cell name"
                        value={form.cellName}
                        onChange={(e) => update({ cellName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rn-cell-desc">Cell description</Label>
                      <Textarea
                        id="rn-cell-desc"
                        placeholder="Cell description"
                        value={form.cellDescription}
                        onChange={(e) => update({ cellDescription: e.target.value })}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rn-phycell">PhyCellID configured or PSC</Label>
                      <Input
                        id="rn-phycell"
                        placeholder="PhyCellID or PSC"
                        value={form.phyCellIdOrPsc}
                        onChange={(e) => update({ phyCellIdOrPsc: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rn-location-type">Location type</Label>
                      <Select value={form.locationType} onValueChange={(v) => update({ locationType: v })}>
                        <SelectTrigger id="rn-location-type">
                          <SelectValue placeholder="Location type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATION_TYPE_OPTIONS.filter((o) => o !== 'Location type').map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rn-zone">Zone</Label>
                      <Select value={form.zone} onValueChange={(v) => update({ zone: v })}>
                        <SelectTrigger id="rn-zone">
                          <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {ZONE_OPTIONS.filter((o) => o !== 'Zone').map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="shrink-0 flex flex-row gap-2 sm:justify-end border-t px-4 py-4 mt-auto">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={form.mode === 'manual' ? false : !uploadFile}
          >
            {form.mode === 'upload' ? 'Upload and add' : 'Add radio node'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

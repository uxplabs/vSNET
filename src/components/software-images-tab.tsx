'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';

const IMAGE_CARDS = [
  {
    title: 'RCP',
    versions: [
      { version: '3.1.2', preferred: true },
      { version: '3.1.0', preferred: false },
      { version: '3.0.8', preferred: false },
    ],
  },
  {
    title: 'CU appliance',
    versions: [
      { version: '2.4.1', preferred: true },
      { version: '2.4.0', preferred: false },
      { version: '2.2.5', preferred: false },
    ],
  },
  {
    title: 'SN',
    versions: [
      { version: '1.8.0', preferred: true },
      { version: '1.5.2', preferred: false },
      { version: '1.2.0', preferred: false },
    ],
  },
];

export function SoftwareImagesTab() {
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [preferredVersion, setPreferredVersion] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenUpload = () => setUploadDialogOpen(true);
  const handleCloseUpload = () => {
    setUploadDialogOpen(false);
    setPreferredVersion(false);
    setSelectedFile(null);
  };

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
    if (file) setSelectedFile(file);
  };
  const handleBrowse = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = '';
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleOpenUpload}>
          <Icon name="upload" size={18} className="mr-2" />
          Upload image
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {IMAGE_CARDS.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{card.title}</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Add">
                  <Icon name="add" size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 h-10">Version</TableHead>
                    <TableHead className="w-12 px-2 py-3 h-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {card.versions.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono text-sm">{row.version}</span>
                          {row.preferred && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              Preferred
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-2 py-3 w-12">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                              <Icon name="more_vert" size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Set as preferred</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>

    <Dialog open={uploadDialogOpen} onOpenChange={(open) => !open && handleCloseUpload()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload image</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upload software image.{' '}
            <a
              href="#"
              className="text-primary underline underline-offset-4 hover:no-underline"
              onClick={(e) => e.preventDefault()}
            >
              Learn more
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div
            role="button"
            tabIndex={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowse}
            onKeyDown={(e) => e.key === 'Enter' && handleBrowse()}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 px-6 text-center transition-colors cursor-pointer min-h-[160px]',
              isDragging
                ? 'border-primary bg-primary/5'
                : selectedFile
                  ? 'border-primary/50 bg-muted/30'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".bin,.img,.zip,.tar.gz,image/*"
              onChange={handleFileChange}
              aria-hidden
            />
            {selectedFile ? (
              <>
                <Icon name="description" size={40} className="text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground truncate max-w-full px-2">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Click or drag another file to replace</p>
              </>
            ) : (
              <>
                <Icon name="cloud_upload" size={40} className="text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Drag and drop your file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="upload-preferred"
              checked={preferredVersion}
              onCheckedChange={(checked) => setPreferredVersion(checked === true)}
            />
            <label
              htmlFor="upload-preferred"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Make this a preferred version
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseUpload}>
            Cancel
          </Button>
          <Button disabled={!selectedFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Icon } from '@/components/Icon';

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
  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button>
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
    </TooltipProvider>
  );
}

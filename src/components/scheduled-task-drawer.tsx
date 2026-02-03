'use client';

import * as React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import type { ScheduledTaskRow, TaskStatus } from './scheduled-tasks-data-table';

const STATUS_ICON: Record<TaskStatus, { name: string; className: string }> = {
  Scheduled: { name: 'schedule', className: 'text-muted-foreground' },
  Running: { name: 'sync', className: 'text-primary' },
  Completed: { name: 'check_circle', className: 'text-green-600 dark:text-green-500' },
  Failed: { name: 'error', className: 'text-destructive' },
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

interface ActivityLogRow {
  startTime: string;
  endTime: string;
  status: TaskStatus;
}

function getActivityLogForTask(task: ScheduledTaskRow): ActivityLogRow[] {
  return [
    { startTime: task.startTime, endTime: task.lastCompleted !== '—' ? task.lastCompleted : '—', status: task.status },
    { startTime: '2025-01-26 02:00', endTime: '2025-01-26 02:14', status: 'Completed' },
    { startTime: '2025-01-25 02:00', endTime: '2025-01-25 02:16', status: 'Completed' },
  ];
}

export interface ScheduledTaskDrawerProps {
  task: ScheduledTaskRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduledTaskDrawer({ task, open, onOpenChange }: ScheduledTaskDrawerProps) {
  if (!task) return null;

  const statusConfig = STATUS_ICON[task.status];

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="left-auto right-0 top-0 bottom-0 h-full w-[560px] max-w-[90vw] rounded-l-[10px] rounded-t-none mt-0 [&>div:first-child]:hidden">
        <div className="flex flex-col h-full min-h-0">
          <DrawerHeader className="relative pr-12 shrink-0">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 shrink-0"
                aria-label="Close"
              >
                <Icon name="close" size={20} />
              </Button>
            </DrawerClose>
            <DrawerTitle className="text-xl font-semibold">{task.task}</DrawerTitle>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="font-normal">
                {task.type}
              </Badge>
              <span className="inline-flex items-center gap-2 text-sm">
                <Icon name={statusConfig.name} size={18} className={`shrink-0 ${statusConfig.className}`} />
                {task.status}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-3 w-full">
              <Button variant="outline" size="sm" className="h-8">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                Disable
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                Delete
              </Button>
            </div>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <DetailRow label="Type" value={task.type} />
                  <DetailRow label="Domain" value={task.domain} />
                  <DetailRow label="Status" value={task.status} />
                  <DetailRow label="Start time" value={<span className="tabular-nums">{task.startTime}</span>} />
                  <DetailRow label="Last completed" value={<span className="tabular-nums">{task.lastCompleted}</span>} />
                  <DetailRow label="Repeats" value={task.repeats} />
                  <DetailRow label="Description" value={task.description ?? '—'} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 pb-4">
                <h4 className="text-sm font-semibold text-foreground mb-4">Activity log</h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-medium text-right">Start time</TableHead>
                        <TableHead className="text-muted-foreground font-medium text-right">End time</TableHead>
                        <TableHead className="text-muted-foreground font-medium text-right">Status</TableHead>
                        <TableHead className="w-12 text-right" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getActivityLogForTask(task).map((row, i) => {
                        const cfg = STATUS_ICON[row.status];
                        return (
                          <TableRow key={i}>
                            <TableCell className="tabular-nums text-sm text-right">{row.startTime}</TableCell>
                            <TableCell className="tabular-nums text-sm text-right">{row.endTime}</TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center gap-1.5 text-sm justify-end">
                                <Icon name={cfg.name} size={14} className={`shrink-0 ${cfg.className}`} />
                                {row.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More actions">
                                    <Icon name="more_vert" size={20} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Re-run</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

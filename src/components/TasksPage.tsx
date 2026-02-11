'use client';

import React, { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { ScheduledTasksDataTable, SCHEDULED_TASKS_DATA } from './scheduled-tasks-data-table';
import type { ScheduledTaskRow } from './scheduled-tasks-data-table';
import { ScheduledTaskDrawer } from './scheduled-task-drawer';
import { AddScheduledTaskDialog } from './add-scheduled-task-dialog';
import { TaskTemplatesDataTable, TASK_TEMPLATES_DATA } from './task-templates-data-table';
import { GoldenConfigTasksDataTable, GOLDEN_CONFIG_TASKS_DATA } from './golden-config-tasks-data-table';
import { NORTH_AMERICAN_REGIONS } from '@/constants/regions';

const DOMAIN_OPTIONS = ['Domain', 'All', ...NORTH_AMERICAN_REGIONS, 'Core network', 'Radio access', 'Edge devices'] as const;
const DEVICE_TYPE_OPTIONS = ['Device type', 'All', 'SN-LTE', 'CU', 'VCU', 'RCP', 'DAS'] as const;
const SCOPE_OPTIONS = ['Scope', 'All', 'Global', 'Local'] as const;
const GOLDEN_DEVICE_TYPE_OPTIONS = ['Device type', 'All', 'SN-LTE', 'CU', 'VCU', 'RCP', 'DAS'] as const;
const GOLDEN_STATUS_OPTIONS = ['Last run', 'All', 'Pass', 'Fail'] as const;

const CONFIG_NODE_TYPE_OPTIONS = ['SN-LTE', 'CU', 'VCU', 'RCP', 'DAS'] as const;
const CONFIG_TECHNOLOGY_OPTIONS = ['LTE', '5G NR', 'NB-IoT', 'LTE-M', 'DSS'] as const;
const CONFIG_FREQUENCY_OPTIONS = ['Hourly', 'Every 6 hours', 'Every 12 hours', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly'] as const;

export interface TasksPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

export default function TasksPage({
  appName = 'AMS',
  onSignOut,
  onNavigate,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
}: TasksPageProps) {
  const [tasksTab, setTasksTab] = useState('scheduled-tasks');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('Domain');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('Device type');
  const [scopeFilter, setScopeFilter] = useState<string>('Scope');
  const [templatesSearch, setTemplatesSearch] = useState('');
  const [templatesDomainFilter, setTemplatesDomainFilter] = useState<string>('Domain');
  const [templatesDeviceTypeFilter, setTemplatesDeviceTypeFilter] = useState<string>('Device type');
  const [templatesScopeFilter, setTemplatesScopeFilter] = useState<string>('Scope');
  const [selectedTask, setSelectedTask] = useState<ScheduledTaskRow | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [goldenConfigSearch, setGoldenConfigSearch] = useState('');
  const [goldenConfigDeviceTypeFilter, setGoldenConfigDeviceTypeFilter] = useState<string>('Device type');
  const [goldenConfigStatusFilter, setGoldenConfigStatusFilter] = useState<string>('Last run');
  const [addConfigDialogOpen, setAddConfigDialogOpen] = useState(false);
  const [configNodeType, setConfigNodeType] = useState<string>('');
  const [configTechnology, setConfigTechnology] = useState<string>('');
  const [configFrequency, setConfigFrequency] = useState<string>('');

  const handleAddConfig = () => {
    // placeholder – close and reset
    setConfigNodeType('');
    setConfigTechnology('');
    setConfigFrequency('');
    setAddConfigDialogOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="tasks"
        hideRegionSelector={tasksTab === 'golden-configuration'}
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
      />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 py-6 md:px-6 lg:px-8">
        <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <CardContent className="pt-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Tabs value={tasksTab} onValueChange={setTasksTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto shrink-0">
                <TabsTrigger value="scheduled-tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                  Scheduled tasks
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                    {SCHEDULED_TASKS_DATA.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="templates" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                  Templates
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                    {TASK_TEMPLATES_DATA.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="golden-configuration" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
                  Golden configuration
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                    {GOLDEN_CONFIG_TASKS_DATA.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled-tasks" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters + Add button on same line */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={scopeFilter} onValueChange={setScopeFilter}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="default"
                        className="ml-auto shrink-0 gap-1"
                        onClick={() => setAddTaskDialogOpen(true)}
                      >
                        <Icon name="add" size={18} />
                        Add scheduled task
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add scheduled task</TooltipContent>
                  </Tooltip>
                </div>
                <AddScheduledTaskDialog
                  open={addTaskDialogOpen}
                  onOpenChange={setAddTaskDialogOpen}
                  region={region}
                  onAdd={(payload) => {
                    // Optional: add to list or show toast
                  }}
                />
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <ScheduledTasksDataTable
                    onTaskClick={(task) => {
                      setSelectedTask(task);
                      setTaskDrawerOpen(true);
                    }}
                  />
                </div>
                <ScheduledTaskDrawer
                  task={selectedTask}
                  open={taskDrawerOpen}
                  onOpenChange={setTaskDrawerOpen}
                />
              </TabsContent>

              <TabsContent value="templates" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                {/* Search and filters + Add template button on same line */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={templatesSearch}
                      onChange={(e) => setTemplatesSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <Select value={templatesDomainFilter} onValueChange={setTemplatesDomainFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAIN_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={templatesDeviceTypeFilter} onValueChange={setTemplatesDeviceTypeFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={templatesScopeFilter} onValueChange={setTemplatesScopeFilter}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="default" className="ml-auto shrink-0 gap-1">
                        <Icon name="add" size={18} />
                        Add template
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add template</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <TaskTemplatesDataTable />
                </div>
              </TabsContent>

              <TabsContent value="golden-configuration" className="mt-6 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search configurations..."
                      value={goldenConfigSearch}
                      onChange={(e) => setGoldenConfigSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <Select value={goldenConfigDeviceTypeFilter} onValueChange={setGoldenConfigDeviceTypeFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOLDEN_DEVICE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={goldenConfigStatusFilter} onValueChange={setGoldenConfigStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Last run" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOLDEN_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="default" className="ml-auto shrink-0 gap-1" onClick={() => setAddConfigDialogOpen(true)}>
                        <Icon name="add" size={18} />
                        Add configuration
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add golden configuration</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <GoldenConfigTasksDataTable />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>

    {/* Add golden configuration dialog */}
    <Dialog open={addConfigDialogOpen} onOpenChange={setAddConfigDialogOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add configuration</DialogTitle>
          <DialogDescription>Select the parameters for the new golden configuration.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Node type</Label>
            <Select value={configNodeType} onValueChange={setConfigNodeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                {CONFIG_NODE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Technology</Label>
            <Select value={configTechnology} onValueChange={setConfigTechnology}>
              <SelectTrigger>
                <SelectValue placeholder="Select technology" />
              </SelectTrigger>
              <SelectContent>
                {CONFIG_TECHNOLOGY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Select value={configFrequency} onValueChange={setConfigFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {CONFIG_FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddConfigDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddConfig} disabled={!configNodeType || !configTechnology || !configFrequency}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

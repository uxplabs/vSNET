'use client';

import React, { useState } from 'react';
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
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { FileManagementUsersDataTable, FILE_MANAGEMENT_USERS_DATA } from './file-management-users-data-table';

const PERMISSIONS_OPTIONS = ['Permissions', 'Read', 'Read, Write', 'Read, Write, Delete', 'All'] as const;

export interface FileManagementPageProps {
  onBack?: () => void;
}

export default function FileManagementPage({ onBack }: FileManagementPageProps) {
  const [fileTab, setFileTab] = useState('users');
  const [search, setSearch] = useState('');
  const [permissionsFilter, setPermissionsFilter] = useState<string>('Permissions');
  const [pmDays, setPmDays] = useState('30');
  const [cmMb, setCmMb] = useState('1024');
  const [cperDays, setCperDays] = useState('14');
  const [debugLogsDays, setDebugLogsDays] = useState('7');
  const [errorBundlesDays, setErrorBundlesDays] = useState('14');
  const [deviceDbBackupsDays, setDeviceDbBackupsDays] = useState('30');
  const [vsnetDbBackupsMb, setVsnetDbBackupsMb] = useState('2048');
  const [cmBackupAutoSync, setCmBackupAutoSync] = useState(true);
  const [cmFileFormat, setCmFileFormat] = useState('CSV');
  const [deviceDbBackupAutoSync, setDeviceDbBackupAutoSync] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">File management</h1>
      <Tabs value={fileTab} onValueChange={setFileTab}>
        <div className="sticky top-0 z-10 -mt-6 -mb-6 bg-background/80 backdrop-blur-sm pt-6 pb-6">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2">
            Users
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
              {FILE_MANAGEMENT_USERS_DATA.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="retention-policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Retention policies
          </TabsTrigger>
          <TabsTrigger value="sync-options" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
            Sync options
          </TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px]">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select value={permissionsFilter} onValueChange={setPermissionsFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Permissions" />
              </SelectTrigger>
              <SelectContent>
                {PERMISSIONS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="ml-auto shrink-0 gap-1">
              <Icon name="add" size={18} />
              Add user
            </Button>
          </div>
          <FileManagementUsersDataTable />
        </TabsContent>

        <TabsContent value="retention-policies" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <form className="grid gap-6 sm:grid-cols-2 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="pm-days">PM (days)</Label>
                  <Input
                    id="pm-days"
                    type="number"
                    min={1}
                    value={pmDays}
                    onChange={(e) => setPmDays(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cm-mb">CM (MB)</Label>
                  <Input
                    id="cm-mb"
                    type="number"
                    min={1}
                    value={cmMb}
                    onChange={(e) => setCmMb(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cper-days">CPER (days)</Label>
                  <Input
                    id="cper-days"
                    type="number"
                    min={1}
                    value={cperDays}
                    onChange={(e) => setCperDays(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debug-logs-days">Debug logs (days)</Label>
                  <Input
                    id="debug-logs-days"
                    type="number"
                    min={1}
                    value={debugLogsDays}
                    onChange={(e) => setDebugLogsDays(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="error-bundles-days">Error bundles (days)</Label>
                  <Input
                    id="error-bundles-days"
                    type="number"
                    min={1}
                    value={errorBundlesDays}
                    onChange={(e) => setErrorBundlesDays(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-db-backups-days">Device database backups (days)</Label>
                  <Input
                    id="device-db-backups-days"
                    type="number"
                    min={1}
                    value={deviceDbBackupsDays}
                    onChange={(e) => setDeviceDbBackupsDays(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="vsnet-db-backups-mb">vSNET database backups (MB)</Label>
                  <Input
                    id="vsnet-db-backups-mb"
                    type="number"
                    min={1}
                    value={vsnetDbBackupsMb}
                    onChange={(e) => setVsnetDbBackupsMb(e.target.value)}
                    className="w-full max-w-xs"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-options" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6 max-w-2xl">
                {/* CM backup auto sync */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="cm-backup-auto-sync"
                      checked={cmBackupAutoSync}
                      onCheckedChange={(checked) => setCmBackupAutoSync(checked === true)}
                    />
                    <Label htmlFor="cm-backup-auto-sync" className="cursor-pointer">
                      CM backup auto sync
                    </Label>
                  </div>
                  {cmBackupAutoSync && (
                    <div className="ml-7 space-y-2">
                      <Label htmlFor="file-format">File format</Label>
                      <Select value={cmFileFormat} onValueChange={setCmFileFormat}>
                        <SelectTrigger id="file-format" className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSV">CSV</SelectItem>
                          <SelectItem value="JSON">JSON</SelectItem>
                          <SelectItem value="XML">XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Device database backup auto sync */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="device-db-backup-auto-sync"
                    checked={deviceDbBackupAutoSync}
                    onCheckedChange={(checked) => setDeviceDbBackupAutoSync(checked === true)}
                  />
                  <Label htmlFor="device-db-backup-auto-sync" className="cursor-pointer">
                    Device database backup auto sync
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

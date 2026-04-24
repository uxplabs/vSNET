'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  FileManagementUsersDataTable,
  type FileManagementPersisted,
  type FileManagementUserRow,
} from './file-management-users-data-table';
import { FileManagementUserSheet } from './file-management-user-sheet';

const PERMISSIONS_OPTIONS = ['All', 'Read', 'Read, Write', 'Read, Write, Delete'] as const;

export interface FileManagementPageProps {
  onBack?: () => void;
  fileMgmt: FileManagementPersisted;
  setFileMgmt: Dispatch<SetStateAction<FileManagementPersisted>>;
}

export default function FileManagementPage({ fileMgmt, setFileMgmt, onBack: _onBack }: FileManagementPageProps) {
  const [fileTab, setFileTab] = useState('users');
  const [fileUserSheetOpen, setFileUserSheetOpen] = useState(false);
  const [fileUserEditing, setFileUserEditing] = useState<FileManagementUserRow | null>(null);
  const [search, setSearch] = useState('');
  const [permissionsFilter, setPermissionsFilter] = useState<string>('All');

  const filteredFileUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fileMgmt.fileUsers.filter((row) => {
      if (permissionsFilter !== 'All' && row.permissions !== permissionsFilter) return false;
      if (!q) return true;
      const hay = `${row.user} ${row.description} ${row.permissions}`.toLowerCase();
      return hay.includes(q);
    });
  }, [fileMgmt.fileUsers, search, permissionsFilter]);

  const takenFileUsernamesLower = useMemo(
    () =>
      fileMgmt.fileUsers
        .filter((u) => (fileUserEditing ? u.id !== fileUserEditing.id : true))
        .map((u) => u.user.toLowerCase()),
    [fileMgmt.fileUsers, fileUserEditing],
  );

  return (
    <div className="space-y-6">
      <Tabs value={fileTab} onValueChange={setFileTab}>
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-2">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger
              value="users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 gap-2"
            >
              Users
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                {fileMgmt.fileUsers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="retention-policies"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
              Retention policies
            </TabsTrigger>
            <TabsTrigger
              value="sync-options"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
            >
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
            <FilterSelect
              value={permissionsFilter}
              onValueChange={setPermissionsFilter}
              label="Permissions"
              options={[...PERMISSIONS_OPTIONS]}
              className="w-[180px]"
            />
            <Button
              type="button"
              variant="default"
              className="ml-auto shrink-0"
              aria-label="Add user"
              onClick={() => {
                setFileUserEditing(null);
                setFileUserSheetOpen(true);
              }}
            >
              <Icon name="add" size={16} />
              Add user
            </Button>
          </div>
          <FileManagementUsersDataTable
            data={filteredFileUsers}
            onEditUser={(row) => {
              setFileUserEditing(row);
              setFileUserSheetOpen(true);
            }}
          />
          <FileManagementUserSheet
            open={fileUserSheetOpen}
            onOpenChange={(open) => {
              setFileUserSheetOpen(open);
              if (!open) setFileUserEditing(null);
            }}
            user={fileUserEditing}
            takenUsernamesLower={takenFileUsernamesLower}
            onSave={(row) => {
              setFileMgmt((prev) => {
                const existsById = prev.fileUsers.some((u) => u.id === row.id);
                if (existsById) {
                  return {
                    ...prev,
                    fileUsers: prev.fileUsers.map((u) => (u.id === row.id ? row : u)),
                  };
                }
                return { ...prev, fileUsers: [...prev.fileUsers, row] };
              });
            }}
          />
        </TabsContent>

        <TabsContent value="retention-policies" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <form className="grid max-w-2xl gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pm-days">PM (days)</Label>
                  <Input
                    id="pm-days"
                    type="number"
                    min={1}
                    value={fileMgmt.pmDays}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, pmDays: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cm-mb">CM (MB)</Label>
                  <Input
                    id="cm-mb"
                    type="number"
                    min={1}
                    value={fileMgmt.cmMb}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, cmMb: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cper-days">CPER (days)</Label>
                  <Input
                    id="cper-days"
                    type="number"
                    min={1}
                    value={fileMgmt.cperDays}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, cperDays: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debug-logs-days">Debug logs (days)</Label>
                  <Input
                    id="debug-logs-days"
                    type="number"
                    min={1}
                    value={fileMgmt.debugLogsDays}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, debugLogsDays: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="error-bundles-days">Error bundles (days)</Label>
                  <Input
                    id="error-bundles-days"
                    type="number"
                    min={1}
                    value={fileMgmt.errorBundlesDays}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, errorBundlesDays: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device-db-backups-days">Device database backups (days)</Label>
                  <Input
                    id="device-db-backups-days"
                    type="number"
                    min={1}
                    value={fileMgmt.deviceDbBackupsDays}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, deviceDbBackupsDays: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ams-db-backups-mb">AMS database backups (MB)</Label>
                  <Input
                    id="ams-db-backups-mb"
                    type="number"
                    min={1}
                    value={fileMgmt.amsDbBackupsMb}
                    onChange={(e) => setFileMgmt((p) => ({ ...p, amsDbBackupsMb: e.target.value }))}
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
              <div className="max-w-2xl space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="cm-backup-auto-sync"
                      checked={fileMgmt.cmBackupAutoSync}
                      onCheckedChange={(checked) =>
                        setFileMgmt((p) => ({ ...p, cmBackupAutoSync: checked === true }))
                      }
                    />
                    <Label htmlFor="cm-backup-auto-sync" className="cursor-pointer">
                      CM backup auto sync
                    </Label>
                  </div>
                  {fileMgmt.cmBackupAutoSync && (
                    <div className="ml-7 space-y-2">
                      <Label htmlFor="file-format">File format</Label>
                      <Select
                        value={fileMgmt.cmFileFormat}
                        onValueChange={(v) => setFileMgmt((p) => ({ ...p, cmFileFormat: v }))}
                      >
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

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="device-db-backup-auto-sync"
                    checked={fileMgmt.deviceDbBackupAutoSync}
                    onCheckedChange={(checked) =>
                      setFileMgmt((p) => ({ ...p, deviceDbBackupAutoSync: checked === true }))
                    }
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

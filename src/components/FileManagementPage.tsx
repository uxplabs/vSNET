'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Field, FieldLabel } from './ui/field';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  FileManagementUsersDataTable,
  normalizeFileManagementUsers,
  type FileManagementPersisted,
  type FileManagementUserRow,
} from './file-management-users-data-table';
import { FileManagementUserSheet } from './file-management-user-sheet';

function FileMgmtFormCardHeaderDivider() {
  return <div className="-mx-6 border-t border-border/50" aria-hidden />;
}

type FileRetentionSlice = Pick<
  FileManagementPersisted,
  | 'pmDays'
  | 'cmMb'
  | 'cperDays'
  | 'debugLogsDays'
  | 'errorBundlesDays'
  | 'deviceDbBackupsDays'
  | 'amsDbBackupsMb'
>;

type FileSyncSlice = Pick<FileManagementPersisted, 'cmBackupAutoSync' | 'cmFileFormat' | 'deviceDbBackupAutoSync'>;

export interface FileManagementPageProps {
  onBack?: () => void;
  fileMgmt: FileManagementPersisted;
  setFileMgmt: Dispatch<SetStateAction<FileManagementPersisted>>;
  /** Incremented when administration restores a snapshot so inline edit modes reset. */
  formsResetNonce?: number;
  onInlineFormSaved?: () => void;
}

export default function FileManagementPage({
  fileMgmt,
  setFileMgmt,
  formsResetNonce = 0,
  onInlineFormSaved,
  onBack: _onBack,
}: FileManagementPageProps) {
  const [fileTab, setFileTab] = useState('users');
  const [fileUserSheetOpen, setFileUserSheetOpen] = useState(false);
  const [fileUserEditing, setFileUserEditing] = useState<FileManagementUserRow | null>(null);
  const [search, setSearch] = useState('');

  const retentionEditBaselineRef = useRef<FileRetentionSlice | null>(null);
  const [retentionSectionMode, setRetentionSectionMode] = useState<'view' | 'edit'>('view');
  const syncEditBaselineRef = useRef<FileSyncSlice | null>(null);
  const [syncSectionMode, setSyncSectionMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    if (fileMgmt.fileUsers.every((u) => typeof u.sshKey === 'string' && u.sshKey.trim().length > 0)) return;
    setFileMgmt((prev) => ({
      ...prev,
      fileUsers: normalizeFileManagementUsers(prev.fileUsers),
    }));
  }, [fileMgmt.fileUsers, setFileMgmt]);

  useEffect(() => {
    setRetentionSectionMode('view');
    setSyncSectionMode('view');
    retentionEditBaselineRef.current = null;
    syncEditBaselineRef.current = null;
  }, [formsResetNonce]);

  const collectRetentionSlice = useCallback((): FileRetentionSlice => {
    return {
      pmDays: fileMgmt.pmDays,
      cmMb: fileMgmt.cmMb,
      cperDays: fileMgmt.cperDays,
      debugLogsDays: fileMgmt.debugLogsDays,
      errorBundlesDays: fileMgmt.errorBundlesDays,
      deviceDbBackupsDays: fileMgmt.deviceDbBackupsDays,
      amsDbBackupsMb: fileMgmt.amsDbBackupsMb,
    };
  }, [
    fileMgmt.pmDays,
    fileMgmt.cmMb,
    fileMgmt.cperDays,
    fileMgmt.debugLogsDays,
    fileMgmt.errorBundlesDays,
    fileMgmt.deviceDbBackupsDays,
    fileMgmt.amsDbBackupsMb,
  ]);

  const applyRetentionSlice = useCallback(
    (v: FileRetentionSlice) => {
      setFileMgmt((p) => ({ ...p, ...v }));
    },
    [setFileMgmt],
  );

  const startRetentionEdit = useCallback(() => {
    retentionEditBaselineRef.current = structuredClone(collectRetentionSlice());
    setRetentionSectionMode('edit');
  }, [collectRetentionSlice]);

  const cancelRetentionEdit = useCallback(() => {
    const baseline = retentionEditBaselineRef.current;
    if (baseline) applyRetentionSlice(baseline);
    retentionEditBaselineRef.current = null;
    setRetentionSectionMode('view');
  }, [applyRetentionSlice]);

  const saveRetention = useCallback(() => {
    retentionEditBaselineRef.current = null;
    toast.success('Retention policies saved');
    onInlineFormSaved?.();
    setRetentionSectionMode('view');
  }, [onInlineFormSaved]);

  const retentionEditDirty =
    retentionSectionMode === 'edit' &&
    retentionEditBaselineRef.current !== null &&
    JSON.stringify(collectRetentionSlice()) !== JSON.stringify(retentionEditBaselineRef.current);

  const collectSyncSlice = useCallback((): FileSyncSlice => {
    return {
      cmBackupAutoSync: fileMgmt.cmBackupAutoSync,
      cmFileFormat: fileMgmt.cmFileFormat,
      deviceDbBackupAutoSync: fileMgmt.deviceDbBackupAutoSync,
    };
  }, [fileMgmt.cmBackupAutoSync, fileMgmt.cmFileFormat, fileMgmt.deviceDbBackupAutoSync]);

  const applySyncSlice = useCallback(
    (v: FileSyncSlice) => {
      setFileMgmt((p) => ({ ...p, ...v }));
    },
    [setFileMgmt],
  );

  const startSyncEdit = useCallback(() => {
    syncEditBaselineRef.current = structuredClone(collectSyncSlice());
    setSyncSectionMode('edit');
  }, [collectSyncSlice]);

  const cancelSyncEdit = useCallback(() => {
    const baseline = syncEditBaselineRef.current;
    if (baseline) applySyncSlice(baseline);
    syncEditBaselineRef.current = null;
    setSyncSectionMode('view');
  }, [applySyncSlice]);

  const saveSync = useCallback(() => {
    syncEditBaselineRef.current = null;
    toast.success('Sync options saved');
    onInlineFormSaved?.();
    setSyncSectionMode('view');
  }, [onInlineFormSaved]);

  const syncEditDirty =
    syncSectionMode === 'edit' &&
    syncEditBaselineRef.current !== null &&
    JSON.stringify(collectSyncSlice()) !== JSON.stringify(syncEditBaselineRef.current);

  /** Match Administration read-only kv spacing: `space-y-8` groups, inner `grid … gap-x-6 gap-y-3` or `space-y-3`, `Field` + `gap-1`. */
  const roKvLabel = 'text-sm font-medium text-muted-foreground';
  const roKvValue = 'text-sm font-semibold text-foreground leading-snug';
  const roKvValueNums = cn(roKvValue, 'tabular-nums tracking-tight');

  const filteredFileUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fileMgmt.fileUsers.filter((row) => {
      if (!q) return true;
      const hay = `${row.user} ${row.sshKey}`.toLowerCase();
      return hay.includes(q);
    });
  }, [fileMgmt.fileUsers, search]);

  const fileUsersActiveFilters = useMemo(() => {
    const list: { key: string; label: string; onClear: () => void }[] = [];
    if (search.trim()) {
      list.push({
        key: 'search',
        label: `Search: "${search.trim()}"`,
        onClear: () => setSearch(''),
      });
    }
    return list;
  }, [search]);

  const clearFileUsersFilters = useCallback(() => {
    setSearch('');
  }, []);

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

        <TabsContent value="users" className="mt-6">
          <div className="flex flex-col min-w-0">
            {fileMgmt.fileUsers.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="rounded-lg border bg-card p-8 text-center max-w-sm w-full shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Icon name="person" size={24} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">No users yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a user with a username and SSH key.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setFileUserEditing(null);
                      setFileUserSheetOpen(true);
                    }}
                  >
                    <Icon name="add" size={16} className="mr-1.5" />
                    Add user
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 mb-2 shrink-0 min-w-0">
                  <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-[280px] sm:min-w-[100px]">
                    <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users or SSH keys..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full min-w-0"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    className="sm:ml-auto shrink-0"
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
                <div className="flex flex-wrap items-center gap-2 py-1.5 shrink-0 min-w-0">
                  <span className="text-sm text-muted-foreground">
                    {filteredFileUsers.length} {filteredFileUsers.length === 1 ? 'result' : 'results'}
                  </span>
                  {fileUsersActiveFilters.map((f) => (
                    <Badge key={f.key} variant="secondary" className="gap-1 pr-0.5 pl-2 py-0.5 font-medium">
                      {f.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 shrink-0 rounded-sm -mr-0.5 hover:bg-muted-foreground/20"
                        onClick={f.onClear}
                        aria-label={`Clear ${f.label}`}
                      >
                        <Icon name="close" size={12} aria-hidden />
                      </Button>
                    </Badge>
                  ))}
                  {fileUsersActiveFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={clearFileUsersFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <FileManagementUsersDataTable
                  data={filteredFileUsers}
                  onEditUser={(row) => {
                    setFileUserEditing(row);
                    setFileUserSheetOpen(true);
                  }}
                />
              </>
            )}
          </div>
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
            <CardHeader className="flex flex-col gap-6 space-y-0 p-6 pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Retention policies</CardTitle>
                  <CardDescription>How long or how much data to retain for each category.</CardDescription>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  {retentionSectionMode === 'view' ? (
                    <Button type="button" className="sm:self-start" onClick={startRetentionEdit}>
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" className="sm:self-start" onClick={cancelRetentionEdit}>
                        Cancel
                      </Button>
                      <Button type="button" className="sm:self-start" disabled={!retentionEditDirty} onClick={saveRetention}>
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <FileMgmtFormCardHeaderDivider />
            </CardHeader>
            <CardContent className="pt-6">
              {retentionSectionMode === 'view' ? (
                <div className="max-w-2xl space-y-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>PM (days)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.pmDays}</p>
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>CM (MB)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.cmMb}</p>
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>CPER (days)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.cperDays}</p>
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>Debug logs (days)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.debugLogsDays}</p>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>Error bundles (days)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.errorBundlesDays}</p>
                    </Field>
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>Device database backups (days)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.deviceDbBackupsDays}</p>
                    </Field>
                    <Field className="gap-1 sm:col-span-2">
                      <FieldLabel className={roKvLabel}>AMS database backups (MB)</FieldLabel>
                      <p className={roKvValueNums}>{fileMgmt.amsDbBackupsMb}</p>
                    </Field>
                  </div>
                </div>
              ) : (
                <form className="grid max-w-2xl gap-6 sm:grid-cols-2">
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="pm-days">PM (days)</FieldLabel>
                    <Input
                      id="pm-days"
                      type="number"
                      min={1}
                      value={fileMgmt.pmDays}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, pmDays: e.target.value }))}
                    />
                  </Field>
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="cm-mb">CM (MB)</FieldLabel>
                    <Input
                      id="cm-mb"
                      type="number"
                      min={1}
                      value={fileMgmt.cmMb}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, cmMb: e.target.value }))}
                    />
                  </Field>
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="cper-days">CPER (days)</FieldLabel>
                    <Input
                      id="cper-days"
                      type="number"
                      min={1}
                      value={fileMgmt.cperDays}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, cperDays: e.target.value }))}
                    />
                  </Field>
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="debug-logs-days">Debug logs (days)</FieldLabel>
                    <Input
                      id="debug-logs-days"
                      type="number"
                      min={1}
                      value={fileMgmt.debugLogsDays}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, debugLogsDays: e.target.value }))}
                    />
                  </Field>
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="error-bundles-days">Error bundles (days)</FieldLabel>
                    <Input
                      id="error-bundles-days"
                      type="number"
                      min={1}
                      value={fileMgmt.errorBundlesDays}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, errorBundlesDays: e.target.value }))}
                    />
                  </Field>
                  <Field controlSize="xs">
                    <FieldLabel htmlFor="device-db-backups-days">Device database backups (days)</FieldLabel>
                    <Input
                      id="device-db-backups-days"
                      type="number"
                      min={1}
                      value={fileMgmt.deviceDbBackupsDays}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, deviceDbBackupsDays: e.target.value }))}
                    />
                  </Field>
                  <Field className="sm:col-span-2" controlSize="xs">
                    <FieldLabel htmlFor="ams-db-backups-mb">AMS database backups (MB)</FieldLabel>
                    <Input
                      id="ams-db-backups-mb"
                      type="number"
                      min={1}
                      value={fileMgmt.amsDbBackupsMb}
                      onChange={(e) => setFileMgmt((p) => ({ ...p, amsDbBackupsMb: e.target.value }))}
                    />
                  </Field>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-options" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col gap-6 space-y-0 p-6 pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Sync options</CardTitle>
                  <CardDescription>Automatic sync for CM and device database backups.</CardDescription>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                  {syncSectionMode === 'view' ? (
                    <Button type="button" className="sm:self-start" onClick={startSyncEdit}>
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" className="sm:self-start" onClick={cancelSyncEdit}>
                        Cancel
                      </Button>
                      <Button type="button" className="sm:self-start" disabled={!syncEditDirty} onClick={saveSync}>
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <FileMgmtFormCardHeaderDivider />
            </CardHeader>
            <CardContent className="pt-6">
              {syncSectionMode === 'view' ? (
                <div className="max-w-2xl space-y-8">
                  <div className="space-y-3">
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>CM backup auto sync</FieldLabel>
                      <p className={roKvValue}>{fileMgmt.cmBackupAutoSync ? 'Yes' : 'No'}</p>
                    </Field>
                    {fileMgmt.cmBackupAutoSync ? (
                      <Field className="gap-1">
                        <FieldLabel className={roKvLabel}>File format</FieldLabel>
                        <p className={roKvValue}>{fileMgmt.cmFileFormat}</p>
                      </Field>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    <Field className="gap-1">
                      <FieldLabel className={roKvLabel}>Device database backup auto sync</FieldLabel>
                      <p className={roKvValue}>{fileMgmt.deviceDbBackupAutoSync ? 'Yes' : 'No'}</p>
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="cm-backup-auto-sync"
                        checked={fileMgmt.cmBackupAutoSync}
                        onCheckedChange={(checked) => setFileMgmt((p) => ({ ...p, cmBackupAutoSync: checked === true }))}
                      />
                      <Label htmlFor="cm-backup-auto-sync" className="cursor-pointer">
                        CM backup auto sync
                      </Label>
                    </div>
                    {fileMgmt.cmBackupAutoSync && (
                      <div className="ml-7 space-y-2">
                        <Field controlSize="sm">
                          <FieldLabel htmlFor="file-format">File format</FieldLabel>
                          <Select
                            value={fileMgmt.cmFileFormat}
                            onValueChange={(v) => setFileMgmt((p) => ({ ...p, cmFileFormat: v }))}
                          >
                            <SelectTrigger id="file-format">
                              <SelectValue />
                            </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSV">CSV</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                            <SelectItem value="XML">XML</SelectItem>
                          </SelectContent>
                          </Select>
                        </Field>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

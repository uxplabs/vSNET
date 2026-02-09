'use client';

import React from 'react';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { DeviceMigrationDataTable, DEVICE_MIGRATION_DATA } from './device-migration-data-table';

export interface DeviceMigrationPageProps {
  onBack?: () => void;
}

export default function DeviceMigrationPage({ onBack }: DeviceMigrationPageProps) {
  const completedCount = DEVICE_MIGRATION_DATA.filter(d => d.status === 'Completed').length;
  const inProgressCount = DEVICE_MIGRATION_DATA.filter(d => d.status === 'In progress').length;
  const totalCount = DEVICE_MIGRATION_DATA.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const estimatedMinutes = 12;

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-sm font-semibold">In progress</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">System name</p>
            <p className="text-sm font-semibold truncate" title="AMS-PROD-01">AMS-PROD-01</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="text-sm font-semibold truncate" title="Pacific Northwest">Pacific Northwest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Sites migrating</p>
            <p className="text-sm font-semibold tabular-nums">{completedCount + inProgressCount} / {totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Estimated time</p>
            <p className="text-sm font-semibold tabular-nums">{estimatedMinutes} min</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Migration progress</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground tabular-nums">{estimatedMinutes} min remaining</span>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Icon name="pause" size={16} />
                Pause
              </Button>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{completedCount} of {totalCount} completed</span>
            <span className="text-xs text-muted-foreground tabular-nums">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DeviceMigrationDataTable />
    </div>
  );
}

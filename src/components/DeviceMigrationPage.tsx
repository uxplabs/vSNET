'use client';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { DeviceMigrationDataTable, DEVICE_MIGRATION_DATA } from './device-migration-data-table';

export interface DeviceMigrationPageProps {
  onBack?: () => void;
}

export default function DeviceMigrationPage({ onBack: _onBack }: DeviceMigrationPageProps) {
  const completedCount = DEVICE_MIGRATION_DATA.filter(d => d.status === 'Completed').length;
  const inProgressCount = DEVICE_MIGRATION_DATA.filter(d => d.status === 'In progress').length;
  const totalCount = DEVICE_MIGRATION_DATA.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const estimatedMinutes = 12;

  const roKvLabel = 'text-sm font-medium text-muted-foreground';
  const roKvValue = 'text-sm font-semibold text-foreground leading-snug';
  const roKvValueNums = cn(roKvValue, 'tabular-nums tracking-tight');

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className={cn(roKvLabel, 'mb-0.5')}>Status</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className={roKvValue}>In progress</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={cn(roKvLabel, 'mb-0.5')}>System name</p>
            <p className={cn(roKvValue, 'truncate')} title="AMS-PROD-01">AMS-PROD-01</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={cn(roKvLabel, 'mb-0.5')}>Location</p>
            <p className={cn(roKvValue, 'truncate')} title="Pacific Northwest">Pacific Northwest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={cn(roKvLabel, 'mb-0.5')}>Sites migrating</p>
            <p className={roKvValueNums}>{completedCount + inProgressCount} / {totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className={cn(roKvLabel, 'mb-0.5')}>Estimated time</p>
            <p className={roKvValueNums}>{estimatedMinutes} min</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Migration progress</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums text-muted-foreground">{estimatedMinutes} min remaining</span>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Icon name="pause" size={16} />
                Pause
              </Button>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-muted-foreground">{completedCount} of {totalCount} completed</span>
            <span className={roKvValueNums}>{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DeviceMigrationDataTable />
    </div>
  );
}

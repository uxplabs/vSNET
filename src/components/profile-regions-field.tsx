'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface ProfileRegionsFieldProps {
  accountRegions: string[];
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
}

export function ProfileRegionsField({
  accountRegions,
  selectedRegions,
  onRegionsChange,
}: ProfileRegionsFieldProps) {
  const sortedCatalog = React.useMemo(
    () => [...accountRegions].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    [accountRegions],
  );

  const allSelected =
    accountRegions.length > 0 && accountRegions.every((r) => selectedRegions.includes(r));
  const someSelected = selectedRegions.some((r) => accountRegions.includes(r));
  const masterChecked: boolean | 'indeterminate' =
    allSelected ? true : someSelected ? 'indeterminate' : false;

  const toggleRegion = (name: string, on: boolean) => {
    if (on) {
      if (selectedRegions.includes(name)) return;
      onRegionsChange([...selectedRegions, name]);
    } else {
      onRegionsChange(selectedRegions.filter((r) => r !== name));
    }
  };

  const toggleAll = (on: boolean) => {
    if (on) {
      onRegionsChange(Array.from(new Set(accountRegions)));
    } else {
      onRegionsChange(selectedRegions.filter((r) => !accountRegions.includes(r)));
    }
  };

  return (
    <div className="space-y-2">
      <Label>Regions</Label>
      <div className="mt-1 max-h-64 space-y-0 overflow-y-auto rounded-md border border-border p-3">
        <label className="flex cursor-pointer items-center gap-2 border-b border-border pb-2.5 text-sm font-medium text-foreground">
          <Checkbox
            checked={masterChecked}
            onCheckedChange={(v) => toggleAll(Boolean(v))}
            disabled={accountRegions.length === 0}
            aria-label="All regions"
          />
          <span>All regions{accountRegions.length > 0 ? ` (${accountRegions.length})` : ''}</span>
        </label>
        <div className="space-y-2 pt-2.5">
          {sortedCatalog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No regions available.</p>
          ) : (
            sortedCatalog.map((regionName) => (
              <label
                key={regionName}
                className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
              >
                <Checkbox
                  checked={selectedRegions.includes(regionName)}
                  onCheckedChange={(v) => toggleRegion(regionName, Boolean(v))}
                  aria-label={regionName}
                />
                <span className="text-foreground">{regionName}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

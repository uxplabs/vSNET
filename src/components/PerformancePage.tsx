'use client';

import React, { useState } from 'react';
import { Navbar01 } from './navbar-01';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { FilterSelect } from './ui/filter-select';
import { Button } from './ui/button';
import { Icon } from './Icon';
import { PerformanceDataTable } from './performance-data-table';

const CARRIER_OPTIONS = ['All', 'Verizon', 'AT&T', 'T-Mobile'] as const;
const TIME_OPTIONS = ['All', 'Last 15 min', 'Last 6 hours', 'Last 24 hours'] as const;

export interface PerformancePageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

export default function PerformancePage({
  appName = 'AMS',
  onSignOut,
  onNavigate,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
}: PerformancePageProps) {
  const [performanceTab, setPerformanceTab] = useState<'lte' | 'nr'>('lte');
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<string>('All');
  const [carrierFilter, setCarrierFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'degraded' | 'optimal'>('all');

  const filtersActive = search !== '' || timeFilter !== 'All' || carrierFilter !== 'All' || statusFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setTimeFilter('All');
    setCarrierFilter('All');
    setStatusFilter('all');
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        currentSection="performance"
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
      />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 py-6 md:px-6 lg:px-8">
        <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <CardContent className="pt-6 flex-1 flex flex-col min-h-0 overflow-hidden">
            <Tabs value={performanceTab} onValueChange={(v) => setPerformanceTab(v as 'lte' | 'nr')} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex flex-col gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                  <TabsList className="inline-flex h-9 w-fit shrink-0 items-center justify-start gap-1 rounded-full bg-muted p-1 text-muted-foreground">
                    <TabsTrigger value="lte" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      LTE
                    </TabsTrigger>
                    <TabsTrigger value="nr" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow">
                      NR
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
                  <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-shrink-0">
                    <Icon
                      name="search"
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <FilterSelect value={timeFilter} onValueChange={setTimeFilter} label="Time" options={[...TIME_OPTIONS]} className="w-[140px]" />
                  <FilterSelect value={carrierFilter} onValueChange={setCarrierFilter} label="Carrier" options={[...CARRIER_OPTIONS]} className="w-[130px]" />
                  <div className="inline-flex items-center rounded-md border border-input shadow-sm shrink-0">
                    {([
                      { value: 'all', label: 'All' },
                      { value: 'degraded', label: 'Degraded' },
                      { value: 'optimal', label: 'Optimal' },
                    ] as const).map((opt, i, arr) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatusFilter(opt.value as 'all' | 'degraded' | 'optimal')}
                        className={`h-9 px-3 text-sm font-medium transition-colors ${
                          statusFilter === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-foreground hover:bg-muted'
                        } ${i === 0 ? 'rounded-l-md' : ''} ${i === arr.length - 1 ? 'rounded-r-md' : ''} ${i > 0 ? 'border-l border-input' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {filtersActive && (
                    <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground" onClick={clearFilters}>
                      <Icon name="close" size={16} />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <TabsContent value="lte" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <PerformanceDataTable />
                </div>
              </TabsContent>
              <TabsContent value="nr" className="mt-0 flex-1 flex flex-col min-h-0 overflow-hidden data-[state=inactive]:hidden">
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <PerformanceDataTable />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

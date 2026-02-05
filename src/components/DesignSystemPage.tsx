'use client';

import React from 'react';
import { Navbar01 } from './navbar-01';
import { Tabs, TabsContent, TabsListUnderline, TabsTriggerUnderline } from './ui/tabs';
import ColorTokensPage from './ColorTokensPage';
import TypographyPage from './TypographyPage';
import ComponentsLibraryPage from './ComponentsLibraryPage';

interface DesignSystemPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  regions?: string[];
  onRegionChange?: (region: string) => void;
  onRegionsChange?: (regions: string[]) => void;
  fixedRegion?: string;
}

export default function DesignSystemPage({
  appName = 'vSNET',
  onSignOut,
  onNavigate,
  region,
  regions,
  onRegionChange,
  onRegionsChange,
  fixedRegion,
}: DesignSystemPageProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        region={region}
        regions={regions}
        onRegionChange={onRegionChange}
        onRegionsChange={onRegionsChange}
        fixedRegion={fixedRegion}
        currentSection="design-system"
      />
      <main className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-2">Design system</p>
          <h1 className="text-3xl font-semibold tracking-tight">vSNET Components & Tokens</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Comprehensive reference for UI components, design tokens, and typography. Use this documentation to maintain consistency across the application.
          </p>
        </div>
        <Tabs defaultValue="components" className="space-y-6">
          <TabsListUnderline className="w-full justify-start border-b">
            <TabsTriggerUnderline value="components">Components</TabsTriggerUnderline>
            <TabsTriggerUnderline value="tokens">Design Tokens</TabsTriggerUnderline>
            <TabsTriggerUnderline value="typography">Typography</TabsTriggerUnderline>
          </TabsListUnderline>
          <TabsContent value="components" className="space-y-6 pt-2">
            <ComponentsLibraryPage />
          </TabsContent>
          <TabsContent value="tokens" className="pt-2">
            <ColorTokensPage />
          </TabsContent>
          <TabsContent value="typography" className="pt-2">
            <TypographyPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

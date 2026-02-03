'use client';

import React from 'react';
import { Navbar01 } from './navbar-01';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ColorTokensPage from './ColorTokensPage';
import TypographyPage from './TypographyPage';
import ComponentsLibraryPage from './ComponentsLibraryPage';

interface DesignSystemPageProps {
  appName?: string;
  onSignOut?: () => void;
  onNavigate?: (page: string, tab?: string) => void;
  region?: string;
  onRegionChange?: (region: string) => void;
}

export default function DesignSystemPage({
  appName = 'vSNET',
  onSignOut,
  onNavigate,
  region,
  onRegionChange,
}: DesignSystemPageProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar01
        appName={appName}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
        region={region}
        onRegionChange={onRegionChange}
        currentSection="design-system"
      />
      <main className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-2">Design system</p>
          <h1 className="text-3xl font-semibold tracking-tight">vSNET components & tokens</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Reference for all UI tokens, typography, and shadcn/ui components included in the project.
            Use this page to keep implementations consistent with the design system.
          </p>
        </div>
        <Tabs defaultValue="components" className="space-y-6">
          <TabsList className="justify-start">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="colors">Color tokens</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
          </TabsList>
          <TabsContent value="components" className="space-y-6">
            <ComponentsLibraryPage />
          </TabsContent>
          <TabsContent value="colors">
            <ColorTokensPage />
          </TabsContent>
          <TabsContent value="typography">
            <TypographyPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

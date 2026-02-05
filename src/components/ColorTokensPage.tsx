import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsListUnderline, TabsTriggerUnderline } from './ui/tabs';
import { Separator } from './ui/separator';

interface ColorTokenRow {
  name: string;
  dark: string;
  light: string;
  note?: string;
}

interface TokenSection {
  title: string;
  description?: string;
  tokens: ColorTokenRow[];
}

const COLOR_TOKEN_SECTIONS: TokenSection[] = [
  {
    title: 'Base',
    tokens: [
      { name: 'Background', dark: '#0F172A', light: '#F8FAFC' },
      { name: 'Foreground', dark: '#F8FAFC', light: '#1E293B' },
      { name: 'Primary', dark: '#004F69', light: '#004F69' },
      { name: 'Primary-foreground', dark: '#FFFFFF', light: '#FFFFFF' },
      { name: 'Secondary', dark: '#639BB2', light: '#CBD5E1' },
      { name: 'Secondary-foreground', dark: '#F8FAFC', light: '#1E293B' },
      { name: 'Transparent', dark: '#FFFFFF', light: '#FFFFFF', note: '0% opacity' },
    ],
  },
  {
    title: 'General UI',
    tokens: [
      { name: 'Muted', dark: '#334155', light: '#F1F5F9' },
      { name: 'Muted-foreground', dark: '#94A3B8', light: '#64748B' },
      { name: 'Subtle-foreground', dark: '#717F94', light: '#475569' },
    ],
  },
  {
    title: 'Card',
    tokens: [
      { name: 'Card', dark: '#1E293B', light: '#FFFFFF' },
      { name: 'Card-foreground', dark: '#F8FAFC', light: '#0F172A' },
      { name: 'Card-border', dark: '#334155', light: '#E2E8F0' },
      { name: 'Card-subtle', dark: '#334155', light: '#F1F5F9' },
      { name: 'Card-subtle-foreground', dark: '#CBD5E1', light: '#475569' },
      { name: 'Card-filled', dark: '#1E2433', light: '#CBD5E1' },
      { name: 'Card-filled-foreground', dark: '#E2E8F0', light: '#334155' },
      { name: 'Card-outlined-foreground', dark: '#F8FAFC', light: '#1E293B' },
      { name: 'Card-filled-border', dark: '#2F2F33', light: '#E2E8F0' },
    ],
  },
  {
    title: 'Accent',
    tokens: [
      { name: 'Accent', dark: '#57534E', light: '#D6D3D1' },
      { name: 'Accent-foreground', dark: '#F8FAFC', light: '#0F172A' },
    ],
  },
  {
    title: 'Input',
    tokens: [
      { name: 'Input', dark: '#334155', light: '#D1D5DB' },
      { name: 'Input-highlight', dark: '#FFFFFF', light: '#18181B' },
    ],
  },
  {
    title: 'Other',
    tokens: [
      { name: 'Ring', dark: '#818CF8', light: '#6366F1' },
      { name: 'Border', dark: '#27303F', light: '#E2E8F0' },
      { name: 'Link', dark: '#0369A1', light: '#0369A1' },
      { name: 'Link-hover', dark: '#A5B4FC', light: '#3730A3' },
    ],
  },
  {
    title: 'Sidebar',
    tokens: [
      { name: 'Sidebar-background', dark: '#1E2433', light: '#F8FAFC' },
      { name: 'Sidebar-foreground', dark: '#F8FAFC', light: '#0F172A' },
      { name: 'Sidebar-accent', dark: '#3E4A66', light: '#EEF2FF' },
    ],
  },
  {
    title: 'Popover',
    tokens: [
      { name: 'Popover', dark: '#1E2433', light: '#FFFFFF' },
      { name: 'Popover-foreground', dark: '#F8FAFC', light: '#0F172A' },
    ],
  },
  {
    title: 'Status',
    tokens: [
      { name: 'Success', dark: '#006C28', light: '#009B3A' },
      { name: 'Destructive', dark: '#8A0821', light: '#D13C59' },
      { name: 'Destructive-foreground', dark: '#FAFAFA', light: '#FAFAFA' },
    ],
  },
];

function ColorSwatch({ hex }: { hex: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <code className="text-xs font-mono text-muted-foreground truncate flex-1">{hex}</code>
      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs shrink-0" onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

// Spacing scale based on Tailwind defaults
const SPACING_SCALE = [
  { name: '0', value: '0px', rem: '0' },
  { name: 'px', value: '1px', rem: '1px' },
  { name: '0.5', value: '2px', rem: '0.125rem' },
  { name: '1', value: '4px', rem: '0.25rem' },
  { name: '1.5', value: '6px', rem: '0.375rem' },
  { name: '2', value: '8px', rem: '0.5rem' },
  { name: '2.5', value: '10px', rem: '0.625rem' },
  { name: '3', value: '12px', rem: '0.75rem' },
  { name: '3.5', value: '14px', rem: '0.875rem' },
  { name: '4', value: '16px', rem: '1rem' },
  { name: '5', value: '20px', rem: '1.25rem' },
  { name: '6', value: '24px', rem: '1.5rem' },
  { name: '7', value: '28px', rem: '1.75rem' },
  { name: '8', value: '32px', rem: '2rem' },
  { name: '9', value: '36px', rem: '2.25rem' },
  { name: '10', value: '40px', rem: '2.5rem' },
  { name: '11', value: '44px', rem: '2.75rem' },
  { name: '12', value: '48px', rem: '3rem' },
  { name: '14', value: '56px', rem: '3.5rem' },
  { name: '16', value: '64px', rem: '4rem' },
  { name: '20', value: '80px', rem: '5rem' },
  { name: '24', value: '96px', rem: '6rem' },
];

// Shadow definitions
const SHADOW_SCALE = [
  { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', description: 'Subtle shadow for small elements' },
  { name: 'shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', description: 'Default shadow for cards' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', description: 'Medium shadow for dropdowns' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', description: 'Large shadow for modals' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', description: 'Extra large shadow for popovers' },
  { name: 'shadow-2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)', description: 'Maximum shadow for overlays' },
  { name: 'shadow-inner', value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', description: 'Inset shadow for inputs' },
  { name: 'shadow-none', value: 'none', description: 'Remove shadow' },
];

// Border radius
const RADIUS_SCALE = [
  { name: 'rounded-none', value: '0px', description: 'No radius' },
  { name: 'rounded-sm', value: '0.125rem (2px)', description: 'Small radius' },
  { name: 'rounded', value: '0.25rem (4px)', description: 'Default radius' },
  { name: 'rounded-md', value: '0.375rem (6px)', description: 'Medium radius' },
  { name: 'rounded-lg', value: '0.5rem (8px)', description: 'Large radius' },
  { name: 'rounded-xl', value: '0.75rem (12px)', description: 'Extra large radius' },
  { name: 'rounded-2xl', value: '1rem (16px)', description: '2x large radius' },
  { name: 'rounded-3xl', value: '1.5rem (24px)', description: '3x large radius' },
  { name: 'rounded-full', value: '9999px', description: 'Fully rounded (pill)' },
];

function ColorTokensPage() {
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens</CardTitle>
          <CardDescription>
            Core design tokens for colors, spacing, shadows, and border radius. These tokens ensure consistency across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsListUnderline className="w-full justify-start">
              <TabsTriggerUnderline value="colors">Colors</TabsTriggerUnderline>
              <TabsTriggerUnderline value="spacing">Spacing</TabsTriggerUnderline>
              <TabsTriggerUnderline value="shadows">Shadows</TabsTriggerUnderline>
              <TabsTriggerUnderline value="radius">Border Radius</TabsTriggerUnderline>
            </TabsListUnderline>
          </Tabs>
        </CardContent>
      </Card>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Definitive color tokens for this project. Use CSS variables like <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">var(--primary)</code> or Tailwind classes like <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">bg-primary</code>. Dark theme applies when <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">.dark</code> is on the root.
          </p>

          {COLOR_TOKEN_SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                {section.description && (
                  <CardDescription>{section.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left font-medium text-foreground py-3 px-6 w-[220px]">
                          Name
                        </th>
                        <th className="text-left font-medium text-foreground py-3 px-6">
                          Dark
                        </th>
                        <th className="text-left font-medium text-foreground py-3 px-6">
                          Light
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.tokens.map((row) => (
                        <tr
                          key={row.name}
                          className="border-b border-border last:border-b-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-6 font-medium text-card-foreground align-top">
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block h-4 w-4 rounded border border-border shrink-0"
                                style={{
                                  backgroundColor: row.dark.startsWith('#') && row.dark !== '#FFFFFF' ? row.dark : undefined,
                                  backgroundImage: row.dark === '#FFFFFF' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
                                  backgroundSize: '4px 4px',
                                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0',
                                }}
                              />
                              {row.name}
                              {row.note && (
                                <span className="text-muted-foreground font-normal text-xs">
                                  ({row.note})
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-6 align-top">
                            <ColorSwatch hex={row.dark} label="Dark" />
                          </td>
                          <td className="py-3 px-6 align-top">
                            <ColorSwatch hex={row.light} label="Light" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Spacing Tab */}
      {activeTab === 'spacing' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Spacing scale based on Tailwind CSS defaults. Use classes like <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">p-4</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">m-2</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">gap-6</code>, etc.
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spacing Scale</CardTitle>
              <CardDescription>
                Standard spacing values for padding, margin, gap, and sizing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {SPACING_SCALE.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <code className="w-12 text-sm font-mono text-muted-foreground">{item.name}</code>
                    <div 
                      className="bg-primary rounded-sm h-4" 
                      style={{ width: item.value === '0px' ? '2px' : item.value }}
                    />
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                    <span className="text-xs text-muted-foreground/60">({item.rem})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Usage</CardTitle>
              <CardDescription>Examples of spacing in practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3">Padding</p>
                <div className="flex flex-wrap gap-4">
                  {['p-2', 'p-4', 'p-6', 'px-4 py-2', 'pt-4 pb-2'].map((cls) => (
                    <div key={cls} className="text-center">
                      <div className={`bg-muted border border-dashed border-border rounded ${cls}`}>
                        <div className="bg-primary/20 rounded text-xs p-2">Content</div>
                      </div>
                      <code className="text-xs text-muted-foreground mt-1 block">{cls}</code>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-3">Gap (Flexbox/Grid)</p>
                <div className="space-y-3">
                  {[2, 4, 6].map((gap) => (
                    <div key={gap}>
                      <code className="text-xs text-muted-foreground mb-1 block">gap-{gap}</code>
                      <div className={`flex gap-${gap}`}>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-primary/20 rounded px-3 py-1 text-xs">Item {i}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shadows Tab */}
      {activeTab === 'shadows' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Shadow utilities for adding depth and elevation. Use classes like <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">shadow-md</code> or <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">shadow-lg</code>.
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shadow Scale</CardTitle>
              <CardDescription>
                Box shadows for different elevation levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {SHADOW_SCALE.map((shadow) => (
                  <div key={shadow.name} className="space-y-2">
                    <div 
                      className={`bg-card rounded-lg p-6 h-24 flex items-center justify-center ${shadow.name}`}
                    >
                      <span className="text-sm text-muted-foreground">Preview</span>
                    </div>
                    <div>
                      <code className="text-sm font-mono">{shadow.name}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{shadow.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shadow Usage Examples</CardTitle>
              <CardDescription>When to use different shadow levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cards & Containers</p>
                  <div className="bg-card rounded-lg p-4 shadow">
                    <p className="text-sm text-muted-foreground">Default shadow for cards</p>
                  </div>
                  <code className="text-xs text-muted-foreground">shadow</code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Dropdowns & Menus</p>
                  <div className="bg-card rounded-lg p-4 shadow-md border">
                    <p className="text-sm text-muted-foreground">Medium shadow for dropdowns</p>
                  </div>
                  <code className="text-xs text-muted-foreground">shadow-md</code>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Modals & Dialogs</p>
                  <div className="bg-card rounded-lg p-4 shadow-lg border">
                    <p className="text-sm text-muted-foreground">Large shadow for modals</p>
                  </div>
                  <code className="text-xs text-muted-foreground">shadow-lg</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Border Radius Tab */}
      {activeTab === 'radius' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Border radius utilities for rounding corners. Use classes like <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">rounded-md</code> or <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">rounded-lg</code>.
          </p>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Border Radius Scale</CardTitle>
              <CardDescription>
                Standard border radius values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {RADIUS_SCALE.map((radius) => (
                  <div key={radius.name} className="space-y-2 text-center">
                    <div 
                      className={`bg-primary/20 border-2 border-primary h-16 w-16 mx-auto ${radius.name}`}
                    />
                    <div>
                      <code className="text-sm font-mono">{radius.name}</code>
                      <p className="text-xs text-muted-foreground">{radius.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Common Patterns</CardTitle>
              <CardDescription>Recommended radius usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Buttons</p>
                  <div className="flex gap-2">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">rounded-md</button>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm">rounded-full</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Cards</p>
                  <div className="flex gap-2">
                    <div className="bg-muted p-4 rounded-lg text-sm">rounded-lg</div>
                    <div className="bg-muted p-4 rounded-xl text-sm">rounded-xl</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Inputs</p>
                  <input className="border rounded-md px-3 py-2 text-sm w-full" placeholder="rounded-md input" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Badges & Pills</p>
                  <div className="flex gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">rounded</span>
                    <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs">rounded-full</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ColorTokensPage;

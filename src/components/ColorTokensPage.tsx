import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';

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

function ColorTokensPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>vSNET Design System — Color Tokens</CardTitle>
          <CardDescription>
            Definitive color tokens for this project. Use these variables in CSS and components. Dark theme applies when <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.dark</code> is on the root.
          </CardDescription>
        </CardHeader>
      </Card>

      {COLOR_TOKEN_SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
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
  );
}

export default ColorTokensPage;

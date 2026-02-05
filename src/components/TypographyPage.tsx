import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Separator } from './ui/separator';
import TypographyDemo from './typography-demo';

// Type scale with Tailwind classes
const TYPE_SCALE = [
  { name: 'text-xs', size: '12px', lineHeight: '16px', example: 'Extra small text for captions' },
  { name: 'text-sm', size: '14px', lineHeight: '20px', example: 'Small text for secondary content' },
  { name: 'text-base', size: '16px', lineHeight: '24px', example: 'Base text for body content' },
  { name: 'text-lg', size: '18px', lineHeight: '28px', example: 'Large text for emphasis' },
  { name: 'text-xl', size: '20px', lineHeight: '28px', example: 'Extra large for subheadings' },
  { name: 'text-2xl', size: '24px', lineHeight: '32px', example: 'Section titles' },
  { name: 'text-3xl', size: '30px', lineHeight: '36px', example: 'Page titles' },
  { name: 'text-4xl', size: '36px', lineHeight: '40px', example: 'Hero headings' },
];

// Font weights
const FONT_WEIGHTS = [
  { name: 'font-normal', weight: '400', description: 'Body text, paragraphs' },
  { name: 'font-medium', weight: '500', description: 'Labels, emphasis' },
  { name: 'font-semibold', weight: '600', description: 'Headings, buttons' },
  { name: 'font-bold', weight: '700', description: 'Strong emphasis' },
  { name: 'font-extrabold', weight: '800', description: 'Hero text, large headings' },
];

/**
 * Official shadcn typography tokens (from CLI: npm run shadcn -- add typography-demo).
 */
const SHADCN_TYPOGRAPHY_TOKENS = [
  { token: 'h1', classes: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', weight: '800', lineHeight: '2.5rem' },
  { token: 'h2', classes: 'scroll-m-20 text-3xl font-semibold tracking-tight', weight: '600', lineHeight: '2.25rem' },
  { token: 'h3', classes: 'scroll-m-20 text-2xl font-semibold tracking-tight', weight: '600', lineHeight: '1.75rem' },
  { token: 'h4', classes: 'scroll-m-20 text-xl font-semibold tracking-tight', weight: '600', lineHeight: '1.75rem' },
  { token: 'p', classes: 'leading-7', weight: '400', lineHeight: '1.75rem' },
  { token: 'lead', classes: 'text-xl text-muted-foreground', weight: '400', lineHeight: '1.75rem' },
  { token: 'large', classes: 'text-lg font-semibold', weight: '600', lineHeight: '1.75rem' },
  { token: 'small', classes: 'text-sm leading-none font-medium', weight: '500', lineHeight: '1' },
  { token: 'muted', classes: 'text-sm text-muted-foreground', weight: '400', lineHeight: '1.5' },
  { token: 'code', classes: 'bg-muted rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', weight: '600', lineHeight: '1.5' },
] as const;

function TypographyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Type system using <strong>TheSans C4</strong> typeface with Tailwind CSS utilities.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Type Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Type Scale</CardTitle>
          <CardDescription>
            Font size classes from <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">text-xs</code> to <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">text-4xl</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TYPE_SCALE.map((item) => (
              <div key={item.name} className="flex items-baseline gap-4 py-2">
                <code className="w-24 text-xs font-mono text-muted-foreground shrink-0">{item.name}</code>
                <span className="w-16 text-xs text-muted-foreground shrink-0">{item.size}</span>
                <span className={`${item.name} flex-1`}>{item.example}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Weights</CardTitle>
          <CardDescription>
            Available font weights for TheSans C4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FONT_WEIGHTS.map((item) => (
              <div key={item.name} className="flex items-center gap-4 py-2">
                <code className="w-32 text-xs font-mono text-muted-foreground shrink-0">{item.name}</code>
                <span className="w-12 text-xs text-muted-foreground shrink-0">{item.weight}</span>
                <span className={`${item.name} text-lg flex-1`}>The quick brown fox jumps over the lazy dog</span>
                <span className="text-xs text-muted-foreground shrink-0">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Semantic Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semantic Typography Tokens</CardTitle>
          <CardDescription>
            Pre-defined typography patterns from shadcn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-foreground py-3 px-6 w-24">Token</th>
                  <th className="text-left font-medium text-foreground py-3 px-6">Classes</th>
                  <th className="text-left font-medium text-foreground py-3 px-6 w-20">Weight</th>
                  <th className="text-left font-medium text-foreground py-3 px-6 w-48">Preview</th>
                </tr>
              </thead>
              <tbody>
                {SHADCN_TYPOGRAPHY_TOKENS.map((row) => (
                  <tr key={row.token} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="py-3 px-6 font-medium text-card-foreground">
                      <code className="text-xs font-mono">{row.token}</code>
                    </td>
                    <td className="py-3 px-6">
                      <code className="text-xs text-muted-foreground font-mono">{row.classes}</code>
                    </td>
                    <td className="py-3 px-6 text-muted-foreground">{row.weight}</td>
                    <td className="py-3 px-6 text-card-foreground">
                      <span className={row.classes.replace(/mt-\d+|first:mt-0|scroll-m-\d+|border-b|pb-2/g, '').trim()}>
                        {row.token === 'code' ? <code className={row.classes}>code</code> : row.token}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common Patterns</CardTitle>
          <CardDescription>Examples of typography in context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Page Header */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Page Header</p>
            <div className="border rounded-lg p-6 bg-muted/20">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Section</p>
              <h1 className="text-3xl font-semibold tracking-tight">Page Title</h1>
              <p className="text-muted-foreground mt-2">A brief description of the page content and purpose.</p>
            </div>
          </div>

          <Separator />

          {/* Card Content */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Card Content</p>
            <div className="border rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-semibold">Card Title</h3>
              <p className="text-sm text-muted-foreground mt-1">Card description or subtitle text.</p>
              <p className="text-sm mt-4">
                Body content with <strong>bold</strong> and <em>italic</em> text. Links are styled with <a href="#" className="text-primary underline-offset-4 hover:underline">underline on hover</a>.
              </p>
            </div>
          </div>

          <Separator />

          {/* Form Labels */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Form Labels</p>
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="text-sm font-medium">Label</label>
                <p className="text-sm text-muted-foreground mt-1">Helper text below the input field.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Required field <span className="text-destructive">*</span></label>
                <p className="text-xs text-destructive mt-1">Error message styling</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Display */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Data Display</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium tabular-nums">Jan 27, 2025</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">$1,234.56</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Typography Demo</CardTitle>
          <CardDescription>
            Complete shadcn typography demo component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TypographyDemo />
        </CardContent>
      </Card>
    </div>
  );
}

export default TypographyPage;

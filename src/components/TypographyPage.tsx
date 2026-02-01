import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import TypographyDemo from './typography-demo';

/**
 * Official shadcn typography tokens (from CLI: npm run shadcn -- add typography-demo).
 * No Figma — built from the shadcn registry only.
 */
const SHADCN_TYPOGRAPHY_TOKENS = [
  { token: 'h1', classes: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', weight: '800 (extrabold)', lineHeight: '2.5rem' },
  { token: 'h2', classes: 'mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0', weight: '600 (semibold)', lineHeight: '2.25rem' },
  { token: 'h3', classes: 'mt-8 scroll-m-20 text-2xl font-semibold tracking-tight', weight: '600 (semibold)', lineHeight: '1.75rem' },
  { token: 'h4', classes: 'scroll-m-20 text-xl font-semibold tracking-tight', weight: '600 (semibold)', lineHeight: '1.75rem' },
  { token: 'p', classes: 'leading-7 [&:not(:first-child)]:mt-6', weight: '400 (normal)', lineHeight: '1.75rem (leading-7)' },
  { token: 'blockquote', classes: 'mt-6 border-l-2 pl-6 italic', weight: '400 (normal)', lineHeight: '1.5' },
  { token: 'table', classes: 'my-6 w-full overflow-y-auto', weight: '400 (normal)', lineHeight: '1.5' },
  { token: 'list', classes: 'my-6 ml-6 list-disc [&>li]:mt-2', weight: '400 (normal)', lineHeight: '1.5' },
  { token: 'code', classes: 'bg-muted rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', weight: '600 (semibold)', lineHeight: '1.5' },
  { token: 'lead', classes: 'text-xl text-muted-foreground', weight: '400 (normal)', lineHeight: '1.75rem' },
  { token: 'large', classes: 'text-lg font-semibold', weight: '600 (semibold)', lineHeight: '1.75rem' },
  { token: 'small', classes: 'text-sm leading-none font-medium', weight: '500 (medium)', lineHeight: '1 (none)' },
  { token: 'muted', classes: 'text-sm text-muted-foreground', weight: '400 (normal)', lineHeight: '1.5' },
] as const;

function TypographyPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>vSNET Design System — Typography</CardTitle>
          <CardDescription>
            Built from the official shadcn CLI only (no Figma). Typeface: <strong>TheSans C4</strong>. Add components with{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">npm run shadcn -- add typography-demo</code>.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Official CLI typography demo</CardTitle>
          <CardDescription>
            All style tokens from shadcn CLI (typography-demo). h1, h2, h3, h4, p, blockquote, list, table — TheSans C4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TypographyDemo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Official shadcn type tokens (CLI)</CardTitle>
          <CardDescription>
            Token reference from the shadcn registry. Classes, weight, and line height per token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-foreground py-3 px-6">Token</th>
                  <th className="text-left font-medium text-foreground py-3 px-6">Classes</th>
                  <th className="text-left font-medium text-foreground py-3 px-6">Weight</th>
                  <th className="text-left font-medium text-foreground py-3 px-6">Line height</th>
                  <th className="text-left font-medium text-foreground py-3 px-6">Preview</th>
                </tr>
              </thead>
              <tbody>
                {SHADCN_TYPOGRAPHY_TOKENS.map((row) => (
                  <tr key={row.token} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="py-3 px-6 font-medium text-card-foreground">{row.token}</td>
                    <td className="py-3 px-6 text-muted-foreground font-mono text-xs">{row.classes}</td>
                    <td className="py-3 px-6 text-muted-foreground">{row.weight}</td>
                    <td className="py-3 px-6 text-muted-foreground">{row.lineHeight}</td>
                    <td className="py-3 px-6 text-card-foreground">
                      <span className={row.classes}>{row.token}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TypographyPage;

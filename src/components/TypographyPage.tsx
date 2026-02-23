import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import TypographyDemo from './typography-demo';

// Font family info
const FONT_FAMILY = {
  name: 'Segoe UI',
  format: 'System font',
  weights: [
    { weight: 300, label: 'Light', tailwind: 'font-light' },
    { weight: 400, label: 'Regular', tailwind: 'font-normal' },
    { weight: 600, label: 'Semibold', tailwind: 'font-semibold' },
    { weight: 700, label: 'Bold', tailwind: 'font-bold' },
  ],
};

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

// Font weights – matching available WOFF2 files
const FONT_WEIGHTS = [
  { name: 'font-light', weight: 300, css: 'font-light', description: 'Subtle text, captions', tailwind: 'font-light' },
  { name: 'font-normal', weight: 400, css: 'font-normal', description: 'Body text, paragraphs', tailwind: 'font-normal' },
  { name: 'font-semibold', weight: 600, css: 'font-semibold', description: 'Headings, buttons', tailwind: 'font-semibold' },
  { name: 'font-bold', weight: 700, css: 'font-bold', description: 'Strong emphasis, titles', tailwind: 'font-bold' },
];

/**
 * Official shadcn typography tokens.
 */
const SHADCN_TYPOGRAPHY_TOKENS = [
  { token: 'h1', classes: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl', weight: '700', lineHeight: '2.5rem', preview: 'Heading one' },
  { token: 'h2', classes: 'scroll-m-20 text-3xl font-semibold tracking-tight', weight: '600', lineHeight: '2.25rem', preview: 'Heading two' },
  { token: 'h3', classes: 'scroll-m-20 text-2xl font-semibold tracking-tight', weight: '600', lineHeight: '1.75rem', preview: 'Heading three' },
  { token: 'h4', classes: 'scroll-m-20 text-xl font-semibold tracking-tight', weight: '600', lineHeight: '1.75rem', preview: 'Heading four' },
  { token: 'p', classes: 'leading-7', weight: '400', lineHeight: '1.75rem', preview: 'Body paragraph text' },
  { token: 'lead', classes: 'text-xl text-muted-foreground', weight: '400', lineHeight: '1.75rem', preview: 'Lead paragraph text' },
  { token: 'large', classes: 'text-lg font-semibold', weight: '600', lineHeight: '1.75rem', preview: 'Large emphasis text' },
  { token: 'small', classes: 'text-sm leading-none font-semibold', weight: '600', lineHeight: '1', preview: 'Small label text' },
  { token: 'muted', classes: 'text-sm text-muted-foreground', weight: '400', lineHeight: '1.5', preview: 'Muted helper text' },
  { token: 'code', classes: 'bg-muted rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', weight: '600', lineHeight: '1.5', preview: 'code' },
] as const;

function TypographyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Type system using <strong>{FONT_FAMILY.name}</strong> system font with Tailwind CSS utilities. <Badge variant="outline" className="ml-1 text-xs font-mono">System font</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Font Family */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Family</CardTitle>
          <CardDescription>
            System font with available weight mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-medium py-2.5 px-4 w-24">Weight</th>
                  <th className="text-left font-medium py-2.5 px-4 w-28">Label</th>
                  <th className="text-left font-medium py-2.5 px-4 w-32">Tailwind</th>
                  <th className="text-left font-medium py-2.5 px-4">Preview</th>
                </tr>
              </thead>
              <tbody>
                {FONT_FAMILY.weights.map((w) => (
                  <tr key={w.weight} className="border-b last:border-b-0">
                    <td className="py-2.5 px-4 tabular-nums">{w.weight}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{w.label}</td>
                    <td className="py-2.5 px-4">
                      <code className="text-xs font-mono text-muted-foreground">{w.tailwind}</code>
                    </td>
                    <td className="py-2.5 px-4">
                      <span style={{ fontWeight: w.weight }} className="text-base">
                        Segoe UI {w.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Font stack: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">"Segoe UI", ui-sans-serif, system-ui, Roboto, "Helvetica Neue", Arial, sans-serif</code>
          </p>
        </CardContent>
      </Card>

      {/* Font Weights – visual comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Font Weights</CardTitle>
          <CardDescription>
            Side-by-side weight comparison at multiple sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Large preview */}
          <div className="space-y-3">
            {FONT_WEIGHTS.map((item) => (
              <div key={item.name} className="flex items-baseline gap-4 py-2 border-b last:border-b-0">
                <div className="w-36 shrink-0">
                  <code className="text-xs font-mono text-muted-foreground">{item.tailwind}</code>
                  <span className="text-xs text-muted-foreground ml-2">({item.weight})</span>
                </div>
                <span style={{ fontWeight: item.weight }} className="text-2xl flex-1 leading-tight">
                  The quick brown fox jumps over the lazy dog
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Small preview grid */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">At body size (14px)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {FONT_WEIGHTS.map((item) => (
                <div key={`sm-${item.name}`} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-mono">{item.weight}</Badge>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                  <p style={{ fontWeight: item.weight }} className="text-sm">
                    AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz
                  </p>
                  <p style={{ fontWeight: item.weight }} className="text-sm tabular-nums text-muted-foreground mt-1">
                    0123456789 · $1,234.56
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
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
          <div className="space-y-1">
            {TYPE_SCALE.map((item) => (
              <div key={item.name} className="flex items-baseline gap-4 py-3 border-b last:border-b-0">
                <code className="w-20 text-xs font-mono text-muted-foreground shrink-0">{item.name}</code>
                <span className="w-14 text-xs text-muted-foreground shrink-0 tabular-nums">{item.size}</span>
                <span className="w-14 text-xs text-muted-foreground shrink-0 tabular-nums">{item.lineHeight}</span>
                <span className={`${item.name} flex-1`}>{item.example}</span>
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
                      <span className={row.classes.replace(/mt-\d+|first:mt-0|scroll-m-\d+|border-b|pb-2|lg:text-5xl/g, '').trim()}>
                        {row.token === 'code' ? <code className={row.classes}>{row.preview}</code> : row.preview}
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

          {/* Metric / KPI */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Metric / KPI</p>
            <div className="border rounded-lg p-6 max-w-xs">
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-3xl font-bold tabular-nums mt-1">2,350</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-600 dark:text-emerald-500 font-medium">↑ 12%</span> from last month
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

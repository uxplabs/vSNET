# Form Field Width Rules

Apply these rules to all text-like form controls (text inputs, number inputs, selects, and textareas).

## Core principle

Size fields by expected content length, not by container width.

- A 3-digit field should not look like a 900px prose field.
- Full-width controls should be explicit (`controlSize="full"`), not default behavior.

## Size scale

Use only this fixed scale:

- `xs` = 80px (small numbers, ports, short counts)
- `sm` = 160px (short enums/codes/versions)
- `md` = 320px (names, usernames, short labels)
- `lg` = 480px (emails, URLs, engine IDs, community strings)
- `full` = 100% width, capped at 720px (messages/prose/search/long text)

Global cap: no single field exceeds 720px.

## Layout rules

- Prefer 2-column form grids for `md`/`lg` fields.
- Pack multiple `xs`/`sm` fields per row when practical.
- `full` fields span available width but still cap at 720px.
- Keep fields left-aligned in each lane.
- On mobile (`<640px`), fields are full width of their parent lane.

## Implementation in this repo

- `Field` accepts `controlSize?: FieldControlSize`.
- Allowed sizes are exported from `src/lib/field-control-size.ts`.
- Width behavior is implemented in `src/index.css` via:
  - `[data-slot="field"][data-field-size="..."]`
  - applies to direct text-like controls, `textarea`, and `SelectTrigger`.
- Search fields use `SearchInput` (`src/components/ui/search-input.tsx`) with DS size variants:
  - `size="sm"` (sidebar/filter compact search, `h-8`)
  - `size="md"` (standard toolbar search, `h-9`)

Example:

```tsx
<Field controlSize="xs">
  <FieldLabel htmlFor="smtp-port">Port</FieldLabel>
  <Input id="smtp-port" type="number" />
</Field>

<Field controlSize="sm">
  <FieldLabel htmlFor="algo">Algorithm</FieldLabel>
  <Select>
    <SelectTrigger id="algo">
      <SelectValue placeholder="Select" />
    </SelectTrigger>
    <SelectContent>{/* options */}</SelectContent>
  </Select>
</Field>

<Field controlSize="md">
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <Input id="username" />
</Field>

<Field controlSize="lg">
  <FieldLabel htmlFor="engine-id">Engine ID</FieldLabel>
  <Input id="engine-id" />
</Field>

<Field controlSize="full">
  <FieldLabel htmlFor="description">Description</FieldLabel>
  <Textarea id="description" />
</Field>
```

## Exceptions

`full` is typically correct for:

- Multi-line prose textareas
- Search inputs
- File paths, long URLs, long tokens/certificate-like content
- Mobile layouts

## Anti-patterns to reject

- Input/select/textarea in a form without explicit `controlSize`
- Defaulting control width from container (`flex: 1`, arbitrary `w-full` on wide forms)
- Sizing by card width instead of expected content
- Arbitrary non-scale widths when a size token fits

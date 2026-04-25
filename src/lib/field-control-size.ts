/**
 * Form control width scale for `Field` (`controlSize` prop).
 * See `index.css` — `[data-slot="field"][data-field-size="…"]` rules.
 *
 * - Mobile (<640px): controls stay full width of the parent.
 * - sm and up: max-width matches the token (global cap 720px for `full`).
 */
export type FieldControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'full';

export const FIELD_CONTROL_SIZES: readonly FieldControlSize[] = ['xs', 'sm', 'md', 'lg', 'full'] as const;

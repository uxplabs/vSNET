'use client';

import * as React from 'react';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface EditableValueProps {
  /** Current value */
  value: string;
  /** Called when user saves (blur or Enter) */
  onSave: (value: string) => void;
  /** Optional placeholder when empty */
  placeholder?: string;
  /** Whether the field is editable */
  editable?: boolean;
  /** Custom class for the value/input container */
  className?: string;
  /** Custom class for the value display */
  valueClassName?: string;
  /** Multiline input */
  multiline?: boolean;
  /** Custom render for display mode (e.g. with icons). Receives value, returns ReactNode */
  renderValue?: (value: string) => React.ReactNode;
}

/**
 * Name/value pair value with inline edit mode.
 * - Click to edit, blur or Enter to save, Escape to cancel
 * - Optional edit icon button to trigger edit mode
 */
export function EditableValue({
  value,
  onSave,
  placeholder = '—',
  editable = true,
  className,
  valueClassName,
  multiline = false,
  renderValue,
}: EditableValueProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditValue(value);
      inputRef.current?.focus();
      if (inputRef.current && 'select' in inputRef.current) {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing, value]);

  const handleSave = React.useCallback(() => {
    if (!isEditing) return;
    const trimmed = editValue.trim();
    if (trimmed !== value) {
      onSave(trimmed || '');
    }
    setIsEditing(false);
  }, [isEditing, editValue, value, onSave]);

  const handleCancel = React.useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value?.trim();

  if (!editable) {
    return (
      <span className={cn('font-medium', valueClassName)}>
        {renderValue ? renderValue(value) : displayValue}
      </span>
    );
  }

  if (isEditing) {
    return multiline ? (
      <Textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className={cn('font-medium', className)}
      />
    ) : (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('h-8 font-medium', className)}
      />
    );
  }

  return (
    <div className="group/value flex items-center gap-1.5 min-w-0">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={cn(
          'flex-1 text-left font-medium rounded px-1.5 -mx-1.5 py-0.5 -my-0.5 min-w-0 transition-colors',
          isEmpty && 'text-muted-foreground',
          'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:rounded',
          valueClassName
        )}
      >
        {renderValue ? renderValue(value) : displayValue}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover/value:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
        aria-label="Edit"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        <Icon name="edit" size={14} />
      </Button>
    </div>
  );
}

export interface NameValueFieldProps extends EditableValueProps {
  /** Label shown above the value */
  label: string;
}

/**
 * Name/value pair row with editable value.
 * Use for form-like fields where the label is above the value.
 */
export function NameValueField({ label, ...editableProps }: NameValueFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <EditableValue {...editableProps} />
    </div>
  );
}

export interface EditableLabelsFieldProps {
  label: string;
  value: string[];
  onSave: (value: string[]) => void;
  placeholder?: string;
  /** Max labels to show before "x more". Omit to show all. */
  visibleCount?: number;
  editable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Name/value pair for labels (array of strings) with inline edit.
 * Display: badges, optionally truncated with "x more" / "Show less". Edit: comma-separated input.
 */
export function EditableLabelsField({
  label,
  value,
  onSave,
  placeholder = '—',
  visibleCount,
  editable = true,
  className,
  style,
}: EditableLabelsFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value.join(', '));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditValue(value.join(', '));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, value]);

  const handleSave = React.useCallback(() => {
    if (!isEditing) return;
    const parsed = editValue
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (JSON.stringify(parsed) !== JSON.stringify(value)) {
      onSave(parsed);
    }
    setIsEditing(false);
  }, [isEditing, editValue, value, onSave]);

  const handleCancel = React.useCallback(() => {
    setEditValue(value.join(', '));
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const [labelsExpanded, setLabelsExpanded] = React.useState(false);
  const hasLabels = value?.length > 0;
  const shouldTruncate = visibleCount != null && value.length > visibleCount;
  const labelsToShow = hasLabels
    ? labelsExpanded || !shouldTruncate
      ? value
      : value.slice(0, visibleCount)
    : [];
  const remainingCount = hasLabels && shouldTruncate && !labelsExpanded ? value.length - visibleCount : 0;

  if (!editable) {
    return (
      <div className={cn('flex flex-col gap-1', className)} style={style}>
        <span className="text-muted-foreground text-sm">{label}</span>
        {hasLabels ? (
          <div className={`flex gap-1.5 ${shouldTruncate && !labelsExpanded ? 'flex-nowrap' : 'flex-wrap'}`}>
            {(shouldTruncate && !labelsExpanded ? value.slice(0, visibleCount) : value).map((l) => (
              <span key={l} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-normal">
                {l}
              </span>
            ))}
            {shouldTruncate && !labelsExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={() => setLabelsExpanded(true)}
              >
                {value.length - visibleCount!} more
                <Icon name="keyboard_arrow_down" size={14} className="ml-0.5" />
              </Button>
            )}
            {shouldTruncate && labelsExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={() => setLabelsExpanded(false)}
              >
                Show less
                <Icon name="keyboard_arrow_up" size={14} className="ml-0.5" />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={cn('flex flex-col gap-1', className)} style={style}>
        <span className="text-muted-foreground text-sm">{label}</span>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Comma-separated labels"
          className="h-8 font-medium"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1', className)} style={style}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="group/labels min-w-0">
        {hasLabels ? (
          <div className={`flex gap-1.5 items-center min-w-0 ${shouldTruncate && !labelsExpanded ? 'flex-nowrap' : 'flex-wrap'}`}>
            {labelsToShow.map((l) => (
              <span key={l} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-normal shrink-0">
                {l}
              </span>
            ))}
            {remainingCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={() => setLabelsExpanded(true)}
              >
                {remainingCount} more
                <Icon name="keyboard_arrow_down" size={14} className="ml-0.5" />
              </Button>
            )}
            {shouldTruncate && labelsExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs shrink-0"
                onClick={() => setLabelsExpanded(false)}
              >
                Show less
                <Icon name="keyboard_arrow_up" size={14} className="ml-0.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover/labels:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
              aria-label="Edit labels"
              onClick={() => setIsEditing(true)}
            >
              <Icon name="edit" size={14} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{placeholder}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover/labels:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
              aria-label="Edit labels"
              onClick={() => setIsEditing(true)}
            >
              <Icon name="edit" size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

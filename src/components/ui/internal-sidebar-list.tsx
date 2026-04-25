'use client';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';
import { SearchInput } from '@/components/ui/search-input';

export interface InternalSidebarListItem {
  id: string;
  label: string;
  count?: number;
}

interface InternalSidebarListProps {
  title: string;
  items: InternalSidebarListItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  showAddAction?: boolean;
  onAddAction?: () => void;
  addAriaLabel?: string;
  /** Visible label on the add button (e.g. "Add profile"). Defaults to "Add". */
  addButtonLabel?: string;
  /** Where to place add action: full-row button or icon in title bar. */
  addActionPlacement?: 'row' | 'title-icon';
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function InternalSidebarList({
  title,
  items,
  selectedId,
  onSelect,
  showAddAction = false,
  onAddAction,
  addAriaLabel = 'Add item',
  addButtonLabel = 'Add',
  addActionPlacement = 'row',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items',
  className,
}: InternalSidebarListProps) {
  return (
    <aside className={`w-full lg:w-52 shrink-0 rounded-lg border bg-muted/30 border-border/80 overflow-hidden flex flex-col max-h-[calc(100vh-12rem)] self-start ${className ?? ''}`}>
      <div className="p-3 border-b border-border/80 bg-muted/20">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
          {showAddAction && onAddAction && addActionPlacement === 'title-icon' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={addAriaLabel}
              onClick={onAddAction}
              className="h-8 w-8 shrink-0"
            >
              <Icon name="add" size={16} />
            </Button>
          )}
        </div>
        {showAddAction && onAddAction && addActionPlacement === 'row' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={addAriaLabel}
            onClick={onAddAction}
            className="mt-2 h-auto min-h-8 w-full border-dashed border-border/80 bg-background/40 py-2 font-normal text-muted-foreground shadow-none hover:border-border hover:bg-background hover:text-foreground"
          >
            <Icon name="add" size={18} className="shrink-0 opacity-80" />
            <span className="truncate">{addButtonLabel}</span>
          </Button>
        )}
        {showSearch && (
          <SearchInput
            wrapperClassName="mt-3"
            size="sm"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        )}
      </div>
      <nav className="p-2 flex-1 min-h-0 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">{emptyMessage}</p>
        ) : (
          items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-left text-sm transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-muted/60 text-foreground'
                }`}
              >
                <span className="truncate min-w-0">{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className={`tabular-nums shrink-0 text-xs px-1.5 py-0.5 rounded ${isSelected ? 'bg-accent-foreground/10 text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </nav>
    </aside>
  );
}


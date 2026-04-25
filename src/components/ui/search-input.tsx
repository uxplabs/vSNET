'use client';

import * as React from 'react';
import { Icon } from '@/components/Icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  wrapperClassName?: string;
  size?: 'sm' | 'md';
}

const SEARCH_INPUT_SIZE_STYLES: Record<NonNullable<SearchInputProps['size']>, { input: string; icon: number }> = {
  sm: { input: 'h-8 py-0 pl-8 pr-2 text-sm leading-8', icon: 16 },
  md: { input: 'h-9 py-0 pl-9 pr-3 text-sm leading-9', icon: 18 },
};

export function SearchInput({ className, wrapperClassName, size = 'md', ...props }: SearchInputProps) {
  const styles = SEARCH_INPUT_SIZE_STYLES[size];
  return (
    <div className={cn('relative', wrapperClassName)}>
      <Icon
        name="search"
        size={styles.icon}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input className={cn('w-full rounded-md border-border/80 bg-background', styles.input, className)} {...props} />
    </div>
  );
}

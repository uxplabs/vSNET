'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';

interface SortableHeaderProps {
  column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void };
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader({ column, children, className }: SortableHeaderProps) {
  const isSorted = column.getIsSorted();
  const sortIcon = isSorted === 'asc' ? 'arrow_upward' : isSorted === 'desc' ? 'arrow_downward' : 'swap_vert';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`group -ml-3 h-8 ${className ?? ''}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <Icon
        name={sortIcon}
        size={16}
        className={`ml-2 transition-opacity ${isSorted ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}
      />
    </Button>
  );
}

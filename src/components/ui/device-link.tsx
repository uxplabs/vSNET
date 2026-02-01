'use client';

import * as React from 'react';
import { Icon } from '@/components/Icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DeviceLinkProps {
  value: string;
  maxLength?: number;
  className?: string;
  onClick?: () => void;
}

export function DeviceLink({ value, maxLength, className = '', onClick }: DeviceLinkProps) {
  const display = maxLength && value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  const link = (
    <a
      href="#"
      className={`group inline-flex items-center gap-2 min-w-0 text-link hover:underline ${className}`}
      onClick={handleClick}
    >
      <span
        className="font-medium truncate"
        style={maxLength ? { maxWidth: `${maxLength}ch` } : undefined}
      >
        {display}
      </span>
      <Icon
        name="open_in_new"
        size={16}
        className="shrink-0 opacity-0 group-hover:opacity-70 transition-opacity text-muted-foreground"
        aria-hidden
      />
    </a>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent>{value}</TooltipContent>
    </Tooltip>
  );
}

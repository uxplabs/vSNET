'use client';

import * as React from 'react';
import { Icon } from '@/components/Icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Context for opening the device sheet from any DeviceLink
const DeviceLinkContext = React.createContext<((deviceName: string) => void) | null>(null);

export function DeviceLinkProvider({
  onDeviceClick,
  children,
}: {
  onDeviceClick: (deviceName: string) => void;
  children: React.ReactNode;
}) {
  return (
    <DeviceLinkContext.Provider value={onDeviceClick}>
      {children}
    </DeviceLinkContext.Provider>
  );
}

interface DeviceLinkProps {
  value: string;
  maxLength?: number;
  className?: string;
  onClick?: () => void;
}

export function DeviceLink({ value, maxLength, className = '', onClick }: DeviceLinkProps) {
  const contextOnClick = React.useContext(DeviceLinkContext);
  const display = maxLength && value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (contextOnClick) {
      contextOnClick(value);
    }
  };

  const link = (
    <a
      href="#"
      className={`group/devlink inline-flex items-center gap-1 min-w-0 text-link no-underline ${className}`}
      onClick={handleClick}
    >
      <span
        className="font-medium truncate group-hover/devlink:underline"
        style={maxLength ? { maxWidth: `${maxLength}ch` } : undefined}
      >
        {display}
      </span>
      <Icon
        name="open_in_new"
        size={14}
        className="shrink-0 w-3.5 opacity-0 group-hover/devlink:opacity-70 transition-opacity text-muted-foreground"
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

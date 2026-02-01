import React from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Material Icons name (e.g. "menu", "wifi", "notifications") */
  name: string;
  /** Size in CSS (e.g. "1rem", "24px"). Defaults to "1em" so it inherits from text. */
  size?: string | number;
}

/**
 * Renders a Material Icon by name. Requires the Material Icons font to be loaded
 * (e.g. via index.html: fonts.googleapis.com/icon?family=Material+Icons).
 */
function Icon({ name, size = '1em', className, style, ...rest }: IconProps) {
  return (
    <span
      className={cn('material-icons select-none', className)}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, ...style }}
      aria-hidden
      {...rest}
    >
      {name}
    </span>
  );
}

export { Icon };

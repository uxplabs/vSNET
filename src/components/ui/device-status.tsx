import { Icon } from '@/components/Icon';

export interface DeviceStatusProps {
  status: string;
  className?: string;
  iconSize?: number;
  /** Use on dark backgrounds (e.g. gray-900 header) */
  variant?: 'default' | 'dark';
}

/**
 * Renders device status with the standard icon (link for Connected, link_off for others).
 */
export function DeviceStatus({ status, className, iconSize = 16, variant = 'default' }: DeviceStatusProps) {
  const isConnected = status === 'Connected';
  const iconClass = variant === 'dark'
    ? isConnected ? 'text-gray-400 shrink-0' : 'text-red-400 shrink-0'
    : isConnected ? 'text-muted-foreground shrink-0' : 'text-destructive shrink-0';
  const textClass = variant === 'dark' ? 'text-gray-300' : '';
  return (
    <span className={`inline-flex items-center gap-2 min-w-0 ${textClass} ${className ?? ''}`}>
      <Icon name={isConnected ? 'link' : 'link_off'} size={iconSize} className={iconClass} />
      <span className="truncate">{status}</span>
    </span>
  );
}

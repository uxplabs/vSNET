import { Badge } from '@/components/ui/badge';

interface NodeTypeBadgeProps {
  type: string;
  className?: string;
}

/**
 * Consistent badge for displaying device/node type labels
 * across all tables and detail views.
 */
function NodeTypeBadge({ type, className }: NodeTypeBadgeProps) {
  return (
    <Badge variant="secondary" className={className}>
      {type}
    </Badge>
  );
}

export { NodeTypeBadge };

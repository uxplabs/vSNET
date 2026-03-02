import * as React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './button';
import { Badge } from './badge';

interface OverflowFilterItem {
  key: string;
  width: number;
  content: React.ReactNode;
}

interface OverflowFilterBarProps {
  items: OverflowFilterItem[];
  className?: string;
  menuLabel?: string;
}

const FILTER_GAP_PX = 8;
const MORE_TRIGGER_WIDTH = 92;

export function OverflowFilterBar({ items, className, menuLabel = 'More' }: OverflowFilterBarProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(items.length);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const widthFor = (count: number) => {
      const visible = items.slice(0, count);
      return visible.reduce((sum, item) => sum + item.width, 0) + Math.max(0, visible.length - 1) * FILTER_GAP_PX;
    };

    const computeVisible = () => {
      const available = el.clientWidth;
      if (available <= 0) {
        setVisibleCount(items.length);
        return;
      }
      if (widthFor(items.length) <= available) {
        setVisibleCount(items.length);
        return;
      }

      let nextCount = items.length;
      while (nextCount > 0) {
        const hiddenCount = items.length - nextCount;
        const moreWidth = hiddenCount > 0 ? MORE_TRIGGER_WIDTH + FILTER_GAP_PX : 0;
        if (widthFor(nextCount) + moreWidth <= available) break;
        nextCount -= 1;
      }
      setVisibleCount(nextCount);
    };

    computeVisible();
    const observer = new ResizeObserver(computeVisible);
    observer.observe(el);
    window.addEventListener('resize', computeVisible);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeVisible);
    };
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  return (
    <div ref={containerRef} className={`flex flex-1 min-w-0 items-center gap-2 overflow-hidden ${className ?? ''}`}>
      {visibleItems.map((item) => (
        <div key={item.key} className="shrink-0" style={{ width: item.width }}>
          <div className="w-full">{item.content}</div>
        </div>
      ))}
      {hiddenItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 shrink-0 gap-1.5">
              {menuLabel}
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 justify-center text-xs tabular-nums">
                {hiddenItems.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px] p-3">
            <div className="space-y-3">
              {hiddenItems.map((item) => (
                <div key={`hidden-${item.key}`} className="w-full">
                  {item.content}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

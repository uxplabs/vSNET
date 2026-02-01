'use client';

import { useEffect, useState } from 'react';

const DEFAULT_ROW_HEIGHT = 52;
const MIN_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 50;

/** Estimated space used by navbar, tabs, filters, table header, pagination, padding (px) */
const PAGE_OVERHEAD = 360;

/** Extra rows to subtract so the last row is never partially visible */
const ROW_BUFFER = 1;

/**
 * Returns a page size that fits the viewport height.
 * Responsive to window resize.
 */
export function useResponsivePageSize() {
  const [pageSize, setPageSize] = useState(MIN_PAGE_SIZE);

  useEffect(() => {
    const measure = () => {
      const bufferHeight = ROW_BUFFER * DEFAULT_ROW_HEIGHT;
      const availableHeight = Math.max(0, window.innerHeight - PAGE_OVERHEAD - bufferHeight);
      const rows = Math.floor(availableHeight / DEFAULT_ROW_HEIGHT);
      const next = Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, rows));
      setPageSize((prev) => (prev !== next ? next : prev));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return pageSize;
}

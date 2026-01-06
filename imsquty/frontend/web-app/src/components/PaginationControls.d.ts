import React from 'react';
/**
 * Pagination controls component for list pages
 * Features: page navigation + page size selector
 * Material-UI Pagination with custom page size dropdown
 */
export interface PaginationControlsProps {
    /** Current page number (1-based) */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total number of items */
    total: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Callback when page size changes */
    onPageSizeChange: (size: number) => void;
    /** Available page sizes */
    pageSizes?: number[];
    /** Optional label for page size selector */
    label?: string;
    /** Optional className for root container */
    className?: string;
}
/**
 * PaginationControls
 * Displays pagination navigation and page size selector
 *
 * @example
 * ```tsx
 * <PaginationControls
 *   page={page}
 *   pageSize={pageSize}
 *   total={total}
 *   onPageChange={(p) => setPage(p)}
 *   onPageSizeChange={(s) => setPageSize(s)}
 * />
 * ```
 */
export declare const PaginationControls: React.ForwardRefExoticComponent<PaginationControlsProps & React.RefAttributes<HTMLDivElement>>;

import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, FormControl, MenuItem, Pagination, Select, Stack, Typography, } from '@mui/material';
import React from 'react';
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
export const PaginationControls = React.forwardRef(({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizes = [5, 10, 25, 50], label = 'Items per page:', className, }, ref) => {
    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize) || 1;
    // Calculate displayed items range
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);
    return (_jsxs(Box, { ref: ref, className: className, sx: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 2,
            px: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
        }, children: [_jsxs(Typography, { variant: "body2", color: "textSecondary", sx: { minWidth: 150 }, children: ["Showing ", startItem, " to ", endItem, " of ", total, " items"] }), _jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { variant: "body2", sx: { whiteSpace: 'nowrap' }, children: label }), _jsx(FormControl, { size: "small", sx: { minWidth: 80 }, children: _jsx(Select, { value: pageSize, onChange: (e) => {
                                onPageSizeChange(e.target.value);
                                // Reset to page 1 when page size changes
                                onPageChange(1);
                            }, "data-testid": "page-size-select", children: pageSizes.map((size) => (_jsx(MenuItem, { value: size, children: size }, size))) }) })] }), _jsx(Pagination, { count: totalPages, page: page, onChange: (_, newPage) => onPageChange(newPage), color: "primary", showFirstButton: true, showLastButton: true, "data-testid": "pagination-component" })] }));
});
PaginationControls.displayName = 'PaginationControls';

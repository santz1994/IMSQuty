import {
    Box,
    FormControl,
    MenuItem,
    Pagination,
    Select,
    Stack,
    Typography,
} from '@mui/material'
import React from 'react'

/**
 * Pagination controls component for list pages
 * Features: page navigation + page size selector
 * Material-UI Pagination with custom page size dropdown
 */
export interface PaginationControlsProps {
  /** Current page number (1-based) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  total: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void
  /** Available page sizes */
  pageSizes?: number[]
  /** Optional label for page size selector */
  label?: string
  /** Optional className for root container */
  className?: string
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
export const PaginationControls = React.forwardRef<
  HTMLDivElement,
  PaginationControlsProps
>(
  (
    {
      page,
      pageSize,
      total,
      onPageChange,
      onPageSizeChange,
      pageSizes = [5, 10, 25, 50],
      label = 'Items per page:',
      className,
    },
    ref
  ) => {
    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize) || 1

    // Calculate displayed items range
    const startItem = (page - 1) * pageSize + 1
    const endItem = Math.min(page * pageSize, total)

    return (
      <Box
        ref={ref}
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          py: 2,
          px: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        {/* Items count display */}
        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 150 }}>
          Showing {startItem} to {endItem} of {total} items
        </Typography>

        {/* Page size selector */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            {label}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(e.target.value as number)
                // Reset to page 1 when page size changes
                onPageChange(1)
              }}
              data-testid="page-size-select"
            >
              {pageSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Pagination navigation */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          color="primary"
          showFirstButton
          showLastButton
          data-testid="pagination-component"
        />
      </Box>
    )
  }
)

PaginationControls.displayName = 'PaginationControls'

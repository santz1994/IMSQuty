import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, CardContent, CardHeader, Skeleton, Stack } from '@mui/material';
/**
 * SkeletonLoader Components
 * Displays placeholder loading state for better perceived performance
 *
 * Usage:
 *   <AssetListSkeleton count={10} />
 *   <TableSkeleton rows={5} columns={6} />
 *   <FormSkeleton fields={4} />
 */
export const AssetListSkeleton = ({ count = 6 }) => (_jsx(Stack, { spacing: 2, children: Array.from({ length: count }).map((_, i) => (_jsx(Card, { children: _jsxs(Box, { sx: { display: 'flex', gap: 2, p: 2 }, children: [_jsx(Skeleton, { variant: "circular", width: 60, height: 60 }), _jsxs(Stack, { sx: { flex: 1 }, spacing: 1, children: [_jsx(Skeleton, { variant: "text", width: "70%", height: 24 }), _jsx(Skeleton, { variant: "text", width: "50%", height: 20 }), _jsx(Skeleton, { variant: "text", width: "40%", height: 16 })] })] }) }, i))) }));
export const FormSkeleton = ({ fields = 4 }) => (_jsxs(Stack, { spacing: 2, children: [Array.from({ length: fields }).map((_, i) => (_jsx(Skeleton, { variant: "rectangular", height: 56, sx: { borderRadius: 1 } }, i))), _jsx(Skeleton, { variant: "rectangular", height: 44, width: 120, sx: { borderRadius: 1 } })] }));
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (_jsx(Box, { sx: { width: '100%', overflow: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { children: Array.from({ length: columns }).map((_, i) => (_jsx("th", { style: { padding: '16px', borderBottom: '1px solid #e0e0e0' }, children: _jsx(Skeleton, { width: "80%", height: 20 }) }, i))) }) }), _jsx("tbody", { children: Array.from({ length: rows }).map((_, rowIdx) => (_jsx("tr", { children: Array.from({ length: columns }).map((_, colIdx) => (_jsx("td", { style: { padding: '16px', borderBottom: '1px solid #f0f0f0' }, children: _jsx(Skeleton, { width: "85%", height: 20 }) }, `${rowIdx}-${colIdx}`))) }, rowIdx))) })] }) }));
export const CardSkeleton = ({ count = 3 }) => (_jsx(Box, { sx: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }, children: Array.from({ length: count }).map((_, i) => (_jsxs(Card, { sx: { height: '100%' }, children: [_jsx(CardHeader, { avatar: _jsx(Skeleton, { variant: "circular", width: 40, height: 40 }), title: _jsx(Skeleton, { width: "60%" }), subheader: _jsx(Skeleton, { width: "40%" }) }), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsx(Skeleton, { width: "100%" }), _jsx(Skeleton, { width: "100%" }), _jsx(Skeleton, { width: "80%" })] }) })] }, i))) }));
export const ListSkeleton = ({ items = 8 }) => (_jsx(Stack, { spacing: 1, children: Array.from({ length: items }).map((_, i) => (_jsxs(Box, { sx: { p: 2, display: 'flex', gap: 2, bgcolor: '#fafafa', borderRadius: 1 }, children: [_jsx(Skeleton, { variant: "rectangular", width: 20, height: 20 }), _jsxs(Stack, { sx: { flex: 1 }, spacing: 0.5, children: [_jsx(Skeleton, { variant: "text", width: "100%", height: 18 }), _jsx(Skeleton, { variant: "text", width: "60%", height: 14 })] }), _jsx(Skeleton, { variant: "text", width: 80, height: 18 })] }, i))) }));
export default {
    AssetListSkeleton,
    FormSkeleton,
    TableSkeleton,
    CardSkeleton,
    ListSkeleton
};

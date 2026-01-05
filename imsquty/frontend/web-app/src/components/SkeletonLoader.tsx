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

export const AssetListSkeleton = ({ count = 6 }) => (
    <Stack spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
            <Card key={i}>
                <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                    <Skeleton variant="circular" width={60} height={60} />
                    <Stack sx={{ flex: 1 }} spacing={1}>
                        <Skeleton variant="text" width="70%" height={24} />
                        <Skeleton variant="text" width="50%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                    </Stack>
                </Box>
            </Card>
        ))}
    </Stack>
);

export const FormSkeleton = ({ fields = 4 }) => (
    <Stack spacing={2}>
        {Array.from({ length: fields }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        ))}
        <Skeleton variant="rectangular" height={44} width={120} sx={{ borderRadius: 1 }} />
    </Stack>
);

export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i} style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
                            <Skeleton width="80%" height={20} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <td
                                key={`${rowIdx}-${colIdx}`}
                                style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
                            >
                                <Skeleton width="85%" height={20} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </Box>
);

export const CardSkeleton = ({ count = 3 }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
            <Card key={i} sx={{ height: '100%' }}>
                <CardHeader
                    avatar={<Skeleton variant="circular" width={40} height={40} />}
                    title={<Skeleton width="60%" />}
                    subheader={<Skeleton width="40%" />}
                />
                <CardContent>
                    <Stack spacing={1}>
                        <Skeleton width="100%" />
                        <Skeleton width="100%" />
                        <Skeleton width="80%" />
                    </Stack>
                </CardContent>
            </Card>
        ))}
    </Box>
);

export const ListSkeleton = ({ items = 8 }) => (
    <Stack spacing={1}>
        {Array.from({ length: items }).map((_, i) => (
            <Box key={i} sx={{ p: 2, display: 'flex', gap: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                <Skeleton variant="rectangular" width={20} height={20} />
                <Stack sx={{ flex: 1 }} spacing={0.5}>
                    <Skeleton variant="text" width="100%" height={18} />
                    <Skeleton variant="text" width="60%" height={14} />
                </Stack>
                <Skeleton variant="text" width={80} height={18} />
            </Box>
        ))}
    </Stack>
);

export default {
    AssetListSkeleton,
    FormSkeleton,
    TableSkeleton,
    CardSkeleton,
    ListSkeleton
};

/**
 * SkeletonLoader Components
 * Displays placeholder loading state for better perceived performance
 *
 * Usage:
 *   <AssetListSkeleton count={10} />
 *   <TableSkeleton rows={5} columns={6} />
 *   <FormSkeleton fields={4} />
 */
export declare const AssetListSkeleton: ({ count }: {
    count?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const FormSkeleton: ({ fields }: {
    fields?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const TableSkeleton: ({ rows, columns }: {
    rows?: number | undefined;
    columns?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const CardSkeleton: ({ count }: {
    count?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const ListSkeleton: ({ items }: {
    items?: number | undefined;
}) => import("react/jsx-runtime").JSX.Element;
declare const _default: {
    AssetListSkeleton: ({ count }: {
        count?: number | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
    FormSkeleton: ({ fields }: {
        fields?: number | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
    TableSkeleton: ({ rows, columns }: {
        rows?: number | undefined;
        columns?: number | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
    CardSkeleton: ({ count }: {
        count?: number | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
    ListSkeleton: ({ items }: {
        items?: number | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
};
export default _default;

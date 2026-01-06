import { Asset } from '../../api/assetService';
interface AssetState {
    assets: Asset[];
    currentAsset: Asset | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchAssets: import("@reduxjs/toolkit").AsyncThunk<import("../../api/assetService").AssetListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchAsset: import("@reduxjs/toolkit").AsyncThunk<Asset, number, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const createAsset: import("@reduxjs/toolkit").AsyncThunk<Asset, Partial<Asset>, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateAsset: import("@reduxjs/toolkit").AsyncThunk<Asset, {
    id: number;
    data: Partial<Asset>;
}, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const deleteAsset: import("@reduxjs/toolkit").AsyncThunk<number, number, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearCurrentAsset: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"asset/clearCurrentAsset">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"asset/clearError">;
declare const _default: import("redux").Reducer<AssetState>;
export default _default;

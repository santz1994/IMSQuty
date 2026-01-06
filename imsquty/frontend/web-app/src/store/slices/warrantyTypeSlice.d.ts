import { WarrantyType } from '../../api/warrantyTypeService';
interface WarrantyTypeState {
    warrantyTypes: WarrantyType[];
    currentWarrantyType: WarrantyType | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchWarrantyTypes: import("@reduxjs/toolkit").AsyncThunk<import("../../api/warrantyTypeService").WarrantyTypeListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchActiveWarrantyTypes: import("@reduxjs/toolkit").AsyncThunk<import("../../api/warrantyTypeService").WarrantyTypeListResponse, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<WarrantyTypeState>;
export default _default;

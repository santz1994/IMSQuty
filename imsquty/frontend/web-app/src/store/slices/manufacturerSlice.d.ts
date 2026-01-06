import { Manufacturer } from '../../api/manufacturerService';
interface ManufacturerState {
    manufacturers: Manufacturer[];
    currentManufacturer: Manufacturer | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchManufacturers: import("@reduxjs/toolkit").AsyncThunk<import("../../api/manufacturerService").ManufacturerListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchActiveManufacturers: import("@reduxjs/toolkit").AsyncThunk<import("../../api/manufacturerService").ManufacturerListResponse, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<ManufacturerState>;
export default _default;

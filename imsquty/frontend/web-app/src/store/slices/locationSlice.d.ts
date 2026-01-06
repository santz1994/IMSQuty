import { Location } from '../../api/locationService';
interface LocationState {
    locations: Location[];
    currentLocation: Location | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchLocations: import("@reduxjs/toolkit").AsyncThunk<import("../../api/locationService").LocationListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchActiveLocations: import("@reduxjs/toolkit").AsyncThunk<import("../../api/locationService").LocationListResponse, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<LocationState>;
export default _default;

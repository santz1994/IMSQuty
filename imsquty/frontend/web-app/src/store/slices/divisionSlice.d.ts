import { Division } from '../../api/divisionService';
interface DivisionState {
    divisions: Division[];
    currentDivision: Division | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchDivisions: import("@reduxjs/toolkit").AsyncThunk<import("../../api/divisionService").DivisionListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchActiveDivisions: import("@reduxjs/toolkit").AsyncThunk<import("../../api/divisionService").DivisionListResponse, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<DivisionState>;
export default _default;

interface TicketStatus {
    id: number;
    name: string;
    label: string;
    color: string;
}
interface TicketStatusState {
    statuses: TicketStatus[];
    loading: boolean;
    error: string | null;
}
export declare const fetchTicketStatuses: import("@reduxjs/toolkit").AsyncThunk<{
    data: {
        id: number;
        name: string;
        label: string;
        color: string;
    }[];
}, void, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
declare const _default: import("redux").Reducer<TicketStatusState>;
export default _default;

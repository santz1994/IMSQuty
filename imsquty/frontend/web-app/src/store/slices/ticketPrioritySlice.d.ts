interface TicketPriority {
    id: number;
    name: string;
    label: string;
    order: number;
}
interface TicketPriorityState {
    priorities: TicketPriority[];
    loading: boolean;
    error: string | null;
}
export declare const fetchTicketPriorities: import("@reduxjs/toolkit").AsyncThunk<{
    data: {
        id: number;
        name: string;
        label: string;
        order: number;
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
declare const _default: import("redux").Reducer<TicketPriorityState>;
export default _default;

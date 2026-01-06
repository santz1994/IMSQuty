import { Ticket } from '../../api/ticketService';
interface TicketState {
    tickets: Ticket[];
    currentTicket: Ticket | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        perPage: number;
        total: number;
    };
}
export declare const fetchTickets: import("@reduxjs/toolkit").AsyncThunk<import("../../api/ticketService").TicketListResponse, any, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchTicket: import("@reduxjs/toolkit").AsyncThunk<Ticket, number, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const createTicket: import("@reduxjs/toolkit").AsyncThunk<Ticket, Partial<Ticket>, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateTicket: import("@reduxjs/toolkit").AsyncThunk<Ticket, {
    id: number;
    data: Partial<Ticket>;
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
export declare const deleteTicket: import("@reduxjs/toolkit").AsyncThunk<number, number, {
    state?: unknown;
    dispatch?: import("redux").Dispatch;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const clearCurrentTicket: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ticket/clearCurrentTicket">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"ticket/clearError">;
declare const _default: import("redux").Reducer<TicketState>;
export default _default;

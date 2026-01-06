export interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    ticket_type_id: number;
    ticket_status_id: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_by: number;
    assigned_to: number;
    location_id: number;
    asset_id: number;
    due_date: string;
    created_at: string;
    updated_at: string;
}
export interface TicketListResponse {
    success: boolean;
    data: Ticket[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface TicketResponse {
    success: boolean;
    data: Ticket;
    message: string;
}
export declare const ticketService: {
    getTickets: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<TicketListResponse>;
    getTicket: (id: number) => Promise<TicketResponse>;
    createTicket: (data: Partial<Ticket>) => Promise<TicketResponse>;
    updateTicket: (id: number, data: Partial<Ticket>) => Promise<TicketResponse>;
    deleteTicket: (id: number) => Promise<TicketResponse>;
    searchTickets: (query: string) => Promise<TicketListResponse>;
    assignTicket: (ticketId: number, userId: number) => Promise<TicketResponse>;
};

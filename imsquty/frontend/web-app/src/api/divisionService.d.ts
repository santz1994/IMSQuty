export interface Division {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface DivisionListResponse {
    success: boolean;
    data: Division[];
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface DivisionResponse {
    success: boolean;
    data: Division;
    message: string;
}
export declare const divisionService: {
    getDivisions: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<DivisionListResponse>;
    getActiveDivisions: () => Promise<DivisionListResponse>;
    getDivision: (id: number) => Promise<DivisionResponse>;
};
export default divisionService;

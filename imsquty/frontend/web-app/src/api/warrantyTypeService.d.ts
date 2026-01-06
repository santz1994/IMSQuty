export interface WarrantyType {
    id: number;
    name: string;
    code: string;
    duration_months: number;
    coverage_description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface WarrantyTypeListResponse {
    success: boolean;
    data: WarrantyType[];
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface WarrantyTypeResponse {
    success: boolean;
    data: WarrantyType;
    message: string;
}
export declare const warrantyTypeService: {
    getWarrantyTypes: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<WarrantyTypeListResponse>;
    getActiveWarrantyTypes: () => Promise<WarrantyTypeListResponse>;
    getWarrantyType: (id: number) => Promise<WarrantyTypeResponse>;
};
export default warrantyTypeService;

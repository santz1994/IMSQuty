export interface Manufacturer {
    id: number;
    name: string;
    code: string;
    contact_person: string;
    email: string;
    phone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface ManufacturerListResponse {
    success: boolean;
    data: Manufacturer[];
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface ManufacturerResponse {
    success: boolean;
    data: Manufacturer;
    message: string;
}
export declare const manufacturerService: {
    getManufacturers: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<ManufacturerListResponse>;
    getActiveManufacturers: () => Promise<ManufacturerListResponse>;
    getManufacturer: (id: number) => Promise<ManufacturerResponse>;
};
export default manufacturerService;

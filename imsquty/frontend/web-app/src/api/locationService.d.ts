export interface Location {
    id: number;
    name: string;
    code: string;
    building: string;
    floor: string;
    room: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface LocationListResponse {
    success: boolean;
    data: Location[];
    meta?: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface LocationResponse {
    success: boolean;
    data: Location;
    message: string;
}
export declare const locationService: {
    getLocations: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<LocationListResponse>;
    getActiveLocations: () => Promise<LocationListResponse>;
    getLocation: (id: number) => Promise<LocationResponse>;
};
export default locationService;

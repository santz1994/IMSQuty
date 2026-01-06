export interface Asset {
    id: number;
    asset_tag: string;
    name: string;
    serial_number: string;
    asset_type_id: number;
    model_id: number;
    division_id: number;
    location_id: number;
    supplier_id: number;
    purchase_date: string;
    warranty_months: number;
    warranty_type_id: number;
    invoice_id: string;
    purchase_order_id: string;
    ip_address: string;
    mac_address: string;
    status_id: number;
    assigned_to: number;
    notes: string;
    created_at: string;
    updated_at: string;
}
export interface AssetListResponse {
    success: boolean;
    data: Asset[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    message: string;
}
export interface AssetResponse {
    success: boolean;
    data: Asset;
    message: string;
}
export declare const assetService: {
    getAssets: (page?: number, perPage?: number, filters?: Record<string, any>) => Promise<AssetListResponse>;
    getAsset: (id: number) => Promise<AssetResponse>;
    createAsset: (data: Partial<Asset>) => Promise<AssetResponse>;
    updateAsset: (id: number, data: Partial<Asset>) => Promise<AssetResponse>;
    deleteAsset: (id: number) => Promise<AssetResponse>;
    searchAssets: (query: string) => Promise<AssetListResponse>;
};

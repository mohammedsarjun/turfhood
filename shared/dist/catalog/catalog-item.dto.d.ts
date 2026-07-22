export interface CatalogItem {
    id: string;
    name: string;
    icon?: string;
    isListed: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCatalogItemRequest {
    name: string;
    icon?: string;
}
export interface UpdateCatalogItemRequest {
    name?: string;
    icon?: string;
}
export interface ToggleCatalogItemListedRequest {
    isListed: boolean;
}

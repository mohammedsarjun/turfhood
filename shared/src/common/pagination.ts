export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isListed?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type BookingListFilter = "upcoming" | "completed" | "cancelled";
export type OwnerSessionListFilter =
  "all" | "active" | "completed" | "cancelled";

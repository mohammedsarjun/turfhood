export interface ListAmenitiesRequestDTO {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

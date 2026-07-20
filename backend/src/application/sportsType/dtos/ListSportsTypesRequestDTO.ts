export interface ListSportsTypesRequestDTO {
  page: number;
  limit: number;
  search?: string;
  isListed?: boolean;
}

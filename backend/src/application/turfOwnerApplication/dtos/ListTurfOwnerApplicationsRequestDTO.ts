export interface ListTurfOwnerApplicationsRequestDTO {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected';
}

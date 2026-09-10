import type {
  CreateOpenSessionRequest,
  OpenSessionDTO,
  OpenSessionFilters,
  OpenSessionListResponse,
  OpenSessionPaymentResponse,
  CustomerRefundListResponse,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function createOpenSession(input: CreateOpenSessionRequest) {
  const response = await axiosInstance.post<OpenSessionPaymentResponse>(
    API_ROUTES.openSessions.base,
    input,
  );
  return response.data;
}
export async function listOpenSessions(filters: OpenSessionFilters) {
  const response = await axiosInstance.get<OpenSessionListResponse>(API_ROUTES.openSessions.base, {
    params: filters,
  });
  return response.data;
}
export async function listMyOpenSessions(
  page = 1,
  filter?: import('@turfhood/shared').BookingListFilter,
) {
  const response = await axiosInstance.get<OpenSessionListResponse>(API_ROUTES.openSessions.mine, {
    params: { page, limit: 10, filter },
  });
  return response.data;
}
export async function listMyRefunds(page = 1) {
  const response = await axiosInstance.get<CustomerRefundListResponse>(
    API_ROUTES.openSessions.refunds,
    { params: { page, limit: 20 } },
  );
  return response.data;
}
export async function getOpenSession(id: string) {
  const response = await axiosInstance.get<OpenSessionDTO>(API_ROUTES.openSessions.details(id));
  return response.data;
}
export async function joinOpenSession(id: string) {
  const response = await axiosInstance.post<OpenSessionPaymentResponse>(
    API_ROUTES.openSessions.join(id),
  );
  return response.data;
}
export async function cancelOpenSessionParticipation(id: string) {
  const response = await axiosInstance.delete<OpenSessionDTO>(
    API_ROUTES.openSessions.cancelParticipation(id),
  );
  return response.data;
}
export async function listOwnerOpenSessions(
  turfId: string,
  page = 1,
  filter?: import('@turfhood/shared').OwnerSessionListFilter,
) {
  const response = await axiosInstance.get<OpenSessionListResponse>(
    API_ROUTES.openSessions.owner(turfId),
    { params: { page, limit: 20, filter } },
  );
  return response.data;
}

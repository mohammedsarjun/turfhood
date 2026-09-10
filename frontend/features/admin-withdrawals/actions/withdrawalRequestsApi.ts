import type {
  RejectWithdrawalRequest,
  WithdrawalRequestDTO,
  WithdrawalRequestListResponse,
  WithdrawalRequestStatus,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listWithdrawalRequests(page = 1, status?: WithdrawalRequestStatus | 'all') {
  const response = await axiosInstance.get<WithdrawalRequestListResponse>(
    API_ROUTES.admin.withdrawalRequests,
    { params: { page, limit: 20, ...(status && status !== 'all' ? { status } : {}) } },
  );
  return response.data;
}

export async function markWithdrawalPaid(id: string) {
  const response = await axiosInstance.post<WithdrawalRequestDTO>(
    API_ROUTES.admin.markWithdrawalPaid(id),
  );
  return response.data;
}

export async function rejectWithdrawal(id: string, input: RejectWithdrawalRequest) {
  const response = await axiosInstance.post<WithdrawalRequestDTO>(
    API_ROUTES.admin.rejectWithdrawal(id),
    input,
  );
  return response.data;
}

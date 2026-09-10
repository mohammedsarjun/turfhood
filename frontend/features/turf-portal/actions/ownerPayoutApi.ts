import type {
  BankAccountDTO,
  CreateBankAccountRequest,
  CreateWithdrawalRequest,
  PayoutOverviewDTO,
  WithdrawalRequestDTO,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function getOwnerPayoutOverview(turfId: string) {
  const response = await axiosInstance.get<PayoutOverviewDTO>(API_ROUTES.turfPayouts(turfId));
  return response.data;
}

export async function createBankAccount(turfId: string, input: CreateBankAccountRequest) {
  const response = await axiosInstance.post<BankAccountDTO>(
    API_ROUTES.turfBankAccounts(turfId),
    input,
  );
  return response.data;
}

export async function createWithdrawalRequest(turfId: string, input: CreateWithdrawalRequest) {
  const response = await axiosInstance.post<WithdrawalRequestDTO>(
    API_ROUTES.turfWithdrawals(turfId),
    input,
  );
  return response.data;
}

import type {
  BankAccountDTO,
  CreateBankAccountRequest,
  CreateWithdrawalRequest,
  PayoutOverviewDTO,
  WithdrawalRequestDTO,
  WithdrawalRequestListResponse,
  WithdrawalRequestStatus,
} from '@turfhood/shared';

export interface IManagePayoutsUseCase {
  getOwnerOverview(ownerId: string, portalTurfId: string): Promise<PayoutOverviewDTO>;
  addBankAccount(ownerId: string, input: CreateBankAccountRequest): Promise<BankAccountDTO>;
  requestWithdrawal(
    ownerId: string,
    portalTurfId: string,
    input: CreateWithdrawalRequest,
  ): Promise<WithdrawalRequestDTO>;
  listAdminRequests(input: {
    page: number;
    limit: number;
    status?: WithdrawalRequestStatus;
  }): Promise<WithdrawalRequestListResponse>;
  markPaid(id: string): Promise<WithdrawalRequestDTO>;
  reject(id: string, reason: string): Promise<WithdrawalRequestDTO>;
}

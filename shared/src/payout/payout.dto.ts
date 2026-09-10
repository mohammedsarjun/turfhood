export type BankAccountType = "savings" | "current";

export interface BankAccountDTO {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber?: string;
  accountNumberMasked: string;
  ifscCode: string;
  accountType: BankAccountType;
  createdAt: string;
}

export type WithdrawalRequestStatus = "pending" | "paid" | "rejected";

export interface WithdrawalRequestDTO {
  id: string;
  turfId: string;
  turfName: string;
  ownerId: string;
  ownerName: string;
  amountPaise: number;
  status: WithdrawalRequestStatus;
  bankAccount: BankAccountDTO;
  requestedAt: string;
  paidAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface PayoutOverviewDTO {
  availableBalancePaise: number;
  bankAccounts: BankAccountDTO[];
  withdrawalRequests: WithdrawalRequestDTO[];
}

export interface CreateBankAccountRequest {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: BankAccountType;
}

export interface CreateWithdrawalRequest {
  amountPaise: number;
  bankAccountId: string;
}

export interface WithdrawalRequestListResponse {
  items: WithdrawalRequestDTO[];
  pagination: import("../common/pagination.js").PaginationMeta;
}

export interface RejectWithdrawalRequest {
  reason: string;
}

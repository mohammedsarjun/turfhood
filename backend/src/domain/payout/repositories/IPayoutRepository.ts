import type {
  BankAccountDTO,
  BankAccountType,
  WithdrawalRequestDTO,
  WithdrawalRequestStatus,
} from '@turfhood/shared';

export interface BankAccountDetailsDTO extends BankAccountDTO {
  accountNumber: string;
}

export interface CreateBankAccountInput {
  ownerId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: BankAccountType;
}

export interface CreateWithdrawalInput {
  turfId: string;
  turfName: string;
  ownerId: string;
  ownerName: string;
  amountPaise: number;
  bankAccount: BankAccountDetailsDTO;
}

export interface IPayoutRepository {
  createBankAccount(input: CreateBankAccountInput): Promise<BankAccountDTO>;
  listBankAccounts(ownerId: string): Promise<BankAccountDTO[]>;
  findBankAccount(ownerId: string, bankAccountId: string): Promise<BankAccountDetailsDTO | null>;
  createWithdrawal(input: CreateWithdrawalInput): Promise<WithdrawalRequestDTO>;
  listOwnerWithdrawals(ownerId: string, turfId: string): Promise<WithdrawalRequestDTO[]>;
  sumRequestedForTurf(ownerId: string, turfId: string): Promise<number>;
  listWithdrawals(input: {
    page: number;
    limit: number;
    status?: WithdrawalRequestStatus;
  }): Promise<{ items: WithdrawalRequestDTO[]; total: number }>;
  markPaid(id: string): Promise<WithdrawalRequestDTO | null>;
  reject(id: string, reason: string): Promise<WithdrawalRequestDTO | null>;
}

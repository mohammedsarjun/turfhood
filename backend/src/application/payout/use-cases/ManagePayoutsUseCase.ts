import { inject, injectable } from 'tsyringe';
import type {
  CreateBankAccountRequest,
  CreateWithdrawalRequest,
  WithdrawalRequestStatus,
} from '@turfhood/shared';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import type { IBookingRepository } from '@domain/booking/repositories/IBookingRepository';
import { PAYOUT_TOKENS } from '@domain/payout/tokens';
import type { IPayoutRepository } from '@domain/payout/repositories/IPayoutRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { USER_TOKENS } from '@domain/user/tokens';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { AppError } from '@shared/errors/AppError';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { IManagePayoutsUseCase } from './IManagePayoutsUseCase.js';

@injectable()
export class ManagePayoutsUseCase implements IManagePayoutsUseCase {
  constructor(
    @inject(PAYOUT_TOKENS.Repository) private readonly payouts: IPayoutRepository,
    @inject(TURF_TOKENS.TurfRepository) private readonly turfs: ITurfRepository,
    @inject(BOOKING_TOKENS.Repository) private readonly bookings: IBookingRepository,
    @inject(USER_TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async getOwnerOverview(ownerId: string, portalTurfId: string) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
    const [bankAccounts, withdrawalRequests, completedEarnings, requestedAmount] =
      await Promise.all([
        this.payouts.listBankAccounts(ownerId),
        this.payouts.listOwnerWithdrawals(ownerId, turf.id),
        this.bookings.completedOwnerEarnings(turf.id),
        this.payouts.sumRequestedForTurf(ownerId, turf.id),
      ]);
    return {
      availableBalancePaise: Math.max(0, completedEarnings - requestedAmount),
      bankAccounts,
      withdrawalRequests,
    };
  }

  async addBankAccount(ownerId: string, input: CreateBankAccountRequest) {
    return this.payouts.createBankAccount({
      ownerId,
      accountHolderName: input.accountHolderName.trim(),
      bankName: input.bankName.trim(),
      accountNumber: input.accountNumber.trim(),
      ifscCode: input.ifscCode.trim().toUpperCase(),
      accountType: input.accountType,
    });
  }

  async requestWithdrawal(ownerId: string, portalTurfId: string, input: CreateWithdrawalRequest) {
    const turf = await this.turfs.findOwnedByIdOrVerificationId(portalTurfId, ownerId);
    if (!turf?.id) throw new AppError('Turf not found.', HttpStatus.NOT_FOUND);
    const bankAccount = await this.payouts.findBankAccount(ownerId, input.bankAccountId);
    if (!bankAccount)
      throw new AppError('Add or select a valid bank account before requesting withdrawal.', HttpStatus.BAD_REQUEST);
    const [completedEarnings, requestedAmount, owner] = await Promise.all([
      this.bookings.completedOwnerEarnings(turf.id),
      this.payouts.sumRequestedForTurf(ownerId, turf.id),
      this.users.findById(ownerId),
    ]);
    const availableBalancePaise = Math.max(0, completedEarnings - requestedAmount);
    if (input.amountPaise > availableBalancePaise)
      throw new AppError('Withdrawal amount cannot exceed available balance.', HttpStatus.BAD_REQUEST);
    if (input.amountPaise < 100)
      throw new AppError('Withdrawal amount must be at least INR 1.', HttpStatus.BAD_REQUEST);
    return this.payouts.createWithdrawal({
      turfId: turf.id,
      turfName: turf.name,
      ownerId,
      ownerName: owner?.name ?? 'Turf owner',
      amountPaise: input.amountPaise,
      bankAccount,
    });
  }

  async listAdminRequests(input: {
    page: number;
    limit: number;
    status?: WithdrawalRequestStatus;
  }) {
    const result = await this.payouts.listWithdrawals(input);
    return {
      items: result.items,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / input.limit)),
      },
    };
  }

  async markPaid(id: string) {
    const request = await this.payouts.markPaid(id);
    if (!request) throw new AppError('Withdrawal request not found.', HttpStatus.NOT_FOUND);
    return request;
  }

  async reject(id: string, reason: string) {
    const request = await this.payouts.reject(id, reason.trim());
    if (!request) throw new AppError('Withdrawal request not found.', HttpStatus.NOT_FOUND);
    return request;
  }
}

import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import type { BankAccountDTO, WithdrawalRequestDTO } from '@turfhood/shared';
import type {
  BankAccountDetailsDTO,
  CreateBankAccountInput,
  CreateWithdrawalInput,
  IPayoutRepository,
} from '@domain/payout/repositories/IPayoutRepository';
import { BankAccountModel, type BankAccountDocument } from '../models/BankAccountModel.js';
import {
  WithdrawalRequestModel,
  type WithdrawalRequestDocument,
} from '../models/WithdrawalRequestModel.js';

const maskAccountNumber = (value: string) => `XXXX${value.slice(-4)}`;

@injectable()
export class PayoutRepository implements IPayoutRepository {
  async createBankAccount(input: CreateBankAccountInput) {
    const doc = await BankAccountModel.create({
      ownerId: input.ownerId,
      accountHolderName: input.accountHolderName,
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      ifscCode: input.ifscCode,
      accountType: input.accountType,
    });
    return this.toBankAccountDTO(doc);
  }

  async listBankAccounts(ownerId: string) {
    if (!mongoose.isValidObjectId(ownerId)) return [];
    const docs = await BankAccountModel.find({ ownerId, isDeleted: false }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toBankAccountDTO(doc));
  }

  async findBankAccount(ownerId: string, bankAccountId: string) {
    if (!mongoose.isValidObjectId(ownerId) || !mongoose.isValidObjectId(bankAccountId)) return null;
    const doc = await BankAccountModel.findOne({
      _id: bankAccountId,
      ownerId,
      isDeleted: false,
    });
    return doc ? this.toBankAccountDetailsDTO(doc) : null;
  }

  async createWithdrawal(input: CreateWithdrawalInput) {
    const doc = await WithdrawalRequestModel.create({
      turfId: input.turfId,
      turfName: input.turfName,
      ownerId: input.ownerId,
      ownerName: input.ownerName,
      amountPaise: input.amountPaise,
      bankAccount: {
        id: input.bankAccount.id,
        accountHolderName: input.bankAccount.accountHolderName,
        bankName: input.bankAccount.bankName,
        accountNumber: input.bankAccount.accountNumber,
        accountNumberMasked: input.bankAccount.accountNumberMasked,
        ifscCode: input.bankAccount.ifscCode,
        accountType: input.bankAccount.accountType,
        createdAt: new Date(input.bankAccount.createdAt),
      },
    });
    return this.toWithdrawalDTO(doc);
  }

  async listOwnerWithdrawals(ownerId: string, turfId: string) {
    if (!mongoose.isValidObjectId(ownerId) || !mongoose.isValidObjectId(turfId)) return [];
    const docs = await WithdrawalRequestModel.find({ ownerId, turfId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toWithdrawalDTO(doc));
  }

  async sumRequestedForTurf(ownerId: string, turfId: string) {
    if (!mongoose.isValidObjectId(ownerId) || !mongoose.isValidObjectId(turfId)) return 0;
    const rows = await WithdrawalRequestModel.aggregate<{ _id: null; total: number }>([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          turfId: new mongoose.Types.ObjectId(turfId),
          status: { $in: ['pending', 'paid'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } },
    ]);
    return rows[0]?.total ?? 0;
  }

  async listWithdrawals(input: {
    page: number;
    limit: number;
    status?: 'pending' | 'paid' | 'rejected';
  }) {
    const filter = input.status ? { status: input.status } : {};
    const [docs, total] = await Promise.all([
      WithdrawalRequestModel.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      WithdrawalRequestModel.countDocuments(filter),
    ]);
    const bankAccountNumbers = await this.getBankAccountNumbers(docs);
    return {
      items: docs.map((doc) =>
        this.toWithdrawalDTO(doc, true, bankAccountNumbers.get(doc.bankAccount.id)),
      ),
      total,
    };
  }

  async markPaid(id: string) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await WithdrawalRequestModel.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'paid', paidAt: new Date() } },
      { new: true },
    );
    return doc
      ? this.toWithdrawalDTO(doc, true, await this.getBankAccountNumber(doc.bankAccount.id))
      : null;
  }

  async reject(id: string, reason: string) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await WithdrawalRequestModel.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'rejected', rejectedAt: new Date(), rejectionReason: reason } },
      { new: true },
    );
    return doc
      ? this.toWithdrawalDTO(doc, true, await this.getBankAccountNumber(doc.bankAccount.id))
      : null;
  }

  private toBankAccountDTO(doc: BankAccountDocument): BankAccountDTO {
    return {
      id: doc._id.toString(),
      accountHolderName: doc.accountHolderName,
      bankName: doc.bankName,
      accountNumberMasked: maskAccountNumber(doc.accountNumber),
      ifscCode: doc.ifscCode,
      accountType: doc.accountType,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private toBankAccountDetailsDTO(doc: BankAccountDocument): BankAccountDetailsDTO {
    return {
      ...this.toBankAccountDTO(doc),
      accountNumber: doc.accountNumber,
    };
  }

  private toWithdrawalDTO(
    doc: WithdrawalRequestDocument,
    includeSensitiveAccountNumber = false,
    bankAccountNumber?: string,
  ): WithdrawalRequestDTO {
    const sensitiveAccountNumber = doc.bankAccount.accountNumber ?? bankAccountNumber;
    return {
      id: doc._id.toString(),
      turfId: doc.turfId.toString(),
      turfName: doc.turfName,
      ownerId: doc.ownerId.toString(),
      ownerName: doc.ownerName,
      amountPaise: doc.amountPaise,
      status: doc.status,
      bankAccount: {
        id: doc.bankAccount.id,
        accountHolderName: doc.bankAccount.accountHolderName,
        bankName: doc.bankAccount.bankName,
        accountNumberMasked: doc.bankAccount.accountNumberMasked,
        ...(includeSensitiveAccountNumber && sensitiveAccountNumber
          ? { accountNumber: sensitiveAccountNumber }
          : {}),
        ifscCode: doc.bankAccount.ifscCode,
        accountType: doc.bankAccount.accountType,
        createdAt: doc.bankAccount.createdAt.toISOString(),
      },
      requestedAt: doc.createdAt.toISOString(),
      ...(doc.paidAt ? { paidAt: doc.paidAt.toISOString() } : {}),
      ...(doc.rejectedAt ? { rejectedAt: doc.rejectedAt.toISOString() } : {}),
      ...(doc.rejectionReason ? { rejectionReason: doc.rejectionReason } : {}),
    };
  }

  private async getBankAccountNumber(bankAccountId: string) {
    if (!mongoose.isValidObjectId(bankAccountId)) return undefined;
    const account = await BankAccountModel.findOne({
      _id: bankAccountId,
      isDeleted: false,
    })
      .select('accountNumber')
      .lean();
    return account?.accountNumber;
  }

  private async getBankAccountNumbers(docs: WithdrawalRequestDocument[]) {
    const accountIds = docs
      .map((doc) => doc.bankAccount.id)
      .filter((id) => mongoose.isValidObjectId(id));
    const accounts = await BankAccountModel.find({
      _id: { $in: accountIds },
      isDeleted: false,
    })
      .select('_id accountNumber')
      .lean();
    return new Map(accounts.map((account) => [account._id.toString(), account.accountNumber]));
  }
}

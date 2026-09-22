import { injectable } from 'tsyringe';
import mongoose, { type FilterQuery } from 'mongoose';
import type {
  AdminTurfStatus,
  AdminTurfSummaryDTO,
  AdminUserSummaryDTO,
  UserRole,
  UserStatus,
} from '@turfhood/shared';
import type {
  AdminManagementListParams,
  AdminManagementListResult,
  IAdminManagementRepository,
} from '@domain/admin/repositories/IAdminManagementRepository';
import { UserModel, type UserDocument } from '@infrastructure/user/models/UserModel';
import { TurfModel, type TurfDocument } from '@infrastructure/turf/models/TurfModel';

interface TurfWithOwnerDocument extends TurfDocument {
  owner?: Pick<UserDocument, 'name' | 'email'>;
}

@injectable()
export class AdminManagementRepository implements IAdminManagementRepository {
  async listUsers(
    params: AdminManagementListParams,
  ): Promise<AdminManagementListResult<AdminUserSummaryDTO>> {
    const filter = this.userFilter(params.search);
    const skip = (params.page - 1) * params.limit;
    const [docs, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(params.limit),
      UserModel.countDocuments(filter),
    ]);
    return { items: docs.map((doc) => this.toUserDTO(doc)), total };
  }

  async suspendUser(id: string, reason: string): Promise<AdminUserSummaryDTO | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: { status: 'suspended', suspensionReason: reason } },
      { new: true, runValidators: true },
    );
    return doc ? this.toUserDTO(doc) : null;
  }

  async unsuspendUser(id: string): Promise<AdminUserSummaryDTO | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: { status: 'active' }, $unset: { suspensionReason: '' } },
      { new: true, runValidators: true },
    );
    return doc ? this.toUserDTO(doc) : null;
  }

  async listTurfs(
    params: AdminManagementListParams,
  ): Promise<AdminManagementListResult<AdminTurfSummaryDTO>> {
    const match = this.turfFilter(params.search);
    const skip = (params.page - 1) * params.limit;
    const docsQuery = TurfModel.find(match)
      .populate<{ ownerId: Pick<UserDocument, 'name' | 'email'> }>('ownerId', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(params.limit);
    const [docs, total] = await Promise.all([docsQuery, TurfModel.countDocuments(match)]);
    return {
      items: docs.map((doc) => this.toTurfDTO(doc as unknown as TurfWithOwnerDocument)),
      total,
    };
  }

  async suspendTurf(id: string, reason: string): Promise<AdminTurfSummaryDTO | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await TurfModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: 'suspended', suspensionReason: reason } },
      { new: true, runValidators: true },
    ).populate<{ ownerId: Pick<UserDocument, 'name' | 'email'> }>('ownerId', 'name email');
    return doc ? this.toTurfDTO(doc as unknown as TurfWithOwnerDocument) : null;
  }

  async unsuspendTurf(id: string): Promise<AdminTurfSummaryDTO | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await TurfModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { status: 'approved' }, $unset: { suspensionReason: '' } },
      { new: true, runValidators: true },
    ).populate<{ ownerId: Pick<UserDocument, 'name' | 'email'> }>('ownerId', 'name email');
    return doc ? this.toTurfDTO(doc as unknown as TurfWithOwnerDocument) : null;
  }

  private userFilter(search?: string): FilterQuery<UserDocument> {
    if (!search) return {};
    const pattern = this.searchPattern(search);
    return {
      $or: [{ name: pattern }, { email: pattern }, { phone: pattern }],
    };
  }

  private turfFilter(search?: string): FilterQuery<TurfDocument> {
    const filter: FilterQuery<TurfDocument> = { isDeleted: false };
    if (!search) return filter;
    const pattern = this.searchPattern(search);
    return {
      ...filter,
      $or: [
        { name: pattern },
        { 'address.line1': pattern },
        { 'address.city': pattern },
        { 'address.state': pattern },
        { 'address.pincode': pattern },
      ],
    };
  }

  private searchPattern(search: string): RegExp {
    return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  private toUserDTO(doc: UserDocument): AdminUserSummaryDTO {
    return {
      id: doc._id.toString(),
      name: doc.name,
      ...(doc.email ? { email: doc.email } : {}),
      ...(doc.phone ? { phone: doc.phone } : {}),
      roles: doc.roles as UserRole[],
      status: doc.status as UserStatus,
      ...(doc.suspensionReason ? { suspensionReason: doc.suspensionReason } : {}),
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private toTurfDTO(doc: TurfWithOwnerDocument): AdminTurfSummaryDTO {
    const owner = doc.ownerId as unknown as Pick<UserDocument, 'name' | 'email'>;
    return {
      id: doc._id.toString(),
      name: doc.name,
      ownerId: doc.ownerId.toString(),
      ownerName: owner?.name ?? 'Unknown owner',
      ...(owner?.email ? { ownerEmail: owner.email } : {}),
      address: doc.address,
      status: doc.status as AdminTurfStatus,
      ...(doc.suspensionReason ? { suspensionReason: doc.suspensionReason } : {}),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}

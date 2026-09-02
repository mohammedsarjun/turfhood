import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import type {
  AvailabilityOverrideDTO,
  CourtDTO,
  CreateAvailabilityOverrideRequest,
  UpdateCourtFields,
} from '@turfhood/shared';
import type {
  ICourtRepository,
  ICreateCourtPersistenceInput,
} from '@domain/court/repositories/ICourtRepository';
import { DuplicateCourtNameError } from '@domain/court/errors/DuplicateCourtNameError';

import { CourtModel, type CourtDocument } from '../models/CourtModel.js';
import { CourtImageModel } from '../models/CourtImageModel.js';
import { PricingRuleModel } from '../models/PricingRuleModel.js';
import {
  AvailabilityOverrideModel,
  type AvailabilityOverrideDocument,
} from '../models/AvailabilityOverrideModel.js';
import { SportsTypeModel } from '../../sportsType/models/SportsTypeModel.js';

@injectable()
export class CourtRepository implements ICourtRepository {
  async listPublic(input: { turfId: string; page: number; limit: number }) {
    const filter = { turfId: input.turfId, status: 'active', isDeleted: false };
    const [documents, total] = await Promise.all([
      CourtModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      CourtModel.countDocuments(filter),
    ]);
    return { items: await Promise.all(documents.map((document) => this.toDTO(document))), total };
  }

  async findTurfIdsMatchingDiscoveryFilters(input: {
    sportTypeId?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<string[]> {
    const priceFilterActive = input.minPrice !== undefined || input.maxPrice !== undefined;
    const pricedCourtIds = priceFilterActive
      ? await PricingRuleModel.distinct('courtId', {
          pricePerSlot: {
            ...(input.minPrice !== undefined ? { $gte: input.minPrice } : {}),
            ...(input.maxPrice !== undefined ? { $lte: input.maxPrice } : {}),
          },
        })
      : undefined;
    const turfIds = await CourtModel.distinct('turfId', {
      status: 'active',
      isDeleted: false,
      ...(input.sportTypeId ? { sportTypeIds: input.sportTypeId } : {}),
      ...(pricedCourtIds ? { _id: { $in: pricedCourtIds } } : {}),
    });
    return turfIds.map(String);
  }

  async findDiscoveryDetails(turfIds: string[]) {
    const courts = await CourtModel.find({
      turfId: { $in: turfIds },
      status: 'active',
      isDeleted: false,
    });
    const sportIds = [...new Set(courts.flatMap((court) => court.sportTypeIds.map(String)))];
    const [sports, pricingRules] = await Promise.all([
      SportsTypeModel.find({ _id: { $in: sportIds }, isListed: true }).select('name'),
      PricingRuleModel.find({ courtId: { $in: courts.map((court) => court._id) } }),
    ]);
    const sportNames = new Map(sports.map((sport) => [sport._id.toString(), sport.name]));
    const rulesByCourt = new Map<string, number[]>();
    for (const rule of pricingRules) {
      const courtId = rule.courtId.toString();
      rulesByCourt.set(courtId, [...(rulesByCourt.get(courtId) ?? []), rule.pricePerSlot]);
    }
    const details = new Map<
      string,
      { sports: string[]; prices: Array<{ pricePerSlot: number; slotDurationMinutes: number }> }
    >();
    for (const court of courts) {
      const turfId = court.turfId.toString();
      const current = details.get(turfId) ?? { sports: [], prices: [] };
      const names = court.sportTypeIds.flatMap((id) => {
        const name = sportNames.get(id.toString());
        return name ? [name] : [];
      });
      current.sports = [...new Set([...current.sports, ...names])];
      current.prices.push(
        ...(rulesByCourt.get(court._id.toString()) ?? []).map((pricePerSlot) => ({
          pricePerSlot,
          slotDurationMinutes: court.slotDurationMinutes,
        })),
      );
      details.set(turfId, current);
    }
    return details;
  }

  async existsByName(turfId: string, name: string, excludeCourtId?: string): Promise<boolean> {
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return CourtModel.exists({
      turfId,
      isDeleted: false,
      name: { $regex: `^${escapedName}$`, $options: 'i' },
      ...(excludeCourtId && mongoose.isValidObjectId(excludeCourtId)
        ? { _id: { $ne: excludeCourtId } }
        : {}),
    }).then(Boolean);
  }

  async create(input: ICreateCourtPersistenceInput): Promise<CourtDTO> {
    const session = await mongoose.startSession();
    let createdCourtId!: string;
    try {
      await session.withTransaction(async () => {
        const [court] = await CourtModel.create(
          [
            {
              ...input,
              normalizedName: input.name.trim().toLocaleLowerCase('en-IN'),
              images: undefined,
              pricingRules: undefined,
            },
          ],
          { session },
        );
        if (!court) throw new mongoose.Error.DocumentNotFoundError('Court');
        createdCourtId = court._id.toString();

        await CourtImageModel.insertMany(
          input.images.map((image) => ({ ...image, courtId: court._id, turfId: input.turfId })),
          { session },
        );
        await PricingRuleModel.insertMany(
          input.pricingRules.map((rule) => ({ ...rule, courtId: court._id })),
          { session },
        );
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
      ) {
        throw new DuplicateCourtNameError(input.name);
      }
      throw error;
    } finally {
      await session.endSession();
    }

    const court = await CourtModel.findById(createdCourtId).orFail();
    return this.toDTO(court);
  }

  async list(input: {
    turfId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: CourtDTO[]; total: number }> {
    const escaped = input.search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = {
      turfId: input.turfId,
      isDeleted: false,
      ...(escaped ? { name: { $regex: escaped, $options: 'i' } } : {}),
    };
    const [docs, total] = await Promise.all([
      CourtModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit),
      CourtModel.countDocuments(filter),
    ]);
    return { items: await Promise.all(docs.map((doc) => this.toDTO(doc))), total };
  }

  async findByIdAndTurf(courtId: string, turfId: string): Promise<CourtDTO | null> {
    if (!mongoose.isValidObjectId(courtId)) return null;
    const court = await CourtModel.findOne({ _id: courtId, turfId, isDeleted: false });
    return court ? this.toDTO(court) : null;
  }

  async listOverrides(courtId: string): Promise<AvailabilityOverrideDTO[]> {
    const docs = await AvailabilityOverrideModel.find({ courtId }).sort({ date: 1 });
    return docs.map((doc) => this.overrideToDTO(doc));
  }

  async createOverride(
    input: CreateAvailabilityOverrideRequest & { turfId: string; courtId: string },
  ): Promise<AvailabilityOverrideDTO> {
    const doc = await AvailabilityOverrideModel.create(input);
    return this.overrideToDTO(doc);
  }

  async updateOverride(
    overrideId: string,
    courtId: string,
    input: CreateAvailabilityOverrideRequest,
  ): Promise<AvailabilityOverrideDTO | null> {
    if (!mongoose.isValidObjectId(overrideId)) return null;
    const doc = await AvailabilityOverrideModel.findOneAndUpdate(
      { _id: overrideId, courtId },
      {
        $set: input,
        $unset: {
          type: 1,
          reasonType: 1,
          customOpen: 1,
          customClose: 1,
          reason: 1,
          customHours: 1,
          pricingRules: 1,
          blockedPeriods: 1,
          ...(!input.closureReason ? { closureReason: 1 } : {}),
        },
      },
      { new: true, runValidators: true },
    );
    return doc ? this.overrideToDTO(doc) : null;
  }

  async deleteOverride(overrideId: string, courtId: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(overrideId)) return false;
    const result = await AvailabilityOverrideModel.deleteOne({ _id: overrideId, courtId });
    return result.deletedCount === 1;
  }

  async update(courtId: string, input: UpdateCourtFields): Promise<CourtDTO | null> {
    if (!mongoose.isValidObjectId(courtId)) return null;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const court = await CourtModel.findOneAndUpdate(
          { _id: courtId, isDeleted: false },
          {
            $set: {
              name: input.name,
              normalizedName: input.name.trim().toLocaleLowerCase('en-IN'),
              sportTypeIds: input.sportTypeIds,
              capacity: input.capacity,
              status: input.status,
              allowOpenSessions: input.allowOpenSessions,
              minPlayersForOpenSession: input.minPlayersForOpenSession,
              slotDurationMinutes: input.slotDurationMinutes,
            },
          },
          { session, new: true, runValidators: true },
        );
        if (!court) throw new mongoose.Error.DocumentNotFoundError('Court');
        await PricingRuleModel.deleteMany({ courtId }, { session });
        await PricingRuleModel.insertMany(
          input.pricingRules.map((rule) => ({ ...rule, courtId })),
          { session },
        );
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: unknown }).code === 11000
      ) {
        throw new DuplicateCourtNameError(input.name);
      }
      throw error;
    } finally {
      await session.endSession();
    }
    const court = await CourtModel.findById(courtId);
    return court ? this.toDTO(court) : null;
  }

  private overrideToDTO(doc: AvailabilityOverrideDocument): AvailabilityOverrideDTO {
    return {
      id: doc._id.toString(),
      turfId: doc.turfId.toString(),
      courtId: doc.courtId.toString(),
      date: doc.date,
      isClosed: doc.isClosed,
      ...(doc.closureReason ? { closureReason: doc.closureReason } : {}),
      blockedSlots: doc.blockedSlots.map(({ startTime, endTime }) => ({
        startTime,
        endTime,
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private async toDTO(doc: CourtDocument): Promise<CourtDTO> {
    const [images, rules] = await Promise.all([
      CourtImageModel.find({ courtId: doc._id }).sort({ order: 1 }),
      PricingRuleModel.find({ courtId: doc._id }).sort({ dayType: 1, startTime: 1 }),
    ]);
    return {
      id: doc._id.toString(),
      turfId: doc.turfId.toString(),
      name: doc.name,
      sportTypeIds: doc.sportTypeIds.map(String),
      capacity: doc.capacity,
      status: doc.status,
      allowOpenSessions: doc.allowOpenSessions,
      minPlayersForOpenSession: doc.minPlayersForOpenSession,
      slotDurationMinutes: doc.slotDurationMinutes,
      images: images.map((image) => ({
        id: image._id.toString(),
        url: image.url,
        isCover: image.isCover,
        order: image.order,
      })),
      pricingRules: rules.map((rule) => ({
        id: rule._id.toString(),
        dayType: rule.dayType,
        startTime: rule.startTime,
        endTime: rule.endTime,
        pricePerSlot: rule.pricePerSlot,
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

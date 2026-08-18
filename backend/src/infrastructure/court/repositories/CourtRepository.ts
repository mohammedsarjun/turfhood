import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import type { CourtDTO } from '@turfhood/shared';
import type {
  ICourtRepository,
  ICreateCourtPersistenceInput,
} from '@domain/court/repositories/ICourtRepository';
import { DuplicateCourtNameError } from '@domain/court/errors/DuplicateCourtNameError';

import { CourtModel, type CourtDocument } from '../models/CourtModel.js';
import { CourtImageModel } from '../models/CourtImageModel.js';
import { PricingRuleModel } from '../models/PricingRuleModel.js';

@injectable()
export class CourtRepository implements ICourtRepository {
  async existsByName(turfId: string, name: string): Promise<boolean> {
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return CourtModel.exists({
      turfId,
      isDeleted: false,
      name: { $regex: `^${escapedName}$`, $options: 'i' },
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

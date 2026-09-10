import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { Turf } from '@domain/turf/entities/Turf';
import type {
  ITurfRepository,
  TurfDiscoveryRepositoryInput,
} from '@domain/turf/repositories/ITurfRepository';

import { TurfModel, type TurfDocument } from '../models/TurfModel.js';
import { TurfOwnerApplicationModel } from '../../turfOwnerApplication/models/TurfOwnerApplicationModel.js';

@injectable()
export class TurfRepository implements ITurfRepository {
  async updateBasicDetails(
    id: string,
    ownerId: string,
    input: {
      name: string;
      description?: string;
      address: Turf['address'];
      location: Turf['location'];
    },
  ): Promise<Turf | null> {
    const owned = await this.findOwnedByIdOrVerificationId(id, ownerId);
    if (!owned?.id) return null;
    const document = await TurfModel.findOneAndUpdate(
      { _id: owned.id, ownerId, isDeleted: false },
      {
        $set: {
          name: input.name,
          description: input.description ?? '',
          address: input.address,
          location: input.location,
        },
      },
      { new: true, runValidators: true },
    );
    return document ? this.toDomain(document) : null;
  }
  async findApprovedById(id: string): Promise<Turf | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    const document = await TurfModel.findOne({ _id: id, status: 'approved', isDeleted: false });
    return document ? this.toDomain(document) : null;
  }

  async findApprovedByIds(ids: string[]): Promise<Turf[]> {
    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    if (!validIds.length) return [];
    const documents = await TurfModel.find({
      _id: { $in: validIds },
      status: 'approved',
      isDeleted: false,
    });
    const byId = new Map(documents.map((document) => [document._id.toString(), document]));
    return validIds.flatMap((id) => {
      const document = byId.get(id);
      return document ? [this.toDomain(document)] : [];
    });
  }

  async discover(input: TurfDiscoveryRepositoryInput) {
    const match: Record<string, unknown> = { status: 'approved', isDeleted: false };
    if (input.eligibleTurfIds)
      match._id = { $in: input.eligibleTurfIds.map((id) => new mongoose.Types.ObjectId(id)) };
    if (input.amenityIds?.length)
      match['amenities.amenityId'] = {
        $all: input.amenityIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    if (input.minRating !== undefined) match['rating.avg'] = { $gte: input.minRating };
    if (input.stateCode && input.stateName)
      match.$and = [
        {
          $or: [
            { 'address.stateCode': input.stateCode },
            { 'address.state': new RegExp(`^${this.escape(input.stateName)}$`, 'i') },
          ],
        },
        ...(input.cityCode && input.cityName
          ? [
              {
                $or: [
                  { 'address.cityCode': input.cityCode },
                  { 'address.city': new RegExp(`^${this.escape(input.cityName)}$`, 'i') },
                ],
              },
            ]
          : []),
      ];
    const stages: mongoose.PipelineStage[] = input.coordinates
      ? [
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [input.coordinates.longitude, input.coordinates.latitude],
              },
              distanceField: 'distanceMeters',
              spherical: true,
              query: match,
            },
          },
        ]
      : [{ $match: match }, { $sort: { 'rating.avg': -1, createdAt: -1 } }];
    stages.push({
      $facet: {
        items: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
        total: [{ $count: 'count' }],
      },
    });
    const [result] = await TurfModel.aggregate<{
      items: Array<TurfDocument & { distanceMeters?: number }>;
      total: Array<{ count: number }>;
    }>(stages);
    const documents = result?.items ?? [];
    return {
      items: documents.map((document) => this.toDomain(document)),
      total: result?.total[0]?.count ?? 0,
      distances: new Map(
        documents.flatMap((document) =>
          document.distanceMeters !== undefined
            ? [[document._id.toString(), document.distanceMeters / 1000] as const]
            : [],
        ),
      ),
    };
  }

  private escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async findApprovedByCity(
    location: { cityCode: string; cityName: string; stateCode: string; stateName: string },
    limit: number,
  ): Promise<Turf[]> {
    const escapedCity = location.cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedState = location.stateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const documents = await TurfModel.find({
      status: 'approved',
      isDeleted: false,
      $and: [
        {
          $or: [
            { 'address.stateCode': location.stateCode },
            { 'address.state': { $regex: `^${escapedState}$`, $options: 'i' } },
          ],
        },
        {
          $or: [
            { 'address.cityCode': location.cityCode },
            { 'address.city': { $regex: `^${escapedCity}$`, $options: 'i' } },
          ],
        },
      ],
    })
      .sort({ 'rating.avg': -1, createdAt: -1 })
      .limit(limit);
    return documents.map((document) => this.toDomain(document));
  }

  async create(turf: Turf): Promise<Turf> {
    const doc = await TurfModel.create({
      ownerId: turf.ownerId,
      name: turf.name,
      description: turf.description,
      location: turf.location,
      address: turf.address,
      amenities: turf.amenities,
      sportsOffered: turf.sportsOffered,
      rating: turf.rating,
      status: turf.status,
      verificationId: turf.verificationId,
      isDeleted: turf.isDeleted,
    });
    return this.toDomain(doc);
  }

  async findOwnedByIdOrVerificationId(id: string, ownerId: string): Promise<Turf | null> {
    let doc = await TurfModel.findOne({
      ownerId,
      isDeleted: false,
      status: 'approved',
      $or: [{ _id: id }, { verificationId: id }],
    });
    if (!doc) {
      const application = await TurfOwnerApplicationModel.findOne({
        _id: id,
        applicantUserId: ownerId,
        status: 'approved',
        turfId: { $exists: true },
      }).select('turfId');
      if (application?.turfId) {
        doc = await TurfModel.findOne({
          _id: application.turfId,
          ownerId,
          isDeleted: false,
          status: 'approved',
        });
      }
    }
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: TurfDocument): Turf {
    return Turf.fromPersistence({
      id: doc._id.toString(),
      ownerId: doc.ownerId.toString(),
      name: doc.name,
      ...(doc.description ? { description: doc.description } : {}),
      location: doc.location,
      address: doc.address,
      amenities: doc.amenities,
      sportsOffered: doc.sportsOffered.map((id) => id.toString()),
      rating: doc.rating,
      status: doc.status,
      ...(doc.verificationId ? { verificationId: doc.verificationId.toString() } : {}),
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

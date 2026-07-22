import { TurfOwnerApplication } from '../../src/domain/turfOwnerApplication/entities/TurfOwnerApplication.js';
import type {
  ITurfOwnerApplicationRepository,
  ListTurfOwnerApplicationsParams,
  ListTurfOwnerApplicationsResult,
} from '../../src/domain/turfOwnerApplication/repositories/ITurfOwnerApplicationRepository.js';

interface FakeTurfOwnerApplicationRepositoryOptions {
  /** Returned by findById(); set to simulate "an application with this id exists". */
  existingById?: TurfOwnerApplication | null;
  /** Returned by findPendingByApplicant(); set to simulate "the applicant already has one pending". */
  existingPendingByApplicant?: TurfOwnerApplication | null;
  /** Returned by findLatestByApplicant(). */
  existingLatestByApplicant?: TurfOwnerApplication | null;
  /** Returned by findAllByApplicant(). */
  allByApplicant?: TurfOwnerApplication[];
  listResult?: ListTurfOwnerApplicationsResult;
}

/** In-memory stand-in for the real Mongo-backed TurfOwnerApplicationRepository. */
export class FakeTurfOwnerApplicationRepository implements ITurfOwnerApplicationRepository {
  public readonly createCalls: TurfOwnerApplication[] = [];
  public readonly approveCalls: Array<{ id: string; reviewedBy: string; turfId: string }> = [];
  public readonly rejectCalls: Array<{ id: string; reviewedBy: string; reason?: string }> = [];

  constructor(private readonly options: FakeTurfOwnerApplicationRepositoryOptions = {}) {}

  async findById(): Promise<TurfOwnerApplication | null> {
    return this.options.existingById ?? null;
  }

  async findPendingByApplicant(): Promise<TurfOwnerApplication | null> {
    return this.options.existingPendingByApplicant ?? null;
  }

  async findLatestByApplicant(): Promise<TurfOwnerApplication | null> {
    return this.options.existingLatestByApplicant ?? null;
  }

  async findAllByApplicant(): Promise<TurfOwnerApplication[]> {
    return this.options.allByApplicant ?? [];
  }

  async list(params: ListTurfOwnerApplicationsParams): Promise<ListTurfOwnerApplicationsResult> {
    void params;
    return this.options.listResult ?? { items: [], total: 0 };
  }

  async create(application: TurfOwnerApplication): Promise<TurfOwnerApplication> {
    this.createCalls.push(application);
    return TurfOwnerApplication.fromPersistence({
      id: application.id ?? 'generated_application_id',
      applicantUserId: application.applicantUserId,
      name: application.name,
      ...(application.description ? { description: application.description } : {}),
      address: application.address,
      location: application.location,
      sportsOffered: application.sportsOffered,
      amenities: application.amenities,
      documents: application.documents,
      images: application.images,
      status: application.status,
      createdAt: application.createdAt ?? new Date('2026-01-01'),
      updatedAt: application.updatedAt ?? new Date('2026-01-01'),
    });
  }

  async approve(
    id: string,
    reviewedBy: string,
    turfId: string,
  ): Promise<TurfOwnerApplication | null> {
    this.approveCalls.push({ id, reviewedBy, turfId });
    const existing = this.options.existingById;
    if (!existing) return null;
    return TurfOwnerApplication.fromPersistence({
      id: existing.id ?? id,
      applicantUserId: existing.applicantUserId,
      name: existing.name,
      ...(existing.description ? { description: existing.description } : {}),
      address: existing.address,
      location: existing.location,
      sportsOffered: existing.sportsOffered,
      amenities: existing.amenities,
      documents: existing.documents,
      images: existing.images,
      status: 'approved',
      reviewedBy,
      turfId,
      createdAt: existing.createdAt ?? new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    });
  }

  async reject(
    id: string,
    reviewedBy: string,
    reason?: string,
  ): Promise<TurfOwnerApplication | null> {
    this.rejectCalls.push({ id, reviewedBy, ...(reason ? { reason } : {}) });
    const existing = this.options.existingById;
    if (!existing) return null;
    return TurfOwnerApplication.fromPersistence({
      id: existing.id ?? id,
      applicantUserId: existing.applicantUserId,
      name: existing.name,
      ...(existing.description ? { description: existing.description } : {}),
      address: existing.address,
      location: existing.location,
      sportsOffered: existing.sportsOffered,
      amenities: existing.amenities,
      documents: existing.documents,
      images: existing.images,
      status: 'rejected',
      reviewedBy,
      ...(reason ? { reviewNotes: reason } : {}),
      createdAt: existing.createdAt ?? new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    });
  }
}

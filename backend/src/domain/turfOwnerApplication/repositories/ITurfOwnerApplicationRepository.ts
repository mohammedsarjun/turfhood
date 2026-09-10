import type { TurfOwnerApplication } from '../entities/TurfOwnerApplication.js';

export interface ListTurfOwnerApplicationsParams {
  applicantUserId?: string;
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ListTurfOwnerApplicationsResult {
  items: TurfOwnerApplication[];
  total: number;
}

export interface ITurfOwnerApplicationRepository {
  findById(id: string): Promise<TurfOwnerApplication | null>;
  /** Used to reject a second submission while one is still pending. */
  findPendingByApplicant(userId: string): Promise<TurfOwnerApplication | null>;
  /** Most recent application regardless of status — drives status-aware profile-menu routing. */
  findLatestByApplicant(userId: string): Promise<TurfOwnerApplication | null>;
  /** Every application the user has ever submitted, any status, newest first — backs the My Turfs page. */
  findAllByApplicant(userId: string): Promise<TurfOwnerApplication[]>;
  list(params: ListTurfOwnerApplicationsParams): Promise<ListTurfOwnerApplicationsResult>;
  create(application: TurfOwnerApplication): Promise<TurfOwnerApplication>;
  approve(id: string, reviewedBy: string, turfId: string): Promise<TurfOwnerApplication | null>;
  reject(id: string, reviewedBy: string, reason?: string): Promise<TurfOwnerApplication | null>;
}

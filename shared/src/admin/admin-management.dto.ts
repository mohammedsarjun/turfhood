import type { PaginatedResponse } from "../common/pagination.js";
import type { TurfApplicationAddress } from "../turfOnboarding/turf-application.dto.js";
import type { UserRole, UserStatus } from "../user/types.js";

export type AdminTurfStatus = "pending_approval" | "approved" | "rejected" | "suspended";

export interface AdminUserSummaryDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: UserRole[];
  status: UserStatus;
  suspensionReason?: string;
  createdAt: string;
}

export interface AdminTurfSummaryDTO {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  address: TurfApplicationAddress;
  status: AdminTurfStatus;
  suspensionReason?: string;
  createdAt: string;
}

export interface SuspendUserRequest {
  reason: string;
}

export interface SuspendTurfRequest {
  reason: string;
}

export type AdminUserListResponse = PaginatedResponse<AdminUserSummaryDTO>;
export type AdminTurfListResponse = PaginatedResponse<AdminTurfSummaryDTO>;

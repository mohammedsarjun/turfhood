import type { GeoPoint } from '../geo/coordinates.dto.js';
import type { TurfApplicationStatus } from './turf-onboarding-status.js';
export interface TurfApplicationAddress {
    line1: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}
export interface TurfApplicationDocument {
    type: string;
    url: string;
}
export interface TurfApplicationImage {
    url: string;
    isCover: boolean;
}
export interface TurfApplicationSummary {
    id: string;
    name: string;
    description?: string;
    address: TurfApplicationAddress;
    location: GeoPoint;
    sportsOffered: string[];
    amenities: string[];
    documents: TurfApplicationDocument[];
    images: TurfApplicationImage[];
    status: TurfApplicationStatus;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SubmitTurfApplicationResponse {
    application: TurfApplicationSummary;
}
export interface RejectTurfApplicationRequest {
    reviewNotes?: string;
}

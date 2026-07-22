import type { TurfAddress } from '@domain/turf/entities/Turf';

export interface SubmitTurfOwnerApplicationDocumentInput {
  type: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SubmitTurfOwnerApplicationImageInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  isCover: boolean;
}

export interface SubmitTurfOwnerApplicationRequestDTO {
  applicantUserId: string;
  name: string;
  description?: string;
  address: TurfAddress;
  coordinates: { lat: number; lng: number };
  sportsOffered: string[];
  amenities: string[];
  documents: SubmitTurfOwnerApplicationDocumentInput[];
  images: SubmitTurfOwnerApplicationImageInput[];
}

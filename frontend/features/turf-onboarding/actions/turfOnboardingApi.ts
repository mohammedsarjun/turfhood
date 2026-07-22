import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { TurfApplicationSummary } from '../types';
import type { DocumentEntry } from '../components/DocumentUpload';
import type { CountryStateCityValue } from '../components/CountryStateCityFields';
import type { Coordinates } from '../components/LocationMapPicker';
import type { TurfImageEntry } from '../components/TurfImageUpload';

export async function getMyApplication(): Promise<
  ApiResponse<{ application: TurfApplicationSummary | null }>
> {
  const response = await axiosInstance.get<{ application: TurfApplicationSummary | null }>(
    API_ROUTES.turfOwnerApplications.latest,
  );
  return response.data;
}

export async function listMyApplications(): Promise<
  ApiResponse<{ applications: TurfApplicationSummary[] }>
> {
  const response = await axiosInstance.get<{ applications: TurfApplicationSummary[] }>(
    API_ROUTES.turfOwnerApplications.mine,
  );
  return response.data;
}

export interface SubmitTurfApplicationPayload {
  name: string;
  description?: string;
  address: CountryStateCityValue & { line1: string; pincode: string };
  coordinates: Coordinates;
  sportsOffered: string[];
  amenities: string[];
  images: TurfImageEntry[];
  documents: DocumentEntry[];
}

export async function submitApplication(
  payload: SubmitTurfApplicationPayload,
): Promise<ApiResponse<{ application: TurfApplicationSummary }>> {
  const formData = new FormData();
  formData.append('name', payload.name);
  if (payload.description) {
    formData.append('description', payload.description);
  }
  formData.append(
    'address',
    JSON.stringify({
      line1: payload.address.line1,
      city: payload.address.city,
      state: payload.address.state,
      country: payload.address.country,
      pincode: payload.address.pincode,
    }),
  );
  formData.append('coordinates', JSON.stringify(payload.coordinates));
  formData.append('sportsOffered', JSON.stringify(payload.sportsOffered));
  formData.append('amenities', JSON.stringify(payload.amenities));
  formData.append('documentTypes', JSON.stringify(payload.documents.map((doc) => doc.type)));
  for (const doc of payload.documents) {
    formData.append('documents', doc.file);
  }
  formData.append('imageCoverFlags', JSON.stringify(payload.images.map((image) => image.isCover)));
  for (const image of payload.images) {
    formData.append('images', image.file);
  }

  const response = await axiosInstance.post<{ application: TurfApplicationSummary }>(
    API_ROUTES.turfOwnerApplications.base,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

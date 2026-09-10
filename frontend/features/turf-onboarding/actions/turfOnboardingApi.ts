import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { TurfApplicationAddress, MyTurfApplicationsResponse } from '@turfhood/shared';
import type { TurfApplicationSummary } from '../types';
import type { DocumentEntry } from '../components/DocumentUpload';
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

export async function listMyApplications(
  page = 1,
): Promise<ApiResponse<MyTurfApplicationsResponse>> {
  const response = await axiosInstance.get<MyTurfApplicationsResponse>(
    API_ROUTES.turfOwnerApplications.mine,
    { params: { page, limit: 9 } },
  );
  return response.data;
}

export interface SubmitTurfApplicationPayload {
  name: string;
  description?: string;
  address: TurfApplicationAddress;
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
  formData.append('address', JSON.stringify(payload.address));
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

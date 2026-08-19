import type {
  AvailabilityOverrideDTO,
  CourtDetailsResponse,
  CreateAvailabilityOverrideRequest,
  CreateCourtFields,
  ListCourtsResponse,
  CourtDTO,
  UpdateCourtFields,
} from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export async function listCourts(
  turfId: string,
  params: { page: number; limit: number; search?: string },
): Promise<ListCourtsResponse> {
  const response = await axiosInstance.get<ListCourtsResponse>(API_ROUTES.courts.forTurf(turfId), {
    params,
  });
  return response.data;
}

export async function getCourtDetails(
  turfId: string,
  courtId: string,
): Promise<CourtDetailsResponse> {
  const response = await axiosInstance.get<CourtDetailsResponse>(
    API_ROUTES.courts.details(turfId, courtId),
  );
  return response.data;
}

export async function createAvailabilityOverride(
  turfId: string,
  courtId: string,
  data: CreateAvailabilityOverrideRequest,
): Promise<AvailabilityOverrideDTO> {
  const response = await axiosInstance.post<{ availabilityOverride: AvailabilityOverrideDTO }>(
    API_ROUTES.courts.overrides(turfId, courtId),
    data,
  );
  return response.data.availabilityOverride;
}

export async function updateAvailabilityOverride(
  turfId: string,
  courtId: string,
  overrideId: string,
  data: CreateAvailabilityOverrideRequest,
): Promise<AvailabilityOverrideDTO> {
  const response = await axiosInstance.put<{ availabilityOverride: AvailabilityOverrideDTO }>(
    API_ROUTES.courts.override(turfId, courtId, overrideId),
    data,
  );
  return response.data.availabilityOverride;
}

export async function deleteAvailabilityOverride(
  turfId: string,
  courtId: string,
  overrideId: string,
): Promise<void> {
  await axiosInstance.delete(API_ROUTES.courts.override(turfId, courtId, overrideId));
}

export async function updateCourt(
  turfId: string,
  courtId: string,
  fields: UpdateCourtFields,
): Promise<CourtDTO> {
  const response = await axiosInstance.put<{ court: CourtDTO }>(
    API_ROUTES.courts.details(turfId, courtId),
    fields,
  );
  return response.data.court;
}

export async function createCourt(
  turfId: string,
  fields: CreateCourtFields,
  images: File[],
): Promise<{ court: CourtDTO }> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(fields));
  images.forEach((image) => formData.append('images', image));
  const response = await axiosInstance.post<{ court: CourtDTO }>(
    API_ROUTES.courts.forTurf(turfId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

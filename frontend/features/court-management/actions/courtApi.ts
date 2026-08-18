import type { CreateCourtFields, ListCourtsResponse, CourtDTO } from '@turfhood/shared';
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

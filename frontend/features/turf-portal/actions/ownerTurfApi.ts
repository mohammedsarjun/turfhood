import type { TurfApplicationAddress } from '@turfhood/shared';
import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';

export interface OwnerTurfDetails {
  id: string;
  name: string;
  description: string;
  address: TurfApplicationAddress;
  location: { latitude: number; longitude: number };
  images: string[];
}

export async function getOwnerTurf(id: string): Promise<OwnerTurfDetails> {
  const response = await axiosInstance.get<{ turf: OwnerTurfDetails }>(API_ROUTES.turfs.manage(id));
  return response.data.turf;
}

export async function updateOwnerTurf(id: string, turf: Omit<OwnerTurfDetails, 'id' | 'images'>) {
  await axiosInstance.put(API_ROUTES.turfs.manage(id), turf);
}

export async function uploadOwnerTurfCover(id: string, cover: File): Promise<string> {
  const data = new FormData();
  data.append('cover', cover);
  const response = await axiosInstance.post<{ url: string }>(
    API_ROUTES.turfs.manageCover(id),
    data,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data.url;
}

export async function updateOwnerTurfImages(
  id: string,
  retainedUrls: string[],
  images: File[],
  coverKey: string,
): Promise<string[]> {
  const data = new FormData();
  data.append('retainedUrls', JSON.stringify(retainedUrls));
  data.append('coverKey', coverKey);
  images.forEach((image) => data.append('images', image));
  const response = await axiosInstance.put<{ images: string[] }>(
    API_ROUTES.turfs.manageImages(id),
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data.images;
}

import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type { LocationOption } from '@turfhood/shared';

export async function listCountries(): Promise<ApiResponse<{ items: LocationOption[] }>> {
  const response = await axiosInstance.get<{ items: LocationOption[] }>(
    API_ROUTES.locations.countries,
  );
  return response.data;
}

export async function listStates(
  countryCode: string,
): Promise<ApiResponse<{ items: LocationOption[] }>> {
  const response = await axiosInstance.get<{ items: LocationOption[] }>(
    API_ROUTES.locations.states(countryCode),
  );
  return response.data;
}

export async function listCities(
  countryCode: string,
  stateCode: string,
): Promise<ApiResponse<{ items: LocationOption[] }>> {
  const response = await axiosInstance.get<{ items: LocationOption[] }>(
    API_ROUTES.locations.cities(countryCode, stateCode),
  );
  return response.data;
}

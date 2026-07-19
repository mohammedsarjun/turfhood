import { axiosInstance } from '@/lib/axios';
import { API_ROUTES } from '@/lib/apiRoutes';
import type { ApiResponse } from '@/types/api/response';
import type {
  PublicUser,
  UpdateNameRequest,
  UpdateNameResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  RequestEmailChangeRequest,
  RequestEmailChangeResponse,
  ConfirmEmailChangeRequest,
  ConfirmEmailChangeResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SetPasswordRequest,
  SetPasswordResponse,
  AvatarUploadResponse,
} from '../types';

export async function getMe(): Promise<ApiResponse<PublicUser>> {
  const response = await axiosInstance.get<PublicUser>(API_ROUTES.users.me);
  return response.data;
}

export async function updateName(
  payload: UpdateNameRequest,
): Promise<ApiResponse<UpdateNameResponse>> {
  const response = await axiosInstance.patch<UpdateNameResponse>(
    API_ROUTES.users.updateName,
    payload,
  );
  return response.data;
}

export async function updatePhone(
  payload: UpdatePhoneRequest,
): Promise<ApiResponse<UpdatePhoneResponse>> {
  const response = await axiosInstance.patch<UpdatePhoneResponse>(
    API_ROUTES.users.updatePhone,
    payload,
  );
  return response.data;
}

export async function requestEmailChange(
  payload: RequestEmailChangeRequest,
): Promise<ApiResponse<RequestEmailChangeResponse>> {
  const response = await axiosInstance.post<RequestEmailChangeResponse>(
    API_ROUTES.users.requestEmailChange,
    payload,
  );
  return response.data;
}

export async function confirmEmailChange(
  payload: ConfirmEmailChangeRequest,
): Promise<ApiResponse<ConfirmEmailChangeResponse>> {
  const response = await axiosInstance.post<ConfirmEmailChangeResponse>(
    API_ROUTES.users.confirmEmailChange,
    payload,
  );
  return response.data;
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<ApiResponse<ChangePasswordResponse>> {
  const response = await axiosInstance.post<ChangePasswordResponse>(
    API_ROUTES.users.changePassword,
    payload,
  );
  return response.data;
}

export async function setPassword(
  payload: SetPasswordRequest,
): Promise<ApiResponse<SetPasswordResponse>> {
  const response = await axiosInstance.post<SetPasswordResponse>(
    API_ROUTES.users.setPassword,
    payload,
  );
  return response.data;
}

export async function uploadAvatar(file: File): Promise<ApiResponse<AvatarUploadResponse>> {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await axiosInstance.post<AvatarUploadResponse>(
    API_ROUTES.users.uploadAvatar,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

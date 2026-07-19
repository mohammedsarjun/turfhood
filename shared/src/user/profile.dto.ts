import type { PublicUser } from './types.js';

export interface UpdateNameRequest {
  name: string;
}

export interface UpdateNameResponse {
  user: PublicUser;
}

export interface UpdatePhoneRequest {
  phone: string;
}

export interface UpdatePhoneResponse {
  user: PublicUser;
}

export interface RequestEmailChangeRequest {
  newEmail: string;
}

export interface RequestEmailChangeResponse {
  message: string;
  expiresInSeconds: number;
}

export interface ConfirmEmailChangeRequest {
  otp: string;
}

export interface ConfirmEmailChangeResponse {
  message: string;
  user: PublicUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SetPasswordRequest {
  newPassword: string;
}

export interface SetPasswordResponse {
  message: string;
  user: PublicUser;
}

export interface AvatarUploadResponse {
  user: PublicUser;
}

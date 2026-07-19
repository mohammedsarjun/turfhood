export interface ChangePasswordRequestDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponseDTO {
  message: string;
}

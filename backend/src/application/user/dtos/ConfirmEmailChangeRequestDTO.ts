export interface ConfirmEmailChangeRequestDTO {
  userId: string;
  newEmail: string;
  otp: string;
}

export interface ConfirmEmailChangeResponseDTO {
  message: string;
}

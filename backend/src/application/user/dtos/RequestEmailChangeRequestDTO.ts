export interface RequestEmailChangeRequestDTO {
  userId: string;
  newEmail: string;
}

export interface RequestEmailChangeResponseDTO {
  message: string;
  expiresInSeconds: number;
  otpSessionToken: string;
}

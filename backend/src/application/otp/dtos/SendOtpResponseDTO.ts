export interface SendOtpResponseDTO {
  message: string;
  expiresInSeconds: number;
  /** Server-internal only — the controller consumes this to set the otpSession cookie and never returns it in the JSON body. */
  otpSessionToken: string;
}

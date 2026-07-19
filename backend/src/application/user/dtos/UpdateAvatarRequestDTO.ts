export interface UpdateAvatarRequestDTO {
  userId: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

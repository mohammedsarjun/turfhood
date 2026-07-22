export interface UploadAmenityIconRequestDTO {
  id: string;
  buffer: Buffer;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

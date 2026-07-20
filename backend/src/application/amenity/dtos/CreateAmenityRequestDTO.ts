export interface CreateAmenityRequestDTO {
  name: string;
  iconBuffer: Buffer;
  iconFilename: string;
  iconMimeType: string;
  iconSizeBytes: number;
}

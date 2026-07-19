import type { GoogleAuthRequestDTO } from '../dtos/GoogleAuthRequestDTO.js';
import type { GoogleAuthResponseDTO } from '../dtos/GoogleAuthResponseDTO.js';

export interface ILoginWithGoogleUseCase {
  execute(request: GoogleAuthRequestDTO): Promise<GoogleAuthResponseDTO>;
}

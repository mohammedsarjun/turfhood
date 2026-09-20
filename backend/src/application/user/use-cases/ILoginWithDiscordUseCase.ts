import type { DiscordAuthRequestDTO } from '../dtos/DiscordAuthRequestDTO.js';
import type { DiscordAuthResponseDTO } from '../dtos/DiscordAuthResponseDTO.js';

export interface ILoginWithDiscordUseCase {
  execute(request: DiscordAuthRequestDTO): Promise<DiscordAuthResponseDTO>;
}

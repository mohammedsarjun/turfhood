import type {
  ConfirmEmailChangeRequestDTO,
  ConfirmEmailChangeResponseDTO,
} from '../dtos/ConfirmEmailChangeRequestDTO.js';
import type { UserResponseDTO } from '../dtos/UserResponseDTO.js';

export interface IConfirmEmailChangeUseCase {
  execute(
    request: ConfirmEmailChangeRequestDTO,
  ): Promise<ConfirmEmailChangeResponseDTO & { user: UserResponseDTO }>;
}

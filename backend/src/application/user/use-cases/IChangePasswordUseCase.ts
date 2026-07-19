import type {
  ChangePasswordRequestDTO,
  ChangePasswordResponseDTO,
} from '../dtos/ChangePasswordRequestDTO.js';

export interface IChangePasswordUseCase {
  execute(request: ChangePasswordRequestDTO): Promise<ChangePasswordResponseDTO>;
}

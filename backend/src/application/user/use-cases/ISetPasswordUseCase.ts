import type {
  SetPasswordRequestDTO,
  SetPasswordResponseDTO,
} from '../dtos/SetPasswordRequestDTO.js';

export interface ISetPasswordUseCase {
  execute(request: SetPasswordRequestDTO): Promise<SetPasswordResponseDTO>;
}

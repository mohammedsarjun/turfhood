import type { SignUpResponseDTO } from '../dtos/SignUpResponseDTO.js';
import type { SignUpUserRequestDTO } from '../dtos/SignUpUserRequestDTO.js';

export interface ISignUpUserUseCase {
  execute(request: SignUpUserRequestDTO): Promise<SignUpResponseDTO>;
}

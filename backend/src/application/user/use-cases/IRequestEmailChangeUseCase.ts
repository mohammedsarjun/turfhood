import type {
  RequestEmailChangeRequestDTO,
  RequestEmailChangeResponseDTO,
} from '../dtos/RequestEmailChangeRequestDTO.js';

export interface IRequestEmailChangeUseCase {
  execute(request: RequestEmailChangeRequestDTO): Promise<RequestEmailChangeResponseDTO>;
}

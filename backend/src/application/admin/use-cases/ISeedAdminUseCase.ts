import type { SeedAdminRequestDTO } from '../dtos/SeedAdminRequestDTO.js';

export interface ISeedAdminUseCase {
  execute(request: SeedAdminRequestDTO): Promise<void>;
}

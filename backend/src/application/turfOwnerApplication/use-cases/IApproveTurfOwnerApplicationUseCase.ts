import type { TurfApplicationSummary } from '@turfhood/shared';

import type { ApproveTurfOwnerApplicationRequestDTO } from '../dtos/ApproveTurfOwnerApplicationRequestDTO.js';

export interface IApproveTurfOwnerApplicationUseCase {
  execute(request: ApproveTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary>;
}

import type { TurfApplicationSummary } from '@turfhood/shared';

import type { RejectTurfOwnerApplicationRequestDTO } from '../dtos/RejectTurfOwnerApplicationRequestDTO.js';

export interface IRejectTurfOwnerApplicationUseCase {
  execute(request: RejectTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary>;
}

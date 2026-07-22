import type { TurfApplicationSummary } from '@turfhood/shared';

import type { SubmitTurfOwnerApplicationRequestDTO } from '../dtos/SubmitTurfOwnerApplicationRequestDTO.js';

export interface ISubmitTurfOwnerApplicationUseCase {
  execute(request: SubmitTurfOwnerApplicationRequestDTO): Promise<TurfApplicationSummary>;
}

import type { TurfDetailResponse } from '@turfhood/shared';

export interface IGetTurfDetailsUseCase {
  execute(turfId: string, page: number, limit: number): Promise<TurfDetailResponse>;
}

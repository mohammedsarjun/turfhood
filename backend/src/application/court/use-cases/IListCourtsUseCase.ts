import type { ListCourtsResponse } from '@turfhood/shared';

export interface IListCourtsUseCase {
  execute(input: {
    portalTurfId: string;
    ownerId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<ListCourtsResponse>;
}

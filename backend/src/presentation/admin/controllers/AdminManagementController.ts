import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IManageAdminResourcesUseCase } from '@application/admin/use-cases/IManageAdminResourcesUseCase';
import { ADMIN_TOKENS } from '@domain/admin/tokens';
import { parsePagination } from '@presentation/shared/utils/pagination';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class AdminManagementController {
  constructor(
    @inject(ADMIN_TOKENS.ManagementUseCase)
    private readonly useCase: IManageAdminResourcesUseCase,
  ) {}

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query, 10, 50);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const result = await this.useCase.listUsers({ page, limit, ...(search ? { search } : {}) });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  suspendUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.useCase.suspendUser(
        req.params.id as string,
        String(req.body.reason ?? ''),
      );
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };

  unsuspendUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.useCase.unsuspendUser(req.params.id as string);
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };

  listTurfs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query, 10, 50);
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const result = await this.useCase.listTurfs({ page, limit, ...(search ? { search } : {}) });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  suspendTurf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const turf = await this.useCase.suspendTurf(
        req.params.id as string,
        String(req.body.reason ?? ''),
      );
      res.status(HttpStatus.OK).json({ turf });
    } catch (error) {
      next(error);
    }
  };

  unsuspendTurf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const turf = await this.useCase.unsuspendTurf(req.params.id as string);
      res.status(HttpStatus.OK).json({ turf });
    } catch (error) {
      next(error);
    }
  };
}

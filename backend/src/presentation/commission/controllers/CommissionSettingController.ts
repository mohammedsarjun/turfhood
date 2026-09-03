import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { updateCommissionSchema } from '@turfhood/shared';
import type { IManageCommissionSettingUseCase } from '@application/commission/use-cases/IManageCommissionSettingUseCase';
import { COMMISSION_TOKENS } from '@domain/commission/tokens';
import type { AdminAuthenticatedRequest } from '@presentation/admin/middlewares/adminOnly';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class CommissionSettingController {
  constructor(
    @inject(COMMISSION_TOKENS.UseCase)
    private readonly commission: IManageCommissionSettingUseCase,
  ) {}

  get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(HttpStatus.OK).json(await this.commission.get());
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = updateCommissionSchema.safeParse(req.body);
      if (!result.success) {
        res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid commission percentage.',
          errors: result.error.flatten().fieldErrors,
        });
        return;
      }
      const adminId = (req as AdminAuthenticatedRequest).admin!.userId;
      res.status(HttpStatus.OK).json(await this.commission.update(result.data.percentage, adminId));
    } catch (error) {
      next(error);
    }
  };
}

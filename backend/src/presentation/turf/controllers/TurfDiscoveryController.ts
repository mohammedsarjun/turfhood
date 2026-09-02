import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IListNearbyTurfsUseCase } from '@application/turf/use-cases/IListNearbyTurfsUseCase';
import type { IGetTurfDetailsUseCase } from '@application/turf/use-cases/IGetTurfDetailsUseCase';
import type { IGetPublicCourtDetailsUseCase } from '@application/court/use-cases/IGetPublicCourtDetailsUseCase';
import { COURT_TOKENS } from '@domain/court/tokens';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class TurfDiscoveryController {
  constructor(
    @inject(TURF_TOKENS.ListNearbyTurfsUseCase)
    private readonly listNearbyTurfs: IListNearbyTurfsUseCase,
    @inject(TURF_TOKENS.GetTurfDetailsUseCase)
    private readonly getTurfDetails: IGetTurfDetailsUseCase,
    @inject(COURT_TOKENS.GetPublicCourtDetailsUseCase)
    private readonly getPublicCourtDetails: IGetPublicCourtDetailsUseCase,
  ) {}
  nearby = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cityCode = String(req.query.cityCode ?? '').trim();
      const cityName = String(req.query.cityName ?? '').trim();
      const stateCode = String(req.query.stateCode ?? '').trim();
      const stateName = String(req.query.stateName ?? '').trim();
      if (!cityCode || !cityName || !stateCode || !stateName) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'City and state are required.' });
        return;
      }
      const requestedLimit = Number(req.query.limit ?? 4);
      const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 4;
      res.status(HttpStatus.OK).json({
        items: await this.listNearbyTurfs.execute(
          { cityCode, cityName, stateCode, stateName },
          limit,
        ),
      });
    } catch (error) {
      next(error);
    }
  };

  discover = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const number = (value: unknown) => {
        const parsed = value === undefined ? undefined : Number(value);
        return parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
      };
      const page = Math.max(1, number(req.query.page) ?? 1);
      const limit = Math.min(10, Math.max(1, number(req.query.limit) ?? 10));
      const latitude = number(req.query.latitude);
      const longitude = number(req.query.longitude);
      const minRating = number(req.query.minRating);
      const minPrice = number(req.query.minPrice);
      const maxPrice = number(req.query.maxPrice);
      const result = await this.listNearbyTurfs.discover({
        page,
        limit,
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ...(req.query.stateCode ? { stateCode: String(req.query.stateCode) } : {}),
        ...(req.query.stateName ? { stateName: String(req.query.stateName) } : {}),
        ...(req.query.cityCode ? { cityCode: String(req.query.cityCode) } : {}),
        ...(req.query.cityName ? { cityName: String(req.query.cityName) } : {}),
        ...(req.query.sportTypeId ? { sportTypeId: String(req.query.sportTypeId) } : {}),
        ...(req.query.amenityIds
          ? { amenityIds: String(req.query.amenityIds).split(',').filter(Boolean) }
          : {}),
        ...(minRating !== undefined ? { minRating } : {}),
        ...(minPrice !== undefined ? { minPrice } : {}),
        ...(maxPrice !== undefined ? { maxPrice } : {}),
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  details = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 6));
      res
        .status(HttpStatus.OK)
        .json(await this.getTurfDetails.execute(String(req.params.id), page, limit));
    } catch (error) {
      next(error);
    }
  };

  courtDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(HttpStatus.OK).json(
        await this.getPublicCourtDetails.execute(
          String(req.params.id),
          String(req.params.courtId),
        ),
      );
    } catch (error) {
      next(error);
    }
  };
}

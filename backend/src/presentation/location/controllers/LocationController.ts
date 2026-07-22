import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IListCitiesUseCase } from '@application/location/use-cases/IListCitiesUseCase';
import type { IListCountriesUseCase } from '@application/location/use-cases/IListCountriesUseCase';
import type { IListStatesUseCase } from '@application/location/use-cases/IListStatesUseCase';
import { LOCATION_TOKENS } from '@domain/location/tokens';
import { HttpStatus } from '@shared/constants/httpStatus';

/** Public, read-only country/state/city catalog — consumed by the turf-owner onboarding form. */
@injectable()
export class LocationController {
  constructor(
    @inject(LOCATION_TOKENS.ListCountriesUseCase)
    private readonly listCountriesUseCase: IListCountriesUseCase,
    @inject(LOCATION_TOKENS.ListStatesUseCase)
    private readonly listStatesUseCase: IListStatesUseCase,
    @inject(LOCATION_TOKENS.ListCitiesUseCase)
    private readonly listCitiesUseCase: IListCitiesUseCase,
  ) {}

  listCountries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const countries = await this.listCountriesUseCase.execute();
      res.status(HttpStatus.OK).json({ items: countries });
    } catch (error) {
      next(error);
    }
  };

  listStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const states = await this.listStatesUseCase.execute(req.params.countryCode as string);
      res.status(HttpStatus.OK).json({ items: states });
    } catch (error) {
      next(error);
    }
  };

  listCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cities = await this.listCitiesUseCase.execute(
        req.params.countryCode as string,
        req.params.stateCode as string,
      );
      res.status(HttpStatus.OK).json({ items: cities });
    } catch (error) {
      next(error);
    }
  };
}

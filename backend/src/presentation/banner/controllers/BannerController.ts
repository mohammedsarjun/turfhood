import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IManageBannersUseCase } from '@application/banner/use-cases/IManageBannersUseCase';
import { BANNER_TOKENS } from '@domain/banner/tokens';
import { HttpStatus } from '@shared/constants/httpStatus';

@injectable()
export class BannerController {
  constructor(
    @inject(BANNER_TOKENS.ManageBannersUseCase) private readonly banners: IManageBannersUseCase,
  ) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(HttpStatus.OK).json({ items: await this.banners.list() });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Banner image is required.' });
        return;
      }
      const item = await this.banners.create({
        title: String(req.body.title ?? ''),
        description: String(req.body.description ?? ''),
        image: {
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
      res.status(HttpStatus.CREATED).json({ item });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.banners.delete(String(req.params.id));
      if (!deleted) {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Banner not found.' });
        return;
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

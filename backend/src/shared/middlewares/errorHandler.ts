import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError.js';
import { HttpStatus } from '../constants/httpStatus.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json({ message: err.message, ...(err.code ? { code: err.code } : {}) });
    return;
  }
  console.error(err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong. Please try again later.' });
}

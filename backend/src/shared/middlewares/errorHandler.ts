import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, ...(err.code ? { code: err.code } : {}) });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
}

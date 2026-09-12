import type { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import type { ITurfRepository } from '@domain/turf/repositories/ITurfRepository';
import { TURF_TOKENS } from '@domain/turf/tokens';
import { TurfSuspendedError } from '@domain/turf/errors/TurfSuspendedError';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';

export async function blockSuspendedTurfOwnerAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const rawTurfId = req.params.turfId ?? req.params.id ?? req.baseUrl.match(/\/turf-portal\/([^/]+)/)?.[1];
    const turfId = Array.isArray(rawTurfId) ? rawTurfId[0] : rawTurfId;
    if (!userId || !turfId) {
      next();
      return;
    }
    const turfs = container.resolve<ITurfRepository>(TURF_TOKENS.TurfRepository);
    const turf = await turfs.findOwnedPortalByIdOrVerificationId(turfId, userId);
    if (turf?.status === 'suspended') {
      throw new TurfSuspendedError(turf.suspensionReason);
    }
    next();
  } catch (error) {
    next(error);
  }
}

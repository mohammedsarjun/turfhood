import 'reflect-metadata';
import { container } from './config/container.js';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import type { ISeedAdminUseCase } from './application/admin/use-cases/ISeedAdminUseCase.js';
import { ADMIN_TOKENS } from './domain/admin/tokens.js';
import type { IBookingRepository } from './domain/booking/repositories/IBookingRepository.js';
import { BOOKING_TOKENS } from './domain/booking/tokens.js';
import type { IManageBookingsUseCase } from './application/booking/use-cases/IManageBookingsUseCase.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const seedAdminUseCase = container.resolve<ISeedAdminUseCase>(ADMIN_TOKENS.SeedAdminUseCase);
  await seedAdminUseCase.execute({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  });

  const bookingRepository = container.resolve<IBookingRepository>(BOOKING_TOKENS.Repository);
  const cleanupTimer = setInterval(() => {
    const now = new Date();
    void Promise.all([
      bookingRepository.expirePending(now),
      bookingRepository.completePast(now),
    ]).catch((error: unknown) => {
      console.error('Unable to update booking statuses.', error);
    });
  }, 60_000);
  cleanupTimer.unref();

  const bookingUseCase = container.resolve<IManageBookingsUseCase>(BOOKING_TOKENS.UseCase);
  const reconcile = () => {
    void bookingUseCase.reconcileRefunds().catch((error: unknown) => {
      console.error('Unable to reconcile PayU refunds.', error);
    });
  };
  reconcile();
  const refundTimer = setInterval(reconcile, 5 * 60_000);
  refundTimer.unref();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap();

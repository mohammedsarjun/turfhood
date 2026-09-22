import 'reflect-metadata';
import http from 'node:http';
import { container } from './config/container.js';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import type { ISeedAdminUseCase } from './application/admin/use-cases/ISeedAdminUseCase.js';
import { ADMIN_TOKENS } from './domain/admin/tokens.js';
import type { IBookingRepository } from './domain/booking/repositories/IBookingRepository.js';
import { BOOKING_TOKENS } from './domain/booking/tokens.js';
import type { IManageBookingsUseCase } from './application/booking/use-cases/IManageBookingsUseCase.js';
import type { IManageOpenSessionsUseCase } from './application/openSession/use-cases/IManageOpenSessionsUseCase.js';
import { OPEN_SESSION_TOKENS } from './domain/openSession/tokens.js';
import type { IManageNotificationsUseCase } from './application/notification/use-cases/IManageNotificationsUseCase.js';
import { NOTIFICATION_TOKENS } from './domain/notification/tokens.js';
import { configureNotificationSocket } from './infrastructure/notification/socket.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const seedAdminUseCase = container.resolve<ISeedAdminUseCase>(ADMIN_TOKENS.SeedAdminUseCase);
  await seedAdminUseCase.execute({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  });
  const server = http.createServer(app);
  configureNotificationSocket(server);

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
  const openSessions = container.resolve<IManageOpenSessionsUseCase>(OPEN_SESSION_TOKENS.UseCase);
  const processOpenSessionDeadlines = () => {
    void openSessions.processDeadlines().catch((error: unknown) => {
      console.error('Unable to process open-session deadlines.', error);
    });
  };
  processOpenSessionDeadlines();
  const openSessionTimer = setInterval(processOpenSessionDeadlines, 60_000);
  openSessionTimer.unref();
  const notificationUseCase = container.resolve<IManageNotificationsUseCase>(
    NOTIFICATION_TOKENS.UseCase,
  );
  const processBookingReminders = () => {
    void notificationUseCase.notifyUpcomingBookingReminders().catch((error: unknown) => {
      console.error('Unable to send booking reminder notifications.', error);
    });
  };
  processBookingReminders();
  const notificationTimer = setInterval(processBookingReminders, 60_000);
  notificationTimer.unref();

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap();

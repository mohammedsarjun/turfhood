import 'reflect-metadata';
import { container } from './config/container.js';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import type { ISeedAdminUseCase } from './application/admin/use-cases/ISeedAdminUseCase.js';
import { ADMIN_TOKENS } from './domain/admin/tokens.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const seedAdminUseCase = container.resolve<ISeedAdminUseCase>(ADMIN_TOKENS.SeedAdminUseCase);
  await seedAdminUseCase.execute({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  });

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap();

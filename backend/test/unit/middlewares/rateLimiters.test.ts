import { expect } from 'chai';
import express, { type Express } from 'express';
import request from 'supertest';
import { createRateLimiter } from '../../../src/presentation/shared/middlewares/rateLimiters.js';
import { errorHandler } from '../../../src/shared/middlewares/errorHandler.js';

/**
 * Builds an isolated app with its own limiter instance so tests never share counters with
 * each other or with the real named limiters used by routes.
 */
function buildTestApp(limit: number): Express {
  const app = express();
  const limiter = createRateLimiter({ windowMs: 60_000, limit, message: 'Slow down.' });
  app.get('/limited', limiter, (_req, res) => res.status(200).json({ ok: true }));
  app.use(errorHandler);
  return app;
}

describe('rate limiter (createRateLimiter)', () => {
  // The limiter's `skip` check is NODE_ENV === 'test' (see rateLimiters.ts); flip it for the
  // duration of these tests only, since this test file needs the real enforcement path.
  const originalNodeEnv = process.env.NODE_ENV;
  before(() => {
    process.env.NODE_ENV = 'development';
  });
  after(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('allows requests up to the configured limit', async () => {
    const app = buildTestApp(3);

    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/limited');
      expect(response.status).to.equal(200);
    }
  });

  it('rejects the request once the limit is exceeded, with the shared error shape', async () => {
    const app = buildTestApp(2);

    await request(app).get('/limited');
    await request(app).get('/limited');
    const response = await request(app).get('/limited');

    expect(response.status).to.equal(429);
    expect(response.body).to.deep.equal({ message: 'Slow down.', code: 'TOO_MANY_REQUESTS' });
  });
});

import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import { describe } from 'mocha';
import { testEmailService } from '../setup.js';

const TEST_MONGODB_URI = 'mongodb://localhost:27017/turfhood_test';

describe('POST /api/users/login (integration)', () => {
  let app: Express;

  before(async function () {
    this.timeout(20000);

    process.env.MONGODB_URI = TEST_MONGODB_URI;
    process.env.JWT_SECRET = 'test-only-secret';

    await mongoose.connect(TEST_MONGODB_URI);

    const { container } = await import('../../src/config/container.js');
    const { OTP_TOKENS } = await import('../../src/domain/otp/tokens.js');
    // See otp.integration.test.ts: container.js always re-registers the real
    // ResendEmailService on import, so reapply the fake before app.js resolves it.
    container.register(OTP_TOKENS.EmailService, { useValue: testEmailService });

    app = (await import('../../src/app.js')).default;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
    // testEmailService is a process-wide singleton shared across every integration
    // test file — reset it so another file's earlier sends don't leak into this one.
    testEmailService.sentEmails.length = 0;
  });

  const payload = {
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    phone: '9123456780',
    password: 'password1',
  };

  // BRANCH UNDER TEST: a freshly-signed-up user is unverified by default —
  // login with correct credentials must not issue a token.
  it('responds 200 with status:needs_verification for an unverified user with correct credentials', async () => {
    await request(app).post('/api/users/signup').send(payload);

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: payload.password });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('needs_verification');
    expect(response.body.email).to.equal(payload.email);
    expect(response.body.accessToken).to.be.undefined;
  });

  // HAPPY PATH: once verified (via /api/otp/verify), the same credentials log in successfully.
  it('responds 200 with status:success and an access token once the user is verified', async () => {
    await request(app).post('/api/users/signup').send(payload);
    await request(app).post('/api/otp/send').send({ email: payload.email, purpose: 'signup' });

    const otp = testEmailService.sentEmails[testEmailService.sentEmails.length - 1]?.otp as string;
    await request(app).post('/api/otp/verify').send({ email: payload.email, otp, purpose: 'signup' });

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: payload.password });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.accessToken).to.be.a('string');
  });

  // REGRESSION: wrong password must still be rejected with 401.
  it('responds 401 for a wrong password', async () => {
    await request(app).post('/api/users/signup').send(payload);

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: 'wrong-password' });

    expect(response.status).to.equal(401);
  });
});

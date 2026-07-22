import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import { describe } from 'mocha';
import { testEmailService } from '../setup.js';

const TEST_MONGODB_URI = 'mongodb://localhost:27017/turfhood_test';

describe('GET /api/users/me (integration)', () => {
  let app: Express;

  before(async function () {
    this.timeout(20000);

    process.env.MONGODB_URI = TEST_MONGODB_URI;
    process.env.JWT_SECRET = 'test-only-secret';

    await mongoose.connect(TEST_MONGODB_URI);

    const { container } = await import('../../src/config/container.js');
    const { OTP_TOKENS } = await import('../../src/domain/otp/tokens.js');
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
    testEmailService.sentEmails.length = 0;
  });

  const payload = {
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    phone: '9123456780',
    password: 'password1',
  };

  async function signUpVerifyAndLogin(): Promise<string> {
    await request(app).post('/api/users/signup').send(payload);
    const agent = request.agent(app);
    await agent.post('/api/otp/send').send({ email: payload.email, purpose: 'signup' });
    const otp = testEmailService.sentEmails[testEmailService.sentEmails.length - 1]?.otp as string;
    await agent.post('/api/otp/verify').send({ otp });

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: payload.password });

    return loginResponse.body.accessToken as string;
  }

  // REGRESSION: no Authorization header and no cookie must be rejected before reaching the controller.
  it('responds 401 with no token', async () => {
    const response = await request(app).get('/api/users/me');

    expect(response.status).to.equal(401);
    expect(response.body.code).to.equal('TOKEN_MISSING');
  });

  // BRANCH UNDER TEST: a malformed/garbage token must be rejected as invalid.
  it('responds 401 for an invalid token', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer not-a-real-jwt');

    expect(response.status).to.equal(401);
    expect(response.body.code).to.equal('TOKEN_INVALID');
  });

  // HAPPY PATH: the token issued by a real login flow authenticates the request and returns the profile.
  it('responds 200 with the current user for a valid Bearer token', async () => {
    const accessToken = await signUpVerifyAndLogin();

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).to.equal(200);
    expect(response.body.email).to.equal(payload.email);
  });

  // REGRESSION: public routes must remain reachable with zero token/cookie at all.
  it('leaves POST /api/users/login reachable without any token', async () => {
    await request(app).post('/api/users/signup').send(payload);

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: payload.email, password: 'wrong-password' });

    // 401 here comes from InvalidCredentialsError, not TokenMissingError — proves
    // the request reached the controller instead of being rejected by auth middleware.
    expect(response.status).to.equal(401);
    expect(response.body.code).to.be.undefined;
  });
});

import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import { describe } from 'mocha';
import { testEmailService } from '../setup.js';

const TEST_MONGODB_URI = 'mongodb://localhost:27017/turfhood_test';

describe('POST /api/otp/* (integration)', () => {
  let app: Express;

  before(async function () {
    this.timeout(20000);

    process.env.MONGODB_URI = TEST_MONGODB_URI;
    process.env.JWT_SECRET = 'test-only-secret';

    await mongoose.connect(TEST_MONGODB_URI);

    const { container } = await import('../../src/config/container.js');
    const { OTP_TOKENS } = await import('../../src/domain/otp/tokens.js');
    // container.js's own module-level registration always binds the real
    // ResendEmailService — reapply the fake immediately before importing
    // app.js (which eagerly resolves OtpController) so this file's real
    // send never fires.
    container.register(OTP_TOKENS.EmailService, { useValue: testEmailService });

    app = (await import('../../src/app.js')).default;
    testEmailService.sentEmails.length = 0;
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

  async function signUp(email: string) {
    return request(app).post('/api/users/signup').send({
      name: 'Jordan Lee',
      email,
      phone: '9123456780',
      password: 'password1',
    });
  }

  it('sends a code and later verifies it, marking the user verified', async () => {
    await signUp('jordan@example.com');
    const agent = request.agent(app);

    const sendResponse = await agent
      .post('/api/otp/send')
      .send({ email: 'jordan@example.com', purpose: 'signup' });

    expect(sendResponse.status).to.equal(200);
    expect(sendResponse.body.expiresInSeconds).to.equal(60);
    expect(sendResponse.body.otpSessionToken).to.be.undefined;
    expect(testEmailService.sentEmails).to.have.length(1);

    const otp = testEmailService.sentEmails[0]?.otp as string;

    const verifyResponse = await agent.post('/api/otp/verify').send({ otp });

    expect(verifyResponse.status).to.equal(200);
    expect(verifyResponse.body.isVerified).to.equal(true);
    expect(verifyResponse.body.user.isVerified).to.equal(true);
    expect(verifyResponse.body.accessToken).to.be.a('string');
  });

  it('responds 401 when verifying without a pending otp session', async () => {
    const response = await request(app).post('/api/otp/verify').send({ otp: '123456' });

    expect(response.status).to.equal(401);
    expect(response.body.code).to.equal('OTP_SESSION_INVALID');
  });

  it('responds 400 with an OTP_INVALID code for a wrong OTP', async () => {
    await signUp('jordan@example.com');
    const agent = request.agent(app);
    await agent.post('/api/otp/send').send({ email: 'jordan@example.com', purpose: 'signup' });

    const response = await agent.post('/api/otp/verify').send({ otp: '000000' });

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('OTP_INVALID');
  });

  it('responds 400 with an OTP_EXPIRED code once the 60s window has passed', async () => {
    await signUp('jordan@example.com');
    const agent = request.agent(app);
    await agent.post('/api/otp/send').send({ email: 'jordan@example.com', purpose: 'signup' });
    const otp = testEmailService.sentEmails[0]?.otp as string;

    // Directly age the persisted record instead of a real 60s sleep.
    const { OtpModel } = await import('../../src/infrastructure/otp/models/OtpModel.js');
    await OtpModel.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1) } });

    const response = await agent.post('/api/otp/verify').send({ otp });

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('OTP_EXPIRED');
  });

  it('resend invalidates the previous code and issues a new one', async () => {
    await signUp('jordan@example.com');
    const agent = request.agent(app);
    await agent.post('/api/otp/send').send({ email: 'jordan@example.com', purpose: 'signup' });
    const firstOtp = testEmailService.sentEmails[0]?.otp as string;

    const resendResponse = await agent.post('/api/otp/resend').send();
    expect(resendResponse.status).to.equal(200);
    const secondOtp = testEmailService.sentEmails[1]?.otp as string;

    const verifyOldResponse = await agent.post('/api/otp/verify').send({ otp: firstOtp });
    expect(verifyOldResponse.status).to.equal(400);

    const verifyNewResponse = await agent.post('/api/otp/verify').send({ otp: secondOtp });
    expect(verifyNewResponse.status).to.equal(200);
  });

  it('GET /session returns the masked email and purpose for a pending otp session', async () => {
    await signUp('jordan@example.com');
    const agent = request.agent(app);
    await agent.post('/api/otp/send').send({ email: 'jordan@example.com', purpose: 'signup' });

    const response = await agent.get('/api/otp/session');

    expect(response.status).to.equal(200);
    expect(response.body.maskedEmail).to.equal('jo•••••@example.com');
    expect(response.body.purpose).to.equal('signup');
    expect(response.body.expiresAt).to.be.a('number');
  });

  it('GET /session responds 401 without a pending otp session', async () => {
    const response = await request(app).get('/api/otp/session');

    expect(response.status).to.equal(401);
  });
});

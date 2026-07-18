import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import type { Express } from 'express';
import { describe } from 'mocha';
import { testEmailService } from '../setup.js';

const TEST_MONGODB_URI = 'mongodb://localhost:27017/turfhood_test';

describe('POST /api/password-reset/* (integration)', () => {
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
    // app.js so this file's real send never fires.
    container.register(OTP_TOKENS.EmailService, { useValue: testEmailService });

    app = (await import('../../src/app.js')).default;
    testEmailService.sentPasswordResetEmails.length = 0;
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
    testEmailService.sentPasswordResetEmails.length = 0;
  });

  async function signUp(email: string) {
    return request(app).post('/api/users/signup').send({
      name: 'Jordan Lee',
      email,
      phone: '9123456780',
      password: 'password1',
    });
  }

  function extractToken(resetLink: string): string {
    return new URL(resetLink).searchParams.get('token') as string;
  }

  it('sends a generic response and a reset link, then resets the password with the token', async () => {
    await signUp('jordan@example.com');

    const requestResponse = await request(app)
      .post('/api/password-reset/request')
      .send({ email: 'jordan@example.com' });

    expect(requestResponse.status).to.equal(200);
    expect(requestResponse.body.message).to.equal(
      'If an account exists for this email, a password reset link has been sent.',
    );
    expect(testEmailService.sentPasswordResetEmails).to.have.length(1);

    const token = extractToken(testEmailService.sentPasswordResetEmails[0]?.resetLink as string);

    const resetResponse = await request(app)
      .post('/api/password-reset/reset')
      .send({ token, newPassword: 'newPassword1' });

    expect(resetResponse.status).to.equal(200);
    expect(resetResponse.body.message).to.equal('Password has been reset successfully.');

    // Old password no longer works; new password gets past the credential check
    // (still gated by needs_verification since the signed-up user is unverified).
    const oldPasswordLogin = await request(app)
      .post('/api/users/login')
      .send({ email: 'jordan@example.com', password: 'password1' });
    expect(oldPasswordLogin.status).to.equal(401);

    const newPasswordLogin = await request(app)
      .post('/api/users/login')
      .send({ email: 'jordan@example.com', password: 'newPassword1' });
    expect(newPasswordLogin.status).to.equal(200);
    expect(newPasswordLogin.body.status).to.equal('needs_verification');
  });

  it('returns the exact same generic response, with no email sent, for an unregistered email', async () => {
    const response = await request(app)
      .post('/api/password-reset/request')
      .send({ email: 'unknown@example.com' });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal(
      'If an account exists for this email, a password reset link has been sent.',
    );
    expect(testEmailService.sentPasswordResetEmails).to.have.length(0);
  });

  it('responds 400 with RESET_TOKEN_INVALID for a nonexistent token', async () => {
    const response = await request(app)
      .post('/api/password-reset/reset')
      .send({ token: 'not-a-real-token', newPassword: 'newPassword1' });

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal('RESET_TOKEN_INVALID');
  });

  it('responds 400 with RESET_TOKEN_ALREADY_USED when the same token is reused', async () => {
    await signUp('jordan@example.com');
    await request(app).post('/api/password-reset/request').send({ email: 'jordan@example.com' });
    const token = extractToken(testEmailService.sentPasswordResetEmails[0]?.resetLink as string);

    const firstReset = await request(app)
      .post('/api/password-reset/reset')
      .send({ token, newPassword: 'newPassword1' });
    expect(firstReset.status).to.equal(200);

    const secondReset = await request(app)
      .post('/api/password-reset/reset')
      .send({ token, newPassword: 'anotherPassword1' });

    expect(secondReset.status).to.equal(400);
    expect(secondReset.body.code).to.equal('RESET_TOKEN_ALREADY_USED');
  });
});

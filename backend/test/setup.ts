// tsyringe (the dependency-injection library used by the app's controllers
// and use cases) needs this polyfill loaded before anything else. Mocha
// loads this file first (see .mocharc.json).
import 'reflect-metadata';

import { container } from '../src/config/container.js';
import { OTP_TOKENS } from '../src/domain/otp/tokens.js';
import { FakeEmailService } from './mocks/FakeEmailService.js';

declare global {
  // eslint-disable-next-line no-var
  var __turfhubTestEmailService: FakeEmailService | undefined;
}

/**
 * Registered here — not inside individual integration test files — because
 * otp.routes.ts resolves OtpController (and its IEmailService dependency) at
 * module *import* time, and each integration test file's before() hook
 * re-imports the composition root (mocha's ESM spec loading re-evaluates
 * each spec file's module graph). Stashing the fake on `globalThis` (a true
 * process-wide singleton, unlike a module-level export which is re-created
 * on every re-evaluation) guarantees every test file's OtpController — and
 * every test file's assertions — reference the exact same instance, so no
 * integration test ever calls the real Resend API and every file can read
 * the emails another file's request actually triggered.
 */
export const testEmailService = globalThis.__turfhubTestEmailService ?? new FakeEmailService();
globalThis.__turfhubTestEmailService = testEmailService;

container.register(OTP_TOKENS.EmailService, { useValue: testEmailService });

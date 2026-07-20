// Must be set before any route module loads, since rate limiters (created at router
// construction time) read it to decide whether to enforce limits — see rateLimiters.ts.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// tsyringe (the dependency-injection library used by the app's controllers
// and use cases) needs this polyfill loaded before anything else. Mocha
// loads this file first (see .mocharc.json).
import 'reflect-metadata';

import { container } from '../src/config/container.js';
import { OTP_TOKENS } from '../src/domain/otp/tokens.js';
import { FakeEmailService } from './mocks/FakeEmailService.js';

declare global {
  // eslint-disable-next-line no-var
  var __turfhoodTestEmailService: FakeEmailService | undefined;
}

export const testEmailService = globalThis.__turfhoodTestEmailService ?? new FakeEmailService();
globalThis.__turfhoodTestEmailService = testEmailService;

container.register(OTP_TOKENS.EmailService, { useValue: testEmailService });

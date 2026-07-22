import { randomBytes, createHash } from 'node:crypto';

import { injectable } from 'tsyringe';
import type { IPasswordResetTokenService } from '@domain/passwordReset/services/IPasswordResetTokenService';

const TOKEN_BYTES = 32;

@injectable()
export class PasswordResetTokenService implements IPasswordResetTokenService {
  generateToken(): string {
    return randomBytes(TOKEN_BYTES).toString('hex');
  }

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}

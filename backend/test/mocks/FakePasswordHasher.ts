import type { IPasswordHasher } from '../../src/domain/user/services/IPasswordHasher.js';

/**
 * Fake stand-in for the real bcrypt-backed hasher. Real hashing is slow and
 * its exact output doesn't matter for unit tests — only that *something*
 * gets passed along as the password hash.
 */
export class FakePasswordHasher implements IPasswordHasher {
  constructor(private readonly compareResult: boolean = true) {}

  async hash(plainPassword: string): Promise<string> {
    return `hashed-${plainPassword}`;
  }

  async compare(): Promise<boolean> {
    return this.compareResult;
  }
}

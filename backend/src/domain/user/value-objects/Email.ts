import { InvalidEmailError } from '../errors/InvalidEmailError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validated, normalized (lowercased/trimmed) email address. */
export class Email {
  private constructor(private readonly value: string) {}

  static create(rawEmail: string): Email {
    const normalized = rawEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailError(rawEmail);
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

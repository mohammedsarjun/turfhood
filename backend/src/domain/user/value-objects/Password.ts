import { WeakPasswordError } from '../errors/WeakPasswordError.js';

const MIN_LENGTH = 8;
const HAS_LETTER = /[A-Za-z]/;
const HAS_NUMBER = /[0-9]/;


export class Password {
  private constructor(private readonly value: string) {}

  static create(rawPassword: string): Password {
    if (rawPassword.length < MIN_LENGTH) {
      throw new WeakPasswordError(`Password must be at least ${MIN_LENGTH} characters long.`);
    }
    if (!HAS_LETTER.test(rawPassword) || !HAS_NUMBER.test(rawPassword)) {
      throw new WeakPasswordError('Password must contain at least one letter and one number.');
    }
    return new Password(rawPassword);
  }

  getPlainValue(): string {
    return this.value;
  }
}

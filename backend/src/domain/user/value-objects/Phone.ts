import { InvalidPhoneError } from '../errors/InvalidPhoneError.js';

const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

/** Validated, normalized (stripped of spaces/dashes) phone number. */
export class Phone {
  private constructor(private readonly value: string) {}

  static create(rawPhone: string): Phone {
    const normalized = rawPhone.trim().replace(/[\s-]/g, '');
    if (!PHONE_PATTERN.test(normalized)) {
      throw new InvalidPhoneError(rawPhone);
    }
    return new Phone(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}

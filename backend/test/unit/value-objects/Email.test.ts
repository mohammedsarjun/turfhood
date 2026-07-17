// This file tests the `Email` value object — a small class whose only job
// is to make sure an email address is valid before the rest of the app trusts it.
import { expect } from 'chai';
import { Email } from '../../../src/domain/user/value-objects/Email.js';
import { InvalidEmailError } from '../../../src/domain/user/errors/InvalidEmailError.js';

describe('Email value object', () => {
  // HAPPY PATH: valid input, we expect it to succeed.
  it('accepts a valid email and normalizes it to lowercase (happy path)', () => {
    const email = Email.create('User@Example.com');

    expect(email.toString()).to.equal('user@example.com');
  });

  // ERROR CASE: invalid input, we expect it to fail loudly instead of
  // silently accepting bad data.
  it('throws InvalidEmailError when the email has no "@" (error case)', () => {
    expect(() => Email.create('not-an-email')).to.throw(InvalidEmailError);
  });
});

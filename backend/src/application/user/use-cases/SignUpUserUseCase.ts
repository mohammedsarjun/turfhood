import { inject, injectable } from 'tsyringe';
import { SendOtpUseCase } from '@application/otp/use-cases/SendOtpUseCase';
import { User } from '@domain/user/entities/User';
import { DuplicateEmailError } from '@domain/user/errors/DuplicateEmailError';
import { DuplicatePhoneError } from '@domain/user/errors/DuplicatePhoneError';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import { USER_TOKENS } from '@domain/user/tokens';
import { Email } from '@domain/user/value-objects/Email';
import { Password } from '@domain/user/value-objects/Password';
import { Phone } from '@domain/user/value-objects/Phone';

import type { ISignUpUserUseCase } from './ISignUpUserUseCase.js';
import type { SignUpResponseDTO } from '../dtos/SignUpResponseDTO.js';
import type { SignUpUserRequestDTO } from '../dtos/SignUpUserRequestDTO.js';
import { toUserResponseDTO } from '../mappers/toUserResponseDTO.js';

/** Orchestrates new-user registration: validates invariants, hashes the password, persists the user, and sends the signup OTP. */
@injectable()
export class SignUpUserUseCase implements ISignUpUserUseCase {
  constructor(
    @inject(USER_TOKENS.UserRepository) private readonly userRepository: IUserRepository,
    @inject(USER_TOKENS.PasswordHasher) private readonly passwordHasher: IPasswordHasher,
    @inject(SendOtpUseCase) private readonly sendOtpUseCase: SendOtpUseCase,
  ) {}

  async execute(request: SignUpUserRequestDTO): Promise<SignUpResponseDTO> {
    const email = Email.create(request.email);
    const phone = Phone.create(request.phone);
    const password = Password.create(request.password);

    const existingEmailUser = await this.userRepository.findByEmail(email);
    if (existingEmailUser) {
      throw new DuplicateEmailError(email.toString());
    }

    const existingPhoneUser = await this.userRepository.findByPhone(phone);
    if (existingPhoneUser) {
      throw new DuplicatePhoneError(phone.toString());
    }

    const passwordHash = await this.passwordHasher.hash(password.getPlainValue());
    const newUser = User.register({ name: request.name.trim(), email, phone, passwordHash });
    const createdUser = await this.userRepository.create(newUser);

    const { expiresInSeconds } = await this.sendOtpUseCase.execute({
      email: email.toString(),
      purpose: 'signup',
    });

    return { user: toUserResponseDTO(createdUser), expiresInSeconds };
  }
}

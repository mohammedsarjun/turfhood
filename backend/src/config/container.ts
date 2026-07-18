import 'reflect-metadata';
import { container } from 'tsyringe';
import type { IUserRepository } from '@domain/user/repositories/IUserRepository';
import type { IPasswordHasher } from '@domain/user/services/IPasswordHasher';
import type { ITokenService } from '@domain/user/services/ITokenService';
import { USER_TOKENS } from '@domain/user/tokens';
import { UserRepository } from '@infrastructure/user/repositories/UserRepository';
import { BcryptPasswordHasher } from '@infrastructure/user/services/BcryptPasswordHasher';
import { JwtTokenService } from '@infrastructure/user/services/JwtTokenService';
import type { IOtpRepository } from '@domain/otp/repositories/IOtpRepository';
import type { IOtpService } from '@domain/otp/services/IOtpService';
import type { IEmailService } from '@domain/otp/services/IEmailService';
import { OTP_TOKENS } from '@domain/otp/tokens';
import { OtpRepository } from '@infrastructure/otp/repositories/OtpRepository';
import { OtpService } from '@infrastructure/otp/services/OtpService';
import { ResendEmailService } from '@infrastructure/otp/services/ResendEmailService';

/** Composition root — wires domain interfaces to their infrastructure implementations. */
container.register<IUserRepository>(USER_TOKENS.UserRepository, { useClass: UserRepository });
container.register<IPasswordHasher>(USER_TOKENS.PasswordHasher, { useClass: BcryptPasswordHasher });
container.register<ITokenService>(USER_TOKENS.TokenService, { useClass: JwtTokenService });
container.register<IOtpRepository>(OTP_TOKENS.OtpRepository, { useClass: OtpRepository });
container.register<IOtpService>(OTP_TOKENS.OtpService, { useClass: OtpService });
container.register<IEmailService>(OTP_TOKENS.EmailService, { useClass: ResendEmailService });

export { container };

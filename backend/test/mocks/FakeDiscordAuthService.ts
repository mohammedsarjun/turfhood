import type {
  DiscordProfile,
  IDiscordAuthService,
} from '../../src/domain/user/services/IDiscordAuthService.js';
import { DiscordTokenInvalidError } from '../../src/domain/user/errors/DiscordTokenInvalidError.js';

export class FakeDiscordAuthService implements IDiscordAuthService {
  constructor(private readonly profile: DiscordProfile | null) {}

  async verifyAndGetProfile(): Promise<DiscordProfile> {
    if (!this.profile) {
      throw new DiscordTokenInvalidError();
    }
    return this.profile;
  }
}

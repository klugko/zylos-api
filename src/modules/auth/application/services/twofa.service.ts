import { Inject, Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '@modules/auth/domain/interfaces/auth-repository.interface';

@Injectable()
export class TwoFAService {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async generateTwoFASecret(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('APP_NAME', 'Zylos AI');
    const otpauthUrl = authenticator.keyuri(email, appName, secret);
    
    await this.authRepo.updateTwoFASecret(userId, secret);
    
    return {
      secret,
      qrCodeUrl: await toDataURL(otpauthUrl),
    };
  }

  async verifyTwoFACode(userId: string, code: string): Promise<boolean> {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.twoFASecret) {
      return false;
    }
    
    return authenticator.verify({
      token: code,
      secret: user.twoFASecret,
    });
  }

  async disableTwoFA(userId: string): Promise<void> {
    await this.authRepo.updateTwoFASecret(userId, null);
  }
}
import { CryptoService } from '@core/crypto/crypto.service';
import { MailService } from '@core/mail/mail.service';
import { AuthRepository } from '@modules/auth/domain/interfaces/auth-repository.interface';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class PasswordResetUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly mailService: MailService,
    private readonly cryptoService: CryptoService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      return;
    }
  
    const resetToken = this.cryptoService.generateRandomToken(32);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
    await this.authRepo.updateResetToken(user.id, resetToken, resetTokenExpiry);
  
    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetToken, user.fullname);
    } catch (err) {
      await this.authRepo.clearResetToken(user.id);
      throw err;
    }
  }
  

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.authRepo.findByResetToken(token);
    
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const hashedPassword = await this.cryptoService.hashPassword(newPassword);
    
    await this.authRepo.updatePassword(user.id, hashedPassword);
    await this.authRepo.clearResetToken(user.id);
  }
}
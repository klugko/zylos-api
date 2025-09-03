import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });
    
  }

  async sendPasswordResetEmail(email: string, token: string, fullname: string): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL')}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('SUPPORT_EMAIL'),
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Zylos AI',
      html: `
        <p>Bonjour ${fullname},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de reset envoyé à ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email reset à ${email}`, error.stack);
      throw new InternalServerErrorException('Impossible d’envoyer l’email de réinitialisation');
    }
  }
}

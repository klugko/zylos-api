import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendReminderEmail(email: string, subject: string, body: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        html: `<p>${body}</p>`,
      });

      this.logger.log(`✅ Email envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email à ${email}: ${error.message}`);
    }
  }
}

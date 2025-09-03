import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { CryptoService } from './crypto/crypto.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailService, CryptoService],
  exports: [MailService, CryptoService],
})
export class CoreModule {}
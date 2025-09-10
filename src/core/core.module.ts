import { Module } from "@nestjs/common";
import { MailService } from "./mail/mail.service";
import { CryptoService } from "./crypto/crypto.service";
import { ConfigModule } from "@nestjs/config";
import { GoogleOAuthValidator } from "./config/google-oauth.validator";

@Module({
  imports: [ConfigModule],
  providers: [MailService, CryptoService, GoogleOAuthValidator],
  exports: [MailService, CryptoService, GoogleOAuthValidator],
})
export class CoreModule {}

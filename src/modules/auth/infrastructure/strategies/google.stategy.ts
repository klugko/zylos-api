import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleAuthUseCase } from "../../application/use-cases/google-auth.use-case";
import { GoogleOAuthValidator } from "@core/config/google-oauth.validator";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private readonly useCase: GoogleAuthUseCase,
    private readonly configService: ConfigService,
    private readonly validator: GoogleOAuthValidator
  ) {
    validator.validateGoogleOAuthConfig();

    super({
      clientID: configService.get<string>("oauth.google.clientId"),
      clientSecret: configService.get<string>("oauth.google.clientSecret"),
      callbackURL: configService.get<string>("oauth.google.callbackURL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function
  ): Promise<any> {
    const result = await this.useCase.execute({
      email: profile.emails[0].value,
      fullname: profile.displayName,
      googleId: profile.id,
      avatar: profile.photos?.[0]?.value,
    });

    done(null, result);
  }
}

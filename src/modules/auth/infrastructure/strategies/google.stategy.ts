import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { GoogleAuthUseCase } from '../../application/use-cases/google-auth.use-case';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly useCase: GoogleAuthUseCase) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const result = await this.useCase.execute({
      email: profile.emails[0].value,
      fullname: profile.displayName,
      googleId: profile.id,
      avatar: profile.photos?.[0]?.value,
    });

    done(null, result);
  }
}

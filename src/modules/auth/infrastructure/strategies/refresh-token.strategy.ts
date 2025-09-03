import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  tokenType: 'refresh';
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.refreshToken;
        },
        ExtractJwt.fromBodyField('refreshToken'),
        ExtractJwt.fromHeader('x-refresh-token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret-fallback',
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any): Promise<User> {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const token = ExtractJwt.fromExtractors([
      (req) => req.cookies?.refreshToken,
      ExtractJwt.fromBodyField('refreshToken'),
      ExtractJwt.fromHeader('x-refresh-token'),
    ])(request);

    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (await this.authRepo.isRefreshTokenRevoked(token)) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const user = await this.authRepo.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }
    
    return user;
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { Inject } from '@nestjs/common';
import { User } from '@modules/auth/domain/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<User> {
    const user = await this.authRepo.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
  
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }
  
    if (user.passwordChangedAt && payload.iat && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
      throw new UnauthorizedException('Token expiré après changement de mot de passe');
    }
  
    return user;
  }
  
}
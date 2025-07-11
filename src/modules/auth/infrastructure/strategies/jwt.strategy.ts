import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { Inject } from '@nestjs/common';
import { User } from '@modules/auth/domain/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.authRepo.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }
    
    return user;
  }
}
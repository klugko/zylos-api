import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { GoogleTokenService } from '../services/google-token.service';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ActivityLoggerService } from '@modules/activity-log/application/services/activity-logger.service';
import { ActivityAction } from '@modules/activity-log/domain/enums/activity.enums';

type Result = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullname: string;
    role: UserRole;
    isActive: boolean;
    avatarUrl?: string;
    googleId?: string;
  };
};

@Injectable()
export class LoginWithGoogleIdTokenUseCase {
  constructor(
    private readonly googleTokenService: GoogleTokenService,
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  /**
   * - Vérifie l'ID token Google
   * - Récupère l'utilisateur par googleId ou email
   * - Lie/Crée le compte si besoin
   * - Marque emailVerified=true
   * - Retourne notre accessToken + infos user
   */
  async execute(googleIdToken: string, expectedNonce?: string, ipAddress?: string, userAgent?: string): Promise<Result> {
    const payload = await this.googleTokenService.verifyIdToken(googleIdToken, expectedNonce);

    const googleId = payload.sub!;
    const email = payload.email!;
    const fullname = payload.name ?? email.split('@')[0];
    const avatarUrl = payload.picture ?? undefined;

    let user = await this.authRepo.findByGoogleId(googleId);

    if (!user) {
      const byEmail = await this.authRepo.findByEmail(email);
      if (byEmail) {
        if (!byEmail.isActive) throw new ForbiddenException('User account is deactivated');
        byEmail.googleId = googleId;
        byEmail.emailVerified = true;
        if (!byEmail.fullname) byEmail.fullname = fullname;
        if (!byEmail.avatarUrl && avatarUrl) byEmail.avatarUrl = avatarUrl;
        user = await this.authRepo.update(byEmail);
      }
    }

    if (!user) {
      const now = new Date();
      user = new User(
        uuidv4(),          // id
        fullname,          // fullname
        email,             // email
        undefined,         // password (non utilisé pour Google)
        UserRole.USER,     // role par défaut
        true,              // isActive
        now,               // createdAt
        now,               // updatedAt
        [],                // skills
        100,               // availability (par défaut)
        0,                 // performanceScore (par défaut)
        googleId,          // googleId
        avatarUrl,         // avatarUrl
        undefined,         // phone
        undefined,         // poste
        undefined,         // twoFASecret
        false,             // isTwoFAEnabled
        undefined,         // resetToken
        undefined,         // resetTokenExpiry
        undefined,         // passwordChangedAt
        true,              // emailVerified
        undefined,         // emailVerificationToken
        undefined          // emailVerificationExpiry
      );

      user = await this.authRepo.create(user);
    }

    if (!user.isActive) throw new ForbiddenException('User account is deactivated');

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.activityLogger.logUserAction(
      user.id,
      ActivityAction.USER_LOGGED_IN,
      `Connexion Google de ${user.fullname}`,
      `L'utilisateur s'est connecté via Google`,
      {
        email: user.email,
        role: user.role,
        loginMethod: 'google',
      },
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
        googleId: user.googleId,
      },
    };
  }
}

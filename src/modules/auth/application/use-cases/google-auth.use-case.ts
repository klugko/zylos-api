import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaAuthRepository } from "../../infrastructure/repositories/prisma-auth.repository";
import { User } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/enums/user-role.enum";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("AuthRepository") private readonly repository: PrismaAuthRepository,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    profile: {
      email: string;
      fullname: string;
      googleId: string;
      avatar?: string;
    },
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; accessToken: string }> {
    let user = await this.repository.findByEmail(profile.email);
    const isNewUser = !user;

    user ??= await this.repository.create(
      new User(
        crypto.randomUUID(),
        profile.fullname,
        profile.email,
        undefined,
        UserRole.USER,
        true,
        new Date(),
        new Date(),
        [],
        0,
        0,
        profile.googleId
      )
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    if (isNewUser) {
      await this.activityLogger.logUserAction(
        user.id,
        ActivityAction.USER_REGISTERED,
        `Inscription de ${user.fullname}`,
        `Nouvel utilisateur inscrit via Google`,
        {
          email: user.email,
          role: user.role,
          loginMethod: "google",
          googleId: profile.googleId,
        },
        ipAddress,
        userAgent
      );
    }

    await this.activityLogger.logUserAction(
      user.id,
      ActivityAction.USER_LOGGED_IN,
      `Connexion de ${user.fullname}`,
      `L'utilisateur s'est connecté via Google`,
      {
        email: user.email,
        role: user.role,
        loginMethod: "google",
        googleId: profile.googleId,
      },
      ipAddress,
      userAgent
    );

    return { user, accessToken: token };
  }
}

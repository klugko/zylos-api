import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { LoginDto } from "../dto/login.dto";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string }> {
    const user = await this.authRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (!user.isActive) {
      throw new ForbiddenException("User account is deactivated");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.activityLogger.logUserAction(
      user.id,
      ActivityAction.USER_LOGGED_IN,
      `Connexion de ${user.fullname}`,
      `L'utilisateur s'est connecté avec succès`,
      {
        email: user.email,
        role: user.role,
        loginMethod: "email_password",
      },
      ipAddress,
      userAgent
    );

    return { accessToken: token };
  }
}

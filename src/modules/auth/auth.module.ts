import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PrismaModule } from "../../core/prisma/prisma.module";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { GoogleAuthUseCase } from "./application/use-cases/google-auth.use-case";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { ActivateUserUseCase } from "./application/use-cases/activate-user.use-case";
import { DeactivateUserUseCase } from "./application/use-cases/deactivate-user.use-case";
import { PrismaAuthRepository } from "./infrastructure/repositories/prisma-auth.repository";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { GoogleStrategy } from "./infrastructure/strategies/google.stategy";
import { JwtAuthGuard } from "./infrastructure/strategies/jwt-auth.guard";
import { RefreshTokenStrategy } from "./infrastructure/strategies/refresh-token.strategy";
import { RolesGuard } from "./application/decorators/role.guard";
import { PasswordResetUseCase } from "./application/use-cases/password-reset.use-case";
import { TwoFAService } from "./application/services/twofa.service";
import { OtpService } from "./application/services/otp.service";
import { CoreModule } from "@core/core.module";
import { GetUsersUseCase } from "./application/use-cases/get-users.use-case";
import { InvitationMailService } from "./infrastructure/strategies/invitation-mail.service";
import { InvitationController } from "./infrastructure/controllers/invitation.controller";
import { InvitationService } from "./infrastructure/strategies/invitation.service";
import { InvitationRepositoryPrisma } from "./infrastructure/repositories/prisma-invitation.repository";
import { EmailVerificationController } from "./infrastructure/controllers/email-verification.controller";
import { EmailVerificationService } from "./application/services/email-verification.service";
import { SendEmailVerificationUseCase } from "./application/use-cases/send-email-verification.use-case";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case";
import { PrismaEmailVerificationRepository } from "./infrastructure/repositories/prisma-email-verification.repository";
import { LoginWithOtpUseCase } from "./application/use-cases/login-with-otp.use-case";
import { OtpController } from "./infrastructure/controllers/otp.controller";
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UpdateAvatarUseCase } from './application/use-cases/update-avatar.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { AvatarStorageService } from './infrastructure/services/avatar-storage.service';
import { UploadCvUseCase } from './application/use-cases/upload-cv.use-case';
import { SkillExtractionService } from './infrastructure/services/skill-extraction.service';
import { OpenAIService } from '../../shared/ai/openai.service';
import { CvTextExtractorService } from './infrastructure/services/cv-text-extractor.service';
import { CvFileStorageService } from './infrastructure/services/cv-file-storage.service';
import { SkillTaxonomyService } from './infrastructure/services/skill-taxonomy.service';
import { SkillScoringService } from './infrastructure/services/skill-scoring.service';
import { UserScoringService } from './infrastructure/services/user-scoring.service';
import { UserSkillRepository } from './infrastructure/repositories/user-skill.repository';
import { UserScoreRepository } from './infrastructure/repositories/user-score.repository';
import { UserResumeRepository } from './infrastructure/repositories/user-resume.repository';
import { GetUserScoreUseCase } from './application/use-cases/get-user-score.use-case';
import { GetSkillSummaryUseCase } from './application/use-cases/get-skill-summary.use-case';
import { ManualDescriptionUseCase } from './application/use-cases/manual-description.use-case';

@Module({
  imports: [
    CoreModule,
    PrismaModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1h"),
          issuer: "zylos.ai",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    InvitationController,
    EmailVerificationController,
    OtpController,
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    GoogleStrategy,
    GoogleAuthUseCase,
    LoginUseCase,
    RegisterUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    PasswordResetUseCase,
    GetUsersUseCase,
    TwoFAService,
    OtpService,
    LoginWithOtpUseCase,
    RefreshTokenStrategy,
    InvitationService,
    InvitationMailService,
    InvitationRepositoryPrisma,
    EmailVerificationService,
    SendEmailVerificationUseCase,
    VerifyEmailUseCase,
    PrismaEmailVerificationRepository,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateAvatarUseCase,
    UpdateProfileUseCase,
    AvatarStorageService,
    UploadCvUseCase,
    SkillExtractionService,
    OpenAIService,
    CvTextExtractorService,
    CvFileStorageService,
    SkillTaxonomyService,
    SkillScoringService,
    UserScoringService,
    UserSkillRepository,
    UserScoreRepository,
    UserResumeRepository,
    GetUserScoreUseCase,
    GetSkillSummaryUseCase,
    ManualDescriptionUseCase,
    {
      provide: "AuthRepository",
      useClass: PrismaAuthRepository,
    },
    {
      provide: "EmailVerificationRepository",
      useClass: PrismaEmailVerificationRepository,
    },
  ],
  exports: [
    PassportModule,
    JwtModule,
    "AuthRepository",
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthUseCase,
    LoginUseCase,
    RegisterUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    PasswordResetUseCase,
    TwoFAService,
    OtpService,
    LoginWithOtpUseCase,
    InvitationService,
    InvitationMailService,
    EmailVerificationService,
    SendEmailVerificationUseCase,
    VerifyEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateAvatarUseCase,
    UpdateProfileUseCase,
    AvatarStorageService,
    UploadCvUseCase,
    SkillExtractionService,
    SkillTaxonomyService,
    SkillScoringService,
    UserScoringService,
    UserSkillRepository,
    UserScoreRepository,
    UserResumeRepository,
    GetUserScoreUseCase,
    GetSkillSummaryUseCase,
    ManualDescriptionUseCase,
  ],
})
export class AuthModule {}

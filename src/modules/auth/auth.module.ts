import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ActivateUserUseCase } from './application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.stategy';
import { JwtAuthGuard } from './infrastructure/strategies/jwt-auth.guard';
import { RefreshTokenStrategy } from './infrastructure/strategies/refresh-token.strategy';
import { RolesGuard } from './application/decorators/role.guard';
import { PasswordResetUseCase } from './application/use-cases/password-reset.use-case';
import { TwoFAService } from './application/services/twofa.service';
import { CoreModule } from '@core/core.module';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { InvitationMailService } from './infrastructure/strategies/invitation-mail.service';
import { InvitationController } from './infrastructure/controllers/invitation.controller';
import { InvitationService } from './infrastructure/strategies/invitation.service';
import { InvitationRepositoryPrisma } from './infrastructure/repositories/prisma-invitation.repository';


@Module({
  imports: [
    CoreModule,
    PrismaModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: 'zylos.ai'
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, InvitationController],
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
    RefreshTokenStrategy,
    InvitationService,
    InvitationMailService,
    InvitationRepositoryPrisma,
    {
      provide: 'AuthRepository',
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [
    PassportModule,
    JwtModule,
    'AuthRepository',
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthUseCase,
    LoginUseCase,
    RegisterUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    PasswordResetUseCase,
    TwoFAService,
    InvitationService,
    InvitationMailService,
  ],
})
export class AuthModule {}
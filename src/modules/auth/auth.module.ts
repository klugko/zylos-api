import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
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

/**
 * @module AuthModule
 * @description Module dédié à la gestion de l'authentification et de l'autorisation.
 * Il centralise la configuration de Passport, JWT, et les logiques métiers d'authentification.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    GoogleStrategy,
    GoogleAuthUseCase,
    LoginUseCase,
    RegisterUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    {
      provide: 'AuthRepository',
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [
    PassportModule,
    JwtModule,
    'AuthRepository',
    GoogleAuthUseCase,
    LoginUseCase,
    RegisterUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
  ],
})
export class AuthModule {}

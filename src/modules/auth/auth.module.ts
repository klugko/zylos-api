import { Module } from '@nestjs/common';
import { PrismaService } from './../../core/prisma/prisma.service';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ActivateUserUseCase } from './application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './infrastructure/strategies/google.stategy';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';



@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    PrismaAuthRepository,
    RegisterUseCase,
    LoginUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    GoogleStrategy,
    GoogleAuthUseCase,
    { provide: 'AuthRepository', useExisting: PrismaAuthRepository },
  ],
  exports: ['AuthRepository'],
})
export class AuthModule {}

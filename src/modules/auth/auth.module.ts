import { Module } from '@nestjs/common';
import { PrismaService } from './../../core/prisma/prisma.service';
import { PrismaAuthRepository } from './infrastructure/repositories/prisma-auth.repository';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { ActivateUserUseCase } from './application/use-cases/activate-user.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';


@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    PrismaAuthRepository,
    RegisterUseCase,
    LoginUseCase,
    ActivateUserUseCase,
    DeactivateUserUseCase,
    { provide: 'AuthRepository', useExisting: PrismaAuthRepository },
  ],
  exports: ['AuthRepository'],
})
export class AuthModule {}

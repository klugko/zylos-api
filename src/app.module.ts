import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { ProjectManagementModule } from './modules/project-management/project-management.module';
import { AuthModule } from './modules/auth/auth.module';
import { RagModule } from './rag/rag.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectManagementModule,
    RagModule,
  ],
  controllers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { ProjectManagementModule } from './modules/project-management/project-management.module';
import { AuthModule } from './modules/auth/auth.module';
import { RagModule } from './rag/rag.module';
import { DocumentModule } from '@modules/document-management/document.module';
import { CollaborationModule } from '@modules/collaboration/collaboration.module';
// import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectManagementModule,
    RagModule,
    DocumentModule,
    CollaborationModule,
    // ScheduleModule.forRoot(),
  ],
  controllers: [],
})
export class AppModule {}

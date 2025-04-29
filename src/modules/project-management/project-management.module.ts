import { Module } from '@nestjs/common';
import { ProjectController } from './infrastructure/controllers/project.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
import { PrismaService } from '../../core/prisma/prisma.service';


@Module({
  controllers: [ProjectController],
  providers: [
    PrismaService,
    CreateProjectUseCase,
    PrismaProjectRepository,
    {
      provide: 'ProjectRepository',
      useExisting: PrismaProjectRepository,
    },
  ],
  exports: ['ProjectRepository'],
})
export class ProjectManagementModule {}

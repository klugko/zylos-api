import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './core/prisma/prisma.module';
import { AppService } from './app.service';
import { ProjectManagementModule } from './modules/project-management/project-management.module';


@Module({
  imports: [
    PrismaModule,
    ProjectManagementModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

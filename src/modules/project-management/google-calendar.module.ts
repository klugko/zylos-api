import { Module } from "@nestjs/common";
import { GoogleCalendarService } from "@modules/project-management/application/use-cases/google-calendar.service";
import { GoogleCalendarController } from "@modules/project-management/infrastructure/controllers/google-calendar.controller";

@Module({
  providers: [GoogleCalendarService],
  controllers: [GoogleCalendarController],
})
export class GoogleCalendarModule {}

import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GoogleCalendarService } from "@modules/project-management/application/use-cases/google-calendar.service";
import { GoogleAuthDto } from "@modules/project-management/application/dto/google-auth.dto";
import { WatchCalendarDto } from "@modules/project-management/application/dto/watch-calendar.dto";

@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get("auth-url")
  getAuthUrl() {
    return { url: this.googleCalendarService.getAuthUrl() };
  }

  @Post("auth")
  async authenticate(@Body() body: GoogleAuthDto) {
    return this.googleCalendarService.setTokens(body.code);
  }

  @Get("events")
  async getEvents(@Query("calendarId") calendarId = "primary") {
    return this.googleCalendarService.getEvents(calendarId);
  }

  @Post("watch")
  async watchCalendar(@Body() body: WatchCalendarDto) {
    return this.googleCalendarService.watchCalendar(
      body.calendarId,
      body.webhookUrl
    );
  }

  // Endpoint qui reçoit les notifications de Google
  @Post("notifications")
  handleNotification(@Body() body: any) {
    console.log("Notification reçue :", body);
    return { message: "OK" };
  }
}

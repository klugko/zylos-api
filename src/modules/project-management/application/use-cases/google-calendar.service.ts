import { Injectable, Logger } from "@nestjs/common";
import { google } from "googleapis";

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  private oauth2Client = new google.auth.OAuth2(
    process.env.VITE_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // ex: http://localhost:3000/google/callback
  );

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
      prompt: "consent",
    });
  }

  async setTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    this.logger.log("Tokens reçus et sauvegardés.");
    return tokens;
  }

  async getEvents(calendarId = "primary") {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items;
  }

  async watchCalendar(calendarId: string, webhookUrl: string) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const res = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: `${Date.now()}`,
        type: "webhook",
        address: webhookUrl,
      },
    });
    this.logger.log(`Watch créé pour ${calendarId}`);
    return res.data;
  }
}

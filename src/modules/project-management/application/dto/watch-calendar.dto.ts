import { IsString } from "class-validator";

export class WatchCalendarDto {
  @IsString()
  calendarId: string;

  @IsString()
  webhookUrl: string;
}

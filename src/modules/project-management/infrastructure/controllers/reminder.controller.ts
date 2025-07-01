import { SmartReminderService } from '@modules/project-management/application/use-cases/smart-reminder';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reminders')
@Controller('api/v1/reminders')
export class ReminderController {
  constructor(private readonly smartReminder: SmartReminderService) {}

  @Get('preview/:userId')
  @ApiOperation({ summary: 'Prévisualiser les rappels à venir pour un utilisateur' })
  async preview(@Param('userId') userId: string) {
    return this.smartReminder.previewReminders(userId);
  }
}

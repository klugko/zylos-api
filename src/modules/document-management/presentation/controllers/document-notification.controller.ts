import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { SetNotificationRuleDto } from '../../dto/set-notification-rule.dto';
import { SetNotificationRuleUseCase } from '../../application/use-cases/set-notification-rule.usecase';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { GetNotificationRulesUseCase } from '@modules/document-management/application/use-cases/get-notification-rules.usecase';

@ApiTags('Documents - Notifications')
@Controller('api/v1/documents')
export class DocumentNotificationController {
  constructor(
    private readonly setUC: SetNotificationRuleUseCase,
    private readonly getUC: GetNotificationRulesUseCase
    ) {}

  @Post(':id/notifications')
  @ApiOperation({ summary: 'Définir une règle de notification pour un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiBody({ type: SetNotificationRuleDto })
  async setRule(@Param('id') documentId: string, @Body() dto: SetNotificationRuleDto) {
    return this.setUC.execute(documentId, dto);
  }

  @Get(':id/notifications')
  @ApiOperation({ summary: 'Récupérer les règles de notification associées à un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async getRules(@Param('id') documentId: string) {
    return this.getUC.execute(documentId);
  }
}

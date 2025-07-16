import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { ActivityLogService } from '../../application/services/activity-log.service';
import { GetActivityLogsDto } from '../../application/dto/get-activity-logs.dto';

@ApiTags('Collaboration - Activity Logs')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/collaboration/activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les journaux d’activité des partenaires' })
  @ApiResponse({ status: 200, description: 'Logs récupérés avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async getLogs(@Query() query: GetActivityLogsDto, @CurrentUser() user: User) {
    try {
      // On peut restreindre aux administrateurs ou owner :
      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
        throw new HttpException('Accès refusé', HttpStatus.FORBIDDEN);
      }
      return await this.activityLogService.getLogs(query);
    } catch (error) {
      throw new HttpException(
        error?.message ?? 'Erreur lors de la récupération des logs',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

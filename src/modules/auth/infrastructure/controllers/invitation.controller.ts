import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Logger,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InvitationService } from '../strategies/invitation.service';
import { CreateInvitationDto } from '@modules/auth/application/dto/create-invitation.dto';
import { Invitation } from '@modules/auth/domain/entities/invitation.entity';

  
  @ApiTags('Invitations')
  @Controller('invitations')
  export class InvitationController {
    private readonly logger = new Logger(InvitationController.name);
  
    constructor(private readonly invitationService: InvitationService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Envoyer une invitation par email' })
    @ApiBody({ type: CreateInvitationDto })
    @ApiResponse({ status: 201, description: 'Invitation créée et email envoyé', type: Invitation })
    @ApiResponse({ status: 500, description: 'Erreur lors de la création ou l’envoi de l’invitation' })
    async sendInvitation(@Body() dto: CreateInvitationDto): Promise<Invitation> {
      try {
        const invitation = await this.invitationService.createInvitation(
          dto.email,
          dto.projectId,
          dto.role,
          dto.invitedBy,
          dto.projectName,
        );
        this.logger.log(`Invitation créée pour ${dto.email}`);
        return invitation;
      } catch (error) {
        this.logger.error('Erreur création invitation', error.stack);
        throw new InternalServerErrorException(
          'Impossible de créer l’invitation ou d’envoyer l’email',
        );
      }
    }
  }
  
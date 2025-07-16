import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
  import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
  import { User } from 'src/modules/auth/domain/entities/user.entity';
  import { CreatePartnerRequestDto } from '../../application/dto/create-partner-request.dto';
  import { CreatePartnerRequestMessageDto } from '../../application/dto/create-partner-request-message.dto';
  import { ConvertPartnerRequestDto } from '../../application/dto/convert-partner-request.dto';
  import { GetPartnerRequestsDto } from '../../application/dto/get-partner-requests.dto';
  import { CreatePartnerRequestUseCase } from '../../application/use-cases/create-partner-request.usecase';
  import { GetPartnerRequestsUseCase } from '../../application/use-cases/get-partner-requests.usecase';
  import { GetPartnerRequestDetailsUseCase } from '../../application/use-cases/get-partner-request-details.usecase';
  import { AddPartnerRequestMessageUseCase } from '../../application/use-cases/add-partner-request-message.usecase';
  import { ConvertPartnerRequestToTaskUseCase } from '../../application/use-cases/convert-partner-request-to-task.usecase';
  
  @ApiTags('Collaboration - Partner Requests')
  @ApiBearerAuth('JWT-auth')
  @Controller('api/v1/collaboration/partner-requests')
  @UseGuards(JwtAuthGuard)
  export class PartnerRequestController {
    constructor(
      private readonly createUseCase: CreatePartnerRequestUseCase,
      private readonly listUseCase: GetPartnerRequestsUseCase,
      private readonly detailsUseCase: GetPartnerRequestDetailsUseCase,
      private readonly messageUseCase: AddPartnerRequestMessageUseCase,
      private readonly convertUseCase: ConvertPartnerRequestToTaskUseCase,
    ) {}
  
    @Post()
    @ApiOperation({ summary: 'Créer une demande partenaire' })
    @ApiResponse({ status: 201, description: 'Demande créée' })
    async create(@Body() dto: CreatePartnerRequestDto, @CurrentUser() user: User) {
      return this.createUseCase.execute(dto, user.id);
    }
  
    @Get()
    @ApiOperation({ summary: 'Lister les demandes partenaires' })
    @ApiResponse({ status: 200, description: 'Liste des demandes' })
    async list(@Query() query: GetPartnerRequestsDto) {
      return this.listUseCase.execute(query);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Détails d’une demande' })
    @ApiResponse({ status: 200, description: 'Détails de la demande' })
    async details(@Param('id') id: string) {
      return this.detailsUseCase.execute(id);
    }
  
    @Post(':id/messages')
    @ApiOperation({ summary: 'Ajouter un message à la demande' })
    @ApiResponse({ status: 201, description: 'Message ajouté' })
    async addMessage(
      @Param('id') id: string,
      @Body() dto: CreatePartnerRequestMessageDto,
      @CurrentUser() user: User,
    ) {
      return this.messageUseCase.execute(id, dto, user.id);
    }
  
    @Put(':id/convert')
    @ApiOperation({ summary: 'Convertir la demande en tâche' })
    @ApiResponse({ status: 200, description: 'Tâche créée' })
    async convert(
      @Param('id') id: string,
      @Body() dto: ConvertPartnerRequestDto,
      @CurrentUser() user: User,
    ) {
      return this.convertUseCase.execute(id, dto, user.id);
    }
  }
  
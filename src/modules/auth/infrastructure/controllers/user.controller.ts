import {
    Controller,
    Get,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { GetPaginatedUsersUseCase } from '../../application/use-cases/get-users.usecase';
  import { ApiQuery, ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { User } from '../../domain/entities/user.entity';
import { GetUsersDto } from '@modules/auth/application/dto/get-users.dto';
import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
import { PaginationDto } from '@modules/auth/application/dto/pagination.dto';
  
  @ApiTags('Users')
  @Controller('users')
  export class UserController {
    constructor(private readonly getUsers: GetPaginatedUsersUseCase) {}
  
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lister tous les utilisateurs (paginé)' })
    @ApiQuery({ name: 'limit', required: true, type: Number })
    @ApiQuery({ name: 'page', required: true, type: Number })
    @ApiResponse({ status: 200, description: 'Résultat paginé', type: PaginationDto })
    @UsePipes(new ValidationPipe({ transform: true }))
    async findAll(@Query() query: GetUsersDto): Promise<PaginationDto<User>> {
        return this.getUsers.execute(query.limit, query.page);
    }
  }
  
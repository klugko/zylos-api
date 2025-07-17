import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePartnerDto } from '../../application/dto/create-partner.dto';
import { CreatePartnerUseCase } from '../../application/use-cases/create-partner.usecase';
import { Partner } from '../../domain/entities/partner.entity';
import { GetPartnerUseCase } from '@modules/collaboration/application/use-cases/get-partener.usecase';
import { UpdatePartnerUseCase } from '@modules/collaboration/application/use-cases/update-partener.usecase';
import { DeletePartnerUseCase } from '@modules/collaboration/application/use-cases/delete-partener.usecase';

@ApiTags('collaboration/partners')
@Controller('api/v1/collaboration/partners')
export class PartnerController {
  constructor(
    private readonly createPartner: CreatePartnerUseCase,
    private readonly getPartner: GetPartnerUseCase,
    private readonly updatePartner: UpdatePartnerUseCase,
    private readonly deletePartner: DeletePartnerUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePartnerDto): Promise<Partner> {
    return this.createPartner.execute(dto);
  }

  @Get()
  async getAll(): Promise<Partner[]> {
    return this.getPartner.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Partner> {
    return this.getPartner.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Partner>): Promise<Partner> {
    return this.updatePartner.execute(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deletePartner.execute(id);
  }
}

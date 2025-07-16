import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePartnerDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ description: 'Type of partner: CLIENT, SUBCONTRACTOR, etc.' })
  @IsString()
  @IsOptional()
  partnerType?: string;
}

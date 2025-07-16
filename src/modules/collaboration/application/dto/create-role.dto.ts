import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty() @IsBoolean() canRead: boolean;
  @ApiProperty() @IsBoolean() canWrite: boolean;
  @ApiProperty() @IsBoolean() canComment: boolean;
  @ApiProperty() @IsBoolean() canValidate: boolean;
  @ApiProperty() @IsBoolean() canDelete: boolean;
  @ApiProperty() @IsBoolean() canUseVisio: boolean;
  @ApiProperty() @IsBoolean() canUseDashboard: boolean;
}

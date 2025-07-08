import { IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetNotificationRuleDto {
  @ApiProperty({ enum: ['new_comment', 'new_version'] })
  @IsEnum(['new_comment', 'new_version'])
  trigger: 'new_comment' | 'new_version';

  @ApiProperty({ enum: ['immediate', 'daily', 'weekly'] })
  @IsEnum(['immediate', 'daily', 'weekly'])
  frequency: 'immediate' | 'daily' | 'weekly';

  @ApiProperty({ enum: ['in-app', 'email', 'webhook'] })
  @IsEnum(['in-app', 'email', 'webhook'])
  channel: 'in-app' | 'email' | 'webhook';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  targetEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetUrl?: string;
}

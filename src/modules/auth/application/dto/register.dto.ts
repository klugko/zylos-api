import { IsEmail, IsString, MinLength, IsEnum, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[]; 

  @IsInt()
  @Min(0)
  @IsOptional()
  availability?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  performanceScore?: number;
}

import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
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
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';


export class LoginDto {
  @ApiProperty({ example: 'jean@example.com', description: 'Adresse email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  @IsString()
  password: string;

@IsOptional()
@IsString()
@ApiProperty({ example: '1234567890', required: false })
googleId?: string;

}

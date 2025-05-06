import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';


export class LoginDto {
  @ApiProperty({ example: 'jean@example.com', description: 'Adresse email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe' })
  @IsString()
  password: string;
}

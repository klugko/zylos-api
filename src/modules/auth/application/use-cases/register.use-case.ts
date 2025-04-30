import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import * as bcrypt from 'bcrypt';
import { User } from '../../domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../domain/enums/user-role.enum';


@Injectable()
export class RegisterUseCase {
    constructor(
      @Inject('AuthRepository') private readonly authRepo: AuthRepository
    ) {}

  async execute(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existing = await this.authRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new User(
      uuidv4(),
      dto.fullname,
      dto.email,
      hashedPassword,
      dto.role,
      true,
      now,
      now
    );

    const saved = await this.authRepo.create(user);

    return new User(
      saved.id,
      saved.fullname,
      saved.email,
      undefined, 
      saved.role,
      saved.isActive,
      saved.createdAt,
      saved.updatedAt
    );
  }
}

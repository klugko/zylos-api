import { Injectable, UnauthorizedException, ForbiddenException, Inject } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class LoginUseCase {
     constructor(
        @Inject('AuthRepository') private readonly authRepo: AuthRepository
      ) {}
  
  async execute(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.authRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) {
      throw new ForbiddenException('User account is deactivated');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    return { token };
  }
}

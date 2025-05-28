import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';


export class User {
  constructor(
    public readonly id: string,
    public fullname: string,
    public email: string,
    public password: string | undefined,
    public role: UserRole,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public skills: string[],
    public availability: number,
    public performanceScore: number,
    public googleId?: string,
  ) {}

  activate(): void {
    if (this.isActive) {
      throw new BadRequestException('User is already active');
    }
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new BadRequestException('User is already inactive');
    }
    this.isActive = false;
  }
}

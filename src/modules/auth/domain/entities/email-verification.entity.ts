import { BadRequestException } from "@nestjs/common";

export class EmailVerification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public isUsed: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed;
  }

  markAsUsed(): void {
    if (this.isUsed) {
      throw new BadRequestException("Email verification token already used");
    }
    if (this.isExpired()) {
      throw new BadRequestException("Email verification token has expired");
    }
    this.isUsed = true;
  }

  static create(
    userId: string,
    email: string,
    token: string,
    expiresInHours: number = 24
  ): EmailVerification {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    return new EmailVerification(
      crypto.randomUUID(),
      userId,
      email,
      token,
      expiresAt,
      false,
      new Date()
    );
  }
}

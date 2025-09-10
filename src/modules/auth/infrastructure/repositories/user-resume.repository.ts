import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export interface UserResume {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  parsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserResumeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrReplace(
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
  ): Promise<UserResume> {
    // Supprimer les anciens CVs
    await this.prisma.userResume.deleteMany({
      where: { userId },
    });

    // Créer le nouveau CV
    const resume = await this.prisma.userResume.create({
      data: {
        userId,
        fileName,
        filePath,
        fileSize,
        mimeType,
      },
    });

    return {
      id: resume.id,
      userId: resume.userId,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      parsedAt: resume.parsedAt,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }

  async setParsedAt(resumeId: string): Promise<void> {
    await this.prisma.userResume.update({
      where: { id: resumeId },
      data: { parsedAt: new Date() },
    });
  }

  async findLatestByUserId(userId: string): Promise<UserResume | null> {
    const resume = await this.prisma.userResume.findFirst({
      where: { userId },
      orderBy: [
        { parsedAt: { sort: 'desc', nulls: 'last' } },
        { id: 'desc' },
      ],
    });

    if (!resume) {
      return null;
    }

    return {
      id: resume.id,
      userId: resume.userId,
      fileName: resume.fileName,
      filePath: resume.filePath,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType,
      parsedAt: resume.parsedAt,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }
}

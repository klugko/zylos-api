import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AvatarStorageService {
  private readonly logger = new Logger(AvatarStorageService.name);
  private readonly uploadDir = 'uploads/avatars';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  async saveAvatar(file: Express.Multer.File): Promise<string> {
    
    this.validateFile(file);

    await fs.mkdir(this.uploadDir, { recursive: true });

    const fileId = uuidv4();
    const originalExtension = path.extname(file.originalname);
    const baseFilename = `${fileId}${originalExtension}`;

    const originalPath = path.join(this.uploadDir, baseFilename);
    await fs.writeFile(originalPath, file.buffer);

    this.logger.log(`Avatar saved: ${baseFilename}`);
    
    return `/uploads/avatars/${baseFilename}`;
  }

  async deleteAvatar(avatarUrl: string): Promise<void> {
    if (!avatarUrl) return;

    try {
      const relativePath = avatarUrl.replace(/^\/uploads\//, '');
      const fullPath = path.join('uploads', relativePath);
  
      await fs.unlink(fullPath);
      this.logger.log(`Avatar deleted: ${fullPath}`);
    } catch (error) {
      this.logger.error(`Failed to delete avatar: ${avatarUrl}`, error);
    }
  }

  getDefaultAvatarUrl(fullname: string, size: number = 128): string {

    const initials = this.extractInitials(fullname);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=random&color=fff&bold=true`;
  }

  private extractInitials(fullname: string): string {
    if (!fullname) return 'U';
    
    const words = fullname.trim().split(/\s+/);
    const initials = words
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2);
    
    return initials.join('');
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }
  }
}

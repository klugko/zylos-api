import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CvFileStorageService {
  private readonly uploadDir = 'uploads/cv';

  async save(file: Express.Multer.File): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    const uniqueFilename = `${uuidv4()}-${this.sanitizeFilename(file.originalname)}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, file.buffer);
    
    return filePath;
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9_\-. ]/g, '_');
  }
}

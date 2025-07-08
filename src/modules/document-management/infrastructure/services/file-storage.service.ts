import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join } from 'path';

@Injectable()
export class FileStorageService {
  private readonly basePath = './uploads/documents';

  async save(file: Express.Multer.File): Promise<string> {
    await mkdir(this.basePath, { recursive: true });

    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = join(this.basePath, fileName);

    await writeFile(filePath, file.buffer);
    return filePath;
  }
}

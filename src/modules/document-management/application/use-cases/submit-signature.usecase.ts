import { Injectable } from '@nestjs/common';
import { DocumentSignatureRepository } from '../../domain/interfaces/document-signature.repository.interface';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join } from 'path';

@Injectable()
export class SubmitSignatureUseCase {
  constructor(private readonly repo: DocumentSignatureRepository) {}

  async execute(documentId: string, base64Image: string) {
    const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
    const folder = 'signatures';
    await mkdir(folder, { recursive: true });
    const path = join(folder, `${randomUUID()}.png`);
    await writeFile(path, buffer);

    return this.repo.submitSignature(documentId, path);
  }
}

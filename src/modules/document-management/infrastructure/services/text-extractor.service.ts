// text-extractor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  async extractText(buffer: Buffer, mimetype: string): Promise<string> {
    try {
      if (mimetype === 'application/pdf') {
        const data = await pdf(buffer);
        return data.text;
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        mimetype === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      } else if (this.isTextMimetype(mimetype)) {
        return buffer.toString('utf-8');
      } else {
        return `[UNSUPPORTED FILE TYPE: ${mimetype}]`;
      }
    } catch (error) {
      this.logger.error(`Text extraction failed: ${error.message}`);
      return `[TEXT EXTRACTION ERROR: ${error.message}]`;
    }
  }

  private isTextMimetype(mimetype: string): boolean {
    return [
      'text/plain',
      'text/csv',
      'application/json',
      'text/html',
      'text/markdown'
    ].includes(mimetype);
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class CvTextExtractorService {
  private readonly logger = new Logger(CvTextExtractorService.name);

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
      } else {
        return `[UNSUPPORTED FILE TYPE: ${mimetype}]`;
      }
    } catch (error) {
      this.logger.error(`Text extraction failed: ${error.message}`);
      return `[TEXT EXTRACTION ERROR: ${error.message}]`;
    }
  }
}

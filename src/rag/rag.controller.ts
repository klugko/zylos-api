import { Controller, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('ask')
  async ask(@Query('q') question: string) {
    const answer = await this.ragService.askQuestion(question);
    return { answer };
  }
}

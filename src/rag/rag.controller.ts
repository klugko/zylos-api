import { Controller, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('api/v1/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('/')
  async ask(@Query('question') question: string) {
    const answer = await this.ragService.askQuestion(question);
    return { answer };
  }
}

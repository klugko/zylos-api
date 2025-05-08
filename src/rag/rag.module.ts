import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { EmbeddingService } from './embedding/embedding.service';
import { RagService } from './rag.service';

@Module({
  controllers: [RagController],
  providers: [RagService, EmbeddingService],
})
export class RagModule {}

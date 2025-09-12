import { Injectable, Logger } from '@nestjs/common';
import { GeneratePdfDto, GeneratePdfResponseDto } from '../dto/pdf-generation.dto';
import { PdfGeneratorService, PdfGenerationOptions } from '../../infrastructure/services/pdf-generator.service';
import { AiAssistantService, UserContext } from '../services/ai-assistant.service';

@Injectable()
export class GeneratePdfUseCase {
  private readonly logger = new Logger(GeneratePdfUseCase.name);

  constructor(
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  async execute(userId: string, dto: GeneratePdfDto): Promise<GeneratePdfResponseDto> {
    try {
      this.logger.log(`Generating PDF for user ${userId}: ${dto.title}`);

      const userContext = await this.aiAssistantService.getUserContext(userId);
      const secureContext = this.aiAssistantService.buildSecureContext(userContext);

      const pdfOptions: PdfGenerationOptions = {
        title: dto.title,
        content: dto.content || '',
        format: dto.format,
        orientation: dto.orientation,
      };

      const result = await this.pdfGeneratorService.generatePdf(pdfOptions, secureContext);

      if (result.success) {
        this.logger.log(`PDF generated successfully for user ${userId}: ${result.downloadUrl}`);
        return {
          success: true,
          downloadUrl: result.downloadUrl,
          message: 'PDF généré avec succès'
        };
      } else {
        this.logger.error(`PDF generation failed for user ${userId}: ${result.error}`);
        return {
          success: false,
          message: 'Erreur lors de la génération du PDF',
          error: result.error
        };
      }
    } catch (error) {
      this.logger.error(`Generate PDF use case failed for user ${userId}: ${error.message}`);
      return {
        success: false,
        message: 'Erreur lors de la génération du PDF',
        error: error.message
      };
    }
  }
}

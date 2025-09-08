import { Injectable, Logger } from '@nestjs/common';
import { UploadCvDto } from '../dto/upload-cv.dto';
import { SkillExtractionService, ExtractedSkill } from '../../infrastructure/services/skill-extraction.service';
import { CvTextExtractorService } from '../../infrastructure/services/cv-text-extractor.service';
import { CvFileStorageService } from '../../infrastructure/services/cv-file-storage.service';
import { Inject } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';

@Injectable()
export class UploadCvUseCase {
  private readonly logger = new Logger(UploadCvUseCase.name);

  constructor(
    private readonly skillExtractionService: SkillExtractionService,
    private readonly textExtractorService: CvTextExtractorService,
    private readonly fileStorageService: CvFileStorageService,
    @Inject('AuthRepository') private readonly authRepository: AuthRepository,
  ) {}

  async execute(
    file: Express.Multer.File,
    dto: UploadCvDto,
    userId: string
  ): Promise<{ message: string; skills: ExtractedSkill[]; fileUrl: string }> {
    try {
      // 1. Sauvegarder le fichier
      const fileUrl = await this.fileStorageService.save(file);
      this.logger.log(`CV saved: ${fileUrl}`);

      // 2. Extraire le texte du CV
      const extractedText = await this.textExtractorService.extractText(file.buffer, file.mimetype);
      
      if (extractedText.includes('[ERROR]') || extractedText.includes('[UNSUPPORTED]')) {
        throw new Error('Impossible d\'extraire le texte du fichier. Formats supportés: PDF, DOCX');
      }

      this.logger.log(`Text extracted from CV: ${extractedText.length} characters`);

      // 3. Extraire les compétences avec OpenAI
      const extractedSkills = await this.skillExtractionService.extractSkillsFromText(extractedText);
      this.logger.log(`Skills extracted: ${extractedSkills.length} skills found`);

      // 4. Mettre à jour les compétences de l'utilisateur
      const skillNames = extractedSkills.map(skill => skill.name);
      await this.authRepository.updateUserSkills(userId, skillNames);

      this.logger.log(`User skills updated for user ${userId}`);

      return {
        message: 'CV uploadé avec succès et compétences extraites',
        skills: extractedSkills,
        fileUrl
      };
    } catch (error) {
      this.logger.error(`CV upload failed: ${error.message}`);
      throw error;
    }
  }
}

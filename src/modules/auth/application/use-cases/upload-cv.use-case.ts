import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { UploadCvDto } from '../dto/upload-cv.dto';
import { SkillExtractionService, ExtractedSkill } from '../../infrastructure/services/skill-extraction.service';
import { CvTextExtractorService } from '../../infrastructure/services/cv-text-extractor.service';
import { CvFileStorageService } from '../../infrastructure/services/cv-file-storage.service';
import { SkillTaxonomyService } from '../../infrastructure/services/skill-taxonomy.service';
import { SkillScoringService, ScoredSkill, SkillAggregation } from '../../infrastructure/services/skill-scoring.service';
import { UserScoringService, UserSignals, UserScoreResult } from '../../infrastructure/services/user-scoring.service';
import { UserSkillRepository } from '../../infrastructure/repositories/user-skill.repository';
import { UserScoreRepository } from '../../infrastructure/repositories/user-score.repository';
import { UserResumeRepository } from '../../infrastructure/repositories/user-resume.repository';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { CvAuthenticityVerificationService } from '../../infrastructure/services/cv-authenticity-verification.service';
import { EvolvingScoringService } from '../../infrastructure/services/evolving-scoring.service';

@Injectable()
export class UploadCvUseCase {
  private readonly logger = new Logger(UploadCvUseCase.name);

  constructor(
    private readonly skillExtractionService: SkillExtractionService,
    private readonly textExtractorService: CvTextExtractorService,
    private readonly fileStorageService: CvFileStorageService,
    private readonly taxonomyService: SkillTaxonomyService,
    private readonly skillScoringService: SkillScoringService,
    private readonly userScoringService: UserScoringService,
    private readonly userSkillRepository: UserSkillRepository,
    private readonly userScoreRepository: UserScoreRepository,
    private readonly userResumeRepository: UserResumeRepository,
    private readonly cvAuthenticityVerificationService: CvAuthenticityVerificationService,
    private readonly evolvingScoringService: EvolvingScoringService,
    @Inject('AuthRepository') private readonly authRepository: AuthRepository,
  ) {}

  async execute(
    file: Express.Multer.File,
    dto: UploadCvDto,
    userId: string
  ): Promise<{ 
    message: string; 
    skills: ExtractedSkill[]; 
    fileUrl: string; 
    newSkills: number; 
    totalSkills: number;
    availability: number;
    performanceScore: number;
    scoring: {
      skillScores: ScoredSkill[];
      userScore: UserScoreResult;
      skillAggregation: SkillAggregation;
    };
  }> {
    try {
      // 1. Sauvegarder le fichier CV
      const fileUrl = await this.fileStorageService.save(file);
      this.logger.log(`CV saved: ${fileUrl}`);

      // 2. Créer l'enregistrement du CV dans la base de données
      const resume = await this.userResumeRepository.createOrReplace(
        userId,
        file.originalname,
        fileUrl,
        file.size,
        file.mimetype
      );

      // 3. Extraire le texte du CV
      const extractedText = await this.textExtractorService.extractText(file.buffer, file.mimetype);
      
      if (extractedText.includes('[ERROR]') || extractedText.includes('[UNSUPPORTED]')) {
        throw new Error('Impossible d\'extraire le texte du fichier. Formats supportés: PDF, DOCX');
      }

      this.logger.log(`Text extracted from CV: ${extractedText.length} characters`);

      const currentUser = await this.authRepository.findById(userId);
      if (!currentUser) {
        throw new Error('Utilisateur non trouvé');
      }

      const authenticityResult = await this.cvAuthenticityVerificationService.verifyCvAuthenticity(
        extractedText,
        currentUser.fullname,
        currentUser.email,
        currentUser.phone,
        currentUser.poste
      );

      if (!authenticityResult.isAuthentic) {
        this.logger.warn(`CV authenticity verification failed for user ${userId}: ${authenticityResult.verificationReasoning}`);
        throw new BadRequestException(
          `CV non authentique détecté. ${authenticityResult.verificationReasoning}. ` +
          `Éléments non correspondants: ${authenticityResult.mismatchingElements.join(', ')}`
        );
      }

      this.logger.log(`CV authenticity verified for user ${userId} with confidence ${authenticityResult.confidence}%`);


      const extractedSkills = await this.skillExtractionService.extractSkillsFromText(extractedText);
      this.logger.log(`Skills extracted: ${extractedSkills.length} skills found`);


      const familyMap = new Map<string, string>();
      const scoreMap = new Map<string, number>();
      const scoredSkills: ScoredSkill[] = [];

      for (const skill of extractedSkills) {

        const family = this.taxonomyService.classifyFamily(skill.name, skill.category);
        familyMap.set(skill.name, family);


        const scoredSkill = this.skillScoringService.scoreSkill(
          skill.name,
          skill.proficiency,
          skill.category,
          skill.monthsExperience,
          skill.confidence,
          skill.lastUsedYear
        );
        
        scoreMap.set(skill.name, scoredSkill.weightedScore);
        scoredSkills.push(scoredSkill);
      }


      await this.userSkillRepository.upsertBulk(userId, extractedSkills.map(skill => ({
        name: skill.name,
        score: Math.round(scoreMap.get(skill.name) || 0),
        category: skill.category,
        yearsExperienceMonths: skill.monthsExperience,
        seniority: skill.seniority,
        confidence: skill.confidence,
        lastUsedYear: skill.lastUsedYear,
      })));

      const skillAggregation = this.skillScoringService.aggregate(scoredSkills);

      const skillNames = extractedSkills.map(skill => skill.name);
      const mergeResult = await this.authRepository.mergeUserSkills(userId, skillNames);

      await this.userResumeRepository.setParsedAt(resume.id);


      const profileCompletion = this.userScoringService.calculateProfileCompletionRatio({
        fullname: currentUser.fullname,
        email: currentUser.email,
        phone: currentUser.phone,
        poste: currentUser.poste,
        avatarUrl: currentUser.avatarUrl,
      });

      const userSignals: UserSignals = {
        emailVerified: currentUser.emailVerified || false,
        phoneVerified: false,
        profileCompletionRatio: profileCompletion,
        skillsCount: scoredSkills.length,
        skillsGlobalScore: skillAggregation.globalScore,
        resumeParsedAt: new Date(),
      };

      const userScoreResult = this.userScoringService.compute(userSignals);

      await this.userScoreRepository.upsert(
        userId,
        userScoreResult.score,
        userScoreResult.components.emailVerified,
        userScoreResult.components.phoneVerified,
        userScoreResult.components.profileCompletion,
        userScoreResult.components.skills,
        userScoreResult.components.activity,
        scoredSkills.length,
        skillAggregation.globalScore,
        profileCompletion
      );

      const cvAvailability = this.calculateAvailability(scoredSkills.length, skillAggregation.globalScore);
      const cvPerformanceScore = this.calculatePerformanceScore(userScoreResult.score, skillAggregation.globalScore);

      const hasPreviousCv = false;

      const evolvedScores = this.evolvingScoringService.calculateEvolvedScores(
        currentUser.availability,
        currentUser.performanceScore,
        cvAvailability,
        cvPerformanceScore,
        currentUser.createdAt,
        hasPreviousCv
      );
      currentUser.updateFullProfile({
        skills: skillNames,
        availability: evolvedScores.newAvailability,
        performanceScore: evolvedScores.newPerformanceScore,
      });
      await this.authRepository.update(currentUser);

      this.logger.log(`CV processing completed for user ${userId}: ${mergeResult.newSkillsCount} new skills, evolved availability: ${evolvedScores.newAvailability}, evolved performance: ${evolvedScores.newPerformanceScore}`);

      return {
        message: 'CV uploadé avec succès et compétences extraites avec scoring évolutif',
        skills: extractedSkills,
        fileUrl,
        newSkills: mergeResult.newSkillsCount,
        totalSkills: mergeResult.mergedSkills.length,
        availability: evolvedScores.newAvailability,
        performanceScore: evolvedScores.newPerformanceScore,
        scoring: {
          skillScores: scoredSkills,
          userScore: userScoreResult,
          skillAggregation,
        },
      };
    } catch (error) {
      this.logger.error(`CV upload failed: ${error.message}`);
      throw error;
    }
  }

  private calculateAvailability(skillsCount: number, skillsGlobalScore: number): number {
    const skillsFactor = Math.min(1.0, skillsCount / 20);
    const qualityFactor = skillsGlobalScore / 100;
    
    const availability = Math.round((skillsFactor * 0.4 + qualityFactor * 0.6) * 100);
    
    return Math.max(0, Math.min(100, availability));
  }

  private calculatePerformanceScore(userScore: number, skillsGlobalScore: number): number {
    const userScoreFactor = userScore / 100;
    const skillsScoreFactor = skillsGlobalScore / 100;
    
    const performanceScore = Math.round((userScoreFactor * 0.7 + skillsScoreFactor * 0.3) * 100);
    
    return Math.max(0, Math.min(100, performanceScore));
  }
}

import { Injectable, Logger, Inject } from '@nestjs/common';
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

      // 4. Extraire les compétences avec métadonnées enrichies
      const extractedSkills = await this.skillExtractionService.extractSkillsFromText(extractedText);
      this.logger.log(`Skills extracted: ${extractedSkills.length} skills found`);

      // 5. Classifier les compétences par familles et calculer les scores
      const familyMap = new Map<string, string>();
      const scoreMap = new Map<string, number>();
      const scoredSkills: ScoredSkill[] = [];

      for (const skill of extractedSkills) {
        // Classifier la famille
        const family = this.taxonomyService.classifyFamily(skill.name, skill.category);
        familyMap.set(skill.name, family);

        // Calculer le score pondéré
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

      // 6. Sauvegarder les compétences détaillées
      await this.userSkillRepository.upsertBulk(userId, extractedSkills.map(skill => ({
        name: skill.name,
        score: Math.round(scoreMap.get(skill.name) || 0),
        category: skill.category,
        yearsExperienceMonths: skill.monthsExperience,
        seniority: skill.seniority,
        confidence: skill.confidence,
        lastUsedYear: skill.lastUsedYear,
      })));

      // 7. Calculer l'agrégation des compétences
      const skillAggregation = this.skillScoringService.aggregate(scoredSkills);

      // 8. Mettre à jour les compétences simples dans le profil utilisateur
      const skillNames = extractedSkills.map(skill => skill.name);
      const mergeResult = await this.authRepository.mergeUserSkills(userId, skillNames);

      // 9. Marquer le CV comme parsé
      await this.userResumeRepository.setParsedAt(resume.id);

      // 10. Calculer le score utilisateur global
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const profileCompletion = this.userScoringService.calculateProfileCompletionRatio({
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        poste: user.poste,
        avatarUrl: user.avatarUrl,
      });

      const userSignals: UserSignals = {
        emailVerified: user.emailVerified || false,
        phoneVerified: false, // TODO: Implémenter la vérification téléphone
        profileCompletionRatio: profileCompletion,
        skillsCount: scoredSkills.length,
        skillsGlobalScore: skillAggregation.globalScore,
        resumeParsedAt: new Date(),
      };

      const userScoreResult = this.userScoringService.compute(userSignals);

      // 11. Sauvegarder le score utilisateur
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

      // 12. Calculer et mettre à jour availability et performanceScore
      const availability = this.calculateAvailability(scoredSkills.length, skillAggregation.globalScore);
      const performanceScore = this.calculatePerformanceScore(userScoreResult.score, skillAggregation.globalScore);

      // Mettre à jour l'utilisateur avec les nouveaux scores
      user.updateFullProfile({
        skills: skillNames,
        availability,
        performanceScore,
      });
      await this.authRepository.update(user);

      this.logger.log(`CV processing completed for user ${userId}: ${mergeResult.newSkillsCount} new skills, score: ${userScoreResult.score}, availability: ${availability}, performance: ${performanceScore}`);

      return {
        message: 'CV uploadé avec succès et compétences extraites avec scoring',
        skills: extractedSkills,
        fileUrl,
        newSkills: mergeResult.newSkillsCount,
        totalSkills: mergeResult.mergedSkills.length,
        availability,
        performanceScore,
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
    // Availability basée sur le nombre de compétences et leur qualité
    // Plus l'utilisateur a de compétences et plus elles sont de qualité, plus il est disponible
    const skillsFactor = Math.min(1.0, skillsCount / 20); // Normaliser sur 20 compétences max
    const qualityFactor = skillsGlobalScore / 100; // Normaliser sur 100
    
    // Calculer l'availability (0-100)
    const availability = Math.round((skillsFactor * 0.4 + qualityFactor * 0.6) * 100);
    
    // S'assurer que c'est entre 0 et 100
    return Math.max(0, Math.min(100, availability));
  }

  private calculatePerformanceScore(userScore: number, skillsGlobalScore: number): number {
    // Performance score basé sur le score utilisateur global et la qualité des compétences
    const userScoreFactor = userScore / 100;
    const skillsScoreFactor = skillsGlobalScore / 100;
    
    // Moyenne pondérée (70% score utilisateur, 30% score compétences)
    const performanceScore = Math.round((userScoreFactor * 0.7 + skillsScoreFactor * 0.3) * 100);
    
    // S'assurer que c'est entre 0 et 100
    return Math.max(0, Math.min(100, performanceScore));
  }
}

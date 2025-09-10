import { Injectable, Logger, Inject } from '@nestjs/common';
import { ManualDescriptionDto } from '../dto/manual-description.dto';
import { ManualDescriptionSuccessResponseDto, ManualDescriptionErrorResponseDto } from '../dto/manual-description-response.dto';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { SkillExtractionService, ExtractedSkill } from '../../infrastructure/services/skill-extraction.service';
import { SkillTaxonomyService } from '../../infrastructure/services/skill-taxonomy.service';
import { SkillScoringService, ScoredSkill } from '../../infrastructure/services/skill-scoring.service';
import { UserScoringService, UserScoreResult } from '../../infrastructure/services/user-scoring.service';
import { UserSkillRepository } from '../../infrastructure/repositories/user-skill.repository';
import { UserScoreRepository } from '../../infrastructure/repositories/user-score.repository';
import { OpenAIService } from '../../../../shared/ai/openai.service';

@Injectable()
export class ManualDescriptionUseCase {
  private readonly logger = new Logger(ManualDescriptionUseCase.name);

  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly skillExtractionService: SkillExtractionService,
    private readonly skillTaxonomyService: SkillTaxonomyService,
    private readonly skillScoringService: SkillScoringService,
    private readonly userScoringService: UserScoringService,
    private readonly userSkillRepository: UserSkillRepository,
    private readonly userScoreRepository: UserScoreRepository,
    private readonly openaiService: OpenAIService,
  ) {}

  async execute(
    userId: string,
    dto: ManualDescriptionDto
  ): Promise<ManualDescriptionSuccessResponseDto | ManualDescriptionErrorResponseDto> {
    try {
      // 1. Analyser la qualité et complétude de la description
      const validationResult = await this.validateDescription(dto.description);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message,
          missingElements: validationResult.missingElements,
          suggestion: validationResult.suggestion
        };
      }

      // 2. Extraire les compétences du texte
      const extractedSkills = await this.skillExtractionService.extractSkillsFromText(dto.description);
      this.logger.log(`Skills extracted from manual description: ${extractedSkills.length} skills found`);

      if (extractedSkills.length === 0) {
        return {
          success: false,
          message: 'Aucune compétence technique n\'a pu être identifiée dans votre description.',
          missingElements: ['compétences techniques', 'technologies utilisées', 'outils de développement'],
          suggestion: 'Veuillez inclure des détails sur les technologies, langages de programmation, frameworks, et outils que vous maîtrisez.'
        };
      }

      // 3. Extraire l'availability et performanceScore du texte
      const experienceData = await this.extractExperienceData(dto.description);
      
      // 4. Classifier les compétences par familles et calculer les scores
      const scoredSkills: ScoredSkill[] = [];

      for (const skill of extractedSkills) {
        const scoredSkill = this.skillScoringService.scoreSkill(
          skill.name,
          skill.proficiency,
          skill.category,
          skill.monthsExperience,
          skill.confidence,
          skill.lastUsedYear
        );
        scoredSkills.push(scoredSkill);
      }

      // 5. Calculer l'agrégation des compétences par familles
      const skillAggregation = this.skillScoringService.aggregate(scoredSkills);

      // 6. Sauvegarder les compétences utilisateur
      const existingSkills = await this.userSkillRepository.findByUserId(userId);
      const existingSkillNames = new Set(existingSkills.map(s => s.skill));
      
      const newSkills = scoredSkills.filter(skill => !existingSkillNames.has(skill.name));
      const totalSkills = existingSkills.length + newSkills.length;

      // Convertir les ScoredSkill en format UserSkill pour la sauvegarde
      const skillsToSave = scoredSkills.map(skill => ({
        name: skill.name,
        score: skill.weightedScore,
        category: skill.family,
        yearsExperienceMonths: skill.experienceMonths,
        seniority: 'intermediate', // Valeur par défaut
        confidence: skill.confidence,
        lastUsedYear: new Date().getFullYear() // Valeur par défaut
      }));

      await this.userSkillRepository.upsertBulk(userId, skillsToSave);

      // 7. Calculer le score utilisateur global
      const user = await this.authRepo.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const userSignals = {
        emailVerified: user.emailVerified || false,
        phoneVerified: false, // À implémenter si nécessaire
        profileCompletionRatio: this.userScoringService.calculateProfileCompletionRatio(user),
        skillsCount: totalSkills,
        skillsGlobalScore: skillAggregation.globalScore,
        resumeParsedAt: new Date()
      };

      const userScore = this.userScoringService.compute(userSignals);

      // 8. Sauvegarder le score utilisateur
      await this.userScoreRepository.upsert(
        userId,
        userScore.score,
        userScore.components.emailVerified,
        userScore.components.phoneVerified,
        userScore.components.profileCompletion,
        userScore.components.skills,
        userScore.components.activity,
        totalSkills,
        skillAggregation.globalScore,
        userSignals.profileCompletionRatio
      );

      // 9. Mettre à jour l'utilisateur avec les nouvelles données
      user.updateFullProfile({
        skills: scoredSkills.map(s => s.name),
        availability: experienceData.availability,
        performanceScore: experienceData.performanceScore
      });
      await this.authRepo.update(user);

      return {
        success: true,
        message: 'Votre expérience a été analysée et mise à jour avec succès !',
        skills: scoredSkills.map(skill => ({
          name: skill.name,
          category: skill.family,
          proficiency: skill.proficiency,
          monthsExperience: skill.experienceMonths || 0,
          seniority: 'intermediate',
          confidence: skill.confidence || 80,
          lastUsedYear: new Date().getFullYear()
        })),
        availability: experienceData.availability,
        performanceScore: experienceData.performanceScore,
        newSkills: newSkills.length,
        totalSkills: totalSkills,
        scoring: {
          skillScores: scoredSkills,
          userScore: userScore,
          skillAggregation: skillAggregation
        }
      };

    } catch (error) {
      this.logger.error(`Manual description analysis failed: ${error.message}`);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l\'analyse de votre description.',
        missingElements: ['analyse technique'],
        suggestion: 'Veuillez réessayer avec une description plus détaillée de votre expérience professionnelle.'
      };
    }
  }

  private async validateDescription(description: string): Promise<{
    isValid: boolean;
    message: string;
    missingElements: string[];
    suggestion: string;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY manquant');
    }

    const systemPrompt = `Tu es un assistant RH expert. Analyse cette description d'expérience professionnelle et détermine si elle contient suffisamment d'informations pour évaluer les compétences, l'expérience et la disponibilité du candidat.

Critères d'évaluation :
1. Compétences techniques mentionnées (langages, frameworks, outils)
2. Expérience professionnelle (durée, postes, responsabilités)
3. Disponibilité horaire (mentionnée ou déductible)
4. Niveau de détail suffisant

Réponds UNIQUEMENT avec un JSON contenant :
{
  "isValid": boolean,
  "message": "message explicatif",
  "missingElements": ["élément1", "élément2"],
  "suggestion": "suggestion d'amélioration"
}`;

    const userPrompt = `Analyse cette description d'expérience :\n\n${description}`;

    try {
      const response = await this.openaiService.generateCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Description validation failed: ${error.message}`);
      return {
        isValid: false,
        message: 'Impossible d\'analyser la description.',
        missingElements: ['analyse technique'],
        suggestion: 'Veuillez fournir une description plus détaillée.'
      };
    }
  }

  private async extractExperienceData(description: string): Promise<{
    availability: number;
    performanceScore: number;
  }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY manquant');
    }

    const systemPrompt = `Tu es un assistant RH expert. Extrais les informations suivantes de cette description d'expérience :

1. Disponibilité horaire hebdomadaire (en heures, 0-100)
2. Score de performance estimé (0-100) basé sur l'expérience et les compétences

Réponds UNIQUEMENT avec un JSON :
{
  "availability": number (0-100),
  "performanceScore": number (0-100)
}

Si l'information n'est pas claire, estime basé sur le contexte.`;

    const userPrompt = `Extrais la disponibilité et le score de performance de cette description :\n\n${description}`;

    try {
      const response = await this.openaiService.generateCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const result = JSON.parse(content);
      return {
        availability: Math.max(0, Math.min(100, result.availability || 40)),
        performanceScore: Math.max(0, Math.min(100, result.performanceScore || 70))
      };
    } catch (error) {
      this.logger.error(`Experience data extraction failed: ${error.message}`);
      return {
        availability: 40, // Valeur par défaut
        performanceScore: 70 // Valeur par défaut
      };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';

export interface ScoringEvolutionResult {
  newAvailability: number;
  newPerformanceScore: number;
  evolutionReasoning: string;
  previousAvailability: number;
  previousPerformanceScore: number;
  cvAvailability: number;
  cvPerformanceScore: number;
}

@Injectable()
export class EvolvingScoringService {
  private readonly logger = new Logger(EvolvingScoringService.name);

  /**
   * Calcule les nouveaux scores en combinant les scores existants avec les nouveaux scores du CV
   * Utilise une moyenne pondérée qui favorise les scores plus récents
   */
  calculateEvolvedScores(
    currentAvailability: number,
    currentPerformanceScore: number,
    cvAvailability: number,
    cvPerformanceScore: number,
    userCreationDate: Date,
    hasPreviousCv: boolean = false
  ): ScoringEvolutionResult {
    try {
      // Calculer le poids basé sur l'ancienneté du compte
      const accountAgeInDays = (Date.now() - userCreationDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Plus le compte est ancien, plus on donne de poids aux scores existants
      // Nouveau compte (< 30 jours) : 30% ancien, 70% nouveau
      // Compte mature (> 90 jours) : 70% ancien, 30% nouveau
      let existingWeight: number;
      let newWeight: number;
      
      if (accountAgeInDays < 30) {
        existingWeight = 0.3;
        newWeight = 0.7;
      } else if (accountAgeInDays < 90) {
        existingWeight = 0.5;
        newWeight = 0.5;
      } else {
        existingWeight = 0.7;
        newWeight = 0.3;
      }

      // Si c'est le premier CV, on donne plus de poids au nouveau score
      if (!hasPreviousCv) {
        existingWeight = 0.2;
        newWeight = 0.8;
      }

      // Calculer les nouveaux scores avec moyenne pondérée
      const newAvailability = Math.round(
        (currentAvailability * existingWeight) + (cvAvailability * newWeight)
      );
      
      const newPerformanceScore = Math.round(
        (currentPerformanceScore * existingWeight) + (cvPerformanceScore * newWeight)
      );

      // S'assurer que les scores sont dans la plage 0-100
      const finalAvailability = Math.max(0, Math.min(100, newAvailability));
      const finalPerformanceScore = Math.max(0, Math.min(100, newPerformanceScore));

      // Générer le raisonnement
      const evolutionReasoning = this.generateEvolutionReasoning(
        currentAvailability,
        currentPerformanceScore,
        cvAvailability,
        cvPerformanceScore,
        finalAvailability,
        finalPerformanceScore,
        accountAgeInDays,
        hasPreviousCv
      );

      this.logger.log(`Score evolution calculated: Availability ${currentAvailability} -> ${finalAvailability}, Performance ${currentPerformanceScore} -> ${finalPerformanceScore}`);

      return {
        newAvailability: finalAvailability,
        newPerformanceScore: finalPerformanceScore,
        evolutionReasoning,
        previousAvailability: currentAvailability,
        previousPerformanceScore: currentPerformanceScore,
        cvAvailability,
        cvPerformanceScore
      };
    } catch (error) {
      this.logger.error(`Score evolution calculation failed: ${error.message}`);
      // En cas d'erreur, retourner les scores du CV
      return {
        newAvailability: cvAvailability,
        newPerformanceScore: cvPerformanceScore,
        evolutionReasoning: 'Calcul d\'évolution échoué, utilisation des scores du CV',
        previousAvailability: currentAvailability,
        previousPerformanceScore: currentPerformanceScore,
        cvAvailability,
        cvPerformanceScore
      };
    }
  }

  private generateEvolutionReasoning(
    currentAvailability: number,
    currentPerformanceScore: number,
    cvAvailability: number,
    cvPerformanceScore: number,
    finalAvailability: number,
    finalPerformanceScore: number,
    accountAgeInDays: number,
    hasPreviousCv: boolean
  ): string {
    const availabilityChange = finalAvailability - currentAvailability;
    const performanceChange = finalPerformanceScore - currentPerformanceScore;
    
    let reasoning = '';
    
    // Raisonnement sur l'âge du compte
    if (accountAgeInDays < 30) {
      reasoning += 'Compte récent (< 30 jours) : les nouveaux scores ont plus d\'impact. ';
    } else if (accountAgeInDays < 90) {
      reasoning += 'Compte en développement (30-90 jours) : équilibre entre ancien et nouveau. ';
    } else {
      reasoning += 'Compte mature (> 90 jours) : les scores existants ont plus de poids. ';
    }

    // Raisonnement sur le premier CV
    if (!hasPreviousCv) {
      reasoning += 'Premier CV uploadé : impact majeur sur les scores. ';
    }

    // Raisonnement sur les changements
    if (Math.abs(availabilityChange) > 10) {
      if (availabilityChange > 0) {
        reasoning += `Disponibilité en hausse significative (+${availabilityChange} points). `;
      } else {
        reasoning += `Disponibilité en baisse significative (${availabilityChange} points). `;
      }
    } else {
      reasoning += `Disponibilité stable (${availabilityChange > 0 ? '+' : ''}${availabilityChange} points). `;
    }

    if (Math.abs(performanceChange) > 10) {
      if (performanceChange > 0) {
        reasoning += `Performance en hausse significative (+${performanceChange} points). `;
      } else {
        reasoning += `Performance en baisse significative (${performanceChange} points). `;
      }
    } else {
      reasoning += `Performance stable (${performanceChange > 0 ? '+' : ''}${performanceChange} points). `;
    }

    // Résumé final
    reasoning += `Scores finaux : Disponibilité ${finalAvailability}/100, Performance ${finalPerformanceScore}/100.`;

    return reasoning;
  }

  /**
   * Calcule les scores initiaux basés sur l'évaluation d'inscription
   */
  calculateInitialScores(evaluationResult: {
    emailProfessionality: number;
    passwordStrength: number;
    nameQuality: number;
    initialAvailability: number;
    initialPerformanceScore: number;
  }): { availability: number; performanceScore: number } {
    // Utiliser directement les scores de l'évaluation IA
    return {
      availability: evaluationResult.initialAvailability,
      performanceScore: evaluationResult.initialPerformanceScore
    };
  }
}

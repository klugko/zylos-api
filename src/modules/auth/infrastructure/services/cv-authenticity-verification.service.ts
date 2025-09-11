import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';

export interface CvAuthenticityResult {
  isAuthentic: boolean;
  confidence: number; // 0-100
  matchingElements: string[];
  mismatchingElements: string[];
  verificationReasoning: string;
}

@Injectable()
export class CvAuthenticityVerificationService {
  private readonly logger = new Logger(CvAuthenticityVerificationService.name);

  constructor(
    private readonly openaiService: OpenAIService,
  ) {}

  async verifyCvAuthenticity(
    cvText: string,
    userFullname: string,
    userEmail: string,
    userPhone?: string,
    userPoste?: string
  ): Promise<CvAuthenticityResult> {
    try {
      const emailFound = this.findEmailInCv(cvText, userEmail);
      
      if (emailFound) {
        this.logger.log(`Email ${userEmail} found in CV - authenticity verified`);
        return {
          isAuthentic: true,
          confidence: 90,
          matchingElements: [`Email ${userEmail} trouvé dans le CV`],
          mismatchingElements: [],
          verificationReasoning: `Email utilisateur ${userEmail} trouvé dans le CV - authentification réussie`
        };
      } else {
        this.logger.warn(`Email ${userEmail} not found in CV - authenticity failed`);
        return {
          isAuthentic: false,
          confidence: 10,
          matchingElements: [],
          mismatchingElements: [`Email ${userEmail} non trouvé dans le CV`],
          verificationReasoning: `Email utilisateur ${userEmail} non trouvé dans le CV - le CV ne semble pas appartenir à cet utilisateur`
        };
      }
    } catch (error) {
      this.logger.error(`CV authenticity verification failed: ${error.message}`);
      return {
        isAuthentic: false,
        confidence: 0,
        matchingElements: [],
        mismatchingElements: ['Erreur technique lors de la vérification'],
        verificationReasoning: 'Impossible de vérifier l\'authenticité du CV en raison d\'une erreur technique'
      };
    }
  }

  private findEmailInCv(cvText: string, userEmail: string): boolean {
    try {
      const normalizedUserEmail = userEmail.toLowerCase().trim();
      const normalizedCvText = cvText.toLowerCase();
      
      if (normalizedCvText.includes(normalizedUserEmail)) {
        return true;
      }
      
      const emailVariations = this.generateEmailVariations(normalizedUserEmail);
      
      for (const variation of emailVariations) {
        if (normalizedCvText.includes(variation)) {
          this.logger.log(`Email variation found: ${variation}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Error searching email in CV: ${error.message}`);
      return false;
    }
  }

  private generateEmailVariations(email: string): string[] {
    const variations: string[] = [];
    
    variations.push(email);
    
    const [localPart, domain] = email.split('@');
    if (localPart && domain) {
      const spacedLocal = localPart.replace(/\./g, ' ');
      variations.push(`${spacedLocal}@${domain}`);
      
      const dashedLocal = localPart.replace(/\./g, '-');
      variations.push(`${dashedLocal}@${domain}`);
      
      const dottedLocal = localPart.replace(/-/g, '.');
      variations.push(`${dottedLocal}@${domain}`);
      
      const spacedDashedLocal = localPart.replace(/-/g, ' ');
      variations.push(`${spacedDashedLocal}@${domain}`);
    }
    
    return variations;
  }
}

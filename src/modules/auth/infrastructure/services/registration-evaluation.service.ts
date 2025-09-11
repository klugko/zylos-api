import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';

export interface RegistrationEvaluationResult {
  emailProfessionality: number; // 0-100
  passwordStrength: number; // 0-100
  nameQuality: number; // 0-100
  initialAvailability: number; // 0-100
  initialPerformanceScore: number; // 0-100
  evaluationReasoning: string;
}

@Injectable()
export class RegistrationEvaluationService {
  private readonly logger = new Logger(RegistrationEvaluationService.name);

  constructor(
    private readonly openaiService: OpenAIService,
  ) {}

  async evaluateRegistration(
    fullname: string,
    email: string,
    password: string,
    role: string
  ): Promise<RegistrationEvaluationResult> {
    try {
      const isBasicAccount = this.isBasicAccount(fullname, email);
      
      if (isBasicAccount) {
        this.logger.log(`Basic account detected: ${fullname} - ${email}`);
        return {
          emailProfessionality: 10,
          passwordStrength: 30,
          nameQuality: 10,
          initialAvailability: 5,
          initialPerformanceScore: 8,
          evaluationReasoning: 'Compte basique détecté automatiquement'
        };
      }

      const prompt = this.buildEvaluationPrompt(fullname, email, password, role);
      
      const response = await this.openaiService.generateCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en évaluation de profils professionnels. Tu analyses les informations d\'inscription pour évaluer la qualité et la professionnalité d\'un utilisateur.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response received from OpenAI');
      }

      const result = this.parseEvaluationResponse(content);
      
      return this.validateAndAdjustScores(result, fullname, email);
    } catch (error) {
      this.logger.error(`Registration evaluation failed: ${error.message}`);
      return {
        emailProfessionality: 30,
        passwordStrength: 30,
        nameQuality: 30,
        initialAvailability: 8,
        initialPerformanceScore: 12,
        evaluationReasoning: 'Évaluation par défaut stricte en cas d\'erreur technique'
      };
    }
  }

  private buildEvaluationPrompt(fullname: string, email: string, password: string, role: string): string {
    return `
Évalue les informations d'inscription suivantes et retourne UNIQUEMENT un JSON valide :

INFORMATIONS À ÉVALUER :
- Nom complet: "${fullname}"
- Email: "${email}"
- Rôle: "${role}"
- Mot de passe: "${password}" (longueur: ${password.length} caractères)

CRITÈRES D'ÉVALUATION :

1. EMAIL PROFESSIONNALITÉ (0-100) :
   - Email professionnel (entreprise, domaine spécialisé) : 80-100
   - Email personnel mais sérieux (gmail, outlook) : 50-70
   - Email suspect ou non professionnel : 0-40
   - Emails basiques (admin@admin.com, test@test.com) : 0-20

2. FORCE DU MOT DE PASSE (0-100) :
   - Très fort (12+ caractères, majuscules, minuscules, chiffres, symboles) : 90-100
   - Fort (8-11 caractères, mélange de types) : 70-89
   - Moyen (6-7 caractères, basique) : 40-69
   - Faible (<6 caractères ou très simple) : 0-39

3. QUALITÉ DU NOM (0-100) :
   - Nom complet et professionnel : 80-100
   - Nom correct mais incomplet : 50-79
   - Nom suspect ou non professionnel : 0-49
   - Noms basiques (admin, test, user, demo) : 0-20

4. DISPONIBILITÉ INITIALE (0-20) :
   - Basée sur l'impression générale de professionnalité
   - Email professionnel + mot de passe fort + nom complet = 15-20
   - Email personnel + mot de passe moyen + nom correct = 8-15
   - Email suspect + mot de passe faible + nom suspect = 2-8
   - Comptes basiques (admin, test, etc.) = 3-8

5. SCORE DE PERFORMANCE INITIAL (0-20) :
   - Basé sur la cohérence et la qualité globale du profil
   - Email professionnel + mot de passe fort + nom complet = 15-20
   - Email personnel + mot de passe moyen + nom correct = 8-15
   - Email suspect + mot de passe faible + nom suspect = 2-8
   - Comptes basiques (admin, test, etc.) = 3-10

RETOURNE UNIQUEMENT CE JSON (sans commentaires) :
{
  "emailProfessionality": [0-100],
  "passwordStrength": [0-100],
  "nameQuality": [0-100],
  "initialAvailability": [0-100],
  "initialPerformanceScore": [0-100],
  "evaluationReasoning": "Explication courte de l'évaluation en français"
}
`;
  }

  private parseEvaluationResponse(content: string): RegistrationEvaluationResult {
    try {
      let jsonText = content.trim();
      
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
      }
      
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON found in response');
      }
      
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
      
      const parsed = JSON.parse(jsonText);
      
      const emailProfessionality = Math.max(0, Math.min(100, parseInt(parsed.emailProfessionality) || 30));
      const passwordStrength = Math.max(0, Math.min(100, parseInt(parsed.passwordStrength) || 30));
      const nameQuality = Math.max(0, Math.min(100, parseInt(parsed.nameQuality) || 30));
      const initialAvailability = Math.max(0, Math.min(20, parseInt(parsed.initialAvailability) || 8));
      const initialPerformanceScore = Math.max(0, Math.min(20, parseInt(parsed.initialPerformanceScore) || 12));

      return {
        emailProfessionality,
        passwordStrength,
        nameQuality,
        initialAvailability,
        initialPerformanceScore,
        evaluationReasoning: parsed.evaluationReasoning || 'Évaluation effectuée'
      };
    } catch (error) {
      this.logger.error(`Failed to parse evaluation response: ${error.message}`);
      throw new Error('Impossible de parser la réponse d\'évaluation');
    }
  }

  private isBasicAccount(fullname: string, email: string): boolean {
    const basicNames = ['admin', 'user', 'test', 'demo', 'guest', 'temp', 'temporary'];
    const basicEmails = ['admin@admin.com', 'user@user.com', 'test@test.com', 'demo@demo.com'];
    
    const nameLower = fullname.toLowerCase().trim();
    const emailLower = email.toLowerCase().trim();
    
    const isBasicName = basicNames.some(basicName => 
      nameLower === basicName || 
      nameLower.includes(basicName) ||
      nameLower.length <= 3
    );
    
    const isBasicEmail = basicEmails.some(basicEmail => 
      emailLower === basicEmail ||
      emailLower.includes('@admin.') ||
      emailLower.includes('@user.') ||
      emailLower.includes('@test.') ||
      emailLower.includes('@demo.')
    );
    
    return isBasicName || isBasicEmail;
  }

  private validateAndAdjustScores(
    result: RegistrationEvaluationResult, 
    fullname: string, 
    email: string
  ): RegistrationEvaluationResult {
    const isSuspicious = this.isSuspiciousAccount(fullname, email);
    
    if (isSuspicious && (result.initialAvailability > 8 || result.initialPerformanceScore > 10)) {
      this.logger.warn(`Adjusting high scores for suspicious account: ${fullname} - ${email}`);
      return {
        ...result,
        initialAvailability: Math.min(result.initialAvailability, 8),
        initialPerformanceScore: Math.min(result.initialPerformanceScore, 10),
        evaluationReasoning: result.evaluationReasoning + ' (Scores ajustés pour compte suspect)'
      };
    }
    
    return result;
  }

  private isSuspiciousAccount(fullname: string, email: string): boolean {
    const suspiciousNames = ['admin', 'user', 'test', 'demo', 'guest'];
    const suspiciousEmails = ['admin@', 'user@', 'test@', 'demo@'];
    
    const nameLower = fullname.toLowerCase().trim();
    const emailLower = email.toLowerCase().trim();
    
    const isSuspiciousName = suspiciousNames.some(suspiciousName => 
      nameLower === suspiciousName || 
      nameLower.includes(suspiciousName)
    );
    
    const isSuspiciousEmail = suspiciousEmails.some(suspiciousEmail => 
      emailLower.startsWith(suspiciousEmail)
    );
    
    return isSuspiciousName || isSuspiciousEmail;
  }
}

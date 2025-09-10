import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';

export interface ExtractedSkill {
  name: string;
  category?: string;
  proficiency: number;        // 0-100
  monthsExperience?: number;  // Mois d'expérience (plus précis que les années)
  seniority?: string;         // junior, intermediate, senior
  confidence?: number;        // 0-100, niveau de confiance de l'IA
  lastUsedYear?: number;      // Année de dernière utilisation
}

@Injectable()
export class SkillExtractionService {
  private readonly logger = new Logger(SkillExtractionService.name);
  

  constructor(private readonly openaiService: OpenAIService) {}

  async extractSkillsFromText(text: string): Promise<ExtractedSkill[]> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY manquant');
    }

    const maxChars = 18000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

    const systemPrompt = `You are a recruitment assistant. Extract concise, normalized skills from resumes. 
Prefer canonical names (e.g., 'PostgreSQL', 'FastAPI', 'Azure'), avoid duplicates. 
Return a JSON object with a 'skills' array containing skill objects with these fields: 
name (string), category (string), proficiency (0-100), months_experience (number), 
seniority (string: junior/intermediate/senior), confidence (0-100), last_used_year (integer).

Analyze the context carefully to determine:
- Proficiency level based on experience and usage
- Months of experience from job descriptions and timelines (convert years to months: 1 year = 12 months, 6 months = 6 months)
- Seniority level from roles and responsibilities
- Confidence in your assessment (0-100)
- Last used year from recent projects/roles`;

    const userPrompt = `Extract skills from this resume text:\n\n${truncatedText}`;

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

      const parsed = JSON.parse(content);
      const skills = parsed.skills || [];

      return this.normalizeSkills(skills);
    } catch (error) {
      this.logger.error(`Skill extraction failed: ${error.message}`);
      throw new Error(`Échec de l'extraction des compétences: ${error.message}`);
    }
  }

  private normalizeSkills(skills: any[]): ExtractedSkill[] {
    const normalizedSkills: ExtractedSkill[] = [];

      for (const skill of skills) {
        const name = (skill.name || '').trim();
        if (!name) continue;

        // Normaliser les valeurs
        const proficiency = Math.max(0, Math.min(100, parseInt(skill.proficiency) || 50));
        const monthsExperience = skill.months_experience ? Math.max(0, parseInt(skill.months_experience)) : undefined;
        const confidence = skill.confidence ? Math.max(0, Math.min(100, parseInt(skill.confidence))) : undefined;
        const lastUsedYear = skill.last_used_year ? parseInt(skill.last_used_year) : undefined;
        
        // Normaliser la séniorité
        let seniority = skill.seniority?.toLowerCase()?.trim();
        if (seniority && !['junior', 'intermediate', 'senior'].includes(seniority)) {
          seniority = 'intermediate'; // Valeur par défaut
        }

        normalizedSkills.push({
          name: name.substring(0, 120),
          category: skill.category?.trim() || undefined,
          proficiency,
          monthsExperience,
          seniority: seniority || undefined,
          confidence,
          lastUsedYear,
        });
      }

    return normalizedSkills;
  }

}
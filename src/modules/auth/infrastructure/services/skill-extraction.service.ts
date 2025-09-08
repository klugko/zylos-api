import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';

export interface ExtractedSkill {
  name: string;
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
Return a JSON object with a 'skills' array containing skill objects with this field: 
name (string).`;

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

      normalizedSkills.push({
        name: name.substring(0, 120)
      });
    }

    return normalizedSkills;
  }

}
import { Injectable } from '@nestjs/common';

export interface WeightConfig {
  tauRecencyYears: number;      // constante de décroissance (plus grand = moins de pénalité)
  minRecencyFactor: number;     // plancher si très ancien
  expBoostMaxYears: number;     // au-delà, pas plus de boost
  expBoostMin: number;          // poids mini d'expérience
  expBoostMax: number;          // poids maxi d'expérience
  confBase: number;             // base si confidence absent
  kGlobalTop: number;           // nombre de skills à agréger pour score global
  kFamilyTop: number;           // top N par famille pour agrégats
}

export interface ScoredSkill {
  name: string;
  family: string;
  weightedScore: number;
  proficiency: number;
  experienceMonths?: number;
  recencyFactor: number;
  confidence?: number;
}

export interface FamilySummary {
  family: string;
  score: number;
  topSkills: ScoredSkill[];
}

export interface SkillAggregation {
  globalScore: number;
  familyCount: number;
  families: FamilySummary[];
}

@Injectable()
export class SkillScoringService {
  private readonly config: WeightConfig;

  constructor() {
    this.config = {
      tauRecencyYears: 6.0,
      minRecencyFactor: 0.6,
      expBoostMaxYears: 5.0,
      expBoostMin: 0.6,
      expBoostMax: 1.0,
      confBase: 0.75,
      kGlobalTop: 10,
      kFamilyTop: 3,
    };
  }

  private recencyFactor(lastUsedYear?: number): number {
    if (!lastUsedYear) {
      return 1.0; // pas d'info -> neutre
    }
    const nowYear = new Date().getFullYear();
    const age = Math.max(0, nowYear - lastUsedYear);
    // exponentiel avec plancher
    return Math.max(this.config.minRecencyFactor, Math.exp(-age / this.config.tauRecencyYears));
  }

  private experienceFactor(monthsExperience?: number): number {
    if (monthsExperience === undefined || monthsExperience === null) {
      return this.config.expBoostMin;
    }
    const months = Math.max(0.0, monthsExperience);
    const years = months / 12.0; // Convertir les mois en années
    const ratio = Math.min(1.0, years / this.config.expBoostMaxYears);
    return this.config.expBoostMin + (this.config.expBoostMax - this.config.expBoostMin) * ratio;
  }

  private confidenceFactor(confidence?: number): number {
    if (confidence === undefined || confidence === null) {
      return this.config.confBase;
    }
    const c = Math.max(0, Math.min(100, confidence)) / 100.0;
    return 0.5 + 0.5 * c; // 0.5..1.0
  }

  scoreSkill(
    name: string,
    proficiency: number,
    category?: string,
    monthsExperience?: number,
    confidence?: number,
    lastUsedYear?: number,
  ): ScoredSkill {
    const prof = Math.max(0, Math.min(100, proficiency)) / 100.0;
    const fExp = this.experienceFactor(monthsExperience);
    const fRec = this.recencyFactor(lastUsedYear);
    const fConf = this.confidenceFactor(confidence);

    const weighted = 100.0 * prof * fExp * fRec * fConf;

    return {
      name,
      family: this.classifyFamily(name, category),
      weightedScore: Math.round(Math.min(100.0, weighted) * 100) / 100,
      proficiency: Math.round(prof * 100),
      experienceMonths: monthsExperience,
      recencyFactor: Math.round(fRec * 1000) / 1000,
      confidence,
    };
  }

  private classifyFamily(skillName: string, category?: string): string {
    // Logique simplifiée pour la classification
    const name = skillName.toLowerCase();
    
    if (category) {
      const categoryMap: Record<string, string> = {
        language: 'programming_languages',
        framework: 'web_frameworks',
        library: 'web_frameworks',
        database: 'databases',
        cloud: 'cloud',
        devops: 'devops',
        ml: 'data_ml',
        data: 'data_ml',
        mobile: 'mobile',
        testing: 'testing',
        tool: 'tools',
        soft: 'soft_skills',
        domain: 'domain',
      };
      
      if (categoryMap[category.toLowerCase()]) {
        return categoryMap[category.toLowerCase()];
      }
    }

    // Classification par nom
    if (/\b(python|java|kotlin|go|golang|rust|typescript|javascript|node\.?js|c\+\+|c#|php|ruby|scala|swift|dart)\b/i.test(name)) {
      return 'programming_languages';
    }
    if (/\b(fastapi|django|flask|spring|laravel|symfony|rails|express|nest\.?js|next\.?js|angular|react|vue)\b/i.test(name)) {
      return 'web_frameworks';
    }
    if (/\b(postgres(?:ql)?|mysql|mariadb|sqlite|oracle|sql server|mongodb|redis|elasticsearch)\b/i.test(name)) {
      return 'databases';
    }
    if (/\b(aws|gcp|google cloud|azure|cloud run|lambda|ecs|eks|gke|s3|terraform)\b/i.test(name)) {
      return 'cloud';
    }
    if (/\b(docker|kubernetes|k8s|github actions|gitlab ci|jenkins|helm|prometheus|grafana)\b/i.test(name)) {
      return 'devops';
    }
    if (/\b(pandas|numpy|pyspark|spark|airflow|sklearn|tensorflow|pytorch|mlflow)\b/i.test(name)) {
      return 'data_ml';
    }
    if (/\b(android|ios|swiftui|react native|flutter)\b/i.test(name)) {
      return 'mobile';
    }
    if (/\b(pytest|unittest|jest|cypress|playwright|junit|selenium)\b/i.test(name)) {
      return 'testing';
    }
    if (/\b(git|linux|bash|zsh|make|vim|vscode|postman|swagger|openapi)\b/i.test(name)) {
      return 'tools';
    }
    if (/\b(communication|leadership|mentoring|agile|scrum|kanban|collaboration)\b/i.test(name)) {
      return 'soft_skills';
    }

    return 'other';
  }

  aggregate(scoredSkills: ScoredSkill[]): SkillAggregation {
    const famMap: Record<string, ScoredSkill[]> = {};
    
    // Grouper par famille
    for (const skill of scoredSkills) {
      if (!famMap[skill.family]) {
        famMap[skill.family] = [];
      }
      famMap[skill.family].push(skill);
    }

    const families: FamilySummary[] = [];
    let nonEmptyFams = 0;
    const allScores: number[] = [];

    for (const [family, items] of Object.entries(famMap)) {
      const itemsSorted = items.sort((a, b) => b.weightedScore - a.weightedScore);
      const top = itemsSorted.slice(0, this.config.kFamilyTop);
      
      if (top.length > 0) {
        nonEmptyFams++;
      }
      
      const famScore = top.length > 0 
        ? Math.round((top.reduce((sum, x) => sum + x.weightedScore, 0) / top.length) * 100) / 100
        : 0.0;

      families.push({
        family,
        score: famScore,
        topSkills: top,
      });

      allScores.push(...itemsSorted.map(x => x.weightedScore));
    }

    allScores.sort((a, b) => b - a);
    const topGlobal = allScores.slice(0, this.config.kGlobalTop);
    const baseGlobal = topGlobal.length > 0 
      ? Math.round((topGlobal.reduce((sum, x) => sum + x, 0) / topGlobal.length) * 100) / 100
      : 0.0;

    const coverage = nonEmptyFams / 8.0; // 8 familles "tech" typiques
    const normalizedCoverage = Math.max(0.0, Math.min(1.0, coverage));
    const globalScore = Math.round(Math.min(100.0, baseGlobal * (0.9 + 0.1 * normalizedCoverage)) * 100) / 100;

    families.sort((a, b) => b.score - a.score);

    return {
      globalScore,
      familyCount: nonEmptyFams,
      families,
    };
  }
}

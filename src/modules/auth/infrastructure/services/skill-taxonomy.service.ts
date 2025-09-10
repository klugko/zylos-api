import { Injectable } from '@nestjs/common';

@Injectable()
export class SkillTaxonomyService {
  private readonly families = [
    'programming_languages',
    'web_frameworks',
    'databases',
    'cloud',
    'devops',
    'data_ml',
    'mobile',
    'testing',
    'tools',
    'soft_skills',
    'domain',
    'other',
  ];

  private readonly patterns: Record<string, RegExp[]> = {
    programming_languages: [
      /\b(python|java|kotlin|go|golang|rust|typescript|javascript|node\.?js|c\+\+|c#|php|ruby|scala|swift|dart)\b/i,
    ],
    web_frameworks: [
      /\b(fastapi|django|flask|spring|spring boot|laravel|symfony|rails|express|nest\.?js|next\.?js|nuxt\.?js|angular|react|vue)\b/i,
    ],
    databases: [
      /\b(postgres(?:ql)?|mysql|mariadb|sqlite|oracle|sql server|mssql|mongodb|redis|elasticsearch|dynamodb|cassandra|neo4j)\b/i,
    ],
    cloud: [
      /\b(aws|gcp|google cloud|azure|cloud run|lambda|ecs|eks|gke|aks|cloudfront|s3|cloudformation|terraform|pulumi)\b/i,
    ],
    devops: [
      /\b(docker|kubernetes|k8s|github actions|gitlab ci|jenkins|argo|istio|helm|prometheus|grafana|ansible)\b/i,
    ],
    data_ml: [
      /\b(pandas|numpy|pyspark|spark|airflow|dbt|sklearn|tensorflow|pytorch|mlflow|huggingface)\b/i,
    ],
    mobile: [
      /\b(android|ios|swiftui|kotlin multiplatform|react native|flutter)\b/i,
    ],
    testing: [
      /\b(pytest|unittest|jest|cypress|playwright|junit|selenium|cucumber)\b/i,
    ],
    tools: [
      /\b(git|linux|bash|zsh|make|vim|vscode|postman|swagger|openapi|grpc)\b/i,
    ],
    soft_skills: [
      /\b(communication|leadership|mentoring|agile|scrum|kanban|ownership|collaboration)\b/i,
    ],
    domain: [
      /\b(fintech|healthcare|e-?commerce|iot|telecom|banking|insurtech|adtech|edtech|gaming)\b/i,
    ],
  };

  private readonly categoryToFamily: Record<string, string> = {
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
    other: 'other',
  };

  classifyFamily(skillName: string, category?: string): string {

    if (category) {
      const family = this.categoryToFamily[category.toLowerCase()];
      if (family) {
        return family;
      }
    }

    const name = skillName.toLowerCase().trim();
    for (const [family, patterns] of Object.entries(this.patterns)) {
      if (patterns.some(pattern => pattern.test(name))) {
        return family;
      }
    }

    return 'other';
  }

  getAllFamilies(): string[] {
    return [...this.families];
  }
}

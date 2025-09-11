import { Injectable, Logger, Inject } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';
import { PrismaService } from '@core/prisma/prisma.service';

export interface UserContext {
  userId: string;
  userRole: string;
  userProfile: {
    fullname: string;
    email: string;
    phone?: string;
    poste?: string;
    skills: string[];
    availability: number;
    performanceScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  userProjects: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  userTasks: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: Date;
    projectId: string;
  }>;
  userDocuments: Array<{
    id: string;
    title: string;
    type: string;
    projectId?: string;
  }>;
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly prisma: PrismaService,
  ) {}

  async generateResponse(userMessage: string, userContext: UserContext): Promise<string> {
    try {
      // Construire le contexte sécurisé pour l'utilisateur
      const secureContext = this.buildSecureContext(userContext);
      
      // Construire le prompt système avec les contraintes de sécurité
      const systemPrompt = this.buildSystemPrompt(secureContext);
      
      // Construire l'historique de conversation si nécessaire
      const conversationHistory = await this.getConversationHistory(userContext.userId);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await this.openaiService.generateCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response received from OpenAI');
      }

      return content;
    } catch (error) {
      this.logger.error(`AI Assistant response generation failed: ${error.message}`);
      return 'Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.';
    }
  }

  private buildSecureContext(userContext: UserContext): any {
    return {
      user: {
        id: userContext.userId,
        role: userContext.userRole,
        profile: userContext.userProfile
      },
      projects: userContext.userProjects,
      tasks: userContext.userTasks,
      documents: userContext.userDocuments
    };
  }

  private buildSystemPrompt(context: any): string {
    return `Tu es un assistant IA spécialisé dans la gestion de projets et de tâches. Tu aides les utilisateurs avec leurs projets, tâches, et documents.

CONTRAINTES DE SÉCURITÉ IMPORTANTES :
- Tu ne peux accéder qu'aux informations de l'utilisateur connecté
- Tu ne peux pas accéder aux données d'autres utilisateurs
- Tu ne peux pas créer, modifier ou supprimer des données sans autorisation explicite
- Tu ne peux que consulter et analyser les données de l'utilisateur

INFORMATIONS DISPONIBLES POUR CET UTILISATEUR :
- Rôle: ${context.user.role}
- Profil: ${JSON.stringify(context.user.profile)}
- Projets: ${JSON.stringify(context.projects)}
- Tâches: ${JSON.stringify(context.tasks)}
- Documents: ${JSON.stringify(context.documents)}

CAPACITÉS :
1. Afficher les informations de profil de l'utilisateur (nom, email, poste, compétences, etc.)
2. Analyser les tâches en retard ou à venir
3. Fournir des résumés de projets
4. Suggérer des priorités de tâches
5. Analyser les documents (lecture seule)
6. Créer des rapports basés sur les données disponibles
7. Répondre aux questions sur la gestion de projet

RÈGLES :
- Sois toujours utile et professionnel
- Ne propose que des actions que l'utilisateur peut réellement effectuer
- Si tu ne peux pas répondre à une question, explique pourquoi
- Utilise les données fournies pour donner des réponses précises
- Ne jamais accéder à des données d'autres utilisateurs

Réponds en français et sois concis mais informatif.`;
  }

  private async getConversationHistory(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const recentMessages = await this.prisma.aiMessage.findMany({
        where: {
          conversation: {
            userId: userId
          }
        },
        include: {
          conversation: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit * 2 // Prendre plus pour avoir des paires user/assistant
      });

      // Organiser les messages par conversation et garder seulement les plus récents
      const history: any[] = [];
      const processedConversations = new Set();

      for (const message of recentMessages) {
        if (!processedConversations.has(message.conversationId)) {
          processedConversations.add(message.conversationId);
          
          // Trouver le message de l'utilisateur et la réponse de l'assistant
          const conversationMessages = recentMessages.filter(m => m.conversationId === message.conversationId);
          const userMsg = conversationMessages.find(m => m.role === 'USER');
          const assistantMsg = conversationMessages.find(m => m.role === 'ASSISTANT');

          if (userMsg && assistantMsg) {
            history.unshift(
              { role: 'user', content: userMsg.content },
              { role: 'assistant', content: assistantMsg.content }
            );
          }

          if (history.length >= limit * 2) break;
        }
      }

      return history;
    } catch (error) {
      this.logger.error(`Failed to get conversation history: ${error.message}`);
      return [];
    }
  }

  async getUserContext(userId: string): Promise<UserContext> {
    try {
      // Récupérer les informations complètes de l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          role: true,
          fullname: true,
          email: true,
          phone: true,
          poste: true,
          skills: true,
          availability: true,
          performanceScore: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Récupérer les projets de l'utilisateur (en tant que membre ET propriétaire)
      const [memberProjects, ownedProjects] = await Promise.all([
        // Projets où l'utilisateur est membre
        this.prisma.projectMember.findMany({
          where: { userId },
          include: {
            project: {
              select: { id: true, name: true }
            }
          }
        }),
        // Projets dont l'utilisateur est propriétaire
        this.prisma.project.findMany({
          where: { ownerId: userId },
          select: { id: true, name: true }
        })
      ]);

      // Combiner et dédupliquer les projets
      const allProjects = [
        ...memberProjects.map(pm => ({
          id: pm.project.id,
          name: pm.project.name,
          role: pm.role
        })),
        ...ownedProjects.map(project => ({
          id: project.id,
          name: project.name,
          role: 'OWNER'
        }))
      ];

      // Dédupliquer par ID de projet
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      );

      // Récupérer les tâches de l'utilisateur (assignées ET dans ses projets)
      const projectIds = uniqueProjects.map(p => p.id);
      const userTasks = await this.prisma.task.findMany({
        where: {
          OR: [
            { assignedUserId: userId },
            { projectId: { in: projectIds } }
          ]
        },
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          projectId: true,
          assignedUserId: true
        }
      });

      // Récupérer les documents de l'utilisateur (uploadés ET dans ses projets)
      const userDocuments = await this.prisma.document.findMany({
        where: {
          OR: [
            { uploadedById: userId },
            { projectId: { in: projectIds } }
          ]
        },
        select: {
          id: true,
          name: true,
          type: true,
          projectId: true,
          uploadedById: true
        }
      });

      return {
        userId: user.id,
        userRole: user.role,
        userProfile: {
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          poste: user.poste,
          skills: user.skills,
          availability: user.availability,
          performanceScore: user.performanceScore,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        userProjects: uniqueProjects,
        userTasks: userTasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          dueDate: task.dueDate,
          projectId: task.projectId
        })),
        userDocuments: userDocuments.map(doc => ({
          id: doc.id,
          title: doc.name,
          type: doc.type,
          projectId: doc.projectId
        }))
      };
    } catch (error) {
      this.logger.error(`Failed to get user context: ${error.message}`);
      throw new Error('Impossible de récupérer le contexte utilisateur');
    }
  }
}

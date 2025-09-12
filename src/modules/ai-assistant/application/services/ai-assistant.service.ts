import { Injectable, Logger, Inject } from '@nestjs/common';
import { OpenAIService } from '../../../../shared/ai/openai.service';
import { PrismaService } from '@core/prisma/prisma.service';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';

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
    description?: string;
    status: string;
    priority?: string;
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    projectId: string;
    projectName?: string;
    isAssigned: boolean;
    assignedUserId?: string;
    assignee?: {
      id: string;
      fullname: string;
      email: string;
    };
  }>;
  userDocuments: Array<{
    id: string;
    title: string;
    type: string;
    projectId?: string;
    projectName?: string;
    isUploaded: boolean;
  }>;
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly prisma: PrismaService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async generateResponse(userMessage: string, userContext: UserContext): Promise<string> {
    try {
      const isPdfRequest = this.detectPdfRequest(userMessage);
      
      if (isPdfRequest) {
        return await this.handlePdfGeneration(userMessage, userContext);
      }

      const secureContext = this.buildSecureContext(userContext);

      const systemPrompt = this.buildSystemPrompt(secureContext);

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

  public buildSecureContext(userContext: UserContext): any {
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
8. GÉNÉRER DES PDF : Si l'utilisateur demande de créer un document PDF ou un rapport PDF, tu peux utiliser la fonction generatePdf() avec les paramètres appropriés

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
        take: limit * 2
      });

      const history: any[] = [];
      const processedConversations = new Set();

      for (const message of recentMessages) {
        if (!processedConversations.has(message.conversationId)) {
          processedConversations.add(message.conversationId);

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

      const [memberProjects, ownedProjects] = await Promise.all([
        this.prisma.projectMember.findMany({
          where: { userId },
          include: {
            project: {
              select: { id: true, name: true }
            }
          }
        }),
        this.prisma.project.findMany({
          where: { ownerId: userId },
          select: { id: true, name: true }
        })
      ]);

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

      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      );

      const projectIds = uniqueProjects.map(p => p.id);
      
      const allProjectTasks = await this.prisma.task.findMany({
        where: { 
          projectId: { in: projectIds }
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          startDate: true,
          endDate: true,
          projectId: true,
          assignedUserId: true,
          project: {
            select: { name: true }
          },
          assignee: {
            select: {
              id: true,
              fullname: true,
              email: true
            }
          }
        }
      });

      const assignedTasks = allProjectTasks.filter(task => task.assignedUserId === userId);
      const projectTasks = allProjectTasks.filter(task => task.assignedUserId !== userId);


      const [uploadedDocuments, projectDocuments] = await Promise.all([
        this.prisma.document.findMany({
          where: { uploadedById: userId },
          select: {
            id: true,
            name: true,
            type: true,
            projectId: true,
            uploadedById: true,
            project: {
              select: { name: true }
            }
          }
        }),
        this.prisma.document.findMany({
          where: { 
            projectId: { in: projectIds },
            uploadedById: { not: userId }
          },
          select: {
            id: true,
            name: true,
            type: true,
            projectId: true,
            uploadedById: true,
            project: {
              select: { name: true }
            }
          }
        })
      ]);

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
        userTasks: [
          ...assignedTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            startDate: task.startDate,
            endDate: task.endDate,
            projectId: task.projectId,
            projectName: task.project?.name,
            isAssigned: true,
            assignedUserId: task.assignedUserId,
            assignee: task.assignee
          })),
          ...projectTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            startDate: task.startDate,
            endDate: task.endDate,
            projectId: task.projectId,
            projectName: task.project?.name,
            isAssigned: false,
            assignedUserId: task.assignedUserId,
            assignee: task.assignee
          }))
        ],
        userDocuments: [
          ...uploadedDocuments.map(doc => ({
            id: doc.id,
            title: doc.name,
            type: doc.type,
            projectId: doc.projectId,
            projectName: doc.project?.name,
            isUploaded: true
          })),
          ...projectDocuments.map(doc => ({
            id: doc.id,
            title: doc.name,
            type: doc.type,
            projectId: doc.projectId,
            projectName: doc.project?.name,
            isUploaded: false
          }))
        ]
      };
    } catch (error) {
      this.logger.error(`Failed to get user context: ${error.message}`);
      throw new Error('Impossible de récupérer le contexte utilisateur');
    }
  }

  private detectPdfRequest(message: string): boolean {
    const pdfKeywords = [
      'pdf', 'document', 'rapport', 'générer', 'créer', 'télécharger',
      'exporter', 'imprimer', 'fichier', 'résumé', 'bilan', 'export',
      'download', 'télécharge', 'mets dans', 'mettre dans', 'dans un document',
      'dans un pdf', 'en pdf', 'en document'
    ];
    
    const messageLower = message.toLowerCase();
    return pdfKeywords.some(keyword => messageLower.includes(keyword));
  }

  private async handlePdfGeneration(userMessage: string, userContext: UserContext): Promise<string> {
    try {
      const secureContext = this.buildSecureContext(userContext);
      
      // Générer le contenu PDF via l'IA basé sur la demande exacte de l'utilisateur
      const pdfContent = await this.generatePdfContentViaAI(userMessage, secureContext);
      
      const pdfOptions = {
        title: this.extractPdfTitle(userMessage),
        content: pdfContent,
        userRequest: userMessage
      };
      
      const result = await this.pdfGeneratorService.generatePdf(pdfOptions, secureContext);
      
      if (result.success) {
        return `📄 **PDF généré avec succès !**

Votre document **"${pdfOptions.title}"** a été créé et est prêt au téléchargement.

🔗 **Lien de téléchargement :** ${result.downloadUrl}

Le document contient exactement ce que vous avez demandé : ${userMessage}

Vous pouvez maintenant télécharger le fichier en cliquant sur le lien ci-dessus.`;
      } else {
        return `❌ **Erreur lors de la génération du PDF**

Désolé, je n'ai pas pu créer votre document PDF. 

**Erreur :** ${result.error}

Veuillez réessayer ou contactez le support technique si le problème persiste.`;
      }
    } catch (error) {
      this.logger.error(`PDF generation failed: ${error.message}`);
      return `❌ **Erreur lors de la génération du PDF**

Une erreur technique s'est produite. Veuillez réessayer plus tard.`;
    }
  }

  private async generatePdfContentViaAI(userMessage: string, secureContext: any): Promise<string> {
    try {
      const pdfPrompt = `Tu es un assistant qui génère du contenu pour un document PDF. 

L'utilisateur a demandé : "${userMessage}"

Voici les données disponibles pour cet utilisateur :
- Profil utilisateur : ${JSON.stringify(secureContext.user)}
- Projets : ${JSON.stringify(secureContext.projects)}
- Tâches : ${JSON.stringify(secureContext.tasks)}
- Documents : ${JSON.stringify(secureContext.documents)}

INSTRUCTIONS IMPORTANTES :
1. Génère un contenu PDF structuré et professionnel basé EXACTEMENT sur la demande de l'utilisateur
2. Utilise uniquement les données fournies ci-dessus
3. Si l'utilisateur demande des détails sur les projets, inclut les tâches associées
4. Si l'utilisateur demande des explications du chat, génère un résumé de la conversation
5. Structure le contenu avec des titres, sous-titres et listes appropriés
6. Sois précis et détaillé selon la demande
7. Utilise un format HTML simple pour la structure

RÈGLES POUR LES TÂCHES :
- Si une tâche a "assignedUserId": null, elle n'est PAS assignée à quelqu'un
- Si une tâche a "assignedUserId": "id", elle est assignée à l'utilisateur avec cet ID
- Si une tâche a un objet "assignee", affiche le nom de la personne assignée
- Ne mentionne PAS "assigné à" si assignedUserId est null
- Pour les tâches non assignées, affiche simplement le statut et la priorité

FORMAT HTML ATTENDU :
- Utilise <h1>, <h2>, <h3> pour les titres
- Utilise <p> pour les paragraphes
- Utilise <ul> et <li> pour les listes
- Utilise <strong> pour mettre en évidence
- Utilise <table> pour les données tabulaires si nécessaire

Génère le contenu HTML pour le PDF :`;

      const response = await this.openaiService.generateCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: pdfPrompt }
        ],
        temperature: 0.3
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated for PDF');
      }


      return content;
    } catch (error) {
      this.logger.error(`Failed to generate PDF content via AI: ${error.message}`);
      return `<div class="error">Erreur lors de la génération du contenu PDF</div>`;
    }
  }

  private extractPdfTitle(userMessage: string): string {
    const messageLower = userMessage.toLowerCase();
    
    // Extraire un titre basé sur la demande
    if (messageLower.includes('projet') && messageLower.includes('tâche')) {
      return 'Mes projets et tâches détaillés';
    } else if (messageLower.includes('projet')) {
      return 'Mes projets';
    } else if (messageLower.includes('tâche')) {
      return 'Mes tâches';
    } else if (messageLower.includes('profil') || messageLower.includes('informations')) {
      return 'Mon profil utilisateur';
    } else if (messageLower.includes('document')) {
      return 'Mes documents';
    } else if (messageLower.includes('rapport') || messageLower.includes('bilan')) {
      return 'Rapport complet';
    } else if (messageLower.includes('explication') || messageLower.includes('chat')) {
      return 'Explications et résumé';
    } else {
      return 'Document personnalisé';
    }
  }


}

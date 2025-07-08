import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs/promises';

@Injectable()
export class OpenAiClassifierService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  async classify(filePath: string): Promise<{
    tags: string[];
    metadata: Record<string, any>;
    validationRequired: boolean;
  }> {
    let content = await fs.readFile(filePath, 'utf-8');
    if (!content || content.length === 0) {
      throw new BadRequestException('Le document est vide ou introuvable.');
    }

    if (content.length > 25000) {
      content = content.slice(0, 15000) + '\n...\n' + content.slice(-5000);
    }

    const prompt = `
    Tu es un assistant intelligent d’un système de gestion documentaire (ERP).

    Tu dois **analyser attentivement** le document ci-dessous et **classer automatiquement** son contenu selon les règles suivantes :

    ---

    **1. TAGS (obligatoire)**
    Fournis **au moins un** tag sémantique parmi :
    - "Contrat client"
    - "Contrat fournisseur"
    - "Offre commerciale"
    - "PV de réunion"
    - "Cahier des charges"
    - "Facture"
    - "Devis"
    - "Document juridique"
    - "Document confidentiel"
    - "Note interne"
    - "Budget"

    Le tag doit refléter **le sens réel du contenu**, pas seulement le titre ou les mots-clés.

    ---

    **2. METADATA (extraction réelle du contenu)**
    Extrais ces informations **seulement si elles apparaissent explicitement** dans le contenu (pas de champ vide ou fictif) :
    - "montant" (ex : "100 000 MGA", "2 000 €", etc.)
    - "date" (ex : "2023-07-01", ou une date claire)
    - "numeroContrat" (ex : "CT-2024-001" ou similaire)
    - "partiePrenante" (nom d’entreprise, personne, ministère, etc.)

    Si un champ est réellement **absent** ou indétectable, omets-le du JSON (\`metadata\` peut être partiel mais jamais rempli artificiellement).

    ---

    **3. Validation**
    Si le contenu est **trop court, incomplet, contradictoire ou illisible**, retourne :
    - \`validationRequired: true\`

    Sinon :
    - \`validationRequired: false\`

    ---

    Format attendu (strictement) :
    {
    "tags": ["..."],
    "metadata": {
        "montant": "...",
        "date": "...",
        "numeroContrat": "...",
        "partiePrenante": "..."
    },
    "validationRequired": true|false
    }

    Important et impératif :
    - Ne génère pas de valeur fictive
    - Ne laisse aucun champ vide (\\"\\" ou null) dans \`metadata\`
    - \`tags\` est toujours **obligatoire** et non vide

    ---

    Voici le contenu du document à analyser :
    """${content}"""
    `;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let reply = response.data.choices[0].message?.content?.trim();

      if (!reply) throw new BadRequestException('Réponse vide du modèle.');

      // Nettoyage : GPT peut renvoyer du ```json ... ```
      if (reply.startsWith('```json')) {
        reply = reply.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      const json = JSON.parse(reply);

      return {
        tags: json.tags ?? [],
        metadata: json.metadata ?? {},
        validationRequired: json.validationRequired ?? true,
      };
    } catch (error) {
      console.error('[OpenAI Classification Error]', error?.response?.data || error);
      throw new BadRequestException(
        'Erreur lors de la classification IA. Essayez avec un document plus court ou plus clair.',
      );
    }
  }
}

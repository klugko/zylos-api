import { DocumentTag } from '@modules/document-management/domain/enums/document-tags.enum';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAiClassifierService {
  private readonly logger = new Logger(OpenAiClassifierService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  async classify(
    content: string,
    fileType?: string
  ): Promise<{
    tags: DocumentTag[];
    metadata: Record<string, any>;
    validationRequired: boolean;
  }> {
    // Handle error markers or empty content
    if (content.includes('[ERROR]') || content.includes('[UNSUPPORTED]') || 
        !content || content.trim().length < 50) {
      return {
        tags: [],
        metadata: {},
        validationRequired: true
      };
    }

    // Optimized content truncation
    const optimizedContent = content.length > 25000 
      ? content.substring(0, 20000) + '\n...[TRUNCATED]...\n' + content.substring(content.length - 5000)
      : content;

    // Generate tag list for prompt
    const tagList = Object.entries(DocumentTag)
      .map(([key, code]) => `- ${code} = ${DocumentTag[code as DocumentTag]}`)
      .join('\n');

    const prompt = `Analyze the document below and perform automated classification:

    1. TAGS (REQUIRED):
    Select 1-3 relevant tags from this list:
    ${tagList}

    2. METADATA EXTRACTION:
    Extract ONLY if explicitly present:
    - amount (currency format)
    - date (YYYY-MM-DD)
    - contractNumber (alphanumeric code)
    - stakeholder (entity name)
    - holder (signatory name)
    - projectName (exact project reference)
    - fileType (detected: ${fileType})

    3. VALIDATION FLAG:
    Set validationRequired: true if:
    - Content is ambiguous
    - Key elements are missing
    - Contradictory information exists

    OUTPUT FORMAT (STRICT JSON):
    {
      "tags": ["TAG_CODE1", "TAG_CODE2"],
      "metadata": { ... },
      "validationRequired": boolean
    }

    RULES:
    - Never invent missing data
    - Omit empty metadata fields
    - Use only valid tag codes from the list

    DOCUMENT CONTENT:
    """${optimizedContent}"""`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      const rawResponse = response.data.choices[0].message?.content?.trim();
      if (!rawResponse) throw new Error('Empty AI response');

      // Extract JSON from response
      let jsonString = rawResponse;
      if (!rawResponse.startsWith('{')) {
        const match = rawResponse.match(/\{[\s\S]*\}/);
        if (match) jsonString = match[0];
      }

      const result = JSON.parse(jsonString);
      
      // Validate tags
      const validTags = (result.tags || [])
        .filter((tag: string) => Object.values(DocumentTag).includes(tag as DocumentTag))
        .slice(0, 3);

      return {
        tags: validTags,
        metadata: result.metadata || {},
        validationRequired: Boolean(result.validationRequired),
      };
    } catch (error) {
      this.logger.error(`Classification failed: ${error.message}`, error.stack);
      return {
        tags: [],
        metadata: {},
        validationRequired: true
      };
    }
  }
}
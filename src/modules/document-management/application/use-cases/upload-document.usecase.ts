import { Injectable, Logger } from "@nestjs/common";
import { FileStorageService } from "../../infrastructure/services/file-storage.service";
import { DocumentRepository } from "../../domain/interfaces/document.repository.interface";
import { UploadDocumentDto } from "../../dto/upload-document.dto";
import { DocumentVersionRepository } from "../../domain/interfaces/document-version.repository.interface";
import * as path from "path";
import { OpenAiClassifierService } from "@modules/document-management/infrastructure/services/openai-classifier.service";
import { TextExtractorService } from "@modules/document-management/infrastructure/services/text-extractor.service";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class UploadDocumentUseCase {
  private readonly logger = new Logger(UploadDocumentUseCase.name);

  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: FileStorageService,
    private readonly versionRepo: DocumentVersionRepository,
    private readonly classifier: OpenAiClassifierService,
    private readonly textExtractor: TextExtractorService,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    ownerId: string
  ) {
    // Save file and get URL
    const url = await this.storage.save(file);
    const fileType =
      path.extname(file.originalname).replace(".", "").toUpperCase() ||
      "UNKNOWN";

    // Extract text content
    let content = "";
    try {
      content = await this.textExtractor.extractText(
        file.buffer,
        file.mimetype
      );
      this.logger.log(
        `Extracted ${content.length} characters from ${file.originalname}`
      );
    } catch (error) {
      this.logger.error(`Text extraction failed: ${error.message}`);
      content = `[TEXT EXTRACTION ERROR: ${file.originalname}]`;
    }

    // Classify document
    let classification = {
      tags: [],
      metadata: {},
      validationRequired: true,
    };

    try {
      if (!content.includes("[ERROR]") && !content.includes("[UNSUPPORTED]")) {
        classification = await this.classifier.classify(content, fileType);
      }
    } catch (error) {
      this.logger.error(`Classification failed: ${error.message}`);
    }

    // Check for existing document
    const existingDocs = await this.repo.findAllByProject(dto.projectId);
    const match = existingDocs.find((doc) => doc.name === file.originalname);

    // Create version if exists
    if (match) {
      await this.versionRepo.create({
        documentId: match.id,
        url: match.url,
        name: match.name,
        type: match.type,
        mimetype: file.mimetype,
        size: file.size,
      });
    }

    // Create new document with classification
    const document = await this.repo.save({
      name: file.originalname,
      type: dto.type,
      url,
      uploadedById: ownerId ?? null,
      projectId: dto.projectId,
      tags: classification.tags,
      metadata: classification.metadata,
      validationRequired: classification.validationRequired,
    });

    // Log document upload activity
    await this.activityLogger.logDocumentAction(
      ownerId,
      ActivityAction.DOCUMENT_UPLOADED,
      document.id,
      dto.projectId,
      `Document "${file.originalname}" uploadé`,
      `Nouveau document uploadé avec classification automatique`,
      {
        fileName: file.originalname,
        fileType: fileType,
        fileSize: file.size,
        mimeType: file.mimetype,
        tags: classification.tags,
        validationRequired: classification.validationRequired,
        isUpdate: !!match,
      }
    );

    return document;
  }
}

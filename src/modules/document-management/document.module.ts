import { Module } from '@nestjs/common';
import { DocumentController } from './presentation/controllers/document.controller';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.usecase';
import { GetProjectDocumentsUseCase } from './application/use-cases/get-project-documents.usecase';
import { FileStorageService } from './infrastructure/services/file-storage.service';
import { PrismaDocumentRepository } from './infrastructure/repositories/prisma-document.repository';
import { DocumentRepository } from './domain/interfaces/document.repository.interface';
import { PrismaModule } from '@core/prisma/prisma.module';
import { PrismaDocumentVersionRepository } from './infrastructure/repositories/prisma-document-version.repository';
import { DocumentVersionRepository } from './domain/interfaces/document-version.repository.interface';
import { GetDocumentVersionsUseCase } from './application/use-cases/get-document-versions.usecase';
import { RestoreDocumentVersionUseCase } from './application/use-cases/restore-document-version.usecase';
import { CreateDocumentCommentUseCase } from './application/use-cases/create-document-comment.usecase';
import { GetDocumentCommentsUseCase } from './application/use-cases/get-document-comments.usecase';
import { DocumentCommentRepository } from './domain/interfaces/document-comment.repository.interface';
import { PrismaDocumentCommentRepository } from './infrastructure/repositories/prisma-document-comment.repository';
import { DocumentVersionController } from './presentation/controllers/document-version.controller';
import { DocumentCommentController } from './presentation/controllers/document-comment.controller';
import { SetNotificationRuleUseCase } from './application/use-cases/set-notification-rule.usecase';
import { TriggerNotificationUseCase } from './application/use-cases/trigger-notification.usecase';
import { DocumentNotificationRepository } from './domain/interfaces/document-notification.repository.interface';
import { PrismaDocumentNotificationRepository } from './infrastructure/repositories/prisma-document-notification.repository';
import { DocumentNotificationController } from './presentation/controllers/document-notification.controller';
import { GetNotificationRulesUseCase } from './application/use-cases/get-notification-rules.usecase';
import { InitiateSignatureUseCase } from './application/use-cases/initiate-signature.usecase';
import { SubmitSignatureUseCase } from './application/use-cases/submit-signature.usecase';
import { DocumentSignatureRepository } from './domain/interfaces/document-signature.repository.interface';
import { PrismaDocumentSignatureRepository } from './infrastructure/repositories/prisma-document-signature.repository';
import { DocumentSignatureController } from './presentation/controllers/document-signature.controller';
import { DocumentClassificationController } from './presentation/controllers/document-classification.controller';
import { ClassifyDocumentUseCase } from './application/use-cases/classify-document.usecase';
import { ReclassifyDocumentUseCase } from './application/use-cases/reclassify-document.usecase';
import { OpenAiClassifierService } from './infrastructure/services/openai-classifier.service';
import { GetDocumentClassificationUseCase } from './application/use-cases/get-document-classification.usecase';


@Module({
  imports: [PrismaModule],
  controllers: [
    DocumentController,
    DocumentVersionController,
    DocumentCommentController,
    DocumentNotificationController,
    DocumentSignatureController,
    DocumentClassificationController,
  ],
  providers: [
    UploadDocumentUseCase,
    GetProjectDocumentsUseCase,
    FileStorageService,
    GetDocumentVersionsUseCase,
    RestoreDocumentVersionUseCase,
    CreateDocumentCommentUseCase,
    GetDocumentCommentsUseCase,
    SetNotificationRuleUseCase,
    TriggerNotificationUseCase,
    GetNotificationRulesUseCase,
    InitiateSignatureUseCase,
    SubmitSignatureUseCase,
    ClassifyDocumentUseCase,
    ReclassifyDocumentUseCase,
    OpenAiClassifierService,
    GetDocumentClassificationUseCase,
    {
      provide: DocumentRepository,
      useClass: PrismaDocumentRepository,
    },
    {
        provide: DocumentVersionRepository,
        useClass: PrismaDocumentVersionRepository,
    },
    {
      provide: DocumentCommentRepository,
      useClass: PrismaDocumentCommentRepository,
    },
    {
      provide: DocumentNotificationRepository,
      useClass: PrismaDocumentNotificationRepository,
    },
    {
      provide: DocumentSignatureRepository,
      useClass: PrismaDocumentSignatureRepository,
    },

  ],
})
export class DocumentModule {}

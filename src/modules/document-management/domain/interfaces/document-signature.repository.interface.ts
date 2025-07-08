import { DocumentSignatureEntity } from '../entities/document-signature.entity';

export abstract class DocumentSignatureRepository {
  abstract createRequest(documentId: string): Promise<DocumentSignatureEntity>;
  abstract submitSignature(documentId: string, imagePath: string): Promise<DocumentSignatureEntity>;
  abstract getByDocumentId(documentId: string): Promise<DocumentSignatureEntity | null>;
}

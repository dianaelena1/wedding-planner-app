export type FirebaseDocumentType = 'contract' | 'offer' | 'invoice' | 'image' | 'invitation' | 'other';

export interface FirebaseWeddingDocument {
  id?: string;
  title: string;
  vendorName?: string;
  type: FirebaseDocumentType;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
  contentType?: string;
  sizeBytes?: number;
  uploadedAt?: unknown;
  uploadedByUid?: string;
  uploadedByEmail?: string | null;
}

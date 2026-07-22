export type FirebaseDocumentType = 'contract' | 'offer' | 'invoice' | 'image' | 'invitation' | 'spreadsheet' | 'other';

export type FirebaseDocumentStatus =
  | 'available'
  | 'missing'
  | 'to-request'
  | 'to-sign'
  | 'signed'
  | 'paid'
  | 'expired';

export interface FirebaseWeddingDocument {
  id?: string;
  title: string;
  vendorName?: string;
  vendorId?: string;
  type: FirebaseDocumentType;
  status: FirebaseDocumentStatus;
  downloadUrl: string;
  notes?: string;
  dueDate?: string;
  isFavorite?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdByUid?: string;
  createdByEmail?: string | null;

  // Câmpuri vechi păstrate pentru compatibilitate cu documentele încărcate anterior.
  fileName?: string;
  storagePath?: string;
  contentType?: string;
  sizeBytes?: number;
  uploadedAt?: unknown;
  uploadedByUid?: string;
  uploadedByEmail?: string | null;
}

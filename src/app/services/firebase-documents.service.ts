import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import {
  FirebaseDocumentStatus,
  FirebaseDocumentType,
  FirebaseWeddingDocument
} from '../models/firebase-document.model';

export interface WeddingDocumentInput {
  title: string;
  type: FirebaseDocumentType;
  status: FirebaseDocumentStatus;
  vendorName?: string;
  downloadUrl?: string;
  notes?: string;
  dueDate?: string;
  isFavorite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FirebaseDocumentsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly collectionName = 'weddingDocuments';

  getDocuments(): Observable<FirebaseWeddingDocument[]> {
    const documentsRef = collection(this.firestore, this.collectionName);
    const documentsQuery = query(documentsRef, orderBy('uploadedAt', 'desc'));
    return collectionData(documentsQuery, { idField: 'id' }) as Observable<FirebaseWeddingDocument[]>;
  }

  async addDocument(data: WeddingDocumentInput): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Trebuie să fii autentificată înainte să adaugi documente.');
    }

    await addDoc(collection(this.firestore, this.collectionName), {
      title: data.title.trim(),
      vendorName: data.vendorName?.trim() || '',
      type: data.type,
      status: data.status,
      downloadUrl: data.downloadUrl?.trim() || '',
      notes: data.notes?.trim() || '',
      dueDate: data.dueDate || '',
      isFavorite: Boolean(data.isFavorite),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // uploadedAt rămâne pentru sortarea compatibilă cu înregistrările vechi.
      uploadedAt: serverTimestamp(),
      createdByUid: user.uid,
      createdByEmail: user.email
    });
  }

  async updateDocument(id: string, data: WeddingDocumentInput): Promise<void> {
    await updateDoc(doc(this.firestore, `${this.collectionName}/${id}`), {
      title: data.title.trim(),
      vendorName: data.vendorName?.trim() || '',
      type: data.type,
      status: data.status,
      downloadUrl: data.downloadUrl?.trim() || '',
      notes: data.notes?.trim() || '',
      dueDate: data.dueDate || '',
      isFavorite: Boolean(data.isFavorite),
      updatedAt: serverTimestamp()
    });
  }

  async toggleFavorite(documentToUpdate: FirebaseWeddingDocument): Promise<void> {
    if (!documentToUpdate.id) return;
    await updateDoc(doc(this.firestore, `${this.collectionName}/${documentToUpdate.id}`), {
      isFavorite: !documentToUpdate.isFavorite,
      updatedAt: serverTimestamp()
    });
  }

  async deleteDocument(documentToDelete: FirebaseWeddingDocument): Promise<void> {
    if (!documentToDelete.id) return;
    // Ștergem numai înregistrarea Firestore. Fișierul rămâne în Google Drive.
    await deleteDoc(doc(this.firestore, `${this.collectionName}/${documentToDelete.id}`));
  }
}

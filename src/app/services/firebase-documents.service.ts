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
  serverTimestamp
} from '@angular/fire/firestore';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { FirebaseWeddingDocument, FirebaseDocumentType } from '../models/firebase-document.model';

@Injectable({ providedIn: 'root' })
export class FirebaseDocumentsService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private collectionName = 'weddingDocuments';

  getDocuments(): Observable<FirebaseWeddingDocument[]> {
    const documentsRef = collection(this.firestore, this.collectionName);
    const documentsQuery = query(documentsRef, orderBy('uploadedAt', 'desc'));
    return collectionData(documentsQuery, { idField: 'id' }) as Observable<FirebaseWeddingDocument[]>;
  }

  async uploadDocument(file: File, data: { title: string; type: FirebaseDocumentType; vendorName?: string }): Promise<void> {
    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('Trebuie sa fii logata inainte sa incarci documente.');
    }

    const timestamp = Date.now();
    const safeFileName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();

    const storagePath = `wedding-documents/${user.uid}/${timestamp}-${safeFileName}`;
    const fileRef = ref(this.storage, storagePath);

    await uploadBytes(fileRef, file, {
      contentType: file.type || undefined
    });

    const downloadUrl = await getDownloadURL(fileRef);
    const documentsRef = collection(this.firestore, this.collectionName);

    await addDoc(documentsRef, {
      title: data.title,
      vendorName: data.vendorName || '',
      type: data.type,
      fileName: file.name,
      storagePath,
      downloadUrl,
      contentType: file.type || '',
      sizeBytes: file.size,
      uploadedAt: serverTimestamp(),
      uploadedByUid: user.uid,
      uploadedByEmail: user.email
    });
  }

  async deleteDocument(documentToDelete: FirebaseWeddingDocument): Promise<void> {
    if (!documentToDelete.id) {
      return;
    }

    await deleteDoc(doc(this.firestore, `${this.collectionName}/${documentToDelete.id}`));

    if (documentToDelete.storagePath) {
      await deleteObject(ref(this.storage, documentToDelete.storagePath));
    }
  }
}

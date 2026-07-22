import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingPreparationItem } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebasePreparationsService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingPreparations';

  getPreparations(): Observable<WeddingPreparationItem[]> {
    const preparationsQuery = query(
      collection(this.firestore, this.collectionName),
      orderBy('sortOrder', 'asc')
    );

    return collectionData(preparationsQuery, { idField: 'id' }) as Observable<WeddingPreparationItem[]>;
  }

  async hasPreparations(): Promise<boolean> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));
    return !snapshot.empty;
  }

  addPreparation(item: Omit<WeddingPreparationItem, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.collectionName), {
      ...this.toFirestore(item),
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  savePreparation(item: WeddingPreparationItem): Promise<void> {
    if (!item.id) {
      return Promise.reject(new Error('Lipsește ID-ul elementului de pregătire.'));
    }

    return setDoc(
      doc(this.firestore, `${this.collectionName}/${item.id}`),
      {
        ...this.toFirestore(item),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  deletePreparation(itemId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.collectionName}/${itemId}`));
  }

  async importInitialPreparations(items: WeddingPreparationItem[]): Promise<void> {
    if (await this.hasPreparations()) {
      throw new Error('Colecția de pregătiri conține deja date. Importul a fost oprit pentru a nu suprascrie modificările.');
    }

    const batch = writeBatch(this.firestore);
    const preparationsRef = collection(this.firestore, this.collectionName);

    items.forEach((item, index) => {
      batch.set(doc(preparationsRef, item.id), {
        ...this.toFirestore(item),
        sortOrder: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  private toFirestore(item: Partial<WeddingPreparationItem>): Record<string, unknown> {
    const totalPrice = Number(item.totalPrice) || 0;
    const advancePaid = Number(item.advancePaid) || 0;

    return {
      name: item.name?.trim() ?? '',
      category: item.category ?? 'Other',
      provider: item.provider?.trim() ?? '',
      appointmentDate: item.appointmentDate?.trim() ?? '',
      appointmentTime: item.appointmentTime?.trim() ?? '',
      totalPrice,
      currency: item.currency ?? 'RON',
      advancePaid,
      remainingPayment: Math.max(totalPrice - advancePaid, 0),
      notes: item.notes?.trim() ?? '',
      status: item.status ?? 'unknown'
    };
  }
}

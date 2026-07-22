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

import { WeddingRingItem } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseRingsService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingRings';

  getRings(): Observable<WeddingRingItem[]> {
    const ringsQuery = query(
      collection(this.firestore, this.collectionName),
      orderBy('sortOrder', 'asc')
    );

    return collectionData(ringsQuery, { idField: 'id' }) as Observable<WeddingRingItem[]>;
  }

  async hasRings(): Promise<boolean> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));
    return !snapshot.empty;
  }

  addRing(item: Omit<WeddingRingItem, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.collectionName), {
      ...this.toFirestore(item),
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveRing(item: WeddingRingItem): Promise<void> {
    if (!item.id) {
      return Promise.reject(new Error('Lipsește ID-ul verighetelor.'));
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

  deleteRing(itemId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.collectionName}/${itemId}`));
  }

  async importInitialRings(items: WeddingRingItem[]): Promise<void> {
    if (await this.hasRings()) {
      throw new Error('Colecția de verighete conține deja date. Importul a fost oprit pentru a nu suprascrie modificările.');
    }

    const batch = writeBatch(this.firestore);
    const ringsRef = collection(this.firestore, this.collectionName);

    items.forEach((item, index) => {
      batch.set(doc(ringsRef, item.id), {
        ...this.toFirestore(item),
        sortOrder: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  private toFirestore(item: Partial<WeddingRingItem>): Record<string, unknown> {
    const totalPrice = Number(item.totalPrice) || 0;
    const advancePaid = Number(item.advancePaid) || 0;

    return {
      name: item.name?.trim() ?? '',
      shop: item.shop?.trim() ?? '',
      material: item.material?.trim() ?? '',
      sizeDiana: item.sizeDiana?.trim() ?? '',
      sizeDan: item.sizeDan?.trim() ?? '',
      totalPrice,
      currency: item.currency ?? 'RON',
      advancePaid,
      remainingPayment: Math.max(totalPrice - advancePaid, 0),
      orderDate: item.orderDate?.trim() ?? '',
      pickupDate: item.pickupDate?.trim() ?? '',
      notes: item.notes?.trim() ?? '',
      status: item.status ?? 'unknown'
    };
  }
}

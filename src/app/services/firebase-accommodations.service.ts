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

import { WeddingAccommodation } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseAccommodationsService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingAccommodations';

  getAccommodations(): Observable<WeddingAccommodation[]> {
    const accommodationsQuery = query(
      collection(this.firestore, this.collectionName),
      orderBy('sortOrder', 'asc')
    );

    return collectionData(accommodationsQuery, { idField: 'id' }) as Observable<WeddingAccommodation[]>;
  }

  async hasAccommodations(): Promise<boolean> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));
    return !snapshot.empty;
  }

  addAccommodation(accommodation: Omit<WeddingAccommodation, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.collectionName), {
      ...this.toFirestore(accommodation),
      sortOrder: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveAccommodation(accommodation: WeddingAccommodation): Promise<void> {
    if (!accommodation.id) {
      return Promise.reject(new Error('Lipsește ID-ul cazării.'));
    }

    return setDoc(
      doc(this.firestore, `${this.collectionName}/${accommodation.id}`),
      {
        ...this.toFirestore(accommodation),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  deleteAccommodation(accommodationId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.collectionName}/${accommodationId}`));
  }

  async importInitialAccommodations(accommodations: WeddingAccommodation[]): Promise<void> {
    if (await this.hasAccommodations()) {
      throw new Error('Colecția de cazări conține deja date. Importul a fost oprit pentru a nu suprascrie modificările.');
    }

    const batch = writeBatch(this.firestore);
    const accommodationsRef = collection(this.firestore, this.collectionName);

    accommodations.forEach((accommodation, index) => {
      batch.set(doc(accommodationsRef, accommodation.id), {
        ...this.toFirestore(accommodation),
        sortOrder: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  private toFirestore(accommodation: Partial<WeddingAccommodation>): Record<string, unknown> {
    const nights = this.toOptionalNumber(accommodation.nights);
    const rooms = this.toOptionalNumber(accommodation.rooms);
    const guests = this.toOptionalNumber(accommodation.guests);
    const pricePerRoom = this.toOptionalNumber(accommodation.pricePerRoom);
    const totalPrice = this.toOptionalNumber(accommodation.totalPrice) ??
      (rooms !== undefined && pricePerRoom !== undefined
        ? rooms * pricePerRoom * Math.max(nights ?? 1, 1)
        : undefined);
    const advancePaid = this.toOptionalNumber(accommodation.advancePaid) ?? 0;
    const remainingPayment = totalPrice !== undefined
      ? Math.max(totalPrice - advancePaid, 0)
      : this.toOptionalNumber(accommodation.remainingPayment);

    return {
      name: accommodation.name?.trim() ?? '',
      location: accommodation.location?.trim() ?? '',
      checkIn: accommodation.checkIn?.trim() ?? '',
      checkOut: accommodation.checkOut?.trim() ?? '',
      nights: nights ?? null,
      rooms: rooms ?? null,
      guests: guests ?? null,
      pricePerRoom: pricePerRoom ?? null,
      totalPrice: totalPrice ?? null,
      currency: accommodation.currency ?? 'RON',
      advancePaid,
      remainingPayment: remainingPayment ?? null,
      contactPerson: accommodation.contactPerson?.trim() ?? '',
      phone: accommodation.phone?.trim() ?? '',
      notes: accommodation.notes?.trim() ?? '',
      status: accommodation.status ?? 'to-book'
    };
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}

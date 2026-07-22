import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingVendor } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseVendorsService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingVendors';

  getVendors(): Observable<WeddingVendor[]> {
    return collectionData(collection(this.firestore, this.collectionName), {
      idField: 'id'
    }) as Observable<WeddingVendor[]>;
  }

  async hasVendors(): Promise<boolean> {
    const snapshot = await getDocs(collection(this.firestore, this.collectionName));
    return !snapshot.empty;
  }

  addVendor(vendor: Omit<WeddingVendor, 'id'>): Promise<unknown> {
    return addDoc(collection(this.firestore, this.collectionName), {
      ...this.toFirestore(vendor),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  saveVendor(vendor: WeddingVendor): Promise<void> {
    if (!vendor.id) {
      return Promise.reject(new Error('Lipsește ID-ul furnizorului.'));
    }

    return setDoc(
      doc(this.firestore, `${this.collectionName}/${vendor.id}`),
      {
        ...this.toFirestore(vendor),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  deleteVendor(vendorId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `${this.collectionName}/${vendorId}`));
  }

  async importInitialVendors(vendors: WeddingVendor[]): Promise<void> {
    if (await this.hasVendors()) {
      throw new Error('Colecția de furnizori conține deja date. Importul a fost oprit pentru a nu suprascrie modificările.');
    }

    const batch = writeBatch(this.firestore);
    const vendorsRef = collection(this.firestore, this.collectionName);

    vendors.forEach(vendor => {
      batch.set(doc(vendorsRef, vendor.id), {
        ...this.toFirestore(vendor),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  }

  private toFirestore(vendor: Partial<WeddingVendor>): Record<string, unknown> {
    const totalPrice = this.toOptionalNumber(vendor.totalPrice);
    const advancePaid = this.toOptionalNumber(vendor.advancePaid);
    const explicitRemaining = this.toOptionalNumber(vendor.remainingPayment);
    const remainingPayment = explicitRemaining ??
      (totalPrice !== undefined ? Math.max(totalPrice - (advancePaid ?? 0), 0) : undefined);

    return {
      name: vendor.name?.trim() ?? '',
      category: vendor.category?.trim() ?? '',
      contactPerson: vendor.contactPerson?.trim() ?? '',
      phone: vendor.phone?.trim() ?? '',
      email: vendor.email?.trim() ?? '',
      totalPrice: totalPrice ?? null,
      currency: vendor.currency ?? 'RON',
      advancePaid: advancePaid ?? 0,
      remainingPayment: remainingPayment ?? null,
      paymentDeadline: vendor.paymentDeadline?.trim() ?? '',
      eventTime: vendor.eventTime?.trim() ?? '',
      location: vendor.location?.trim() ?? '',
      notes: vendor.notes?.trim() ?? '',
      status: vendor.status ?? 'pending',
      isPaid: vendor.isPaid ?? remainingPayment === 0,
      quantity: vendor.quantity ?? null,
      unitPrice: this.toOptionalNumber(vendor.unitPrice) ?? null,
      unitLabel: vendor.unitLabel?.trim() ?? ''
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

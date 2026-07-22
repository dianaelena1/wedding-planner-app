import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    serverTimestamp,
    setDoc,
    writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { WeddingGuest } from '../models/wedding-data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseGuestsService {
    private readonly firestore = inject(Firestore);
    private readonly collectionName = 'weddingGuests';

    getGuests(): Observable<WeddingGuest[]> {
        return collectionData(
            collection(this.firestore, this.collectionName),
            { idField: 'id' }
        ) as Observable<WeddingGuest[]>;
    }

    addGuest(guest: Omit<WeddingGuest, 'id'>): Promise<unknown> {
        return addDoc(collection(this.firestore, this.collectionName), {
            ...this.toFirestoreGuest(guest),
            isManual: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }

    saveGuest(guest: WeddingGuest): Promise<void> {
        if (!guest.id) {
            return Promise.reject(new Error('Guest id missing'));
        }

        return setDoc(
            doc(this.firestore, `${this.collectionName}/${guest.id}`),
            {
                ...this.toFirestoreGuest(guest),
                isManual: guest.isManual ?? false,
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );
    }

    deleteGuest(guestId: string): Promise<void> {
        return deleteDoc(doc(this.firestore, `${this.collectionName}/${guestId}`));
    }

    /**
     * Synchronises the spreadsheet snapshot with Firestore.
     * Existing documents keep fields that are not present in the spreadsheet
     * (for example allergies or transport), while spreadsheet fields are refreshed.
     */
    async syncSpreadsheetGuests(guests: WeddingGuest[]): Promise<void> {
        const batch = writeBatch(this.firestore);
        const guestsRef = collection(this.firestore, this.collectionName);

        guests.forEach(guest => {
            batch.set(
                doc(guestsRef, guest.id),
                {
                    ...this.toFirestoreGuest(guest),
                    isManual: false,
                    updatedAt: serverTimestamp()
                },
                { merge: true }
            );
        });

        await batch.commit();
    }

    private toFirestoreGuest(guest: Omit<WeddingGuest, 'id'> | WeddingGuest) {
        return {
            name: guest.name.trim(),
            side: guest.side,
            invitationStatus: guest.invitationStatus,
            attendanceStatus: guest.attendanceStatus,
            adults: Number(guest.adults) || 0,
            children: Number(guest.children) || 0,
            childrenUnder5: Number(guest.childrenUnder5) || 0,
            children5To8: Number(guest.children5To8) || 0,
            children8To12: Number(guest.children8To12) || 0,
            children13To17: Number(guest.children13To17) || 0,
            groupName: guest.groupName ?? '',
            tableNumber: guest.tableNumber ?? null,
            phone: guest.phone ?? '',
            email: guest.email ?? '',
            accommodationStatus: guest.accommodationStatus ?? 'unknown',
            menuType: guest.menuType ?? 'standard',
            allergies: guest.allergies ?? '',
            transportNeeded: guest.transportNeeded ?? false,
            notes: guest.notes ?? ''
        };
    }
}

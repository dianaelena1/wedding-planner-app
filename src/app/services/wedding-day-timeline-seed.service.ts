import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch
} from '@angular/fire/firestore';

interface SeedTimelineItem {
  id: string;
  time: string;
  title: string;
  owner?: string;
  location?: string;
  notes?: string;
  status: 'todo';
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class WeddingDayTimelineSeedService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'weddingDayTimeline';

  async importDefaultTimeline(): Promise<void> {
    const target = collection(
      this.firestore,
      this.collectionName
    );

    const snapshot = await getDocs(target);

    if (!snapshot.empty) {
      throw new Error(
        'Timeline-ul zilei conține deja date.'
      );
    }

    const items: SeedTimelineItem[] = [
      {
        id: 'beauty',
        time: '08:00',
        title: 'Pregătiri mireasă',
        owner: 'Diana',
        location: 'De completat',
        status: 'todo',
        sortOrder: 1
      },
      {
        id: 'photo-preparation',
        time: '12:00',
        title: 'Foto / video pregătiri',
        status: 'todo',
        sortOrder: 2
      },
      {
        id: 'leave-location',
        time: '15:00',
        title: 'Plecare spre locație',
        status: 'todo',
        sortOrder: 3
      },
      {
        id: 'guest-arrival',
        time: '16:00',
        title: 'Primirea invitaților',
        location: 'Wild Garden',
        status: 'todo',
        sortOrder: 4
      },
      {
        id: 'ceremony',
        time: '17:00',
        title: 'Ceremonie',
        location: 'Wild Garden',
        status: 'todo',
        sortOrder: 5
      },
      {
        id: 'dinner',
        time: '19:00',
        title: 'Deschiderea bufetului',
        status: 'todo',
        sortOrder: 6
      },
      {
        id: 'first-dance',
        time: '20:30',
        title: 'Dansul mirilor',
        status: 'todo',
        sortOrder: 7
      },
      {
        id: 'cake',
        time: '23:30',
        title: 'Tortul',
        status: 'todo',
        sortOrder: 8
      }
    ];

    const batch = writeBatch(this.firestore);

    items.forEach(item => {
      batch.set(
        doc(target, item.id),
        {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );
    });

    await batch.commit();
  }
}

import { CommonModule } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData
} from '@angular/fire/firestore';
import {
  Observable,
  catchError,
  combineLatest,
  map,
  of
} from 'rxjs';

import {
  WeddingGuest
} from '../../models/wedding-data.model';
import {
  FirebaseGuestsService
} from '../../services/firebase-guests.service';

interface ViewerTimelineItem {
  id: string;
  time: string;
  title: string;
  owner?: string;
  location?: string;
  notes?: string;
  status?: 'todo' | 'done';
  sortOrder?: number;
}

interface ViewerTimelineDisplayItem {
  time: string;
  title: string;
  details: string;
}

interface DashboardViewerModel {
  confirmedPeople: number;
  confirmedGroups: number;
  pendingGroups: number;
  peopleWithoutTable: number;
  timeline: ViewerTimelineDisplayItem[];
}

@Component({
  selector: 'app-dashboard-viewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard-viewer.component.html',
  styleUrl: './dashboard-viewer.component.scss'
})
export class DashboardViewerComponent {
  private readonly firestore =
    inject(Firestore);

  private readonly guestsService =
    inject(FirebaseGuestsService);

  readonly weddingDate =
    new Date('2026-09-05T16:00:00');

  private readonly timeline$: Observable<ViewerTimelineItem[]> =
    (
      collectionData(
        collection(
          this.firestore,
          'weddingDayTimeline'
        ),
        {
          idField: 'id'
        }
      ) as Observable<ViewerTimelineItem[]>
    ).pipe(
      catchError(error => {
        console.error(
          'Nu am putut încărca programul nunții.',
          error
        );

        return of([]);
      })
    );

  readonly viewModel$: Observable<DashboardViewerModel> =
    combineLatest([
      this.guestsService.getGuests(),
      this.timeline$
    ]).pipe(
      map(([guests, timeline]) => ({
        confirmedPeople:
          this.getConfirmedPeople(guests),

        confirmedGroups:
          guests.filter(
            guest =>
              guest.attendanceStatus ===
              'confirmed'
          ).length,

        pendingGroups:
          guests.filter(
            guest =>
              guest.attendanceStatus ===
                'pending' ||
              guest.attendanceStatus ===
                'maybe'
          ).length,

        peopleWithoutTable:
          guests
            .filter(
              guest =>
                guest.attendanceStatus ===
                  'confirmed' &&
                !guest.tableNumber
            )
            .reduce(
              (sum, guest) =>
                sum +
                Number(
                  guest.adults || 0
                ) +
                Number(
                  guest.children || 0
                ),
              0
            ),

        timeline:
          [...timeline]
            .filter(
              item =>
                Boolean(
                  item.time &&
                  item.title
                )
            )
            .sort(
              (a, b) =>
                a.time.localeCompare(b.time) ||
                (a.sortOrder ?? 999) -
                (b.sortOrder ?? 999)
            )
            .map(item => ({
              time: item.time,
              title: item.title,
              details:
                item.location ||
                item.owner ||
                item.notes ||
                ''
            }))
      })),
      catchError(error => {
        console.error(
          'Nu am putut încărca dashboard-ul viewer.',
          error
        );

        return of({
          confirmedPeople: 0,
          confirmedGroups: 0,
          pendingGroups: 0,
          peopleWithoutTable: 0,
          timeline: []
        });
      })
    );

  get daysUntilWedding(): number {
    const difference =
      this.weddingDate.getTime() -
      Date.now();

    return Math.max(
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      ),
      0
    );
  }

  get weeksUntilWedding(): number {
    return Math.floor(
      this.daysUntilWedding / 7
    );
  }

  get remainingDaysAfterWeeks(): number {
    return this.daysUntilWedding % 7;
  }

  get weddingHasPassed(): boolean {
    return Date.now() >
      this.weddingDate.getTime();
  }

  private getConfirmedPeople(
    guests: WeddingGuest[]
  ): number {
    return guests
      .filter(
        guest =>
          guest.attendanceStatus ===
          'confirmed'
      )
      .reduce(
        (sum, guest) =>
          sum +
          Number(
            guest.adults || 0
          ) +
          Number(
            guest.children || 0
          ),
        0
      );
  }
}

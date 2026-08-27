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
  map,
  of
} from 'rxjs';

interface WeddingDayViewerTimelineItem {
  id: string;
  time: string;
  title: string;
  owner?: string;
  location?: string;
  notes?: string;
  status?: 'todo' | 'done';
  sortOrder?: number;
}

@Component({
  selector: 'app-wedding-day-viewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './wedding-day-viewer.component.html',
  styleUrl: './wedding-day-viewer.component.scss'
})
export class WeddingDayViewerComponent {
  private readonly firestore =
    inject(Firestore);

  readonly timeline$: Observable<
    WeddingDayViewerTimelineItem[]
  > = (
    collectionData(
      collection(
        this.firestore,
        'weddingDayTimeline'
      ),
      {
        idField: 'id'
      }
    ) as Observable<
      WeddingDayViewerTimelineItem[]
    >
  ).pipe(
    map(items =>
      [...items]
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
    ),
    catchError(error => {
      console.error(
        'Nu am putut încărca programul zilei.',
        error
      );

      return of([]);
    })
  );
}

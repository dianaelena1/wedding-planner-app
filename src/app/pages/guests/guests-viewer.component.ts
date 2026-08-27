import { CommonModule } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  GuestAttendanceStatus,
  WeddingGuest
} from '../../models/wedding-data.model';
import {
  FirebaseGuestsService
} from '../../services/firebase-guests.service';

@Component({
  selector: 'app-guests-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './guests-viewer.component.html',
  styleUrl: './guests-viewer.component.scss'
})
export class GuestsViewerComponent {
  private readonly guestsService =
    inject(FirebaseGuestsService);

  readonly guests$ =
    this.guestsService.getGuests();

  searchTerm = '';

  attendanceFilter:
    | GuestAttendanceStatus
    | 'all' =
    'all';

  groupFilter = 'all';

  getGroups(
    guests: WeddingGuest[]
  ): string[] {
    return [
      ...new Set(
        guests
          .map(
            guest =>
              guest.groupName?.trim()
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    ].sort(
      (a, b) =>
        a.localeCompare(
          b,
          'ro'
        )
    );
  }

  getFilteredGuests(
    guests: WeddingGuest[]
  ): WeddingGuest[] {
    const term =
      this.searchTerm
        .trim()
        .toLocaleLowerCase('ro');

    return [...guests]
      .filter(guest => {
        const searchable = [
          guest.name,
          guest.groupName ?? '',
          String(
            guest.tableNumber ?? ''
          ),
          guest.allergies ?? ''
        ]
          .join(' ')
          .toLocaleLowerCase('ro');

        const matchesSearch =
          !term ||
          searchable.includes(term);

        const matchesAttendance =
          this.attendanceFilter ===
            'all' ||
          guest.attendanceStatus ===
            this.attendanceFilter;

        const matchesGroup =
          this.groupFilter === 'all' ||
          (
            guest.groupName?.trim() ??
            ''
          ) === this.groupFilter;

        return (
          matchesSearch &&
          matchesAttendance &&
          matchesGroup
        );
      })
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            'ro'
          )
      );
  }

  getConfirmedPeople(
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
          this.getPeople(guest),
        0
      );
  }

  getPendingRows(
    guests: WeddingGuest[]
  ): number {
    return guests.filter(
      guest =>
        guest.attendanceStatus ===
          'pending' ||
        guest.attendanceStatus ===
          'maybe'
    ).length;
  }

  getPeople(
    guest: WeddingGuest
  ): number {
    return (
      Number(
        guest.adults || 0
      ) +
      Number(
        guest.children || 0
      )
    );
  }

  attendanceLabel(
    status:
      WeddingGuest['attendanceStatus']
  ): string {
    const labels: Record<
      WeddingGuest['attendanceStatus'],
      string
    > = {
      confirmed: 'Confirmat',
      pending: 'În așteptare',
      maybe: 'Poate',
      declined: 'Nu participă'
    };

    return labels[status];
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.attendanceFilter = 'all';
    this.groupFilter = 'all';
  }
}

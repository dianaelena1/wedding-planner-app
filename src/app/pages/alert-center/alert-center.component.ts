import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';

import {
  Currency,
  WeddingExpense,
  WeddingGuest,
  WeddingTask,
  WeddingVendor
} from '../../models/wedding-data.model';
import { FirebaseGuestsService } from '../../services/firebase-guests.service';
import { FirebasePaymentsService } from '../../services/firebase-payments.service';
import { FirebaseTasksService } from '../../services/firebase-tasks.service';
import { FirebaseVendorsService } from '../../services/firebase-vendors.service';

type AlertCategory =
  | 'all'
  | 'payments'
  | 'vendors'
  | 'guests'
  | 'seating'
  | 'accommodation'
  | 'tasks';

interface AlertCategoryOption {
  value: AlertCategory;
  label: string;
  count: number;
}

@Component({
  selector: 'app-alert-center',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alert-center.component.html',
  styleUrl: './alert-center.component.scss'
})
export class AlertCenterComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly paymentsService =
    inject(FirebasePaymentsService);
  private readonly vendorsService =
    inject(FirebaseVendorsService);
  private readonly guestsService =
    inject(FirebaseGuestsService);
  private readonly tasksService =
    inject(FirebaseTasksService);

  expenses: WeddingExpense[] = [];
  vendors: WeddingVendor[] = [];
  guests: WeddingGuest[] = [];
  tasks: WeddingTask[] = [];

  activeCategory: AlertCategory = 'all';
  isLoading = true;
  loadError = '';

  constructor() {
    combineLatest([
      this.paymentsService.getExpenses(),
      this.vendorsService.getVendors(),
      this.guestsService.getGuests(),
      this.tasksService.getTasks()
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([expenses, vendors, guests, tasks]) => {
          this.expenses = expenses;
          this.vendors = vendors;
          this.guests = guests;
          this.tasks = tasks;
          this.isLoading = false;
          this.loadError = '';
        },
        error: error => {
          console.error('Alert center Firestore error:', error);
          this.isLoading = false;
          this.loadError =
            'Alertele nu au putut fi încărcate. Verifică autentificarea și regulile Firestore.';
        }
      });
  }

  get overduePayments(): WeddingExpense[] {
    const today = this.todayKey();

    return this.expenses
      .filter(
        expense =>
          expense.includeInTotals !== false &&
          (Number(expense.remainingPayment) || 0) > 0 &&
          !!expense.dueDate &&
          expense.dueDate < today
      )
      .sort((a, b) =>
        (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      );
  }

  get unconfirmedVendors(): WeddingVendor[] {
    return this.vendors
      .filter(vendor =>
        vendor.status === 'pending' ||
        vendor.status === 'to-confirm' ||
        vendor.status === 'to-contact'
      )
      .sort((a, b) => {
        const statusDifference =
          this.vendorStatusRank(a.status) -
          this.vendorStatusRank(b.status);

        return statusDifference ||
          a.name.localeCompare(b.name, 'ro');
      });
  }

  get unansweredGuests(): WeddingGuest[] {
    return this.guests
      .filter(
        guest =>
          guest.attendanceStatus === 'pending' ||
          guest.attendanceStatus === 'maybe'
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  }

  get confirmedGuestsWithoutTable(): WeddingGuest[] {
    return this.guests
      .filter(
        guest =>
          guest.attendanceStatus === 'confirmed' &&
          !guest.tableNumber
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  }

  get guestsWithoutAccommodation(): WeddingGuest[] {
    return this.guests
      .filter(
        guest =>
          guest.attendanceStatus !== 'declined' &&
          guest.accommodationStatus === 'needed'
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  }

  get overdueTasks(): WeddingTask[] {
    const today = this.todayKey();

    return this.tasks
      .filter(
        task =>
          task.status !== 'done' &&
          !!task.dueDate &&
          task.dueDate < today
      )
      .sort((a, b) =>
        (a.dueDate ?? '').localeCompare(b.dueDate ?? '')
      );
  }

  get totalAlerts(): number {
    return (
      this.overduePayments.length +
      this.unconfirmedVendors.length +
      this.unansweredGuests.length +
      this.confirmedGuestsWithoutTable.length +
      this.guestsWithoutAccommodation.length +
      this.overdueTasks.length
    );
  }

  get criticalAlerts(): number {
    return (
      this.overduePayments.length +
      this.confirmedGuestsWithoutTable.length +
      this.overdueTasks.length
    );
  }

  get categoryOptions(): AlertCategoryOption[] {
    return [
      {
        value: 'all',
        label: 'Toate',
        count: this.totalAlerts
      },
      {
        value: 'payments',
        label: 'Plăți',
        count: this.overduePayments.length
      },
      {
        value: 'vendors',
        label: 'Furnizori',
        count: this.unconfirmedVendors.length
      },
      {
        value: 'guests',
        label: 'Răspunsuri',
        count: this.unansweredGuests.length
      },
      {
        value: 'seating',
        label: 'Mese',
        count: this.confirmedGuestsWithoutTable.length
      },
      {
        value: 'accommodation',
        label: 'Cazare',
        count: this.guestsWithoutAccommodation.length
      },
      {
        value: 'tasks',
        label: 'Task-uri',
        count: this.overdueTasks.length
      }
    ];
  }

  show(category: Exclude<AlertCategory, 'all'>): boolean {
    return (
      this.activeCategory === 'all' ||
      this.activeCategory === category
    );
  }

  peopleCount(guests: WeddingGuest[]): number {
    return guests.reduce(
      (sum, guest) =>
        sum +
        (Number(guest.adults) || 0) +
        (Number(guest.children) || 0),
      0
    );
  }

  formatMoney(
    value: number | undefined,
    currency: Currency | undefined
  ): string {
    return `${(Number(value) || 0).toLocaleString(
      'ro-RO',
      { maximumFractionDigits: 2 }
    )} ${currency ?? 'RON'}`;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Fără termen';
    }

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  vendorStatusLabel(
    status: WeddingVendor['status']
  ): string {
    const labels: Record<
      WeddingVendor['status'],
      string
    > = {
      contracted: 'Contractat',
      pending: 'În așteptare',
      'to-confirm': 'De confirmat',
      'to-contact': 'De contactat',
      done: 'Finalizat'
    };

    return labels[status];
  }

  attendanceLabel(
    status: WeddingGuest['attendanceStatus']
  ): string {
    const labels: Record<
      WeddingGuest['attendanceStatus'],
      string
    > = {
      pending: 'Fără răspuns',
      confirmed: 'Confirmat',
      declined: 'Nu participă',
      maybe: 'Poate'
    };

    return labels[status];
  }

  priorityLabel(
    priority: WeddingTask['priority']
  ): string {
    const labels: Record<
      WeddingTask['priority'],
      string
    > = {
      low: 'Scăzută',
      medium: 'Medie',
      high: 'Ridicată',
      'very high': 'Foarte ridicată'
    };

    return labels[priority];
  }

  private vendorStatusRank(
    status: WeddingVendor['status']
  ): number {
    const ranks: Record<
      WeddingVendor['status'],
      number
    > = {
      'to-contact': 0,
      'to-confirm': 1,
      pending: 2,
      contracted: 3,
      done: 4
    };

    return ranks[status];
  }

  private todayKey(): string {
    const today = new Date();

    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
  }
}

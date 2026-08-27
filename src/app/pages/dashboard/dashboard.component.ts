import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  of
} from 'rxjs';

import {
  Currency,
  WeddingAccommodation,
  WeddingExpense,
  WeddingGuest,
  WeddingTask,
  WeddingVendor
} from '../../models/wedding-data.model';
import { FirebaseAccommodationsService } from '../../services/firebase-accommodations.service';
import { FirebaseGuestsService } from '../../services/firebase-guests.service';
import { FirebasePaymentsService } from '../../services/firebase-payments.service';
import { FirebaseTasksService } from '../../services/firebase-tasks.service';
import { FirebaseVendorsService } from '../../services/firebase-vendors.service';

interface DashboardModule {
  title: string;
  description: string;
  route: string;
  label: string;
  icon: string;
}

interface DashboardWeddingTimelineItem {
  id: string;
  time: string;
  title: string;
  owner?: string;
  location?: string;
  phone?: string;
  notes?: string;
  status?: 'todo' | 'done';
  sortOrder?: number;
  source?: 'manual' | 'vendor';
}

interface DashboardWeddingTimelineDisplayItem {
  time: string;
  title: string;
  details: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly destroyRef = inject(DestroyRef);

  private readonly firestore = inject(Firestore);

  private readonly vendorsService = inject(FirebaseVendorsService);
  private readonly paymentsService = inject(FirebasePaymentsService);
  private readonly guestsService = inject(FirebaseGuestsService);
  private readonly tasksService = inject(FirebaseTasksService);
  private readonly accommodationsService = inject(
      FirebaseAccommodationsService
  );

  readonly weddingDate = new Date('2026-09-05T12:00:00');

  vendors: WeddingVendor[] = [];
  expenses: WeddingExpense[] = [];
  guests: WeddingGuest[] = [];
  tasks: WeddingTask[] = [];
  accommodations: WeddingAccommodation[] = [];

  weddingTimeline: DashboardWeddingTimelineDisplayItem[] = [];

  isLoading = true;
  loadError = '';

  private readonly weddingTimeline$: Observable<
      DashboardWeddingTimelineItem[]
  > = (
      collectionData(
          collection(this.firestore, 'weddingDayTimeline'),
          { idField: 'id' }
      ) as Observable<DashboardWeddingTimelineItem[]>
  ).pipe(
      catchError(error => {
        console.error(
            'Dashboard wedding timeline Firestore error:',
            error
        );

        return of([]);
      })
  );

  constructor() {
    combineLatest([
      this.vendorsService.getVendors(),
      this.paymentsService.getExpenses(),
      this.guestsService.getGuests(),
      this.tasksService.getTasks(),
      this.accommodationsService.getAccommodations(),
      this.weddingTimeline$
    ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ([
                   vendors,
                   expenses,
                   guests,
                   tasks,
                   accommodations,
                   weddingTimeline
                 ]) => {
            this.vendors = vendors;
            this.expenses = expenses;
            this.guests = guests;
            this.tasks = tasks;
            this.accommodations = accommodations;

            this.weddingTimeline = [...weddingTimeline]
                .filter(item => Boolean(item.time && item.title))
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
                }));

            this.isLoading = false;
            this.loadError = '';
          },

          error: error => {
            console.error(
                'Dashboard Firestore error:',
                error
            );

            this.isLoading = false;

            this.loadError =
                'Datele nu au putut fi încărcate din Firestore. Verifică autentificarea și regulile bazei de date.';
          }
        });
  }

  get daysUntilWedding(): number {
    const today = new Date();

    const difference =
        this.weddingDate.getTime() -
        today.getTime();

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
    return (
        new Date().getTime() >
        this.weddingDate.getTime()
    );
  }

  get totalRon(): number {
    return this.sumByCurrency(
        'RON',
        'total'
    );
  }

  get totalEur(): number {
    return this.sumByCurrency(
        'EUR',
        'total'
    );
  }

  get paidRon(): number {
    return this.sumByCurrency(
        'RON',
        'advancePaid'
    );
  }

  get paidEur(): number {
    return this.sumByCurrency(
        'EUR',
        'advancePaid'
    );
  }

  get remainingRon(): number {
    return this.sumByCurrency(
        'RON',
        'remainingPayment'
    );
  }

  get remainingEur(): number {
    return this.sumByCurrency(
        'EUR',
        'remainingPayment'
    );
  }

  get contractedVendors(): number {
    return this.vendors.filter(
        vendor =>
            vendor.status === 'contracted' ||
            vendor.status === 'done'
    ).length;
  }

  get totalVendors(): number {
    return this.vendors.length;
  }

  get confirmedGuests(): number {
    return this.guests.filter(
        guest =>
            guest.attendanceStatus ===
            'confirmed'
    ).length;
  }

  get pendingGuests(): number {
    return this.guests.filter(
        guest =>
            guest.attendanceStatus ===
            'pending' ||
            guest.attendanceStatus ===
            'maybe'
    ).length;
  }

  get declinedGuests(): number {
    return this.guests.filter(
        guest =>
            guest.attendanceStatus ===
            'declined'
    ).length;
  }

  get invitedGuests(): number {
    return this.guests.length;
  }

  get confirmedPeople(): number {
    return this.guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed'
        )
        .reduce(
            (sum, guest) =>
                sum +
                (Number(guest.adults) || 0) +
                (Number(guest.children) || 0),
            0
        );
  }

  get confirmedGroupsWithoutTable(): number {
    return this.guests.filter(
        guest =>
            guest.attendanceStatus ===
            'confirmed' &&
            !guest.tableNumber
    ).length;
  }

  get confirmedPeopleWithoutTable(): number {
    return this.guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed' &&
                !guest.tableNumber
        )
        .reduce(
            (sum, guest) =>
                sum +
                (Number(guest.adults) || 0) +
                (Number(guest.children) || 0),
            0
        );
  }

  get guestsNeedingAccommodation(): number {
    return this.guests
        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined' &&
                guest.accommodationStatus ===
                'needed'
        )
        .reduce(
            (sum, guest) =>
                sum +
                (Number(guest.adults) || 0) +
                (Number(guest.children) || 0),
            0
        );
  }

  get guestsWithBookedAccommodation(): number {
    return this.guests
        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined' &&
                guest.accommodationStatus ===
                'booked'
        )
        .reduce(
            (sum, guest) =>
                sum +
                (Number(guest.adults) || 0) +
                (Number(guest.children) || 0),
            0
        );
  }

  get accommodationAttentionCount(): number {
    return this.guests.filter(
        guest =>
            guest.attendanceStatus !==
            'declined' &&
            guest.accommodationStatus ===
            'needed'
    ).length;
  }

  get completedTasks(): number {
    return this.tasks.filter(
        task => task.status === 'done'
    ).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(
        task => task.status !== 'done'
    ).length;
  }

  get overdueTasks(): WeddingTask[] {
    const today = this.toDateKey(
        new Date()
    );

    return this.tasks
        .filter(
            task =>
                task.status !== 'done' &&
                !!task.dueDate &&
                task.dueDate < today
        )
        .sort((a, b) =>
            (a.dueDate ?? '').localeCompare(
                b.dueDate ?? ''
            )
        );
  }

  get urgentTasks(): WeddingTask[] {
    return this.tasks
        .filter(
            task =>
                task.status !== 'done' &&
                (
                    task.priority === 'high' ||
                    task.priority === 'very high'
                )
        )
        .sort((a, b) => {
          const priorityDiff =
              this.priorityRank(b.priority) -
              this.priorityRank(a.priority);

          return (
              priorityDiff ||
              (a.dueDate ?? '9999-12-31').localeCompare(
                  b.dueDate ?? '9999-12-31'
              )
          );
        })
        .slice(0, 5);
  }

  get upcomingTasks(): WeddingTask[] {
    const today = this.toDateKey(
        new Date()
    );

    return this.tasks
        .filter(
            task =>
                task.status !== 'done' &&
                (
                    !task.dueDate ||
                    task.dueDate >= today
                )
        )
        .sort((a, b) =>
            (a.dueDate ?? '9999-12-31').localeCompare(
                b.dueDate ??
                '9999-12-31'
            )
        )
        .slice(0, 5);
  }

  get paymentsBeforeWedding(): WeddingExpense[] {
    return this.openPayments
        .filter(
            payment =>
                this.resolvePaymentMoment(
                    payment
                ) === 'before-wedding'
        )
        .sort((a, b) =>
            (a.dueDate ?? '9999-12-31').localeCompare(
                b.dueDate ??
                '9999-12-31'
            )
        )
        .slice(0, 5);
  }

  get paymentsOnWeddingDay(): WeddingExpense[] {
    return this.openPayments
        .filter(
            payment =>
                this.resolvePaymentMoment(
                    payment
                ) === 'wedding-day'
        )
        .sort((a, b) =>
            a.name.localeCompare(
                b.name,
                'ro'
            )
        )
        .slice(0, 5);
  }

  get paymentsAfterWedding(): WeddingExpense[] {
    return this.openPayments
        .filter(
            payment =>
                this.resolvePaymentMoment(
                    payment
                ) === 'after-wedding'
        )
        .sort((a, b) =>
            (a.dueDate ?? '9999-12-31').localeCompare(
                b.dueDate ??
                '9999-12-31'
            )
        )
        .slice(0, 6);
  }

  get tasksNextSevenDays(): WeddingTask[] {
    const today = this.toDateKey(
        new Date()
    );

    const nextSevenDays =
        this.toDateKey(
            new Date(
                Date.now() +
                7 *
                24 *
                60 *
                60 *
                1000
            )
        );

    return this.tasks
        .filter(
            task =>
                task.status !== 'done' &&
                !!task.dueDate &&
                task.dueDate >= today &&
                task.dueDate <= nextSevenDays
        )
        .sort((a, b) =>
            (a.dueDate ?? '').localeCompare(
                b.dueDate ?? ''
            )
        )
        .slice(0, 6);
  }

  get overduePaymentsCount(): number {
    const today = this.toDateKey(
        new Date()
    );

    return this.openPayments.filter(
        payment =>
            !!payment.dueDate &&
            payment.dueDate < today
    ).length;
  }

  paymentState(
      payment: WeddingExpense
  ):
      | 'overdue'
      | 'soon'
      | 'undated'
      | 'after'
      | 'wedding-day' {
    const moment =
        this.resolvePaymentMoment(
            payment
        );

    if (
        moment === 'after-wedding'
    ) {
      return 'after';
    }

    if (
        moment === 'wedding-day'
    ) {
      return 'wedding-day';
    }

    if (
        payment.deadlineType ===
        'relative'
    ) {
      return 'soon';
    }

    if (!payment.dueDate) {
      return 'undated';
    }

    return payment.dueDate <
    this.toDateKey(new Date())
        ? 'overdue'
        : 'soon';
  }

  paymentStateLabel(
      payment: WeddingExpense
  ): string {
    const state =
        this.paymentState(payment);

    if (state === 'overdue') {
      return 'Întârziată';
    }

    if (state === 'undated') {
      return 'Fără termen';
    }

    if (state === 'after') {
      return 'După nuntă';
    }

    if (
        state === 'wedding-day'
    ) {
      return 'În ziua nunții';
    }

    return 'Înainte de nuntă';
  }

  paymentTimingLabel(
      payment: WeddingExpense
  ): string {
    const moment =
        this.resolvePaymentMoment(
            payment
        );

    const deadline =
        payment.deadlineType ===
        'relative' &&
        payment.relativeDeadline
            ? payment.relativeDeadline
            : payment.dueDate
                ? this.formatDate(
                    payment.dueDate
                )
                : 'termen necompletat';

    if (
        moment === 'after-wedding'
    ) {
      return `După nuntă · ${deadline}`;
    }

    if (
        moment === 'wedding-day'
    ) {
      return payment.relativeDeadline
          ? `În ziua nunții · ${payment.relativeDeadline}`
          : 'În ziua nunții · 05 sept.';
    }

    return `Înainte de nuntă · ${deadline}`;
  }

  private get openPayments(): WeddingExpense[] {
    return this.expenses.filter(
        expense =>
            (expense.remainingPayment ??
                0) > 0 &&
            expense.includeInTotals !==
            false &&
            expense.status !== 'paid'
    );
  }

  private resolvePaymentMoment(
      payment: WeddingExpense
  ):
      | 'before-wedding'
      | 'wedding-day'
      | 'after-wedding' {
    if (payment.payAfterWedding) {
      return 'after-wedding';
    }

    if (payment.paymentMoment) {
      return payment.paymentMoment;
    }

    const notes =
        `${payment.name} ${payment.notes ?? ''}`.toLocaleLowerCase(
            'ro'
        );

    if (
        notes.includes(
            'după eveniment'
        ) ||
        notes.includes(
            'dupa eveniment'
        ) ||
        notes.includes(
            'după nuntă'
        ) ||
        notes.includes(
            'dupa nunta'
        )
    ) {
      return 'after-wedding';
    }

    if (
        notes.includes(
            'în ziua nunții'
        ) ||
        notes.includes(
            'in ziua nuntii'
        ) ||
        notes.includes(
            'ziua evenimentului'
        )
    ) {
      return 'wedding-day';
    }

    if (payment.dueDate) {
      const weddingKey =
          this.toDateKey(
              this.weddingDate
          );

      if (
          payment.dueDate >
          weddingKey
      ) {
        return 'after-wedding';
      }

      if (
          payment.dueDate ===
          weddingKey
      ) {
        return 'wedding-day';
      }
    }

    return 'before-wedding';
  }

  get bookedRooms(): number {
    return this.accommodations
        .filter(
            item =>
                item.status !==
                'cancelled'
        )
        .reduce(
            (sum, item) =>
                sum +
                (Number(item.rooms) ||
                    0),
            0
        );
  }

  get accommodatedGuests(): number {
    return this.accommodations
        .filter(
            item =>
                item.status !==
                'cancelled'
        )
        .reduce(
            (sum, item) =>
                sum +
                (Number(item.guests) ||
                    0),
            0
        );
  }

  get vendorProgress(): number {
    return this.percentage(
        this.contractedVendors,
        this.totalVendors
    );
  }

  get guestProgress(): number {
    return this.percentage(
        this.confirmedGuests,
        this.invitedGuests
    );
  }

  get paidRonProgress(): number {
    return this.percentage(
        this.paidRon,
        this.totalRon
    );
  }

  get paidEurProgress(): number {
    return this.percentage(
        this.paidEur,
        this.totalEur
    );
  }

  get taskProgress(): number {
    return this.percentage(
        this.completedTasks,
        this.tasks.length
    );
  }

  get organizationProgress(): number {
    const sections = [
      this.vendorProgress,
      this.guestProgress,
      this.taskProgress
    ];

    if (this.totalRon > 0) {
      sections.push(
          this.paidRonProgress
      );
    }

    if (this.totalEur > 0) {
      sections.push(
          this.paidEurProgress
      );
    }

    return sections.length
        ? Math.round(
            sections.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            sections.length
        )
        : 0;
  }

  get modules(): DashboardModule[] {
    return [
      {
        title: 'Furnizori',
        description:
            'Contracte, contacte și resturi de plată.',
        route: '/vendors',
        label:
            `${this.contractedVendors}/${this.totalVendors} contractați`,
        icon: '🤝'
      },
      {
        title: 'Plăți',
        description:
            'Bugetul în RON și EUR, actualizat live.',
        route: '/payments',
        label:
            `${this.formatMoney(
                this.remainingRon,
                'RON'
            )} rest`,
        icon: '💳'
      },
      {
        title: 'Invitați',
        description:
            'Confirmări, refuzuri și persoane participante.',
        route: '/guests',
        label:
            `${this.confirmedGuests}/${this.invitedGuests} confirmați`,
        icon: '💌'
      },
      {
        title: 'Task-uri',
        description:
            'Deadline-uri și activități care mai trebuie făcute.',
        route: '/tasks',
        label:
            `${this.pendingTasks} rămase`,
        icon: '✅'
      },
      {
        title: 'Cazări',
        description:
            'Camere și invitați care au nevoie de cazare.',
        route: '/cazari',
        label:
            `${this.accommodatedGuests} persoane`,
        icon: '🛏️'
      },
      {
        title: 'Documente',
        description:
            'Contracte, facturi și oferte organizate prin Google Drive.',
        route: '/documents',
        label: 'Linkuri Drive',
        icon: '📁'
      }
    ];
  }

  formatMoney(
      value: number | undefined,
      currency: Currency
  ): string {
    if (
        value === undefined ||
        value === null
    ) {
      return '—';
    }

    return `${value.toLocaleString(
        'ro-RO',
        {
          maximumFractionDigits: 2
        }
    )} ${currency}`;
  }

  formatDate(
      value?: string
  ): string {
    if (!value) {
      return 'Fără termen';
    }

    const date = new Date(
        `${value}T12:00:00`
    );

    return Number.isNaN(
        date.getTime()
    )
        ? value
        : new Intl.DateTimeFormat(
            'ro-RO',
            {
              day: '2-digit',
              month: 'short'
            }
        ).format(date);
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
      'very high':
          'Foarte ridicată'
    };

    return labels[priority];
  }

  private sumByCurrency(
      currency: Currency,
      field: keyof Pick<
          WeddingExpense,
          | 'total'
          | 'advancePaid'
          | 'remainingPayment'
      >
  ): number {
    return this.expenses
        .filter(
            expense =>
                (expense.currency ??
                    'RON') ===
                currency &&
                expense.includeInTotals !==
                false
        )
        .reduce(
            (sum, expense) =>
                sum +
                (Number(
                        expense[field]
                    ) ||
                    0),
            0
        );
  }

  private percentage(
      value: number,
      total: number
  ): number {
    return total > 0
        ? Math.min(
            Math.round(
                (value / total) *
                100
            ),
            100
        )
        : 0;
  }

  private priorityRank(
      priority: WeddingTask['priority']
  ): number {
    return {
      low: 1,
      medium: 2,
      high: 3,
      'very high': 4
    }[priority];
  }

  private toDateKey(
      date: Date
  ): string {
    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
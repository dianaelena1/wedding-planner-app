import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData
} from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';

import {
  WeddingAccommodation,
  WeddingExpense,
  WeddingPreparationItem,
  WeddingRingItem,
  WeddingTask,
  WeddingVendor
} from '../../models/wedding-data.model';

type CalendarEventType =
  | 'task'
  | 'payment'
  | 'preparation'
  | 'vendor'
  | 'accommodation'
  | 'rings'
  | 'wedding';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: CalendarEventType;
  sourceLabel: string;
  status?: string;
  notes?: string;
  route?: string;
  amount?: number;
  currency?: string;
}

interface CalendarDay {
  date: Date | null;
  isoDate: string;
  dayNumber: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-timeline.component.html',
  styleUrl: './calendar-timeline.component.scss'
})
export class CalendarTimelineComponent {
  private readonly firestore = inject(Firestore);
  private readonly weddingDate = new Date('2026-09-05T16:00:00');

  private readonly tasks$ = this.readCollection<WeddingTask>('weddingTasks');
  private readonly expenses$ = this.readCollection<WeddingExpense>('weddingExpenses');
  private readonly vendors$ = this.readCollection<WeddingVendor>('weddingVendors');
  private readonly preparations$ = this.readCollection<WeddingPreparationItem>('weddingPreparations');
  private readonly accommodations$ = this.readCollection<WeddingAccommodation>('weddingAccommodations');
  private readonly rings$ = this.readCollection<WeddingRingItem>('weddingRings');

  readonly events$: Observable<CalendarEvent[]> = combineLatest([
    this.tasks$,
    this.expenses$,
    this.vendors$,
    this.preparations$,
    this.accommodations$,
    this.rings$
  ]).pipe(
    map(([tasks, expenses, vendors, preparations, accommodations, rings]) => {
      const events: CalendarEvent[] = [
        ...this.mapTasks(tasks),
        ...this.mapExpenses(expenses),
        ...this.mapVendors(vendors),
        ...this.mapPreparations(preparations),
        ...this.mapAccommodations(accommodations),
        ...this.mapRings(rings),
        {
          id: 'wedding-day',
          title: 'Nunta Diana & Dan',
          date: '2026-09-05',
          time: '16:00',
          type: 'wedding',
          sourceLabel: 'Ziua nunții',
          notes: 'Wild Garden'
        }
      ];

      return events
        .filter(event => this.isValidIsoDate(event.date))
        .sort((a, b) =>
          `${a.date}T${a.time || '00:00'}`.localeCompare(
            `${b.date}T${b.time || '00:00'}`
          )
        );
    })
  );

  readonly viewModel$ = this.events$.pipe(
    map(events => ({
      events,
      calendarDays: this.buildCalendarDays(events),
      upcomingEvents: this.getUpcomingEvents(events),
      overdueEvents: this.getOverdueEvents(events),
      timelineGroups: this.buildTimelineGroups(events)
    }))
  );

  currentMonth = new Date();
  selectedType: CalendarEventType | 'all' = 'all';
  searchTerm = '';
  selectedEvent: CalendarEvent | null = null;

  readonly typeOptions: { value: CalendarEventType | 'all'; label: string }[] = [
    { value: 'all', label: 'Toate' },
    { value: 'task', label: 'Task-uri' },
    { value: 'payment', label: 'Plăți' },
    { value: 'preparation', label: 'Pregătiri' },
    { value: 'vendor', label: 'Furnizori' },
    { value: 'accommodation', label: 'Cazări' },
    { value: 'rings', label: 'Verighete' },
    { value: 'wedding', label: 'Nuntă' }
  ];

  get monthLabel(): string {
    return new Intl.DateTimeFormat('ro-RO', {
      month: 'long',
      year: 'numeric'
    }).format(this.currentMonth);
  }

  get daysUntilWedding(): number {
    const today = this.startOfDay(new Date());
    const wedding = this.startOfDay(this.weddingDate);
    return Math.max(0, Math.ceil((wedding.getTime() - today.getTime()) / 86400000));
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
  }

  goToToday(): void {
    this.currentMonth = new Date();
  }

  goToWeddingMonth(): void {
    this.currentMonth = new Date(2026, 8, 1);
  }

  filteredEvents(events: CalendarEvent[]): CalendarEvent[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('ro');

    return events.filter(event => {
      const matchesType = this.selectedType === 'all' || event.type === this.selectedType;
      const matchesSearch = !query || [
        event.title,
        event.sourceLabel,
        event.notes,
        event.status
      ]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase('ro').includes(query));

      return matchesType && matchesSearch;
    });
  }

  eventsForDay(day: CalendarDay, events: CalendarEvent[]): CalendarEvent[] {
    if (!day.isoDate) {
      return [];
    }

    return this.filteredEvents(events).filter(event => event.date === day.isoDate);
  }

  selectEvent(event: CalendarEvent): void {
    this.selectedEvent = event;
  }

  closeEvent(): void {
    this.selectedEvent = null;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('ro-RO', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(this.parseLocalDate(date));
  }

  formatAmount(event: CalendarEvent): string {
    if (event.amount == null) {
      return '';
    }

    return new Intl.NumberFormat('ro-RO', {
      maximumFractionDigits: 2
    }).format(event.amount) + ` ${event.currency || ''}`;
  }

  typeLabel(type: CalendarEventType): string {
    return this.typeOptions.find(option => option.value === type)?.label || type;
  }

  isOverdue(event: CalendarEvent): boolean {
    return this.parseLocalDate(event.date) < this.startOfDay(new Date()) &&
      !this.isCompleted(event);
  }

  isCompleted(event: CalendarEvent): boolean {
    return ['done', 'paid', 'received', 'cancelled'].includes(event.status || '');
  }

  private readCollection<T>(collectionName: string): Observable<T[]> {
    return collectionData(
      collection(this.firestore, collectionName),
      { idField: 'id' }
    ) as Observable<T[]>;
  }

  private mapTasks(tasks: WeddingTask[]): CalendarEvent[] {
    return tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate!,
        type: 'task' as const,
        sourceLabel: task.category || 'Task',
        status: task.status,
        notes: task.notes,
        route: '/tasks'
      }));
  }

  private mapExpenses(expenses: WeddingExpense[]): CalendarEvent[] {
    return expenses
      .filter(expense => expense.dueDate)
      .map(expense => ({
        id: `payment-${expense.id}`,
        title: `Plată: ${expense.name}`,
        date: expense.dueDate!,
        type: 'payment' as const,
        sourceLabel: expense.category || 'Plată',
        status: expense.status,
        notes: expense.notes,
        route: '/payments',
        amount: expense.remainingPayment ?? expense.total,
        currency: expense.currency
      }));
  }

  private mapVendors(vendors: WeddingVendor[]): CalendarEvent[] {
    return vendors.flatMap(vendor => {
      const events: CalendarEvent[] = [];

      if (vendor.paymentDeadline) {
        events.push({
          id: `vendor-payment-${vendor.id}`,
          title: `Scadență furnizor: ${vendor.name}`,
          date: vendor.paymentDeadline,
          type: 'vendor',
          sourceLabel: vendor.category || 'Furnizor',
          status: vendor.status,
          notes: vendor.notes,
          route: '/vendors',
          amount: vendor.remainingPayment,
          currency: vendor.currency
        });
      }

      return events;
    });
  }

  private mapPreparations(items: WeddingPreparationItem[]): CalendarEvent[] {
    return items
      .filter(item => item.appointmentDate)
      .map(item => ({
        id: `preparation-${item.id}`,
        title: item.name,
        date: item.appointmentDate!,
        time: item.appointmentTime,
        type: 'preparation' as const,
        sourceLabel: item.category,
        status: item.status,
        notes: [item.provider, item.notes].filter(Boolean).join(' · '),
        route: '/pregatiri'
      }));
  }

  private mapAccommodations(items: WeddingAccommodation[]): CalendarEvent[] {
    return items.flatMap(item => {
      const events: CalendarEvent[] = [];

      if (item.checkIn) {
        events.push({
          id: `accommodation-in-${item.id}`,
          title: `Check-in: ${item.name}`,
          date: item.checkIn,
          type: 'accommodation',
          sourceLabel: 'Cazare',
          status: item.status,
          notes: item.location,
          route: '/cazari'
        });
      }

      if (item.checkOut) {
        events.push({
          id: `accommodation-out-${item.id}`,
          title: `Check-out: ${item.name}`,
          date: item.checkOut,
          type: 'accommodation',
          sourceLabel: 'Cazare',
          status: item.status,
          notes: item.location,
          route: '/cazari'
        });
      }

      return events;
    });
  }

  private mapRings(items: WeddingRingItem[]): CalendarEvent[] {
    return items.flatMap(item => {
      const events: CalendarEvent[] = [];

      if (item.orderDate) {
        events.push({
          id: `rings-order-${item.id}`,
          title: `Comandă verighete: ${item.name}`,
          date: item.orderDate,
          type: 'rings',
          sourceLabel: 'Verighete',
          status: item.status,
          notes: item.shop,
          route: '/verighete'
        });
      }

      if (item.pickupDate) {
        events.push({
          id: `rings-pickup-${item.id}`,
          title: `Ridicare verighete: ${item.name}`,
          date: item.pickupDate,
          type: 'rings',
          sourceLabel: 'Verighete',
          status: item.status,
          notes: item.shop,
          route: '/verighete'
        });
      }

      return events;
    });
  }

  private buildCalendarDays(events: CalendarEvent[]): CalendarDay[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const mondayIndex = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((mondayIndex + daysInMonth) / 7) * 7;
    const todayIso = this.toIsoDate(new Date());

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - mondayIndex + 1;

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return {
          date: null,
          isoDate: '',
          dayNumber: null,
          isCurrentMonth: false,
          isToday: false,
          events: []
        };
      }

      const date = new Date(year, month, dayNumber);
      const isoDate = this.toIsoDate(date);

      return {
        date,
        isoDate,
        dayNumber,
        isCurrentMonth: true,
        isToday: isoDate === todayIso,
        events: events.filter(event => event.date === isoDate)
      };
    });
  }

  private getUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
    const today = this.toIsoDate(new Date());
    return events
      .filter(event => event.date >= today && !this.isCompleted(event))
      .slice(0, 8);
  }

  private getOverdueEvents(events: CalendarEvent[]): CalendarEvent[] {
    return events.filter(event => this.isOverdue(event));
  }

  private buildTimelineGroups(events: CalendarEvent[]): { label: string; events: CalendarEvent[] }[] {
    const today = this.startOfDay(new Date());
    const windows = [
      { label: 'Acum / întârziate', min: -9999, max: 0 },
      { label: 'Următoarele 7 zile', min: 1, max: 7 },
      { label: 'Următoarele 14 zile', min: 8, max: 14 },
      { label: 'Următoarele 30 de zile', min: 15, max: 30 },
      { label: 'Până la nuntă', min: 31, max: 9999 }
    ];

    return windows
      .map(window => ({
        label: window.label,
        events: events.filter(event => {
          const days = Math.ceil(
            (this.parseLocalDate(event.date).getTime() - today.getTime()) / 86400000
          );
          return days >= window.min && days <= window.max;
        })
      }))
      .filter(group => group.events.length > 0);
  }

  private isValidIsoDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  private parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EVENT, GUESTS, TASKS, VENDORS } from './data/wedding-data';
import { Currency, GuestStatus, Vendor } from './models/wedding.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly event = EVENT;
  readonly vendors = signal(VENDORS);
  readonly guests = signal(GUESTS);
  readonly tasks = signal(TASKS);
  readonly search = signal('');
  readonly activeTab = signal<'dashboard' | 'vendors' | 'guests' | 'tasks'>('dashboard');

  readonly filteredGuests = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.guests().filter((guest) => guest.name.toLowerCase().includes(term));
  });

  readonly confirmedGuests = computed(() => this.guests().filter((g) => g.status === 'vine').length);
  readonly unconfirmedGuests = computed(() => this.guests().filter((g) => g.status === 'neconfirmat').length);
  readonly openTasks = computed(() => this.tasks().filter((t) => !t.done).length);

  readonly ronTotal = computed(() => this.sumByCurrency('RON'));
  readonly eurTotal = computed(() => this.sumByCurrency('EUR'));
  readonly ronRemaining = computed(() => this.sumRemaining('RON'));
  readonly eurRemaining = computed(() => this.sumRemaining('EUR'));

  setTab(tab: 'dashboard' | 'vendors' | 'guests' | 'tasks'): void {
    this.activeTab.set(tab);
  }

  updateGuestStatus(id: number, status: GuestStatus): void {
    this.guests.update((guests) => guests.map((g) => g.id === id ? { ...g, status } : g));
  }

  toggleTask(id: number): void {
    this.tasks.update((tasks) => tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  money(vendor: Vendor, field: 'total' | 'advance' | 'remaining'): string {
    const value = vendor[field];
    return value ? `${value.amount.toLocaleString('ro-RO')} ${value.currency}` : '-';
  }

  private sumByCurrency(currency: Currency): number {
    return this.vendors()
      .filter((v) => v.total?.currency === currency)
      .reduce((sum, vendor) => sum + (vendor.total?.amount ?? 0), 0);
  }

  private sumRemaining(currency: Currency): number {
    return this.vendors()
      .filter((v) => v.remaining?.currency === currency)
      .reduce((sum, vendor) => sum + (vendor.remaining?.amount ?? 0), 0);
  }
}

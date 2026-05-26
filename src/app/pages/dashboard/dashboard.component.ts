import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WEDDING_EXPENSES, WEDDING_GUESTS, WEDDING_TASKS, WEDDING_VENDORS } from '../../data/wedding-data';
import { Currency, WeddingExpense } from '../../models/wedding-data.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  vendors = WEDDING_VENDORS;
  expenses = WEDDING_EXPENSES;
  guests = WEDDING_GUESTS;
  tasks = WEDDING_TASKS;

  totalRon = this.sumByCurrency('RON', 'total');
  totalEur = this.sumByCurrency('EUR', 'total');
  paidRon = this.sumByCurrency('RON', 'advancePaid');
  paidEur = this.sumByCurrency('EUR', 'advancePaid');
  remainingRon = this.sumByCurrency('RON', 'remainingPayment');
  remainingEur = this.sumByCurrency('EUR', 'remainingPayment');

  contractedVendors = this.vendors.filter(vendor => vendor.status === 'contracted').length;
  pendingTasks = this.tasks.filter(task => task.status !== 'done').length;
  confirmedGuests = this.guests.filter(guest => guest.attendanceStatus === 'confirmed').length;
  invitedGuests = this.guests.length;

  highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && task.status !== 'done');
  nextPayments = this.expenses
    .filter(expense => (expense.remainingPayment ?? 0) > 0)
    .slice(0, 6);

  formatMoney(value: number | undefined, currency: Currency): string {
    if (!value) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency}`;
  }

  private sumByCurrency(currency: Currency, field: keyof Pick<WeddingExpense, 'total' | 'advancePaid' | 'remainingPayment'>): number {
    return this.expenses
      .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
      .reduce((sum, expense) => sum + (expense[field] ?? 0), 0);
  }
}

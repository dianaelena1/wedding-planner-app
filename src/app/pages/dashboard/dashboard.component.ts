import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  WEDDING_EXPENSES,
  WEDDING_GUESTS,
  WEDDING_TASKS,
  WEDDING_VENDORS
} from '../../data/wedding-data';
import { Currency, WeddingExpense } from '../../models/wedding-data.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  vendors = WEDDING_VENDORS;
  expenses = WEDDING_EXPENSES;
  guests = WEDDING_GUESTS;
  tasks = WEDDING_TASKS;

  weddingDate = new Date('2026-09-05T12:00:00');

  totalRon = this.sumByCurrency('RON', 'total');
  totalEur = this.sumByCurrency('EUR', 'total');
  paidRon = this.sumByCurrency('RON', 'advancePaid');
  paidEur = this.sumByCurrency('EUR', 'advancePaid');
  remainingRon = this.sumByCurrency('RON', 'remainingPayment');
  remainingEur = this.sumByCurrency('EUR', 'remainingPayment');

  contractedVendors = this.vendors.filter(vendor => vendor.status === 'contracted').length;
  totalVendors = this.vendors.length;

  confirmedGuests = this.guests.filter(guest => guest.attendanceStatus === 'confirmed').length;
  invitedGuests = this.guests.length;

  pendingTasks = this.tasks.filter(task => task.status !== 'done').length;
  highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && task.status !== 'done');

  nextPayments = this.expenses
      .filter(expense => (expense.remainingPayment ?? 0) > 0 && expense.includeInTotals !== false)
      .slice(0, 5);

  modules = [
    {
      title: 'Furnizori',
      description: 'Contracte, avansuri, resturi de plata si statusuri.',
      route: '/vendors',
      label: `${this.contractedVendors}/${this.totalVendors} contractati`
    },
    {
      title: 'Plati',
      description: 'Bugetul impartit pe RON si EUR, cu resturi clare.',
      route: '/payments',
      label: `${this.formatMoney(this.remainingRon, 'RON')} rest`
    },
    {
      title: 'Invitati',
      description: 'Lista invitati, confirmari si statusuri.',
      route: '/guests',
      label: `${this.confirmedGuests}/${this.invitedGuests} confirmati`
    },
    {
      title: 'Documente',
      description: 'Contracte si fisiere incarcate in Firebase.',
      route: '/documents',
      label: 'Storage privat'
    },
    {
      title: 'Pregatiri',
      description: 'Rochie, machiaj, par, pantofi si costum mire.',
      route: '/pregatiri',
      label: 'Beauty & outfit'
    },
    {
      title: 'Verighete',
      description: 'Model, material, marimi, comanda si plata.',
      route: '/verighete',
      label: 'De urmarit'
    }
  ];

  weddingTimeline = [
    {
      time: '07:30',
      title: 'Machiaj mireasa',
      details: 'Flavia S.'
    },
    {
      time: '08:30',
      title: 'Par mireasa',
      details: 'Lavinia S.'
    },
    {
      time: '12:00',
      title: 'Cununie religioasa',
      details: 'Biserica Sfintii Arhangheli Mihail si Gavril'
    },
    {
      time: '16:00',
      title: 'Receptie Wild Garden',
      details: 'Incepere eveniment'
    },
    {
      time: '18:00',
      title: 'Kids corner',
      details: 'Animator 18:00 - 20:00'
    },
    {
      time: '00:00',
      title: 'Final photo booth',
      details: 'K Boom Photo Booth'
    }
  ];

  get daysUntilWedding(): number {
    const today = new Date();
    const difference = this.weddingDate.getTime() - today.getTime();
    return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
  }

  get vendorProgress(): number {
    if (!this.totalVendors) {
      return 0;
    }

    return Math.round((this.contractedVendors / this.totalVendors) * 100);
  }

  get guestProgress(): number {
    if (!this.invitedGuests) {
      return 0;
    }

    return Math.round((this.confirmedGuests / this.invitedGuests) * 100);
  }

  get paidRonProgress(): number {
    if (!this.totalRon) {
      return 0;
    }

    return Math.round((this.paidRon / this.totalRon) * 100);
  }

  formatMoney(value: number | undefined, currency: Currency): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency}`;
  }

  private sumByCurrency(
      currency: Currency,
      field: keyof Pick<WeddingExpense, 'total' | 'advancePaid' | 'remainingPayment'>
  ): number {
    return this.expenses
        .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
        .reduce((sum, expense) => sum + (expense[field] ?? 0), 0);
  }
}
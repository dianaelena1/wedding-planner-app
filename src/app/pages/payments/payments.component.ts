import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WEDDING_DRINKS, WEDDING_EXPENSES } from '../../data/wedding-data';
import { Currency, WeddingExpense } from '../../models/wedding-data.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  expenses = WEDDING_EXPENSES;
  drinks = WEDDING_DRINKS;

  categories = Array.from(new Set(this.expenses.map(expense => expense.category)));

  totalRon = this.sumByCurrency('RON', 'total');
  totalEur = this.sumByCurrency('EUR', 'total');
  remainingRon = this.sumByCurrency('RON', 'remainingPayment');
  remainingEur = this.sumByCurrency('EUR', 'remainingPayment');

  getExpensesByCategory(category: string): WeddingExpense[] {
    return this.expenses.filter(expense => expense.category === category);
  }

  getCategoryTotal(category: string, currency: Currency): number {
    return this.getExpensesByCategory(category)
      .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
      .reduce((sum, expense) => sum + (expense.total ?? 0), 0);
  }

  formatMoney(value: number | undefined, currency: Currency): string {
    if (!value) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency}`;
  }

  private sumByCurrency(currency: Currency, field: keyof Pick<WeddingExpense, 'total' | 'remainingPayment'>): number {
    return this.expenses
      .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
      .reduce((sum, expense) => sum + (expense[field] ?? 0), 0);
  }
}

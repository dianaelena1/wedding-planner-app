import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WEDDING_DRINKS, WEDDING_EXPENSES } from '../../data/wedding-data';
import {
  Currency,
  WeddingDrinkItem,
  WeddingExpense,
  WeddingExpenseStatus,
  WeddingPaymentDeadlineType,
  WeddingPaymentMoment,
  WeddingVendor
} from '../../models/wedding-data.model';
import { FirebasePaymentsService } from '../../services/firebase-payments.service';
import { FirebaseVendorsService } from '../../services/firebase-vendors.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly paymentsService = inject(FirebasePaymentsService);
  private readonly vendorsService = inject(FirebaseVendorsService);

  expenses: WeddingExpense[] = [];
  vendors: WeddingVendor[] = [];
  drinks: WeddingDrinkItem[] = [];
  expenseForm: WeddingExpense | null = null;
  drinkForm: WeddingDrinkItem | null = null;
  isNewExpense = false;
  isNewDrink = false;
  isSaving = false;
  message = '';
  errorMessage = '';

  readonly paymentMomentOptions: { value: WeddingPaymentMoment; label: string }[] = [
    { value: 'before-wedding', label: 'Înainte de nuntă' },
    { value: 'wedding-day', label: 'În ziua nunții' },
    { value: 'after-wedding', label: 'După nuntă' }
  ];

  readonly deadlineTypeOptions: { value: WeddingPaymentDeadlineType; label: string }[] = [
    { value: 'exact', label: 'Dată exactă' },
    { value: 'relative', label: 'Termen relativ' },
    { value: 'unspecified', label: 'Fără termen stabilit' }
  ];

  readonly expenseStatusOptions: { value: WeddingExpenseStatus; label: string }[] = [
    { value: 'estimate', label: 'Estimare' },
    { value: 'partial', label: 'Parțial plătit' },
    { value: 'paid', label: 'Plătit' },
    { value: 'unpaid', label: 'Neplătit' },
    { value: 'unknown', label: 'Necunoscut' }
  ];

  constructor() {
    this.paymentsService.getExpenses().subscribe(items => this.expenses = items);
    this.paymentsService.getDrinks().subscribe(items => this.drinks = items);
    this.vendorsService.getVendors().subscribe(items => this.vendors = [...items].sort((a, b) => a.name.localeCompare(b.name, 'ro')));
  }

  get categories(): string[] {
    return Array.from(new Set(this.expenses.map(expense => expense.category).filter(Boolean))).sort();
  }

  get totalRon(): number { return this.sumByCurrency('RON', 'total'); }
  get totalEur(): number { return this.sumByCurrency('EUR', 'total'); }
  get remainingRon(): number { return this.sumByCurrency('RON', 'remainingPayment'); }
  get remainingEur(): number { return this.sumByCurrency('EUR', 'remainingPayment'); }

  startAddExpense(): void {
    this.clearMessages();
    this.isNewExpense = true;
    this.expenseForm = {
      id: '', category: '', name: '', currency: 'RON', advancePaid: 0,
      remainingPayment: 0, source: 'Manual', status: 'unpaid', includeInTotals: true,
      paymentMoment: 'before-wedding', deadlineType: 'unspecified', payAfterWedding: false
    };
  }

  startEditExpense(expense: WeddingExpense): void {
    this.clearMessages();
    this.isNewExpense = false;
    this.expenseForm = {
      ...expense,
      deadlineType: expense.deadlineType ?? (expense.dueDate ? 'exact' : expense.relativeDeadline ? 'relative' : 'unspecified'),
      paymentMoment: expense.payAfterWedding ? 'after-wedding' : (expense.paymentMoment ?? 'before-wedding'),
      payAfterWedding: expense.payAfterWedding === true || expense.paymentMoment === 'after-wedding'
    };
  }

  onVendorChange(): void {
    if (!this.expenseForm) return;
    const vendor = this.vendors.find(item => item.id === this.expenseForm?.vendorId);
    this.expenseForm.vendorName = vendor?.name ?? '';
  }

  onDeadlineTypeChange(): void {
    if (!this.expenseForm) return;
    if (this.expenseForm.deadlineType !== 'exact') this.expenseForm.dueDate = '';
    if (this.expenseForm.deadlineType !== 'relative') this.expenseForm.relativeDeadline = '';
  }

  onPaymentMomentChange(): void {
    if (!this.expenseForm) return;
    this.expenseForm.payAfterWedding = this.expenseForm.paymentMoment === 'after-wedding';
  }

  onPayAfterWeddingChange(): void {
    if (!this.expenseForm) return;
    if (this.expenseForm.payAfterWedding) this.expenseForm.paymentMoment = 'after-wedding';
    else if (this.expenseForm.paymentMoment === 'after-wedding') this.expenseForm.paymentMoment = 'before-wedding';
  }

  cancelExpense(): void {
    this.expenseForm = null;
    this.isNewExpense = false;
  }

  recalculateExpense(): void {
    if (!this.expenseForm) return;
    const quantity = Number(this.expenseForm.quantity);
    const unitPrice = Number(this.expenseForm.unitPrice);
    if ((!this.expenseForm.total || Number(this.expenseForm.total) === 0) && quantity > 0 && unitPrice > 0) {
      this.expenseForm.total = quantity * unitPrice;
    }
    const total = Number(this.expenseForm.total) || 0;
    const paid = Number(this.expenseForm.advancePaid) || 0;
    this.expenseForm.remainingPayment = Math.max(total - paid, 0);
    this.expenseForm.status = total > 0 && paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  }

  async saveExpense(): Promise<void> {
    if (!this.expenseForm?.name.trim() || !this.expenseForm.category.trim()) {
      this.errorMessage = 'Completează numele și categoria cheltuielii.';
      return;
    }
    this.isSaving = true;
    this.clearMessages();
    try {
      this.recalculateExpense();
      const { id, ...data } = this.expenseForm;
      if (this.isNewExpense) await this.editSafety.run(this.expenseForm.name, () => this.paymentsService.addExpense(data), { action: 'create', entityType: 'Plată', entityLabel: this.expenseForm.name });
      else await this.editSafety.run(this.expenseForm.name, () => this.paymentsService.saveExpense(this.expenseForm!), { action: 'update', entityType: 'Plată', entityLabel: this.expenseForm.name });
      this.expenseForm = null;
      this.message = 'Cheltuiala a fost salvată.';
    } catch (error) { this.errorMessage = this.errorText(error); }
    finally { this.isSaving = false; }
  }

  async deleteExpense(expense: WeddingExpense): Promise<void> {
    if (!await this.editSafety.confirmDelete(expense.name)) return;
    try {
      await this.editSafety.run(`Ștergere ${expense.name}`, () => this.paymentsService.deleteExpense(expense.id), { action: 'delete', entityType: 'Plată', entityLabel: expense.name });
      this.message = 'Cheltuiala a fost ștearsă.';
    } catch (error) { this.errorMessage = this.errorText(error); }
  }

  startAddDrink(): void {
    this.clearMessages();
    this.isNewDrink = true;
    this.drinkForm = { id: '', name: '' };
  }

  startEditDrink(drink: WeddingDrinkItem): void {
    this.clearMessages();
    this.isNewDrink = false;
    this.drinkForm = { ...drink };
  }

  cancelDrink(): void {
    this.drinkForm = null;
    this.isNewDrink = false;
  }

  recalculateDrink(): void {
    if (!this.drinkForm) return;
    const quantity = Number(this.drinkForm.quantity) || 0;
    const price = Number(this.drinkForm.pricePerLiter) || 0;
    if (quantity > 0 && price > 0) this.drinkForm.total = quantity * price;
  }

  async saveDrink(): Promise<void> {
    if (!this.drinkForm?.name.trim()) {
      this.errorMessage = 'Completează numele băuturii.';
      return;
    }
    this.isSaving = true;
    this.clearMessages();
    try {
      this.recalculateDrink();
      const { id, ...data } = this.drinkForm;
      if (this.isNewDrink) await this.editSafety.run(this.drinkForm.name, () => this.paymentsService.addDrink(data), { action: 'create', entityType: 'Băutură', entityLabel: this.drinkForm.name });
      else await this.editSafety.run(this.drinkForm.name, () => this.paymentsService.saveDrink(this.drinkForm!), { action: 'update', entityType: 'Băutură', entityLabel: this.drinkForm.name });
      this.drinkForm = null;
      this.message = 'Băutura a fost salvată.';
    } catch (error) { this.errorMessage = this.errorText(error); }
    finally { this.isSaving = false; }
  }

  async deleteDrink(drink: WeddingDrinkItem): Promise<void> {
    if (!await this.editSafety.confirmDelete(drink.name)) return;
    try {
      await this.editSafety.run(`Ștergere ${drink.name}`, () => this.paymentsService.deleteDrink(drink.id), { action: 'delete', entityType: 'Băutură', entityLabel: drink.name });
      this.message = 'Băutura a fost ștearsă.';
    } catch (error) { this.errorMessage = this.errorText(error); }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();
    try {
      await this.paymentsService.importInitialData(WEDDING_EXPENSES, WEDDING_DRINKS);
      this.message = 'Plățile și băuturile existente au fost importate în Firestore.';
    } catch (error) { this.errorMessage = this.errorText(error); }
    finally { this.isSaving = false; }
  }

  getExpensesByCategory(category: string): WeddingExpense[] {
    return this.expenses.filter(expense => expense.category === category);
  }

  getCategoryTotal(category: string, currency: Currency): number {
    return this.getExpensesByCategory(category)
      .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
      .reduce((sum, expense) => sum + (Number(expense.total) || 0), 0);
  }

  getPaymentMomentLabel(expense: WeddingExpense): string {
    if (expense.payAfterWedding || expense.paymentMoment === 'after-wedding') return 'După nuntă';
    return this.paymentMomentOptions.find(option => option.value === expense.paymentMoment)?.label ?? 'Înainte de nuntă';
  }

  getDeadlineLabel(expense: WeddingExpense): string {
    if (expense.deadlineType === 'relative' && expense.relativeDeadline) return expense.relativeDeadline;
    if (expense.dueDate) {
      const date = new Date(`${expense.dueDate}T12:00:00`);
      return Number.isNaN(date.getTime()) ? expense.dueDate : new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    }
    return 'Fără termen';
  }

  getStatusLabel(status: WeddingExpenseStatus): string {
    return this.expenseStatusOptions.find(option => option.value === status)?.label ?? status;
  }

  formatMoney(value: number | undefined, currency: Currency | undefined): string {
    if (value === undefined || value === null || !currency) return '-';
    return `${Number(value).toLocaleString('ro-RO', { maximumFractionDigits: 2 })} ${currency}`;
  }

  private sumByCurrency(currency: Currency, field: 'total' | 'remainingPayment'): number {
    return this.expenses
      .filter(expense => expense.currency === currency && expense.includeInTotals !== false)
      .reduce((sum, expense) => sum + (Number(expense[field]) || 0), 0);
  }

  private clearMessages(): void { this.message = ''; this.errorMessage = ''; }
  private errorText(error: unknown): string {
    return this.editSafety.friendlyError(error);
  }
}

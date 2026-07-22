import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WEDDING_PREPARATIONS } from '../../data/wedding-data';
import {
  Currency,
  WeddingPreparationItem,
  WeddingPreparationStatus
} from '../../models/wedding-data.model';
import { FirebasePreparationsService } from '../../services/firebase-preparations.service';

type PreparationCategory = WeddingPreparationItem['category'];

import { FirebaseErrorService } from '../../services/firebase-error.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-preparations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preparations.component.html',
  styleUrl: './preparations.component.scss'
})
export class PreparationsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseErrorService = inject(FirebaseErrorService);
  private readonly preparationsService = inject(FirebasePreparationsService);

  readonly preparations$ = this.preparationsService.getPreparations();

  readonly categoryOptions: { value: PreparationCategory; label: string }[] = [
    { value: 'Mireasa', label: 'Mireasă' },
    { value: 'Mire', label: 'Mire' },
    { value: 'Beauty', label: 'Beauty' },
    { value: 'Accesorii', label: 'Accesorii' },
    { value: 'Other', label: 'Altele' }
  ];

  readonly statusOptions: { value: WeddingPreparationStatus; label: string }[] = [
    { value: 'to-buy', label: 'De cumpărat' },
    { value: 'booked', label: 'Programat' },
    { value: 'advance-paid', label: 'Avans plătit' },
    { value: 'paid', label: 'Plătit' },
    { value: 'done', label: 'Gata' },
    { value: 'unknown', label: 'Necunoscut' }
  ];

  readonly currencyOptions: Currency[] = ['RON', 'EUR'];

  formItem: WeddingPreparationItem | null = null;
  isNewItem = false;
  isSaving = false;
  message = '';
  errorMessage = '';
  searchTerm = '';
  statusFilter: WeddingPreparationStatus | 'all' = 'all';
  categoryFilter: PreparationCategory | 'all' = 'all';

  startAdd(): void {
    this.clearMessages();
    this.isNewItem = true;
    this.formItem = this.createEmptyItem();
  }

  startEdit(item: WeddingPreparationItem): void {
    this.clearMessages();
    this.isNewItem = false;
    this.formItem = { ...item };
  }

  cancelEdit(): void {
    this.formItem = null;
    this.isNewItem = false;
    this.clearMessages();
  }

  async saveItem(): Promise<void> {
    if (!this.formItem?.name.trim()) {
      this.errorMessage = 'Completează denumirea pregătirii.';
      return;
    }

    this.recalculateFormTotals();
    this.isSaving = true;
    this.clearMessages();

    try {
      const { id, ...itemData } = this.formItem;

      if (this.isNewItem) {
        await this.preparationsService.addPreparation(itemData);
      } else {
        await this.preparationsService.savePreparation(this.formItem);
      }

      this.formItem = null;
      this.isNewItem = false;
      this.message = 'Pregătirea a fost salvată.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: WeddingPreparationItem): Promise<void> {
    if (!await this.editSafety.confirmDelete(item.name)) {
      return;
    }

    this.clearMessages();

    try {
      await this.editSafety.run(`Ștergere ${item.name}`, () => this.preparationsService.deletePreparation(item.id), { action: 'delete', entityType: 'Pregătire', entityLabel: item.name });
      this.message = 'Pregătirea a fost ștearsă.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      await this.preparationsService.importInitialPreparations(WEDDING_PREPARATIONS);
      this.message = 'Pregătirile existente au fost importate în Firestore.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  recalculateFormTotals(): void {
    if (!this.formItem) {
      return;
    }

    const total = Number(this.formItem.totalPrice) || 0;
    const advance = Number(this.formItem.advancePaid) || 0;
    this.formItem.remainingPayment = Math.max(total - advance, 0);
  }

  getFilteredItems(items: WeddingPreparationItem[]): WeddingPreparationItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return items.filter(item => {
      const matchesStatus = this.statusFilter === 'all' || item.status === this.statusFilter;
      const matchesCategory = this.categoryFilter === 'all' || item.category === this.categoryFilter;
      const matchesSearch = !term || [
        item.name,
        item.provider ?? '',
        item.category,
        item.notes ?? ''
      ].some(value => value.toLowerCase().includes(term));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }

  getCountByStatus(items: WeddingPreparationItem[], status: WeddingPreparationStatus): number {
    return items.filter(item => item.status === status).length;
  }

  getTotalByCurrency(items: WeddingPreparationItem[], currency: Currency): number {
    return items
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  }

  getPaidByCurrency(items: WeddingPreparationItem[], currency: Currency): number {
    return items
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + (Number(item.advancePaid) || 0), 0);
  }

  getRemainingByCurrency(items: WeddingPreparationItem[], currency: Currency): number {
    return items
      .filter(item => item.currency === currency)
      .reduce((sum, item) => sum + (Number(item.remainingPayment) || 0), 0);
  }

  getStatusLabel(status: WeddingPreparationStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  getCategoryLabel(category: PreparationCategory): string {
    return this.categoryOptions.find(option => option.value === category)?.label ?? category;
  }

  formatMoney(value?: number, currency?: Currency): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${Number(value).toLocaleString('ro-RO')} ${currency ?? ''}`.trim();
  }

  private createEmptyItem(): WeddingPreparationItem {
    return {
      id: '',
      name: '',
      category: 'Mireasa',
      provider: '',
      appointmentDate: '',
      appointmentTime: '',
      totalPrice: undefined,
      currency: 'RON',
      advancePaid: 0,
      remainingPayment: undefined,
      notes: '',
      status: 'unknown'
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

}

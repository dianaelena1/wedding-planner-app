import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WEDDING_RINGS } from '../../data/wedding-data';
import {
  Currency,
  WeddingRingItem,
  WeddingRingStatus
} from '../../models/wedding-data.model';
import { FirebaseRingsService } from '../../services/firebase-rings.service';

import { FirebaseErrorService } from '../../services/firebase-error.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-rings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rings.component.html',
  styleUrl: './rings.component.scss'
})
export class RingsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseErrorService = inject(FirebaseErrorService);
  private readonly ringsService = inject(FirebaseRingsService);

  readonly rings$ = this.ringsService.getRings();
  readonly currencyOptions: Currency[] = ['RON', 'EUR'];
  readonly statusOptions: { value: WeddingRingStatus; label: string }[] = [
    { value: 'to-choose', label: 'De ales' },
    { value: 'ordered', label: 'Comandate' },
    { value: 'advance-paid', label: 'Avans plătit' },
    { value: 'paid', label: 'Plătite' },
    { value: 'received', label: 'Ridicate' },
    { value: 'unknown', label: 'Necunoscut' }
  ];

  formItem: WeddingRingItem | null = null;
  isNewItem = false;
  isSaving = false;
  message = '';
  errorMessage = '';

  startAdd(): void {
    this.clearMessages();
    this.isNewItem = true;
    this.formItem = this.createEmptyItem();
  }

  startEdit(item: WeddingRingItem): void {
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
      this.errorMessage = 'Completează denumirea.';
      return;
    }

    this.recalculateFormTotals();
    this.isSaving = true;
    this.clearMessages();

    try {
      const { id, ...itemData } = this.formItem;

      if (this.isNewItem) {
        await this.ringsService.addRing(itemData);
      } else {
        await this.ringsService.saveRing(this.formItem);
      }

      this.formItem = null;
      this.isNewItem = false;
      this.message = 'Informațiile despre verighete au fost salvate.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async deleteItem(item: WeddingRingItem): Promise<void> {
    if (!await this.editSafety.confirmDelete(item.name)) {
      return;
    }

    this.clearMessages();

    try {
      await this.editSafety.run(`Ștergere ${item.name}`, () => this.ringsService.deleteRing(item.id), { action: 'delete', entityType: 'Verighetă', entityLabel: item.name });
      this.message = 'Înregistrarea a fost ștearsă.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      await this.ringsService.importInitialRings(WEDDING_RINGS);
      this.message = 'Datele existente despre verighete au fost importate în Firestore.';
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

  getOrderedOrReceivedCount(items: WeddingRingItem[]): number {
    return items.filter(item => item.status === 'ordered' || item.status === 'received').length;
  }

  getStatusLabel(status: WeddingRingStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  formatMoney(value?: number, currency?: Currency): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${Number(value).toLocaleString('ro-RO')} ${currency ?? ''}`.trim();
  }

  private createEmptyItem(): WeddingRingItem {
    return {
      id: '',
      name: 'Verighete',
      shop: '',
      material: '',
      sizeDiana: '',
      sizeDan: '',
      totalPrice: undefined,
      currency: 'RON',
      advancePaid: 0,
      remainingPayment: undefined,
      orderDate: '',
      pickupDate: '',
      notes: '',
      status: 'to-choose'
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

}

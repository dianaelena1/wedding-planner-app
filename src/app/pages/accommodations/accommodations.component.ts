import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WEDDING_ACCOMMODATIONS } from '../../data/wedding-data';
import {
  AccommodationStatus,
  Currency,
  WeddingAccommodation
} from '../../models/wedding-data.model';
import { FirebaseAccommodationsService } from '../../services/firebase-accommodations.service';

import { FirebaseErrorService } from '../../services/firebase-error.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accommodations.component.html',
  styleUrl: './accommodations.component.scss'
})
export class AccommodationsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseErrorService = inject(FirebaseErrorService);
  private readonly accommodationsService = inject(FirebaseAccommodationsService);

  readonly accommodations$ = this.accommodationsService.getAccommodations();

  readonly statusOptions: { value: AccommodationStatus; label: string }[] = [
    { value: 'to-book', label: 'De rezervat' },
    { value: 'booked', label: 'Rezervat' },
    { value: 'advance-paid', label: 'Avans plătit' },
    { value: 'paid', label: 'Plătit' },
    { value: 'cancelled', label: 'Anulat' },
    { value: 'unknown', label: 'Necunoscut' }
  ];

  readonly currencyOptions: Currency[] = ['RON', 'EUR'];

  formAccommodation: WeddingAccommodation | null = null;
  isNewAccommodation = false;
  isSaving = false;
  message = '';
  errorMessage = '';
  searchTerm = '';
  statusFilter: AccommodationStatus | 'all' = 'all';

  startAdd(): void {
    this.clearMessages();
    this.isNewAccommodation = true;
    this.formAccommodation = this.createEmptyAccommodation();
  }

  startEdit(accommodation: WeddingAccommodation): void {
    this.clearMessages();
    this.isNewAccommodation = false;
    this.formAccommodation = { ...accommodation };
  }

  cancelEdit(): void {
    this.formAccommodation = null;
    this.isNewAccommodation = false;
    this.clearMessages();
  }

  async saveAccommodation(): Promise<void> {
    if (!this.formAccommodation?.name.trim()) {
      this.errorMessage = 'Completează numele hotelului sau al cazării.';
      return;
    }

    this.recalculateFormTotals();
    this.isSaving = true;
    this.clearMessages();

    try {
      const { id, ...accommodationData } = this.formAccommodation;

      if (this.isNewAccommodation) {
        await this.accommodationsService.addAccommodation(accommodationData);
      } else {
        await this.accommodationsService.saveAccommodation(this.formAccommodation);
      }

      this.formAccommodation = null;
      this.isNewAccommodation = false;
      this.message = 'Cazarea a fost salvată.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async deleteAccommodation(accommodation: WeddingAccommodation): Promise<void> {
    if (!await this.editSafety.confirmDelete(accommodation.name)) {
      return;
    }

    this.clearMessages();

    try {
      await this.editSafety.run(`Ștergere ${accommodation.name}`, () => this.accommodationsService.deleteAccommodation(accommodation.id), { action: 'delete', entityType: 'Cazare', entityLabel: accommodation.name });
      this.message = 'Cazarea a fost ștearsă.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      await this.accommodationsService.importInitialAccommodations(WEDDING_ACCOMMODATIONS);
      this.message = 'Cazările existente au fost importate în Firestore.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  recalculateFormTotals(): void {
    if (!this.formAccommodation) {
      return;
    }

    const rooms = Number(this.formAccommodation.rooms) || 0;
    const nights = Math.max(Number(this.formAccommodation.nights) || 1, 1);
    const pricePerRoom = Number(this.formAccommodation.pricePerRoom) || 0;

    if (rooms > 0 && pricePerRoom > 0) {
      this.formAccommodation.totalPrice = rooms * nights * pricePerRoom;
    }

    const total = Number(this.formAccommodation.totalPrice) || 0;
    const advance = Number(this.formAccommodation.advancePaid) || 0;
    this.formAccommodation.remainingPayment = Math.max(total - advance, 0);
  }

  getFilteredAccommodations(accommodations: WeddingAccommodation[]): WeddingAccommodation[] {
    const term = this.searchTerm.trim().toLowerCase();

    return accommodations.filter(item => {
      const matchesStatus = this.statusFilter === 'all' || item.status === this.statusFilter;
      const matchesSearch = !term || [
        item.name,
        item.location ?? '',
        item.contactPerson ?? '',
        item.phone ?? '',
        item.notes ?? ''
      ].some(value => value.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }

  getTotalRooms(accommodations: WeddingAccommodation[]): number {
    return accommodations.reduce((sum, item) => sum + (Number(item.rooms) || 0), 0);
  }

  getTotalGuests(accommodations: WeddingAccommodation[]): number {
    return accommodations.reduce((sum, item) => sum + (Number(item.guests) || 0), 0);
  }

  getTotalByCurrency(accommodations: WeddingAccommodation[], currency: Currency): number {
    return accommodations
      .filter(item => item.currency === currency && item.status !== 'cancelled')
      .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  }

  getStatusLabel(status: AccommodationStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  formatMoney(value?: number, currency?: Currency): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${Number(value).toLocaleString('ro-RO')} ${currency ?? ''}`.trim();
  }

  private createEmptyAccommodation(): WeddingAccommodation {
    return {
      id: '',
      name: '',
      location: '',
      checkIn: '',
      checkOut: '',
      nights: 1,
      rooms: 1,
      guests: 1,
      pricePerRoom: undefined,
      totalPrice: undefined,
      currency: 'RON',
      advancePaid: 0,
      remainingPayment: undefined,
      contactPerson: '',
      phone: '',
      notes: '',
      status: 'to-book'
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

}

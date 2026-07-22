import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { WEDDING_VENDORS } from '../../data/wedding-data';
import {
  Currency,
  WeddingVendor,
  WeddingVendorStatus
} from '../../models/wedding-data.model';
import { FirebaseWeddingDocument } from '../../models/firebase-document.model';
import { FirebaseDocumentsService } from '../../services/firebase-documents.service';
import { FirebaseVendorsService } from '../../services/firebase-vendors.service';

import { FirebaseErrorService } from '../../services/firebase-error.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseErrorService = inject(FirebaseErrorService);
  private readonly firebaseDocumentsService = inject(FirebaseDocumentsService);
  private readonly firebaseVendorsService = inject(FirebaseVendorsService);

  readonly vendors$ = this.firebaseVendorsService.getVendors();
  readonly firebaseDocuments$: Observable<FirebaseWeddingDocument[]> =
    this.firebaseDocumentsService.getDocuments();

  readonly statusOptions: { value: WeddingVendorStatus; label: string }[] = [
    { value: 'contracted', label: 'Contractat' },
    { value: 'pending', label: 'În așteptare' },
    { value: 'to-confirm', label: 'De confirmat' },
    { value: 'to-contact', label: 'De contactat' },
    { value: 'done', label: 'Finalizat' }
  ];

  formVendor: WeddingVendor | null = null;
  isNewVendor = false;
  isSaving = false;
  message = '';
  errorMessage = '';

  startAdd(): void {
    this.clearMessages();
    this.isNewVendor = true;
    this.formVendor = this.createEmptyVendor();
  }

  startEdit(vendor: WeddingVendor): void {
    this.clearMessages();
    this.isNewVendor = false;
    this.formVendor = { ...vendor };
  }

  cancelEdit(): void {
    this.formVendor = null;
    this.isNewVendor = false;
    this.clearMessages();
  }

  async saveVendor(): Promise<void> {
    if (!this.formVendor || !this.formVendor.name.trim() || !this.formVendor.category.trim()) {
      this.errorMessage = 'Completează cel puțin numele și categoria furnizorului.';
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    try {
      this.recalculatePayment(this.formVendor);
      const { id, ...vendorData } = this.formVendor;

      if (this.isNewVendor) {
        await this.firebaseVendorsService.addVendor(vendorData);
      } else {
        await this.firebaseVendorsService.saveVendor(this.formVendor);
      }

      this.formVendor = null;
      this.isNewVendor = false;
      this.message = 'Furnizorul a fost salvat.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  async deleteVendor(vendor: WeddingVendor): Promise<void> {
    if (!await this.editSafety.confirmDelete(vendor.name)) {
      return;
    }

    this.clearMessages();

    try {
      await this.firebaseVendorsService.deleteVendor(vendor.id);
      this.message = 'Furnizorul a fost șters.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    }
  }

  async importInitialData(): Promise<void> {
    this.isSaving = true;
    this.clearMessages();

    try {
      await this.firebaseVendorsService.importInitialVendors(WEDDING_VENDORS);
      this.message = 'Furnizorii existenți au fost importați în Firestore.';
    } catch (error) {
      this.errorMessage = this.firebaseErrorService.getMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  recalculatePayment(vendor: WeddingVendor): void {
    const total = Number(vendor.totalPrice) || 0;
    const paid = Number(vendor.advancePaid) || 0;
    vendor.remainingPayment = Math.max(total - paid, 0);
    vendor.isPaid = total > 0 && vendor.remainingPayment === 0;
  }

  formatMoney(value: number | undefined, currency: Currency | undefined): string {
    if (value === undefined || value === null || !currency) {
      return '-';
    }

    return `${Number(value).toLocaleString('ro-RO')} ${currency}`;
  }

  getStatusLabel(status: WeddingVendorStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  getVendorDocument(
    vendor: WeddingVendor,
    documents: FirebaseWeddingDocument[]
  ): FirebaseWeddingDocument | undefined {
    const vendorName = this.normalizeText(vendor.name);

    return documents.find(document => {
      const documentVendorName = this.normalizeText(document.vendorName || '');
      const documentTitle = this.normalizeText(document.title || '');

      return Boolean(documentVendorName) && (
        documentVendorName === vendorName ||
        documentTitle.includes(vendorName) ||
        vendorName.includes(documentVendorName)
      );
    });
  }

  private createEmptyVendor(): WeddingVendor {
    return {
      id: '',
      name: '',
      category: '',
      currency: 'RON',
      advancePaid: 0,
      status: 'pending',
      isPaid: false
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }


  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }
}

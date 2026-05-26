import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { WEDDING_VENDORS } from '../../data/wedding-data';
import { Currency, WeddingVendor } from '../../models/wedding-data.model';
import { FirebaseWeddingDocument } from '../../models/firebase-document.model';
import { FirebaseDocumentsService } from '../../services/firebase-documents.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  private firebaseDocumentsService = inject(FirebaseDocumentsService);

  vendors: WeddingVendor[] = WEDDING_VENDORS;
  firebaseDocuments$: Observable<FirebaseWeddingDocument[]> =
      this.firebaseDocumentsService.getDocuments();

  formatMoney(value: number | undefined, currency: Currency | undefined): string {
    if (value === undefined || value === null || !currency) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency}`;
  }

  getVendorDocument(
      vendor: WeddingVendor,
      documents: FirebaseWeddingDocument[]
  ): FirebaseWeddingDocument | undefined {
    const vendorName = this.normalizeText(vendor.name);

    return documents.find(document => {
      const documentVendorName = this.normalizeText(document.vendorName || '');
      const documentTitle = this.normalizeText(document.title || '');

      return (
          documentVendorName === vendorName ||
          documentTitle.includes(vendorName) ||
          vendorName.includes(documentVendorName)
      );
    });
  }

  private normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
  }
}
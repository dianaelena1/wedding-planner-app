import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WEDDING_VENDORS } from '../../data/wedding-data';
import { Currency } from '../../models/wedding-data.model';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  vendors = WEDDING_VENDORS;

  formatMoney(value: number | undefined, currency: Currency | undefined): string {
    if (value === undefined || value === null || !currency) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency}`;
  }
}

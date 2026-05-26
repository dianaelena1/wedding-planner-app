import { Component } from '@angular/core';
import { WEDDING_PREPARATIONS } from '../../data/wedding-data';
import { WeddingPreparationItem } from '../../models/wedding-data.model';

@Component({
  selector: 'app-preparations',
  standalone: true,
  imports: [],
  templateUrl: './preparations.component.html',
  styleUrl: './preparations.component.scss'
})
export class PreparationsComponent {
  items: WeddingPreparationItem[] = WEDDING_PREPARATIONS;

  totalRon = this.items
      .filter(item => item.currency === 'RON')
      .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  paidRon = this.items
      .filter(item => item.currency === 'RON')
      .reduce((sum, item) => sum + (item.advancePaid ?? 0), 0);

  remainingRon = this.items
      .filter(item => item.currency === 'RON')
      .reduce((sum, item) => sum + (item.remainingPayment ?? 0), 0);

  formatMoney(value?: number, currency?: string): string {
    if (!value) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency ?? ''}`;
  }

  getStatusLabel(status: WeddingPreparationItem['status']): string {
    const labels: Record<WeddingPreparationItem['status'], string> = {
      'to-buy': 'De cumparat',
      'booked': 'Programat',
      'advance-paid': 'Avans platit',
      'paid': 'Platit',
      'done': 'Gata',
      'unknown': 'Necunoscut'
    };

    return labels[status];
  }
}
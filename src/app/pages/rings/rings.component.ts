import { Component } from '@angular/core';
import { WEDDING_RINGS } from '../../data/wedding-data';
import { WeddingRingItem } from '../../models/wedding-data.model';

@Component({
  selector: 'app-rings',
  standalone: true,
  imports: [],
  templateUrl: './rings.component.html',
  styleUrl: './rings.component.scss'
})
export class RingsComponent {
  rings: WeddingRingItem[] = WEDDING_RINGS;

  formatMoney(value?: number, currency?: string): string {
    if (!value) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency ?? ''}`;
  }

  getStatusLabel(status: WeddingRingItem['status']): string {
    const labels: Record<WeddingRingItem['status'], string> = {
      'to-choose': 'De ales',
      'ordered': 'Comandate',
      'advance-paid': 'Avans platit',
      'paid': 'Platite',
      'received': 'Ridicate',
      'unknown': 'Necunoscut'
    };

    return labels[status];
  }
}
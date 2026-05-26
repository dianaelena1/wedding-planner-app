import { Component } from '@angular/core';
import { WEDDING_ACCOMMODATIONS } from '../../data/wedding-data';
import { WeddingAccommodation } from '../../models/wedding-data.model';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [],
  templateUrl: './accommodations.component.html',
  styleUrl: './accommodations.component.scss'
})
export class AccommodationsComponent {
  accommodations: WeddingAccommodation[] = WEDDING_ACCOMMODATIONS;

  totalRooms = this.accommodations.reduce((sum, item) => sum + (item.rooms ?? 0), 0);
  totalGuests = this.accommodations.reduce((sum, item) => sum + (item.guests ?? 0), 0);

  totalRon = this.accommodations
      .filter(item => item.currency === 'RON')
      .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  totalEur = this.accommodations
      .filter(item => item.currency === 'EUR')
      .reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);

  getStatusLabel(status: WeddingAccommodation['status']): string {
    const labels: Record<WeddingAccommodation['status'], string> = {
      'to-book': 'De rezervat',
      'booked': 'Rezervat',
      'advance-paid': 'Avans platit',
      'paid': 'Platit',
      'cancelled': 'Anulat',
      'unknown': 'Necunoscut'
    };

    return labels[status];
  }

  getStatusClass(status: WeddingAccommodation['status']): string {
    return `status-${status}`;
  }

  formatMoney(value?: number, currency?: string): string {
    if (value === undefined || value === null || value === 0) {
      return '-';
    }

    return `${value.toLocaleString('ro-RO')} ${currency ?? ''}`;
  }
}
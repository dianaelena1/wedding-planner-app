import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WEDDING_GUESTS } from '../../data/wedding-data';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent {
  guests = WEDDING_GUESTS;

  confirmed = this.guests.filter(guest => guest.attendanceStatus === 'confirmed').length;
  declined = this.guests.filter(guest => guest.attendanceStatus === 'declined').length;
  maybe = this.guests.filter(guest => guest.attendanceStatus === 'maybe').length;
  pending = this.guests.filter(guest => guest.attendanceStatus === 'pending').length;

  totalAdults = this.guests.reduce((sum, guest) => sum + guest.adults, 0);
  totalChildren = this.guests.reduce((sum, guest) => sum + guest.children, 0);
}

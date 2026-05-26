import { Component } from '@angular/core';
import { WEDDING_GUESTS } from '../../data/wedding-data';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent {
  guests = WEDDING_GUESTS;
}

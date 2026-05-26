import { Component } from '@angular/core';
import { WEDDING_VENDORS } from '../../data/wedding-data';

@Component({
  selector: 'app-vendors',
  imports: [],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  vendors = WEDDING_VENDORS;
}
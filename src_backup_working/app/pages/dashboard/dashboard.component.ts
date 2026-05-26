import { Component } from '@angular/core';
import { WEDDING_GUESTS, WEDDING_TASKS, WEDDING_VENDORS } from '../../data/wedding-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  vendors = WEDDING_VENDORS;
  guests = WEDDING_GUESTS;
  tasks = WEDDING_TASKS;

  totalRon = this.vendors
    .filter(vendor => vendor.currency === 'RON')
    .reduce((sum, vendor) => sum + (vendor.totalPrice ?? 0), 0);

  paidRon = this.vendors
    .filter(vendor => vendor.currency === 'RON')
    .reduce((sum, vendor) => sum + (vendor.advancePaid ?? 0), 0);

  remainingRon = this.vendors
    .filter(vendor => vendor.currency === 'RON')
    .reduce((sum, vendor) => sum + (vendor.remainingPayment ?? 0), 0);

  contractedVendors = this.vendors.filter(vendor => vendor.status === 'contracted').length;
}

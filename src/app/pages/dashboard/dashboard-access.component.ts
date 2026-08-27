import { CommonModule } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { DashboardComponent } from './dashboard.component';
import { DashboardViewerComponent } from './dashboard-viewer.component';

@Component({
  selector: 'app-dashboard-access',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    DashboardViewerComponent
  ],
  template: `
    @if (role$ | async; as role) {
      @if (role === 'admin') {
        <app-dashboard />
      } @else {
        <app-dashboard-viewer />
      }
    }
  `
})
export class DashboardAccessComponent {
  private readonly authService =
    inject(AuthService);

  readonly role$ =
    this.authService.role$;
}

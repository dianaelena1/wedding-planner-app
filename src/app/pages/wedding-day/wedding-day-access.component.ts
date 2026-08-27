import { CommonModule } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { WeddingDayComponent } from './wedding-day.component';
import { WeddingDayViewerComponent } from './wedding-day-viewer.component';

@Component({
  selector: 'app-wedding-day-access',
  standalone: true,
  imports: [
    CommonModule,
    WeddingDayComponent,
    WeddingDayViewerComponent
  ],
  template: `
    @if (role$ | async; as role) {
      @if (role === 'admin') {
        <app-wedding-day />
      } @else {
        <app-wedding-day-viewer />
      }
    }
  `
})
export class WeddingDayAccessComponent {
  private readonly authService =
    inject(AuthService);

  readonly role$ =
    this.authService.role$;
}

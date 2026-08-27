import { CommonModule } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { GuestsComponent } from './guests.component';
import { GuestsViewerComponent } from './guests-viewer.component';

@Component({
  selector: 'app-guests-access',
  standalone: true,
  imports: [
    CommonModule,
    GuestsComponent,
    GuestsViewerComponent
  ],
  template: `
    @if (role$ | async; as role) {
      @if (role === 'admin') {
        <app-guests />
      } @else {
        <app-guests-viewer />
      }
    }
  `
})
export class GuestsAccessComponent {
  private readonly authService =
    inject(AuthService);

  readonly role$ =
    this.authService.role$;
}

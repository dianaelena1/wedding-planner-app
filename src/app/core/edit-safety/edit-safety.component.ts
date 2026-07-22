import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { EditSafetyService } from './edit-safety.service';

@Component({
  selector: 'app-edit-safety',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-safety.component.html',
  styleUrl: './edit-safety.component.scss'
})
export class EditSafetyComponent {
  readonly editSafety = inject(EditSafetyService);
  formatDate(value: string): string {
    return new Intl.DateTimeFormat('ro-RO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }
}

import { Component } from '@angular/core';
import { WEDDING_DOCUMENTS } from '../../data/wedding-data';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  documents = WEDDING_DOCUMENTS;
}

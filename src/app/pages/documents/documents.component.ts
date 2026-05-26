import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirebaseDocumentsService } from '../../services/firebase-documents.service';
import { FirebaseDocumentType, FirebaseWeddingDocument } from '../../models/firebase-document.model';
import { WEDDING_DOCUMENTS } from '../../data/wedding-data';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  private firebaseDocumentsService = inject(FirebaseDocumentsService);
  private authService = inject(AuthService);

  user$ = this.authService.user$;
  firebaseDocuments$ = this.firebaseDocumentsService.getDocuments();
  plannedDocuments = WEDDING_DOCUMENTS;

  selectedFile: File | null = null;
  isUploading = false;

  form: {
    title: string;
    vendorName: string;
    type: FirebaseDocumentType;
  } = {
    title: '',
    vendorName: '',
    type: 'contract'
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;

    if (file && !this.form.title) {
      this.form.title = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  async upload(): Promise<void> {
    if (!this.selectedFile) {
      alert('Alege un fisier.');
      return;
    }

    if (!this.form.title.trim()) {
      alert('Completeaza titlul documentului.');
      return;
    }

    this.isUploading = true;

    try {
      await this.firebaseDocumentsService.uploadDocument(this.selectedFile, {
        title: this.form.title.trim(),
        vendorName: this.form.vendorName.trim(),
        type: this.form.type
      });

      this.form = {
        title: '',
        vendorName: '',
        type: 'contract'
      };
      this.selectedFile = null;

      const fileInput = document.getElementById('documentFile') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error(error);
      alert('Nu s-a putut incarca documentul. Verifica daca esti logata si daca Firebase Storage/Firestore sunt active.');
    } finally {
      this.isUploading = false;
    }
  }

  async deleteDocument(document: FirebaseWeddingDocument): Promise<void> {
    const confirmed = confirm(`Stergi documentul "${document.title}" din Firebase?`);

    if (!confirmed) {
      return;
    }

    try {
      await this.firebaseDocumentsService.deleteDocument(document);
    } catch (error) {
      console.error(error);
      alert('Nu s-a putut sterge documentul.');
    }
  }

  formatSize(sizeBytes?: number): string {
    if (!sizeBytes) {
      return '-';
    }

    if (sizeBytes < 1024 * 1024) {
      return `${Math.round(sizeBytes / 1024)} KB`;
    }

    return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  FirebaseDocumentsService,
  WeddingDocumentInput
} from '../../services/firebase-documents.service';
import {
  FirebaseDocumentStatus,
  FirebaseDocumentType,
  FirebaseWeddingDocument
} from '../../models/firebase-document.model';
import { WEDDING_DOCUMENTS } from '../../data/wedding-data';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';
import { FirebaseErrorService } from '../../services/firebase-error.service';

interface DocumentForm extends WeddingDocumentInput {}

type DocumentFilter = 'all' | FirebaseDocumentType | 'favorite' | 'attention';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firebaseDocumentsService = inject(FirebaseDocumentsService);
  private readonly authService = inject(AuthService);
  private readonly firebaseError = inject(FirebaseErrorService);

  readonly user$ = this.authService.user$;
  readonly firebaseDocuments$ = this.firebaseDocumentsService.getDocuments();
  readonly plannedDocuments = WEDDING_DOCUMENTS;

  isFormOpen = false;
  isSaving = false;
  editingId: string | null = null;
  searchTerm = '';
  activeFilter: DocumentFilter = 'all';
  feedback: { type: 'success' | 'error'; message: string } | null = null;

  form: DocumentForm = this.emptyForm();

  readonly typeOptions: Array<{ value: FirebaseDocumentType; label: string }> = [
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Factură' },
    { value: 'offer', label: 'Ofertă' },
    { value: 'spreadsheet', label: 'Excel / listă' },
    { value: 'image', label: 'Imagine' },
    { value: 'invitation', label: 'Invitație' },
    { value: 'other', label: 'Alt document' }
  ];

  readonly statusOptions: Array<{ value: FirebaseDocumentStatus; label: string }> = [
    { value: 'available', label: 'Disponibil' },
    { value: 'to-request', label: 'De cerut' },
    { value: 'to-sign', label: 'De semnat' },
    { value: 'signed', label: 'Semnat' },
    { value: 'paid', label: 'Plătit' },
    { value: 'missing', label: 'Lipsă' },
    { value: 'expired', label: 'Expirat' }
  ];

  openAddForm(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.isFormOpen = true;
    this.feedback = null;
  }

  openEditForm(document: FirebaseWeddingDocument): void {
    this.editingId = document.id ?? null;
    this.form = {
      title: document.title,
      vendorName: document.vendorName ?? '',
      type: this.normalizeType(document.type),
      status: document.status ?? 'available',
      downloadUrl: document.downloadUrl ?? '',
      notes: document.notes ?? '',
      dueDate: document.dueDate ?? '',
      isFavorite: Boolean(document.isFavorite)
    };
    this.isFormOpen = true;
    this.feedback = null;
    queueMicrotask(() => document?.id && globalThis.document.querySelector('.document-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  async save(): Promise<void> {
    this.feedback = null;
    if (!this.form.title.trim()) {
      this.feedback = { type: 'error', message: 'Completează numele documentului.' };
      return;
    }

    const url = this.form.downloadUrl?.trim() ?? '';
    if (url && !this.isValidDriveOrWebUrl(url)) {
      this.feedback = { type: 'error', message: 'Linkul nu este valid. Lipește linkul complet din Google Drive, începând cu https://.' };
      return;
    }

    if (this.form.status === 'available' && !url) {
      this.feedback = { type: 'error', message: 'Pentru un document disponibil, adaugă și linkul Google Drive.' };
      return;
    }

    this.isSaving = true;
    try {
      if (this.editingId) {
        await this.firebaseDocumentsService.updateDocument(this.editingId, this.form);
        this.feedback = { type: 'success', message: `${this.form.title} a fost actualizat.` };
      } else {
        await this.firebaseDocumentsService.addDocument(this.form);
        this.feedback = { type: 'success', message: `${this.form.title} a fost adăugat în registru.` };
      }
      this.closeForm();
    } catch (error) {
      console.error(error);
      this.feedback = { type: 'error', message: this.firebaseError.getMessage(error) };
    } finally {
      this.isSaving = false;
    }
  }

  async toggleFavorite(document: FirebaseWeddingDocument): Promise<void> {
    try {
      await this.firebaseDocumentsService.toggleFavorite(document);
    } catch (error) {
      this.feedback = { type: 'error', message: this.firebaseError.getMessage(error) };
    }
  }

  async deleteDocument(document: FirebaseWeddingDocument): Promise<void> {
    const confirmed = await this.editSafety.confirmDelete(document.title);
    if (!confirmed) return;

    try {
      await this.firebaseDocumentsService.deleteDocument(document);
      this.feedback = { type: 'success', message: `${document.title} a fost șters din registru. Fișierul din Drive nu a fost șters.` };
    } catch (error) {
      console.error(error);
      this.feedback = { type: 'error', message: this.firebaseError.getMessage(error) };
    }
  }

  async copyLink(document: FirebaseWeddingDocument): Promise<void> {
    if (!document.downloadUrl) return;
    try {
      await navigator.clipboard.writeText(document.downloadUrl);
      this.feedback = { type: 'success', message: 'Linkul Google Drive a fost copiat.' };
    } catch {
      this.feedback = { type: 'error', message: 'Nu am putut copia automat linkul. Deschide documentul și copiază adresa din browser.' };
    }
  }

  filteredDocuments(documents: FirebaseWeddingDocument[]): FirebaseWeddingDocument[] {
    const search = this.normalize(this.searchTerm);
    return documents
      .filter(document => {
        const matchesSearch = !search || [document.title, document.vendorName, document.notes]
          .some(value => this.normalize(value ?? '').includes(search));
        const matchesFilter = this.activeFilter === 'all'
          || (this.activeFilter === 'favorite' && document.isFavorite)
          || (this.activeFilter === 'attention' && this.needsAttention(document))
          || document.type === this.activeFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => Number(Boolean(b.isFavorite)) - Number(Boolean(a.isFavorite)) || a.title.localeCompare(b.title, 'ro'));
  }

  countAvailable(documents: FirebaseWeddingDocument[]): number {
    return documents.filter(item => Boolean(item.downloadUrl) && !this.needsAttention(item)).length;
  }

  countAttention(documents: FirebaseWeddingDocument[]): number {
    return documents.filter(item => this.needsAttention(item)).length;
  }

  countSigned(documents: FirebaseWeddingDocument[]): number {
    return documents.filter(item => item.status === 'signed' || item.status === 'paid').length;
  }

  needsAttention(document: FirebaseWeddingDocument): boolean {
    return ['missing', 'to-request', 'to-sign', 'expired'].includes(document.status ?? '') || !document.downloadUrl;
  }

  typeLabel(type: FirebaseDocumentType): string {
    return this.typeOptions.find(option => option.value === this.normalizeType(type))?.label ?? 'Document';
  }

  typeIcon(type: FirebaseDocumentType): string {
    return ({
      contract: '📄', invoice: '🧾', offer: '🏷️', spreadsheet: '📊', image: '🖼️', invitation: '✉️', other: '📎'
    } as Record<FirebaseDocumentType, string>)[this.normalizeType(type)];
  }

  statusLabel(status?: FirebaseDocumentStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? 'Disponibil';
  }

  statusClass(status?: FirebaseDocumentStatus): string {
    return `status-${status ?? 'available'}`;
  }

  private emptyForm(): DocumentForm {
    return {
      title: '', vendorName: '', type: 'contract', status: 'available', downloadUrl: '', notes: '', dueDate: '', isFavorite: false
    };
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private normalizeType(type: FirebaseDocumentType): FirebaseDocumentType {
    return type === ('excel' as FirebaseDocumentType) ? 'spreadsheet' : type;
  }

  private isValidDriveOrWebUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }
}

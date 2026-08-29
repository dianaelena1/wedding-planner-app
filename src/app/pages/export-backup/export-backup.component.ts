import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ExportBackupService } from '../../services/export-backup.service';

type ExportAction =
    | 'guests'
    | 'weddingDay'
    | 'seating'
    | 'checklist'
    | 'all'
    | 'backup';

@Component({
  selector: 'app-export-backup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-backup.component.html',
  styleUrl: './export-backup.component.scss'
})
export class ExportBackupComponent {

  private readonly exportService =
      inject(ExportBackupService);

  runningAction: ExportAction | null = null;

  successMessage = '';
  errorMessage = '';
  lastBackupSummary = '';


  // ============================================================
  // INVITAȚI
  // ============================================================

  async exportGuests(): Promise<void> {
    await this.run(
        'guests',
        () => this.exportService.exportGuestsExcel(),
        'Lista invitaților a fost exportată în Excel.'
    );
  }


  // ============================================================
  // PROGRAM ZIUA NUNȚII
  // ============================================================

  async exportWeddingDay(): Promise<void> {
    await this.run(
        'weddingDay',
        () =>
            this.exportService.exportWeddingDayTimelinePdf(),
        'Programul zilei nunții a fost exportat în PDF.'
    );
  }


  // ============================================================
  // PLAN MESE
  // ============================================================

  async exportSeating(): Promise<void> {
    await this.run(
        'seating',
        () =>
            this.exportService.exportSeatingPdf(),
        'Planul meselor a fost exportat în PDF.'
    );
  }


  // ============================================================
  // CHECKLIST
  // ============================================================

  async exportChecklist(): Promise<void> {
    await this.run(
        'checklist',
        () =>
            this.exportService.exportChecklistExcel(),
        'Checklist-ul a fost exportat în Excel.'
    );
  }


  // ============================================================
  // EXPORT COMPLET
  // ============================================================

  async exportAll(): Promise<void> {
    await this.run(
        'all',
        () =>
            this.exportService.exportAllExcel(),
        'Pachetul Excel complet a fost descărcat.'
    );
  }


  // ============================================================
  // BACKUP FIRESTORE
  // ============================================================

  async backupFirestore(): Promise<void> {

    this.runningAction = 'backup';

    this.successMessage = '';
    this.errorMessage = '';

    try {

      const result =
          await this.exportService.exportFirestoreBackup();

      this.lastBackupSummary =
          `${result.documents} documente din ${result.collections} colecții`;

      this.successMessage =
          `Backup-ul Firestore a fost descărcat: ${this.lastBackupSummary}.`;

    } catch (error) {

      console.error(error);

      this.errorMessage =
          this.errorText(error);

    } finally {

      this.runningAction = null;

    }
  }


  // ============================================================
  // UI HELPERS
  // ============================================================

  isRunning(
      action: ExportAction
  ): boolean {

    return this.runningAction === action;

  }


  private async run(
      action: ExportAction,
      operation: () => Promise<void>,
      successMessage: string
  ): Promise<void> {

    this.runningAction = action;

    this.successMessage = '';
    this.errorMessage = '';

    try {

      await operation();

      this.successMessage =
          successMessage;

    } catch (error) {

      console.error(error);

      this.errorMessage =
          this.errorText(error);

    } finally {

      this.runningAction = null;

    }
  }


  private errorText(
      error: unknown
  ): string {

    const code =
        String(
            (error as { code?: string })?.code || ''
        );

    if (
        code.includes('permission-denied')
    ) {
      return 'Nu ai permisiune să citești una dintre colecții. Verifică regulile Firestore și documentul tău din appAccess.';
    }

    if (
        code.includes('unauthenticated')
    ) {
      return 'Sesiunea Firebase a expirat. Autentifică-te din nou.';
    }

    return 'Exportul nu a putut fi generat. Verifică consola browserului pentru detalii.';
  }
}
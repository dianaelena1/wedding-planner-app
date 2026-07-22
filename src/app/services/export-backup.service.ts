import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs
} from '@angular/fire/firestore';
import * as XLSX from 'xlsx';

import {
  WeddingExpense,
  WeddingGuest,
  WeddingTask,
  WeddingVendor
} from '../models/wedding-data.model';

interface ExtendedWeddingGuest extends WeddingGuest {
  email?: string;
  groupName?: string;
  familyGroup?: string;
  group?: string;
  menuType?: WeddingGuest['menuType'];
  allergies?: string;
  dietaryRequirements?: string;
  needsAccommodation?: boolean | string;
  accommodation?: boolean | string;
  transport?: string;
  transportation?: string;
}

interface BackupFile {
  metadata: {
    app: string;
    exportedAt: string;
    formatVersion: number;
    collections: string[];
  };
  data: Record<string, unknown[]>;
}

interface WorkbookSheet {
  name: string;
  rows: Record<string, unknown>[];
  widths: number[];
}

@Injectable({ providedIn: 'root' })
export class ExportBackupService {
  private readonly firestore = inject(Firestore);

  readonly backupCollections = [
    'weddingGuests',
    'weddingVendors',
    'weddingExpenses',
    'weddingDrinks',
    'weddingDocuments',
    'weddingTasks',
    'weddingAccommodations',
    'weddingPreparations',
    'weddingRings',
    'guestUpdates',
    'appAccess'
  ];

  async exportGuestsExcel(): Promise<void> {
    const guests = await this.readCollection<ExtendedWeddingGuest>('weddingGuests');

    this.downloadWorkbook(
      [{
        name: 'Invitati',
        rows: this.guestRows(guests),
        widths: [24, 10, 14, 14, 9, 9, 10, 16, 18, 18, 18, 22, 18, 18, 32]
      }],
      `invitati-${this.fileDate()}.xlsx`
    );
  }

  async exportPaymentsExcel(): Promise<void> {
    const [expenses, vendors] = await Promise.all([
      this.readCollection<WeddingExpense>('weddingExpenses'),
      this.readCollection<WeddingVendor>('weddingVendors')
    ]);

    this.downloadWorkbook(
      [
        {
          name: 'Cheltuieli',
          rows: this.paymentRows(expenses),
          widths: [22, 28, 10, 12, 12, 12, 12, 14, 16, 20, 35]
        },
        {
          name: 'Furnizori',
          rows: this.vendorPaymentRows(vendors),
          widths: [25, 20, 16, 12, 12, 12, 12, 16, 20, 30]
        }
      ],
      `plati-${this.fileDate()}.xlsx`
    );
  }

  async exportSeatingExcel(): Promise<void> {
    const guests = await this.readCollection<ExtendedWeddingGuest>('weddingGuests');

    this.downloadWorkbook(
      [
        {
          name: 'Plan mese',
          rows: this.seatingRows(guests),
          widths: [12, 28, 10, 10, 10, 13, 18, 22, 30]
        },
        {
          name: 'Sumar mese',
          rows: this.seatingSummaryRows(guests),
          widths: [14, 18, 18, 18]
        }
      ],
      `plan-mese-${this.fileDate()}.xlsx`
    );
  }

  async exportChecklistExcel(): Promise<void> {
    const tasks = await this.readCollection<WeddingTask>('weddingTasks');

    this.downloadWorkbook(
      [{
        name: 'Checklist',
        rows: this.taskRows(tasks),
        widths: [32, 20, 14, 14, 16, 40]
      }],
      `checklist-${this.fileDate()}.xlsx`
    );
  }

  async exportAllExcel(): Promise<void> {
    const [guests, expenses, vendors, tasks] = await Promise.all([
      this.readCollection<ExtendedWeddingGuest>('weddingGuests'),
      this.readCollection<WeddingExpense>('weddingExpenses'),
      this.readCollection<WeddingVendor>('weddingVendors'),
      this.readCollection<WeddingTask>('weddingTasks')
    ]);

    this.downloadWorkbook(
      [
        {
          name: 'Invitati',
          rows: this.guestRows(guests),
          widths: [24, 10, 14, 14, 9, 9, 10, 16, 18, 18, 18, 22, 18, 18, 32]
        },
        {
          name: 'Cheltuieli',
          rows: this.paymentRows(expenses),
          widths: [22, 28, 10, 12, 12, 12, 12, 14, 16, 20, 35]
        },
        {
          name: 'Furnizori',
          rows: this.vendorPaymentRows(vendors),
          widths: [25, 20, 16, 12, 12, 12, 12, 16, 20, 30]
        },
        {
          name: 'Plan mese',
          rows: this.seatingRows(guests),
          widths: [12, 28, 10, 10, 10, 13, 18, 22, 30]
        },
        {
          name: 'Sumar mese',
          rows: this.seatingSummaryRows(guests),
          widths: [14, 18, 18, 18]
        },
        {
          name: 'Checklist',
          rows: this.taskRows(tasks),
          widths: [32, 20, 14, 14, 16, 40]
        }
      ],
      `wedding-planner-export-${this.fileDate()}.xlsx`
    );
  }

  async exportFirestoreBackup(): Promise<{
    collections: number;
    documents: number;
  }> {
    const data: Record<string, unknown[]> = {};
    let documents = 0;

    for (const collectionName of this.backupCollections) {
      const rows = await this.readRawCollection(collectionName);
      data[collectionName] = rows.map(row => this.toJsonSafe(row));
      documents += rows.length;
    }

    const backup: BackupFile = {
      metadata: {
        app: 'Diana & Dan Wedding Planner',
        exportedAt: new Date().toISOString(),
        formatVersion: 1,
        collections: this.backupCollections
      },
      data
    };

    this.downloadBlob(
      JSON.stringify(backup, null, 2),
      `firestore-backup-${this.fileDate(true)}.json`,
      'application/json;charset=utf-8'
    );

    return {
      collections: this.backupCollections.length,
      documents
    };
  }

  private async readCollection<T extends { id: string }>(
    collectionName: string
  ): Promise<T[]> {
    const snapshot = await getDocs(
      collection(this.firestore, collectionName)
    );

    return snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    })) as T[];
  }

  private async readRawCollection(
    collectionName: string
  ): Promise<Record<string, unknown>[]> {
    const snapshot = await getDocs(
      collection(this.firestore, collectionName)
    );

    return snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));
  }

  private guestRows(
    guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {
    return guests
      .slice()
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'ro')
      )
      .map(guest => ({
        'Nume': guest.name,
        'Partea': this.sideLabel(guest.side),
        'Invitație': this.invitationLabel(guest.invitationStatus),
        'Confirmare': this.attendanceLabel(guest.attendanceStatus),
        'Adulți': this.number(guest.adults),
        'Copii': this.number(guest.children),
        'Masa': guest.tableNumber ?? '',
        'Telefon': guest.phone ?? '',
        'Email': guest.email ?? '',
        'Grup / familie':
          guest.groupName ??
          guest.familyGroup ??
          guest.group ??
          '',
        'Tip meniu': guest.menuType ?? '',
        'Alergii':
          guest.allergies ??
          guest.dietaryRequirements ??
          '',
        'Cazare': this.booleanText(
          guest.needsAccommodation ??
          guest.accommodation
        ),
        'Transport':
          guest.transport ??
          guest.transportation ??
          '',
        'Observații': guest.notes ?? ''
      }));
  }

  private paymentRows(
    expenses: WeddingExpense[]
  ): Record<string, unknown>[] {
    return expenses
      .slice()
      .sort((a, b) =>
        (a.dueDate ?? '9999').localeCompare(
          b.dueDate ?? '9999'
        )
      )
      .map(expense => ({
        'Categorie': expense.category,
        'Cheltuială': expense.name,
        'Monedă': expense.currency ?? '',
        'Cantitate': expense.quantity ?? '',
        'Preț unitar': expense.unitPrice ?? '',
        'Total': expense.total ?? '',
        'Avans plătit': expense.advancePaid ?? '',
        'Rest': expense.remainingPayment ?? '',
        'Scadență': expense.dueDate ?? '',
        'Status': expense.status,
        'Observații': expense.notes ?? ''
      }));
  }

  private vendorPaymentRows(
    vendors: WeddingVendor[]
  ): Record<string, unknown>[] {
    return vendors
      .slice()
      .sort((a, b) =>
        (a.paymentDeadline ?? '9999').localeCompare(
          b.paymentDeadline ?? '9999'
        )
      )
      .map(vendor => ({
        'Furnizor': vendor.name,
        'Categorie': vendor.category,
        'Status': vendor.status,
        'Monedă': vendor.currency ?? '',
        'Total': vendor.totalPrice ?? '',
        'Avans plătit': vendor.advancePaid ?? '',
        'Rest': vendor.remainingPayment ?? '',
        'Scadență': vendor.paymentDeadline ?? '',
        'Contact':
          vendor.contactPerson ??
          vendor.phone ??
          '',
        'Observații': vendor.notes ?? ''
      }));
  }

  private seatingRows(
    guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {
    return guests
      .filter(guest =>
        guest.attendanceStatus !== 'declined'
      )
      .slice()
      .sort((a, b) => {
        const tableA = a.tableNumber ?? 999;
        const tableB = b.tableNumber ?? 999;

        return tableA - tableB ||
          a.name.localeCompare(b.name, 'ro');
      })
      .map(guest => ({
        'Masa': guest.tableNumber ?? 'Fără masă',
        'Nume / familie': guest.name,
        'Adulți': this.number(guest.adults),
        'Copii': this.number(guest.children),
        'Total persoane':
          this.number(guest.adults) +
          this.number(guest.children),
        'Confirmare':
          this.attendanceLabel(guest.attendanceStatus),
        'Partea': this.sideLabel(guest.side),
        'Tip meniu / alergii': [
          guest.menuType,
          guest.allergies ??
          guest.dietaryRequirements
        ]
          .filter(Boolean)
          .join(' · '),
        'Observații': guest.notes ?? ''
      }));
  }

  private seatingSummaryRows(
    guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {
    const capacities: Record<number, number> = {
      1: 16,
      2: 16,
      3: 16,
      4: 16,
      5: 16,
      6: 24,
      7: 16,
      8: 24
    };

    const rows: Record<string, unknown>[] =
      Object.entries(capacities).map(
        ([table, capacity]) => {
          const tableNumber = Number(table);

          const people = guests
            .filter(guest =>
              guest.tableNumber === tableNumber &&
              guest.attendanceStatus !== 'declined'
            )
            .reduce(
              (sum, guest) =>
                sum +
                this.number(guest.adults) +
                this.number(guest.children),
              0
            );

          return {
            'Masa': tableNumber,
            'Persoane așezate': people,
            'Capacitate': capacity,
            'Locuri libere': capacity - people
          };
        }
      );

    const unassigned = guests
      .filter(guest =>
        guest.tableNumber == null &&
        guest.attendanceStatus !== 'declined'
      )
      .reduce(
        (sum, guest) =>
          sum +
          this.number(guest.adults) +
          this.number(guest.children),
        0
      );

    rows.push({
      'Masa': 'Fără masă',
      'Persoane așezate': unassigned,
      'Capacitate': '',
      'Locuri libere': ''
    });

    return rows;
  }

  private taskRows(
    tasks: WeddingTask[]
  ): Record<string, unknown>[] {
    return tasks
      .slice()
      .sort((a, b) =>
        (a.dueDate ?? '9999').localeCompare(
          b.dueDate ?? '9999'
        )
      )
      .map(task => ({
        'Task': task.title,
        'Categorie': task.category,
        'Status': task.status,
        'Prioritate': task.priority,
        'Termen': task.dueDate ?? '',
        'Observații': task.notes ?? ''
      }));
  }

  private downloadWorkbook(
    sheets: WorkbookSheet[],
    fileName: string
  ): void {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheetDefinition => {
      const rows = sheetDefinition.rows.length
        ? sheetDefinition.rows
        : [{
            'Informație':
              'Nu există date în această secțiune.'
          }];

      const sheet = XLSX.utils.json_to_sheet(rows);

      sheet['!cols'] = sheetDefinition.widths.map(
        width => ({ wch: width })
      );

      const range = XLSX.utils.decode_range(
        sheet['!ref'] ?? 'A1:A1'
      );

      sheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: {
            r: Math.max(0, range.e.r),
            c: range.e.c
          }
        })
      };

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        sheetDefinition.name.slice(0, 31)
      );
    });

    XLSX.writeFile(
      workbook,
      fileName,
      { compression: true }
    );
  }

  private toJsonSafe(value: unknown): unknown {
    if (
      value == null ||
      typeof value !== 'object'
    ) {
      return value;
    }

    if (
      'toDate' in value &&
      typeof value.toDate === 'function'
    ) {
      return {
        __type: 'timestamp',
        value: value.toDate().toISOString()
      };
    }

    if (Array.isArray(value)) {
      return value.map(item =>
        this.toJsonSafe(item)
      );
    }

    return Object.fromEntries(
      Object.entries(value).map(
        ([key, child]) => [
          key,
          this.toJsonSafe(child)
        ]
      )
    );
  }

  private downloadBlob(
    content: string,
    fileName: string,
    mimeType: string
  ): void {
    const blob = new Blob(
      [content],
      { type: mimeType }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private number(value: unknown): number {
    return Number(value) || 0;
  }

  private sideLabel(
    value: WeddingGuest['side']
  ): string {
    return value === 'Both'
      ? 'Amândoi'
      : value;
  }

  private invitationLabel(
    value: WeddingGuest['invitationStatus']
  ): string {
    const labels: Record<
      WeddingGuest['invitationStatus'],
      string
    > = {
      given: 'Dată',
      'not-given': 'Nedată',
      unknown: 'Necunoscut'
    };

    return labels[value];
  }

  private attendanceLabel(
    value: WeddingGuest['attendanceStatus']
  ): string {
    const labels: Record<
      WeddingGuest['attendanceStatus'],
      string
    > = {
      confirmed: 'Confirmat',
      pending: 'În așteptare',
      maybe: 'Poate',
      declined: 'Refuzat'
    };

    return labels[value];
  }

  private booleanText(value: unknown): string {
    if (
      value === true ||
      value === 'yes' ||
      value === 'da'
    ) {
      return 'Da';
    }

    if (
      value === false ||
      value === 'no' ||
      value === 'nu'
    ) {
      return 'Nu';
    }

    return value
      ? String(value)
      : '';
  }

  private fileDate(
    includeTime = false
  ): string {
    const now = new Date();

    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');

    if (!includeTime) {
      return date;
    }

    return `${date}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }
}

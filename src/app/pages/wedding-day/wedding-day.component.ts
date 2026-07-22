import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, catchError, combineLatest, map, of } from 'rxjs';

import {
  WeddingGuest,
  WeddingTask,
  WeddingVendor
} from '../../models/wedding-data.model';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

interface WeddingDayTimelineItem {
  id: string;
  time: string;
  title: string;
  owner?: string;
  location?: string;
  phone?: string;
  notes?: string;
  status: 'todo' | 'done';
  sortOrder?: number;
  source?: 'manual' | 'vendor';
}

interface WeddingDayForm {
  id?: string;
  time: string;
  title: string;
  owner: string;
  location: string;
  phone: string;
  notes: string;
}

interface DayContact {
  id: string;
  name: string;
  category: string;
  person?: string;
  phone?: string;
  eventTime?: string;
  location?: string;
  notes?: string;
}

interface WeddingDayViewModel {
  guests: WeddingGuest[];
  contacts: DayContact[];
  timeline: WeddingDayTimelineItem[];
  urgentTasks: WeddingTask[];
  confirmedPeople: number;
  guestsWithoutTable: number;
}

@Component({
  selector: 'app-wedding-day',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './wedding-day.component.html',
  styleUrl: './wedding-day.component.scss'
})
export class WeddingDayComponent {
  private readonly editSafety = inject(EditSafetyService);
  private readonly firestore = inject(Firestore);

  private readonly guests$ = this.safeCollection<WeddingGuest>('weddingGuests');
  private readonly vendors$ = this.safeCollection<WeddingVendor>('weddingVendors');
  private readonly tasks$ = this.safeCollection<WeddingTask>('weddingTasks');
  private readonly customTimeline$ =
    this.safeCollection<WeddingDayTimelineItem>('weddingDayTimeline');

  readonly viewModel$: Observable<WeddingDayViewModel> = combineLatest([
    this.guests$,
    this.vendors$,
    this.tasks$,
    this.customTimeline$
  ]).pipe(
    map(([guests, vendors, tasks, customTimeline]) => ({
      guests,
      contacts: this.mapContacts(vendors),
      timeline: this.buildTimeline(vendors, customTimeline),
      urgentTasks: tasks
        .filter(task =>
          task.status !== 'done' &&
          (
            task.priority === 'very high' ||
            task.priority === 'high' ||
            task.dueDate === '2026-09-05'
          )
        )
        .sort((a, b) =>
          this.priorityRank(a.priority) - this.priorityRank(b.priority)
        ),
      confirmedPeople: guests
        .filter(guest => guest.attendanceStatus === 'confirmed')
        .reduce(
          (sum, guest) => sum + Number(guest.adults || 0) + Number(guest.children || 0),
          0
        ),
      guestsWithoutTable: guests
        .filter(guest => guest.attendanceStatus === 'confirmed' && !guest.tableNumber)
        .reduce(
          (sum, guest) => sum + Number(guest.adults || 0) + Number(guest.children || 0),
          0
        )
    }))
  );

  activeTab: 'timeline' | 'guests' | 'contacts' | 'tasks' = 'timeline';
  guestSearch = '';
  contactSearch = '';
  isUpdating = false;
  message = '';
  errorMessage = '';
  showTimelineForm = false;
  timelineForm: WeddingDayForm = this.emptyTimelineForm();

  filteredGuests(guests: WeddingGuest[]): WeddingGuest[] {
    const query = this.normalize(this.guestSearch);

    if (!query) {
      return [];
    }

    return guests
      .filter(guest =>
        this.normalize(guest.name).includes(query) ||
        String(guest.tableNumber ?? '').includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
      .slice(0, 40);
  }

  filteredContacts(contacts: DayContact[]): DayContact[] {
    const query = this.normalize(this.contactSearch);

    if (!query) {
      return contacts;
    }

    return contacts.filter(contact =>
      [contact.name, contact.category, contact.person, contact.location]
        .filter(Boolean)
        .some(value => this.normalize(String(value)).includes(query))
    );
  }

  startAddTimelineItem(): void {
    this.timelineForm = this.emptyTimelineForm();
    this.showTimelineForm = true;
    this.clearMessages();
  }

  startEditTimelineItem(item: WeddingDayTimelineItem): void {
    this.timelineForm = {
      id: item.id,
      time: item.time,
      title: item.title,
      owner: item.owner ?? '',
      location: item.location ?? '',
      phone: item.phone ?? '',
      notes: item.notes ?? ''
    };
    this.showTimelineForm = true;
    this.clearMessages();
  }

  cancelTimelineForm(): void {
    this.showTimelineForm = false;
    this.timelineForm = this.emptyTimelineForm();
  }

  async saveTimelineItem(): Promise<void> {
    const title = this.timelineForm.title.trim();
    const time = this.timelineForm.time.trim();

    if (!title || !time) {
      this.errorMessage = 'Completează ora și titlul momentului.';
      return;
    }

    this.isUpdating = true;
    this.clearMessages();

    const payload = {
      time,
      title,
      owner: this.timelineForm.owner.trim(),
      location: this.timelineForm.location.trim(),
      phone: this.timelineForm.phone.trim(),
      notes: this.timelineForm.notes.trim(),
      status: 'todo' as const,
      source: 'manual' as const,
      updatedAt: serverTimestamp()
    };

    try {
      if (this.timelineForm.id) {
        await setDoc(
          doc(this.firestore, `weddingDayTimeline/${this.timelineForm.id}`),
          payload,
          { merge: true }
        );
        this.message = 'Momentul a fost actualizat.';
      } else {
        await addDoc(collection(this.firestore, 'weddingDayTimeline'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        this.message = 'Momentul a fost adăugat în program.';
      }

      this.cancelTimelineForm();
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isUpdating = false;
    }
  }

  async deleteTimelineItem(item: WeddingDayTimelineItem): Promise<void> {
    if (!await this.editSafety.confirmDelete(item.title)) {
      return;
    }

    this.isUpdating = true;
    this.clearMessages();

    try {
      await deleteDoc(doc(this.firestore, `weddingDayTimeline/${item.id}`));
      this.message = 'Momentul a fost șters.';
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isUpdating = false;
    }
  }

  async importDefaultTimeline(): Promise<void> {
    if (!confirm('Adaugi programul orientativ pentru ziua nunții? Îl poți modifica apoi.')) {
      return;
    }

    this.isUpdating = true;
    this.clearMessages();

    const items: Array<Omit<WeddingDayTimelineItem, 'id'>> = [
      { time: '08:00', title: 'Pregătiri mireasă', owner: 'Diana', status: 'todo', sortOrder: 1, source: 'manual' },
      { time: '11:30', title: 'Foto și video la pregătiri', status: 'todo', sortOrder: 2, source: 'manual' },
      { time: '14:30', title: 'Plecare spre locație', status: 'todo', sortOrder: 3, source: 'manual' },
      { time: '16:00', title: 'Primirea invitaților', location: 'Wild Garden', status: 'todo', sortOrder: 4, source: 'manual' },
      { time: '17:00', title: 'Ceremonie', location: 'Wild Garden', status: 'todo', sortOrder: 5, source: 'manual' },
      { time: '19:00', title: 'Deschiderea bufetului', status: 'todo', sortOrder: 6, source: 'manual' },
      { time: '20:30', title: 'Dansul mirilor', status: 'todo', sortOrder: 7, source: 'manual' },
      { time: '23:30', title: 'Tortul', status: 'todo', sortOrder: 8, source: 'manual' }
    ];

    try {
      const batch = writeBatch(this.firestore);
      const timelineCollection = collection(this.firestore, 'weddingDayTimeline');

      items.forEach((item, index) => {
        batch.set(doc(timelineCollection, `default-${index + 1}`), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
      this.message = 'Programul orientativ a fost importat.';
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isUpdating = false;
    }
  }

  async toggleTimelineItem(item: WeddingDayTimelineItem): Promise<void> {
    this.isUpdating = true;
    this.clearMessages();

    try {
      await setDoc(
        doc(this.firestore, `weddingDayTimeline/${item.id}`),
        {
          time: item.time,
          title: item.title,
          owner: item.owner ?? '',
          location: item.location ?? '',
          phone: item.phone ?? '',
          notes: item.notes ?? '',
          source: item.source ?? 'manual',
          status: item.status === 'done' ? 'todo' : 'done',
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isUpdating = false;
    }
  }

  async toggleTask(task: WeddingTask): Promise<void> {
    this.isUpdating = true;
    this.clearMessages();

    try {
      await setDoc(
        doc(this.firestore, `weddingTasks/${task.id}`),
        {
          status: task.status === 'done' ? 'todo' : 'done',
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isUpdating = false;
    }
  }

  call(phone?: string): void {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
  }

  openWhatsApp(phone?: string): void {
    if (!phone) {
      return;
    }

    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('0')) {
      normalized = `40${normalized.slice(1)}`;
    }

    window.open(`https://wa.me/${normalized}`, '_blank', 'noopener');
  }

  tableLabel(guest: WeddingGuest): string {
    return guest.tableNumber ? `Masa ${guest.tableNumber}` : 'Fără masă';
  }

  attendanceLabel(status: WeddingGuest['attendanceStatus']): string {
    const labels: Record<WeddingGuest['attendanceStatus'], string> = {
      confirmed: 'Confirmat',
      pending: 'În așteptare',
      maybe: 'Poate',
      declined: 'Nu participă'
    };

    return labels[status];
  }

  priorityLabel(priority: WeddingTask['priority']): string {
    const labels: Record<WeddingTask['priority'], string> = {
      'very high': 'Foarte urgent',
      high: 'Urgent',
      medium: 'Mediu',
      low: 'Scăzut'
    };

    return labels[priority];
  }

  private safeCollection<T extends { id: string }>(collectionName: string): Observable<T[]> {
    return (collectionData(
      collection(this.firestore, collectionName),
      { idField: 'id' }
    ) as Observable<T[]>).pipe(
      catchError(error => {
        console.error(`Nu am putut citi ${collectionName}`, error);
        this.errorMessage = `Nu am putut încărca ${collectionName}. Verifică autentificarea și regulile Firestore.`;
        return of([]);
      })
    );
  }

  private mapContacts(vendors: WeddingVendor[]): DayContact[] {
    return vendors
      .filter(vendor => Boolean(vendor.phone || vendor.contactPerson))
      .map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        person: vendor.contactPerson,
        phone: vendor.phone,
        eventTime: vendor.eventTime,
        location: vendor.location,
        notes: vendor.notes
      }))
      .sort((a, b) => a.category.localeCompare(b.category, 'ro'));
  }

  private buildTimeline(
    vendors: WeddingVendor[],
    customTimeline: WeddingDayTimelineItem[]
  ): WeddingDayTimelineItem[] {
    const customIds = new Set(customTimeline.map(item => item.id));

    const vendorItems: WeddingDayTimelineItem[] = vendors
      .filter(vendor => Boolean(vendor.eventTime) && !customIds.has(`vendor-${vendor.id}`))
      .map(vendor => ({
        id: `vendor-${vendor.id}`,
        time: vendor.eventTime ?? '',
        title: vendor.name,
        owner: vendor.contactPerson,
        location: vendor.location,
        phone: vendor.phone,
        notes: vendor.notes,
        status: 'todo',
        source: 'vendor'
      }));

    return [...customTimeline, ...vendorItems]
      .filter(item => item.time && item.title)
      .sort((a, b) =>
        a.time.localeCompare(b.time) ||
        (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      );
  }

  private priorityRank(priority: WeddingTask['priority']): number {
    const ranks: Record<WeddingTask['priority'], number> = {
      'very high': 0,
      high: 1,
      medium: 2,
      low: 3
    };

    return ranks[priority];
  }

  private emptyTimelineForm(): WeddingDayForm {
    return {
      time: '',
      title: '',
      owner: '',
      location: '',
      phone: '',
      notes: ''
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

  private getErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message.toLocaleLowerCase().includes('permission')
      ? 'Nu ai permisiune pentru această operație. Publică noile reguli Firestore și verifică autentificarea.'
      : message;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('ro')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

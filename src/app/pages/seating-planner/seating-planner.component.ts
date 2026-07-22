import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { WeddingGuest } from '../../models/wedding-data.model';
import { FirebaseGuestsService } from '../../services/firebase-guests.service';

interface SeatingTable {
  number: number;
  capacity: number;
  label: string;
}

@Component({
  selector: 'app-seating-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seating-planner.component.html',
  styleUrl: './seating-planner.component.scss'
})
export class SeatingPlannerComponent {
  private readonly guestsService = inject(FirebaseGuestsService);

  readonly guests$ = this.guestsService.getGuests();

  // Capacitățile sunt bazate pe schema PDF: mesele 1-5 și 7 au câte
  // două segmente de 8 persoane, iar mesele 6 și 8 au câte trei.
  readonly tables: SeatingTable[] = [
    { number: 1, capacity: 16, label: 'Masa 1' },
    { number: 2, capacity: 16, label: 'Masa 2' },
    { number: 3, capacity: 16, label: 'Masa 3' },
    { number: 4, capacity: 16, label: 'Masa 4' },
    { number: 5, capacity: 16, label: 'Masa 5' },
    { number: 6, capacity: 24, label: 'Masa 6' },
    { number: 7, capacity: 16, label: 'Masa 7' },
    { number: 8, capacity: 24, label: 'Masa 8' }
  ];

  searchTerm = '';
  savingGuestId: string | null = null;
  errorMessage = '';
  successMessage = '';
  draggedGuest: WeddingGuest | null = null;

  getPeopleCount(guest: WeddingGuest): number {
    return Math.max(0, Number(guest.adults) || 0) +
      Math.max(0, Number(guest.children) || 0);
  }

  getGuestsAtTable(guests: WeddingGuest[], tableNumber: number): WeddingGuest[] {
    return guests
      .filter(guest =>
        guest.attendanceStatus !== 'declined' &&
        guest.tableNumber === tableNumber
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  }

  getUnassignedGuests(guests: WeddingGuest[]): WeddingGuest[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('ro');

    return guests
      .filter(guest =>
        guest.attendanceStatus !== 'declined' &&
        !guest.tableNumber
      )
      .filter(guest =>
        !query || [guest.name, guest.phone, guest.notes]
          .filter(Boolean)
          .some(value =>
            String(value).toLocaleLowerCase('ro').includes(query)
          )
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'));
  }

  getOccupiedSeats(guests: WeddingGuest[], tableNumber: number): number {
    return this.getGuestsAtTable(guests, tableNumber)
      .reduce((sum, guest) => sum + this.getPeopleCount(guest), 0);
  }

  getRemainingSeats(guests: WeddingGuest[], table: SeatingTable): number {
    return table.capacity - this.getOccupiedSeats(guests, table.number);
  }

  getAssignedPeople(guests: WeddingGuest[]): number {
    return guests
      .filter(guest =>
        guest.attendanceStatus !== 'declined' &&
        !!guest.tableNumber
      )
      .reduce((sum, guest) => sum + this.getPeopleCount(guest), 0);
  }

  getUnassignedPeople(guests: WeddingGuest[]): number {
    return guests
      .filter(guest =>
        guest.attendanceStatus !== 'declined' &&
        !guest.tableNumber
      )
      .reduce((sum, guest) => sum + this.getPeopleCount(guest), 0);
  }

  getTotalCapacity(): number {
    return this.tables.reduce((sum, table) => sum + table.capacity, 0);
  }

  dragStart(guest: WeddingGuest): void {
    this.draggedGuest = guest;
  }

  dragEnd(): void {
    this.draggedGuest = null;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  async dropOnTable(
    event: DragEvent,
    table: SeatingTable,
    guests: WeddingGuest[]
  ): Promise<void> {
    event.preventDefault();

    if (!this.draggedGuest) {
      return;
    }

    const guest = this.draggedGuest;
    const currentOccupied = this.getOccupiedSeats(guests, table.number);
    const sameTableSeats = guest.tableNumber === table.number
      ? this.getPeopleCount(guest)
      : 0;
    const newOccupied = currentOccupied - sameTableSeats +
      this.getPeopleCount(guest);

    if (newOccupied > table.capacity) {
      this.errorMessage = `${table.label} ar depăși capacitatea cu ${newOccupied - table.capacity} persoane.`;
      this.draggedGuest = null;
      return;
    }

    await this.moveGuest(guest, table.number);
    this.draggedGuest = null;
  }

  async dropUnassigned(event: DragEvent): Promise<void> {
    event.preventDefault();

    if (!this.draggedGuest) {
      return;
    }

    await this.moveGuest(this.draggedGuest, undefined);
    this.draggedGuest = null;
  }

  async moveGuest(
    guest: WeddingGuest,
    tableNumber: number | undefined
  ): Promise<void> {
    if (!guest.id || guest.tableNumber === tableNumber) {
      return;
    }

    this.savingGuestId = guest.id;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.guestsService.saveGuest({
        ...guest,
        tableNumber
      });

      this.successMessage = tableNumber
        ? `${guest.name} a fost mutat(ă) la masa ${tableNumber}.`
        : `${guest.name} a fost scos/scoasă de la masă.`;
    } catch (error) {
      console.error(error);
      this.errorMessage =
        'Nu am putut salva așezarea. Verifică permisiunile Firestore.';
    } finally {
      this.savingGuestId = null;
    }
  }

  async clearAllAssignments(): Promise<void> {
    const confirmed = window.confirm(
      'Sigur vrei să scoți toți invitații de la mese?'
    );

    if (!confirmed) {
      return;
    }

    const guests = await firstValueFrom(this.guests$);
    const assigned = guests.filter(guest => guest.tableNumber);

    for (const guest of assigned) {
      await this.guestsService.saveGuest({
        ...guest,
        tableNumber: undefined
      });
    }

    this.successMessage = 'Toate așezările au fost resetate.';
  }

  trackGuest(_: number, guest: WeddingGuest): string {
    return guest.id;
  }

  trackTable(_: number, table: SeatingTable): number {
    return table.number;
  }
}

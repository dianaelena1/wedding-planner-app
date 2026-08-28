import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { WeddingGuest } from '../../models/wedding-data.model';
import { FirebaseGuestsService } from '../../services/firebase-guests.service';

type FloorElementType =
    | 'table'
    | 'rectangle'
    | 'square'
    | 'arrow'
    | 'text';

interface FloorElement {
  id: string;
  type: FloorElementType;

  label: string;

  x: number;
  y: number;

  width: number;
  height: number;

  tableNumber?: number;
  capacity?: number;
}

interface DragState {
  elementId: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
}

interface ResizeState {
  elementId: string;
  startMouseX: number;
  startMouseY: number;
  startWidth: number;
  startHeight: number;
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

  private readonly layoutStorageKey = 'wedding-seating-floor-plan-v1';

  selectedElementDraft: FloorElement | null = null;

  searchTerm = '';

  savingGuestId: string | null = null;

  errorMessage = '';
  successMessage = '';

  draggedGuest: WeddingGuest | null = null;

  floorElements: FloorElement[] = [];

  selectedElementId: string | null = null;

  private dragState: DragState | null = null;
  private resizeState: ResizeState | null = null;

  readonly canvasWidth = 1500;
  readonly canvasHeight = 920;

  constructor() {
    this.loadFloorPlan();
  }

  // ============================================================
  // GUEST HELPERS
  // ============================================================

  getPeopleCount(guest: WeddingGuest): number {
    return (
        Math.max(0, Number(guest.adults) || 0) +
        Math.max(0, Number(guest.children) || 0)
    );
  }

  getActiveGuests(guests: WeddingGuest[]): WeddingGuest[] {
    return guests.filter(
        guest => guest.attendanceStatus !== 'declined'
    );
  }

  getTotalPeople(guests: WeddingGuest[]): number {
    return this.getActiveGuests(guests).reduce(
        (sum, guest) => sum + this.getPeopleCount(guest),
        0
    );
  }

  getGuestsAtTable(
      guests: WeddingGuest[],
      tableNumber: number
  ): WeddingGuest[] {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus !== 'declined' &&
                guest.tableNumber === tableNumber
        )
        .sort((a, b) =>
            a.name.localeCompare(b.name, 'ro')
        );
  }

  getUnassignedGuests(
      guests: WeddingGuest[]
  ): WeddingGuest[] {
    const query = this.searchTerm
        .trim()
        .toLocaleLowerCase('ro');

    return guests
        .filter(
            guest =>
                guest.attendanceStatus !== 'declined' &&
                !guest.tableNumber
        )
        .filter(guest => {
          if (!query) {
            return true;
          }

          return [
            guest.name,
            guest.phone,
            guest.notes
          ]
              .filter(Boolean)
              .some(value =>
                  String(value)
                      .toLocaleLowerCase('ro')
                      .includes(query)
              );
        })
        .sort((a, b) =>
            a.name.localeCompare(b.name, 'ro')
        );
  }

  getOccupiedSeats(
      guests: WeddingGuest[],
      tableNumber: number
  ): number {
    return this.getGuestsAtTable(
        guests,
        tableNumber
    ).reduce(
        (sum, guest) => sum + this.getPeopleCount(guest),
        0
    );
  }

  getRemainingSeats(
      guests: WeddingGuest[],
      table: FloorElement
  ): number {
    if (
        table.type !== 'table' ||
        table.tableNumber === undefined
    ) {
      return 0;
    }

    return (
        (table.capacity ?? 0) -
        this.getOccupiedSeats(
            guests,
            table.tableNumber
        )
    );
  }

  getAssignedPeople(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus !== 'declined' &&
                !!guest.tableNumber
        )
        .reduce(
            (sum, guest) =>
                sum + this.getPeopleCount(guest),
            0
        );
  }

  getUnassignedPeople(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus !== 'declined' &&
                !guest.tableNumber
        )
        .reduce(
            (sum, guest) =>
                sum + this.getPeopleCount(guest),
            0
        );
  }

  getTables(): FloorElement[] {
    return this.floorElements.filter(
        element => element.type === 'table'
    );
  }

  getTotalCapacity(): number {
    return this.getTables().reduce(
        (sum, table) =>
            sum + Math.max(0, table.capacity ?? 0),
        0
    );
  }

  // ============================================================
  // GUEST DRAG & DROP
  // ============================================================

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
      table: FloorElement,
      guests: WeddingGuest[]
  ): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (
        !this.draggedGuest ||
        table.type !== 'table' ||
        table.tableNumber === undefined
    ) {
      return;
    }

    const guest = this.draggedGuest;

    const occupied = this.getOccupiedSeats(
        guests,
        table.tableNumber
    );

    const guestPeople = this.getPeopleCount(guest);

    const alreadyAtThisTable =
        guest.tableNumber === table.tableNumber
            ? guestPeople
            : 0;

    const newOccupied =
        occupied -
        alreadyAtThisTable +
        guestPeople;

    const capacity = table.capacity ?? 0;

    if (newOccupied > capacity) {
      this.errorMessage =
          `${table.label} ar depăși capacitatea cu ` +
          `${newOccupied - capacity} persoane.`;

      this.draggedGuest = null;

      return;
    }

    await this.moveGuest(
        guest,
        table.tableNumber
    );

    this.draggedGuest = null;
  }

  async dropUnassigned(
      event: DragEvent
  ): Promise<void> {
    event.preventDefault();

    if (!this.draggedGuest) {
      return;
    }

    await this.moveGuest(
        this.draggedGuest,
        undefined
    );

    this.draggedGuest = null;
  }

  async moveGuest(
      guest: WeddingGuest,
      tableNumber: number | undefined
  ): Promise<void> {
    if (
        !guest.id ||
        guest.tableNumber === tableNumber
    ) {
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

  // ============================================================
  // ADD ELEMENTS
  // ============================================================

  addTable(): void {
    const tableNumberInput = window.prompt(
        'Numărul mesei:',
        String(this.getNextTableNumber())
    );

    if (tableNumberInput === null) {
      return;
    }

    const tableNumber = Number(
        tableNumberInput.trim()
    );

    if (
        !Number.isInteger(tableNumber) ||
        tableNumber <= 0
    ) {
      this.errorMessage =
          'Numărul mesei trebuie să fie un număr întreg mai mare decât 0.';
      return;
    }

    if (
        this.getTables().some(
            table =>
                table.tableNumber === tableNumber
        )
    ) {
      this.errorMessage =
          `Există deja masa ${tableNumber}.`;
      return;
    }

    const capacityInput = window.prompt(
        'Capacitatea mesei:',
        '16'
    );

    if (capacityInput === null) {
      return;
    }

    const capacity = Number(
        capacityInput.trim()
    );

    if (
        !Number.isInteger(capacity) ||
        capacity <= 0
    ) {
      this.errorMessage =
          'Capacitatea trebuie să fie un număr întreg mai mare decât 0.';
      return;
    }

    const position = this.getNextElementPosition();

    const table: FloorElement = {
      id: this.createId(),
      type: 'table',

      label: `Masa ${tableNumber}`,

      tableNumber,
      capacity,

      x: position.x,
      y: position.y,

      width: 240,
      height: 240
    };

    this.floorElements = [
      ...this.floorElements,
      table
    ];

    this.selectedElementId = table.id;

    this.saveFloorPlan();

    this.errorMessage = '';
    this.successMessage =
        `Masa ${tableNumber} a fost adăugată.`;
  }

  addRectangle(): void {
    const label =
        window.prompt(
            'Textul dreptunghiului:',
            'DJ'
        )?.trim() || 'Dreptunghi';

    const position = this.getNextElementPosition();

    this.addFloorElement({
      id: this.createId(),
      type: 'rectangle',
      label,
      x: position.x,
      y: position.y,
      width: 300,
      height: 110
    });
  }

  addSquare(): void {
    const label =
        window.prompt(
            'Textul pătratului:',
            'Element'
        )?.trim() || 'Element';

    const position = this.getNextElementPosition();

    this.addFloorElement({
      id: this.createId(),
      type: 'square',
      label,
      x: position.x,
      y: position.y,
      width: 150,
      height: 150
    });
  }

  addArrow(): void {
    const label =
        window.prompt(
            'Textul săgeții:',
            'INTRARE'
        )?.trim() || '';

    const position = this.getNextElementPosition();

    this.addFloorElement({
      id: this.createId(),
      type: 'arrow',
      label,
      x: position.x,
      y: position.y,
      width: 220,
      height: 90
    });
  }

  addText(): void {
    const label = window.prompt(
        'Introdu textul:',
        'Text'
    );

    if (label === null) {
      return;
    }

    const position = this.getNextElementPosition();

    this.addFloorElement({
      id: this.createId(),
      type: 'text',
      label: label.trim() || 'Text',
      x: position.x,
      y: position.y,
      width: 180,
      height: 60
    });
  }

  private addFloorElement(
      element: FloorElement
  ): void {
    this.floorElements = [
      ...this.floorElements,
      element
    ];

    this.selectedElementId = element.id;

    this.saveFloorPlan();
  }

  // ============================================================
  // SELECT ELEMENT
  // ============================================================

  selectElement(
      event: MouseEvent,
      element: FloorElement
  ): void {
    event.stopPropagation();

    this.selectedElementId = element.id;

    this.selectedElementDraft = {
      ...element
    };
  }

  clearSelection(): void {
    this.selectedElementId = null;
    this.selectedElementDraft = null;
  }

  async saveSelectedElement(): Promise<void> {
    const selected = this.getSelectedElement();
    const draft = this.selectedElementDraft;

    if (!selected || !draft) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const oldTableNumber = selected.tableNumber;

    if (draft.type === 'table') {
      const newTableNumber = Number(draft.tableNumber);
      const newCapacity = Number(draft.capacity);

      if (
          !Number.isInteger(newTableNumber) ||
          newTableNumber <= 0
      ) {
        this.errorMessage =
            'Numărul mesei trebuie să fie un număr întreg mai mare decât 0.';
        return;
      }

      if (
          !Number.isInteger(newCapacity) ||
          newCapacity <= 0
      ) {
        this.errorMessage =
            'Capacitatea trebuie să fie un număr întreg mai mare decât 0.';
        return;
      }

      const duplicate = this.getTables().some(
          table =>
              table.id !== selected.id &&
              table.tableNumber === newTableNumber
      );

      if (duplicate) {
        this.errorMessage =
            `Există deja masa ${newTableNumber}.`;
        return;
      }

      if (
          oldTableNumber !== undefined &&
          oldTableNumber !== newTableNumber
      ) {
        const guests = await firstValueFrom(
            this.guests$
        );

        const guestsAtOldTable = guests.filter(
            guest =>
                guest.tableNumber === oldTableNumber
        );

        for (const guest of guestsAtOldTable) {
          await this.guestsService.saveGuest({
            ...guest,
            tableNumber: newTableNumber
          });
        }
      }

      selected.tableNumber = newTableNumber;
      selected.capacity = newCapacity;
      selected.label = `Masa ${newTableNumber}`;
    } else {
      selected.label = draft.label;
    }

    selected.width = Math.max(
        60,
        Number(draft.width) || 60
    );

    selected.height = Math.max(
        40,
        Number(draft.height) || 40
    );

    selected.x = Math.max(
        0,
        Math.min(
            Number(draft.x) || 0,
            this.canvasWidth - selected.width
        )
    );

    selected.y = Math.max(
        0,
        Math.min(
            Number(draft.y) || 0,
            this.canvasHeight - selected.height
        )
    );

    this.selectedElementDraft = {
      ...selected
    };

    this.saveFloorPlan();

    this.successMessage =
        selected.type === 'table'
            ? `${selected.label} a fost salvată.`
            : 'Modificările au fost salvate.';
  }

  getSelectedElement():
      | FloorElement
      | undefined {
    return this.floorElements.find(
        element =>
            element.id === this.selectedElementId
    );
  }

  isSelected(
      element: FloorElement
  ): boolean {
    return (
        element.id === this.selectedElementId
    );
  }

  // ============================================================
  // MOVE ELEMENT
  // ============================================================

  startElementDrag(
      event: MouseEvent,
      element: FloorElement
  ): void {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;

    if (
        target.closest('.resize-handle') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('.guest-card')
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.selectedElementId = element.id;

    this.dragState = {
      elementId: element.id,

      startMouseX: event.clientX,
      startMouseY: event.clientY,

      startX: element.x,
      startY: element.y
    };
  }

  // ============================================================
  // RESIZE ELEMENT
  // ============================================================

  startResize(
      event: MouseEvent,
      element: FloorElement
  ): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedElementId = element.id;

    this.resizeState = {
      elementId: element.id,

      startMouseX: event.clientX,
      startMouseY: event.clientY,

      startWidth: element.width,
      startHeight: element.height
    };
  }

  @HostListener(
      'document:mousemove',
      ['$event']
  )
  onDocumentMouseMove(
      event: MouseEvent
  ): void {
    if (this.dragState) {
      this.moveElementWithMouse(event);
    }

    if (this.resizeState) {
      this.resizeElementWithMouse(event);
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    const changed =
        !!this.dragState ||
        !!this.resizeState;

    this.dragState = null;
    this.resizeState = null;

    if (changed) {
      this.saveFloorPlan();
    }
  }

  private moveElementWithMouse(
      event: MouseEvent
  ): void {
    if (!this.dragState) {
      return;
    }

    const element =
        this.floorElements.find(
            item =>
                item.id ===
                this.dragState?.elementId
        );

    if (!element) {
      return;
    }

    const deltaX =
        event.clientX -
        this.dragState.startMouseX;

    const deltaY =
        event.clientY -
        this.dragState.startMouseY;

    const newX =
        this.dragState.startX + deltaX;

    const newY =
        this.dragState.startY + deltaY;

    element.x = Math.max(
        0,
        Math.min(
            newX,
            this.canvasWidth - element.width
        )
    );

    element.y = Math.max(
        0,
        Math.min(
            newY,
            this.canvasHeight - element.height
        )
    );
  }

  private resizeElementWithMouse(
      event: MouseEvent
  ): void {
    if (!this.resizeState) {
      return;
    }

    const element =
        this.floorElements.find(
            item =>
                item.id ===
                this.resizeState?.elementId
        );

    if (!element) {
      return;
    }

    const deltaX =
        event.clientX -
        this.resizeState.startMouseX;

    const deltaY =
        event.clientY -
        this.resizeState.startMouseY;

    const minimumWidth =
        element.type === 'text'
            ? 80
            : 100;

    const minimumHeight =
        element.type === 'text'
            ? 40
            : 60;

    element.width = Math.max(
        minimumWidth,
        Math.min(
            this.resizeState.startWidth +
            deltaX,
            this.canvasWidth - element.x
        )
    );

    element.height = Math.max(
        minimumHeight,
        Math.min(
            this.resizeState.startHeight +
            deltaY,
            this.canvasHeight - element.y
        )
    );
  }

  // ============================================================
  // EDIT ELEMENT
  // ============================================================

  onElementSettingsChanged(): void {
    const element =
        this.getSelectedElement();

    if (!element) {
      return;
    }

    element.width = Math.max(
        60,
        Number(element.width) || 60
    );

    element.height = Math.max(
        40,
        Number(element.height) || 40
    );

    element.x = Math.max(
        0,
        Math.min(
            Number(element.x) || 0,
            this.canvasWidth - element.width
        )
    );

    element.y = Math.max(
        0,
        Math.min(
            Number(element.y) || 0,
            this.canvasHeight - element.height
        )
    );

    if (element.type === 'table') {
      element.capacity = Math.max(
          1,
          Number(element.capacity) || 1
      );

      if (element.tableNumber) {
        element.label =
            `Masa ${element.tableNumber}`;
      }
    }

    this.saveFloorPlan();
  }

  async changeTableNumber(
      element: FloorElement,
      oldTableNumber: number | undefined,
      value: number | string
  ): Promise<void> {
    if (element.type !== 'table') {
      return;
    }

    const newNumber = Number(value);

    if (
        !Number.isInteger(newNumber) ||
        newNumber <= 0
    ) {
      this.errorMessage =
          'Numărul mesei trebuie să fie un număr întreg mai mare decât 0.';

      return;
    }

    const duplicate =
        this.getTables().some(
            table =>
                table.id !== element.id &&
                table.tableNumber === newNumber
        );

    if (duplicate) {
      this.errorMessage =
          `Există deja masa ${newNumber}.`;

      return;
    }

    if (
        oldTableNumber !== undefined &&
        oldTableNumber !== newNumber
    ) {
      const guests =
          await firstValueFrom(
              this.guests$
          );

      const guestsAtOldTable =
          guests.filter(
              guest =>
                  guest.tableNumber ===
                  oldTableNumber
          );

      for (
          const guest of guestsAtOldTable
          ) {
        await this.guestsService.saveGuest({
          ...guest,
          tableNumber: newNumber
        });
      }
    }

    element.tableNumber = newNumber;
    element.label = `Masa ${newNumber}`;

    this.errorMessage = '';

    this.saveFloorPlan();

    this.successMessage =
        `Masa a fost redenumită în Masa ${newNumber}.`;
  }

  // ============================================================
  // DELETE
  // ============================================================

  async deleteSelectedElement(): Promise<void> {
    const element =
        this.getSelectedElement();

    if (!element) {
      return;
    }

    const confirmed = window.confirm(
        element.type === 'table'
            ? `Sigur vrei să ștergi ${element.label}? Invitații de la această masă vor reveni în lista "Fără masă".`
            : `Sigur vrei să ștergi "${element.label}"?`
    );

    if (!confirmed) {
      return;
    }

    if (
        element.type === 'table' &&
        element.tableNumber !== undefined
    ) {
      const guests =
          await firstValueFrom(
              this.guests$
          );

      const assigned =
          guests.filter(
              guest =>
                  guest.tableNumber ===
                  element.tableNumber
          );

      for (const guest of assigned) {
        await this.guestsService.saveGuest({
          ...guest,
          tableNumber: undefined
        });
      }
    }

    this.floorElements =
        this.floorElements.filter(
            item => item.id !== element.id
        );

    this.selectedElementId = null;

    this.saveFloorPlan();

    this.successMessage =
        'Elementul a fost șters.';
  }

  // ============================================================
  // RESET GUEST ASSIGNMENTS
  // ============================================================

  async clearAllAssignments(): Promise<void> {
    const confirmed = window.confirm(
        'Sigur vrei să scoți toți invitații de la mese?'
    );

    if (!confirmed) {
      return;
    }

    const guests =
        await firstValueFrom(
            this.guests$
        );

    const assigned =
        guests.filter(
            guest => guest.tableNumber
        );

    for (const guest of assigned) {
      await this.guestsService.saveGuest({
        ...guest,
        tableNumber: undefined
      });
    }

    this.successMessage =
        'Toate așezările au fost resetate.';
  }

  clearFloorPlan(): void {
    const confirmed = window.confirm(
        'Sigur vrei să ștergi toate elementele din planul sălii?'
    );

    if (!confirmed) {
      return;
    }

    this.floorElements = [];
    this.selectedElementId = null;

    this.saveFloorPlan();

    this.successMessage =
        'Planul sălii a fost golit.';
  }

  // ============================================================
  // LOCAL STORAGE
  // ============================================================

  private saveFloorPlan(): void {
    try {
      localStorage.setItem(
          this.layoutStorageKey,
          JSON.stringify(this.floorElements)
      );
    } catch (error) {
      console.error(
          'Nu am putut salva planul în localStorage.',
          error
      );
    }
  }

  private loadFloorPlan(): void {
    try {
      const raw = localStorage.getItem(
          this.layoutStorageKey
      );

      if (!raw) {
        this.floorElements = [];
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        this.floorElements = [];
        return;
      }

      this.floorElements =
          parsed as FloorElement[];
    } catch (error) {
      console.error(
          'Nu am putut încărca planul sălii.',
          error
      );

      this.floorElements = [];
    }
  }

  // ============================================================
  // GENERAL HELPERS
  // ============================================================

  private getNextTableNumber(): number {
    const usedNumbers =
        this.getTables()
            .map(table => table.tableNumber)
            .filter(
                (
                    number
                ): number is number =>
                    typeof number === 'number'
            );

    let number = 1;

    while (
        usedNumbers.includes(number)
        ) {
      number++;
    }

    return number;
  }

  private getNextElementPosition(): {
    x: number;
    y: number;
  } {
    const index =
        this.floorElements.length;

    return {
      x: 35 + (index % 5) * 35,
      y: 35 + (index % 7) * 35
    };
  }

  private createId(): string {
    return (
        Date.now().toString(36) +
        '-' +
        Math.random()
            .toString(36)
            .slice(2, 9)
    );
  }

  trackGuest(
      _: number,
      guest: WeddingGuest
  ): string {
    return guest.id;
  }

  trackElement(
      _: number,
      element: FloorElement
  ): string {
    return element.id;
  }
}
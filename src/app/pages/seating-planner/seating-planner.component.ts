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

  private readonly layoutStorageKey =
      'wedding-seating-floor-plan-v1';

  readonly canvasWidth = 1500;
  readonly canvasHeight = 920;

  searchTerm = '';

  savingGuestId: string | null = null;

  errorMessage = '';
  successMessage = '';

  draggedGuest: WeddingGuest | null = null;

  floorElements: FloorElement[] = [];

  selectedElementId: string | null = null;
  selectedElementDraft: FloorElement | null = null;

  private dragState: DragState | null = null;
  private resizeState: ResizeState | null = null;

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
        (sum, guest) =>
            sum + this.getPeopleCount(guest),
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

    const occupied =
        this.getOccupiedSeats(
            guests,
            table.tableNumber
        );

    const people =
        this.getPeopleCount(guest);

    const alreadyAtTable =
        guest.tableNumber === table.tableNumber
            ? people
            : 0;

    const newOccupied =
        occupied -
        alreadyAtTable +
        people;

    const capacity =
        Number(table.capacity) || 0;

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

    const tableNumber =
        Number(tableNumberInput.trim());

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

    const capacity =
        Number(capacityInput.trim());

    if (
        !Number.isInteger(capacity) ||
        capacity <= 0
    ) {
      this.errorMessage =
          'Capacitatea trebuie să fie un număr întreg mai mare decât 0.';
      return;
    }

    const position =
        this.getNextElementPosition();

    const table: FloorElement = {
      id: this.createId(),
      type: 'table',

      label: `Masa ${tableNumber}`,

      tableNumber,
      capacity,

      x: position.x,
      y: position.y,

      width: 230,
      height: 220
    };

    this.addFloorElement(table);

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

    const position =
        this.getNextElementPosition();

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

    const position =
        this.getNextElementPosition();

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

    const position =
        this.getNextElementPosition();

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

    const position =
        this.getNextElementPosition();

    this.addFloorElement({
      id: this.createId(),
      type: 'text',

      label:
          label.trim() || 'Text',

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

    this.selectedElementDraft = {
      ...element
    };

    this.saveFloorPlan();
  }

  // ============================================================
  // SELECTION
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
        element.id ===
        this.selectedElementId
    );
  }

  // ============================================================
  // SAVE SELECTED ELEMENT
  // ============================================================

  async saveSelectedElement(): Promise<void> {
    if (!this.selectedElementId || !this.selectedElementDraft) {
      return;
    }

    const index = this.floorElements.findIndex(
        element => element.id === this.selectedElementId
    );

    if (index === -1) {
      return;
    }

    const current = this.floorElements[index];
    const draft = this.selectedElementDraft;

    this.errorMessage = '';
    this.successMessage = '';

    const updated: FloorElement = {
      ...current,
      ...draft
    };

    if (updated.type === 'table') {
      const oldTableNumber = current.tableNumber;

      const newTableNumber = Number(
          draft.tableNumber
      );

      const newCapacity = Number(
          draft.capacity
      );

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

      const duplicate = this.floorElements.some(
          element =>
              element.type === 'table' &&
              element.id !== current.id &&
              element.tableNumber === newTableNumber
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
        const guests =
            await firstValueFrom(this.guests$);

        const guestsAtOldTable =
            guests.filter(
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

      updated.tableNumber = newTableNumber;
      updated.capacity = newCapacity;
      updated.label = `Masa ${newTableNumber}`;
    } else {
      updated.label =
          String(draft.label ?? '').trim() ||
          'Element';
    }

    const minimumWidth =
        updated.type === 'table'
            ? 190
            : 60;

    const minimumHeight =
        updated.type === 'table'
            ? 150
            : 40;

    updated.width = Math.max(
        minimumWidth,
        Number(draft.width) || minimumWidth
    );

    updated.height = Math.max(
        minimumHeight,
        Number(draft.height) || minimumHeight
    );

    updated.x = current.x;
    updated.y = current.y;

    this.floorElements = [
      ...this.floorElements.slice(0, index),
      updated,
      ...this.floorElements.slice(index + 1)
    ];

    this.selectedElementDraft = {
      ...updated
    };

    this.saveFloorPlan();

    this.successMessage =
        updated.type === 'table'
            ? `${updated.label} a fost salvată.`
            : 'Modificările au fost salvate.';
  }

  // ============================================================
  // MOVE
  // ============================================================

  startElementDrag(
      event: MouseEvent,
      element: FloorElement
  ): void {
    if (event.button !== 0) {
      return;
    }

    const target =
        event.target as HTMLElement;

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

    this.selectedElementId =
        element.id;

    this.selectedElementDraft = {
      ...element
    };

    this.dragState = {
      elementId: element.id,

      startMouseX: event.clientX,
      startMouseY: event.clientY,

      startX: element.x,
      startY: element.y
    };
  }

  // ============================================================
  // RESIZE
  // ============================================================

  startResize(
      event: MouseEvent,
      element: FloorElement
  ): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectedElementId =
        element.id;

    this.selectedElementDraft = {
      ...element
    };

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

    if (!changed) {
      return;
    }

    this.syncDraftFromSelected();
    this.saveFloorPlan();
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

    element.x = Math.max(
        0,
        Math.min(
            this.dragState.startX +
            deltaX,
            this.canvasWidth -
            element.width
        )
    );

    element.y = Math.max(
        0,
        Math.min(
            this.dragState.startY +
            deltaY,
            this.canvasHeight -
            element.height
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
        element.type === 'table'
            ? 190
            : element.type === 'text'
                ? 80
                : 90;

    const minimumHeight =
        element.type === 'table'
            ? 150
            : element.type === 'text'
                ? 40
                : 55;

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

  private syncDraftFromSelected(): void {
    const selected =
        this.getSelectedElement();

    if (!selected) {
      return;
    }

    this.selectedElementDraft = {
      ...selected
    };
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

    const confirmed =
        window.confirm(
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
    this.selectedElementDraft = null;

    this.saveFloorPlan();

    this.successMessage =
        'Elementul a fost șters.';
  }

  // ============================================================
  // RESET
  // ============================================================

  async clearAllAssignments(): Promise<void> {
    const confirmed =
        window.confirm(
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
    const confirmed =
        window.confirm(
            'Sigur vrei să ștergi toate elementele din planul sălii?'
        );

    if (!confirmed) {
      return;
    }

    this.floorElements = [];

    this.selectedElementId = null;
    this.selectedElementDraft = null;

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
          JSON.stringify(
              this.floorElements
          )
      );
    } catch (error) {
      console.error(
          'Nu am putut salva planul.',
          error
      );
    }
  }

  private loadFloorPlan(): void {
    try {
      const raw =
          localStorage.getItem(
              this.layoutStorageKey
          );

      if (!raw) {
        this.floorElements = [];
        return;
      }

      const parsed =
          JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        this.floorElements = [];
        return;
      }

      this.floorElements =
          parsed.map(
              element => {
                const item =
                    element as FloorElement;

                if (item.type === 'table') {
                  item.width = Math.max(
                      190,
                      Number(item.width) || 230
                  );

                  item.height = Math.max(
                      150,
                      Number(item.height) || 220
                  );
                }

                return item;
              }
          );
    } catch (error) {
      console.error(
          'Nu am putut încărca planul.',
          error
      );

      this.floorElements = [];
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private getNextTableNumber(): number {
    const usedNumbers =
        this.getTables()
            .map(
                table =>
                    table.tableNumber
            )
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
      x: 35 + (index % 6) * 40,
      y: 35 + (index % 7) * 40
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
}
import {
  CommonModule
} from '@angular/common';

import {
  Component,
  HostListener,
  inject
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  firstValueFrom
} from 'rxjs';

import {
  WeddingGuest
} from '../../models/wedding-data.model';

import {
  FirebaseGuestsService
} from '../../services/firebase-guests.service';


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

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
      './seating-planner.component.html',

  styleUrl:
      './seating-planner.component.scss'
})
export class SeatingPlannerComponent {

  private readonly guestsService =
      inject(FirebaseGuestsService);

  readonly guests$ =
      this.guestsService.getGuests();


  private readonly layoutStorageKey =
      'wedding-seating-floor-plan-v1';


  readonly canvasWidth = 1500;

  readonly canvasHeight = 920;


  searchTerm = '';


  savingGuestId:
      string | null = null;


  errorMessage = '';

  successMessage = '';


  draggedGuest:
      WeddingGuest | null = null;


  floorElements:
      FloorElement[] = [];


  selectedElementId:
      string | null = null;


  selectedElementDraft:
      FloorElement | null = null;


  private dragState:
      DragState | null = null;


  private resizeState:
      ResizeState | null = null;


  constructor() {

    this.loadFloorPlan();
  }


  // ============================================================
  // GUEST HELPERS
  // ============================================================


  getPeopleCount(
      guest: WeddingGuest
  ): number {

    return (
        Math.max(
            0,
            Number(guest.adults) || 0
        )
        +
        Math.max(
            0,
            Number(guest.children) || 0
        )
    );
  }


  getActiveGuests(
      guests: WeddingGuest[]
  ): WeddingGuest[] {

    return guests.filter(
        guest =>
            guest.attendanceStatus !==
            'declined'
    );
  }


  getTotalPeople(
      guests: WeddingGuest[]
  ): number {

    return this
        .getActiveGuests(guests)
        .reduce(
            (
                sum,
                guest
            ) =>
                sum +
                this.getPeopleCount(guest),

            0
        );
  }


  /**
   * IMPORTANT
   *
   * Invitatii NU mai sunt sortati alfabetic.
   *
   * Daca exista tableOrder,
   * folosim ordinea salvata manual.
   *
   * Pentru invitatii vechi, care nu au inca
   * tableOrder, folosim temporar numele doar
   * pentru o ordine stabila.
   *
   * Imediat ce faci un drag & drop la masa,
   * ordinea este normalizata si salvata.
   */
  getGuestsAtTable(
      guests: WeddingGuest[],
      tableNumber: number
  ): WeddingGuest[] {

    return guests
        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined'
                &&
                Number(
                    guest.tableNumber
                ) === tableNumber
        )
        .sort(
            (
                a,
                b
            ) => {

              const orderA =
                  this.getGuestOrder(a);

              const orderB =
                  this.getGuestOrder(b);


              const hasOrderA =
                  orderA !== null;

              const hasOrderB =
                  orderB !== null;


              if (
                  hasOrderA &&
                  hasOrderB
              ) {

                return (
                    orderA! -
                    orderB!
                );
              }


              if (hasOrderA) {

                return -1;
              }


              if (hasOrderB) {

                return 1;
              }


              /*
               * Legacy only.
               * Invitatii fara tableOrder.
               */
              return a.name.localeCompare(
                  b.name,
                  'ro'
              );
            }
        );
  }


  private getGuestOrder(
      guest: WeddingGuest
  ): number | null {

    if (
        guest.tableOrder === null ||
        guest.tableOrder === undefined
    ) {

      return null;
    }


    const value =
        Number(guest.tableOrder);


    return Number.isFinite(value)
        ? value
        : null;
  }


  getUnassignedGuests(
      guests: WeddingGuest[]
  ): WeddingGuest[] {

    const query =
        this.searchTerm
            .trim()
            .toLocaleLowerCase('ro');


    /*
     * Lista "Fara masa" poate ramane alfabetica.
     * Cerinta de ordine manuala este pentru
     * invitatii asezati la masa.
     */
    return guests
        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined'
                &&
                !guest.tableNumber
        )
        .filter(
            guest => {

              if (!query) {

                return true;
              }


              return [
                guest.name,
                guest.phone,
                guest.notes
              ]
                  .filter(Boolean)
                  .some(
                      value =>
                          String(value)
                              .toLocaleLowerCase(
                                  'ro'
                              )
                              .includes(query)
                  );
            }
        )
        .sort(
            (
                a,
                b
            ) =>
                a.name.localeCompare(
                    b.name,
                    'ro'
                )
        );
  }


  getOccupiedSeats(
      guests: WeddingGuest[],
      tableNumber: number
  ): number {

    return this
        .getGuestsAtTable(
            guests,
            tableNumber
        )
        .reduce(
            (
                sum,
                guest
            ) =>
                sum +
                this.getPeopleCount(guest),

            0
        );
  }


  getRemainingSeats(
      guests: WeddingGuest[],
      table: FloorElement
  ): number {

    if (
        table.type !== 'table'
        ||
        table.tableNumber ===
        undefined
    ) {

      return 0;
    }


    return (
        (table.capacity ?? 0)
        -
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
                guest.attendanceStatus !==
                'declined'
                &&
                !!guest.tableNumber
        )
        .reduce(
            (
                sum,
                guest
            ) =>
                sum +
                this.getPeopleCount(guest),

            0
        );
  }


  getUnassignedPeople(
      guests: WeddingGuest[]
  ): number {

    return guests
        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined'
                &&
                !guest.tableNumber
        )
        .reduce(
            (
                sum,
                guest
            ) =>
                sum +
                this.getPeopleCount(guest),

            0
        );
  }


  getTables():
      FloorElement[] {

    return this.floorElements.filter(
        element =>
            element.type === 'table'
    );
  }


  getTotalCapacity():
      number {

    return this
        .getTables()
        .reduce(
            (
                sum,
                table
            ) =>
                sum +
                Math.max(
                    0,
                    table.capacity ?? 0
                ),

            0
        );
  }


  // ============================================================
  // GUEST DRAG & DROP
  // ============================================================


  dragStart(
      guest: WeddingGuest
  ): void {

    this.draggedGuest =
        guest;
  }


  dragEnd():
      void {

    this.draggedGuest =
        null;
  }


  allowDrop(
      event: DragEvent
  ): void {

    event.preventDefault();
  }


  /**
   * Drop pe spatiul general al mesei.
   *
   * Invitatii sunt pusi LA FINAL.
   */
  async dropOnTable(
      event: DragEvent,
      table: FloorElement,
      guests: WeddingGuest[]
  ): Promise<void> {

    event.preventDefault();

    event.stopPropagation();


    if (
        !this.draggedGuest
        ||
        table.type !== 'table'
        ||
        table.tableNumber ===
        undefined
    ) {

      return;
    }


    const guest =
        this.draggedGuest;


    if (
        !this.canMoveGuestToTable(
            guest,
            table,
            guests
        )
    ) {

      this.draggedGuest =
          null;

      return;
    }


    await this.placeGuestAtTable(
        guest,
        table.tableNumber,
        guests,
        null
    );


    this.draggedGuest =
        null;
  }


  /**
   * Drop direct peste un alt invitat.
   *
   * Invitatorul tras va fi inserat
   * INAINTEA invitatului peste care este lasat.
   *
   * Exemplu:
   *
   * Maria
   * Ion
   * Andrei
   *
   * il tragi pe Andrei peste Ion:
   *
   * Maria
   * Andrei
   * Ion
   */
  async dropOnGuest(
      event: DragEvent,
      targetGuest: WeddingGuest,
      table: FloorElement,
      guests: WeddingGuest[]
  ): Promise<void> {

    event.preventDefault();

    event.stopPropagation();


    if (
        !this.draggedGuest
        ||
        table.type !== 'table'
        ||
        table.tableNumber ===
        undefined
    ) {

      return;
    }


    const dragged =
        this.draggedGuest;


    if (
        dragged.id ===
        targetGuest.id
    ) {

      this.draggedGuest =
          null;

      return;
    }


    if (
        !this.canMoveGuestToTable(
            dragged,
            table,
            guests
        )
    ) {

      this.draggedGuest =
          null;

      return;
    }


    await this.placeGuestAtTable(
        dragged,
        table.tableNumber,
        guests,
        targetGuest.id
    );


    this.draggedGuest =
        null;
  }


  private canMoveGuestToTable(
      guest: WeddingGuest,
      table: FloorElement,
      guests: WeddingGuest[]
  ): boolean {

    return (
        table.type === 'table' &&
        table.tableNumber !== undefined
    );
  }



  /**
   * Metoda centrala pentru ordinea manuala.
   *
   * targetGuestId:
   *
   * null -> pune invitatul la final.
   *
   * id -> pune invitatul inaintea
   *       invitatului respectiv.
   */
  private async placeGuestAtTable(
      draggedGuest: WeddingGuest,
      targetTableNumber: number,
      allGuests: WeddingGuest[],
      targetGuestId: string | null
  ): Promise<void> {

    if (!draggedGuest.id) {

      return;
    }


    const oldTableNumber =
        draggedGuest.tableNumber
            ? Number(
                draggedGuest.tableNumber
            )
            : undefined;


    /*
     * Lista actuala a mesei destinatie.
     */
    let targetGuests =
        this.getGuestsAtTable(
            allGuests,
            targetTableNumber
        );


    /*
     * Scoatem invitatul tras daca era
     * deja la aceasta masa.
     */
    targetGuests =
        targetGuests.filter(
            guest =>
                guest.id !==
                draggedGuest.id
        );


    let insertIndex =
        targetGuests.length;


    if (targetGuestId) {

      const foundIndex =
          targetGuests.findIndex(
              guest =>
                  guest.id ===
                  targetGuestId
          );


      if (foundIndex !== -1) {

        insertIndex =
            foundIndex;
      }
    }


    targetGuests.splice(
        insertIndex,
        0,
        {
          ...draggedGuest,
          tableNumber:
          targetTableNumber
        }
    );


    this.errorMessage = '';

    this.successMessage = '';

    this.savingGuestId =
        draggedGuest.id;


    try {

      /*
       * Salvam intreaga ordine a mesei.
       */
      await this.saveTableOrder(
          targetGuests,
          targetTableNumber
      );


      /*
       * Daca vine de la alta masa,
       * renumerotam si masa veche.
       */
      if (
          oldTableNumber !== undefined
          &&
          oldTableNumber !==
          targetTableNumber
      ) {

        const oldTableGuests =
            this
                .getGuestsAtTable(
                    allGuests,
                    oldTableNumber
                )
                .filter(
                    guest =>
                        guest.id !==
                        draggedGuest.id
                );


        await this.saveTableOrder(
            oldTableGuests,
            oldTableNumber
        );
      }


      this.successMessage =
          `${draggedGuest.name} a fost mutat(ă) la masa ${targetTableNumber}.`;

    } catch (error) {

      console.error(error);


      this.errorMessage =
          'Nu am putut salva așezarea. Verifică permisiunile Firestore.';

    } finally {

      this.savingGuestId =
          null;
    }
  }


  /**
   * Renumeroteaza invitatii:
   *
   * 0, 1, 2, 3...
   *
   * si salveaza totul in Firestore.
   */
  private async saveTableOrder(
      guests: WeddingGuest[],
      tableNumber: number
  ): Promise<void> {

    for (
        let index = 0;
        index < guests.length;
        index++
    ) {

      const guest =
          guests[index];


      await this.guestsService
          .saveGuest({
            ...guest,

            tableNumber,

            tableOrder:
            index
          });
    }
  }


  async dropUnassigned(
      event: DragEvent
  ): Promise<void> {

    event.preventDefault();

    event.stopPropagation();


    if (!this.draggedGuest) {

      return;
    }


    const dragged =
        this.draggedGuest;


    await this.moveGuest(
        dragged,
        undefined
    );


    this.draggedGuest =
        null;
  }


  /**
   * Folosit in principal de butonul X
   * pentru scoaterea invitatului de la masa.
   */
  async moveGuest(
      guest: WeddingGuest,
      tableNumber:
          number | undefined
  ): Promise<void> {

    if (!guest.id) {

      return;
    }


    const oldTableNumber =
        guest.tableNumber
            ? Number(
                guest.tableNumber
            )
            : undefined;


    /*
     * Daca se cere aceeasi masa,
     * nu avem nimic de facut.
     */
    if (
        tableNumber !== undefined
        &&
        oldTableNumber === tableNumber
    ) {

      return;
    }


    this.savingGuestId =
        guest.id;


    this.errorMessage = '';

    this.successMessage = '';


    try {

      /*
       * Scoatere de la masa.
       */
      if (
          tableNumber === undefined
      ) {

        await this.guestsService
            .saveGuest({
              ...guest,

              tableNumber:
              undefined,

              tableOrder:
              undefined
            });


        /*
         * Renumerotam masa veche.
         */
        if (
            oldTableNumber !==
            undefined
        ) {

          const allGuests =
              await firstValueFrom(
                  this.guests$
              );


          const remaining =
              this
                  .getGuestsAtTable(
                      allGuests,
                      oldTableNumber
                  )
                  .filter(
                      item =>
                          item.id !==
                          guest.id
                  );


          await this.saveTableOrder(
              remaining,
              oldTableNumber
          );
        }


        this.successMessage =
            `${guest.name} a fost scos/scoasă de la masă.`;

        return;
      }


      /*
       * Fallback pentru eventuale apeluri
       * viitoare moveGuest(guest, masa).
       *
       * Invitatorul se pune la final.
       */
      const allGuests =
          await firstValueFrom(
              this.guests$
          );


      await this.placeGuestAtTable(
          guest,
          tableNumber,
          allGuests,
          null
      );

    } catch (error) {

      console.error(error);


      this.errorMessage =
          'Nu am putut salva așezarea. Verifică permisiunile Firestore.';

    } finally {

      this.savingGuestId =
          null;
    }
  }


  // ============================================================
  // ADD ELEMENTS
  // ============================================================


  addTable():
      void {

    const tableNumberInput =
        window.prompt(
            'Numărul mesei:',
            String(
                this.getNextTableNumber()
            )
        );


    if (
        tableNumberInput === null
    ) {

      return;
    }


    const tableNumber =
        Number(
            tableNumberInput.trim()
        );


    if (
        !Number.isInteger(
            tableNumber
        )
        ||
        tableNumber <= 0
    ) {

      this.errorMessage =
          'Numărul mesei trebuie să fie un număr întreg mai mare decât 0.';

      return;
    }


    if (
        this
            .getTables()
            .some(
                table =>
                    table.tableNumber ===
                    tableNumber
            )
    ) {

      this.errorMessage =
          `Există deja masa ${tableNumber}.`;

      return;
    }


    const capacityInput =
        window.prompt(
            'Capacitatea mesei:',
            '16'
        );


    if (
        capacityInput === null
    ) {

      return;
    }


    const capacity =
        Number(
            capacityInput.trim()
        );


    if (
        !Number.isInteger(capacity)
        ||
        capacity <= 0
    ) {

      this.errorMessage =
          'Capacitatea trebuie să fie un număr întreg mai mare decât 0.';

      return;
    }


    const position =
        this.getNextElementPosition();


    const table:
        FloorElement = {

      id:
          this.createId(),

      type:
          'table',

      label:
          `Masa ${tableNumber}`,

      tableNumber,

      capacity,

      x:
      position.x,

      y:
      position.y,

      width:
          230,

      height:
          220
    };


    this.addFloorElement(
        table
    );


    this.errorMessage =
        '';


    this.successMessage =
        `Masa ${tableNumber} a fost adăugată.`;
  }


  addRectangle():
      void {

    const label =
        window.prompt(
            'Textul dreptunghiului:',
            'DJ'
        )?.trim()
        ||
        'Dreptunghi';


    const position =
        this.getNextElementPosition();


    this.addFloorElement({

      id:
          this.createId(),

      type:
          'rectangle',

      label,

      x:
      position.x,

      y:
      position.y,

      width:
          300,

      height:
          110
    });
  }


  addSquare():
      void {

    const label =
        window.prompt(
            'Textul pătratului:',
            'Element'
        )?.trim()
        ||
        'Element';


    const position =
        this.getNextElementPosition();


    this.addFloorElement({

      id:
          this.createId(),

      type:
          'square',

      label,

      x:
      position.x,

      y:
      position.y,

      width:
          150,

      height:
          150
    });
  }


  addArrow():
      void {

    const label =
        window.prompt(
            'Textul săgeții:',
            'INTRARE'
        )?.trim()
        ||
        '';


    const position =
        this.getNextElementPosition();


    this.addFloorElement({

      id:
          this.createId(),

      type:
          'arrow',

      label,

      x:
      position.x,

      y:
      position.y,

      width:
          220,

      height:
          90
    });
  }


  addText():
      void {

    const label =
        window.prompt(
            'Introdu textul:',
            'Text'
        );


    if (
        label === null
    ) {

      return;
    }


    const position =
        this.getNextElementPosition();


    this.addFloorElement({

      id:
          this.createId(),

      type:
          'text',

      label:
          label.trim()
          ||
          'Text',

      x:
      position.x,

      y:
      position.y,

      width:
          180,

      height:
          60
    });
  }


  private addFloorElement(
      element: FloorElement
  ): void {

    this.floorElements = [
      ...this.floorElements,
      element
    ];


    this.selectedElementId =
        element.id;


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


    this.selectedElementId =
        element.id;


    this.selectedElementDraft = {
      ...element
    };
  }


  clearSelection():
      void {

    this.selectedElementId =
        null;


    this.selectedElementDraft =
        null;
  }


  getSelectedElement():
      FloorElement | undefined {

    return this.floorElements.find(
        element =>
            element.id ===
            this.selectedElementId
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


  async saveSelectedElement():
      Promise<void> {

    if (
        !this.selectedElementId
        ||
        !this.selectedElementDraft
    ) {

      return;
    }


    const currentIndex =
        this.floorElements.findIndex(
            element =>
                element.id ===
                this.selectedElementId
        );


    if (
        currentIndex === -1
    ) {

      return;
    }


    const current =
        this.floorElements[
            currentIndex
            ];


    const draft =
        this.selectedElementDraft;


    this.errorMessage =
        '';


    this.successMessage =
        '';


    const oldTableNumber =
        current.type === 'table'
            ? Number(
                current.tableNumber
            )
            : undefined;


    const updated:
        FloorElement = {

      ...current,

      ...draft
    };


    let didSwap =
        false;


    // ============================================================
    // TABLE
    // ============================================================


    if (
        updated.type === 'table'
    ) {

      const newTableNumber =
          Number(
              draft.tableNumber
          );


      const newCapacity =
          Number(
              draft.capacity
          );


      if (
          !Number.isInteger(
              newTableNumber
          )
          ||
          newTableNumber <= 0
      ) {

        this.errorMessage =
            'Numărul mesei trebuie să fie un număr întreg mai mare decât 0.';

        return;
      }


      if (
          !Number.isInteger(
              newCapacity
          )
          ||
          newCapacity <= 0
      ) {

        this.errorMessage =
            'Capacitatea trebuie să fie un număr întreg mai mare decât 0.';

        return;
      }


      if (
          oldTableNumber ===
          newTableNumber
      ) {

        updated.tableNumber =
            newTableNumber;


        updated.capacity =
            newCapacity;


        updated.label =
            `Masa ${newTableNumber}`;

      } else {

        const conflictingTableIndex =
            this.floorElements.findIndex(
                element =>
                    element.type ===
                    'table'
                    &&
                    element.id !==
                    current.id
                    &&
                    element.tableNumber ===
                    newTableNumber
            );


        /*
         * Masa noua exista -> SWAP.
         */
        if (
            conflictingTableIndex !== -1
            &&
            oldTableNumber !== undefined
        ) {

          const conflictingTable =
              this.floorElements[
                  conflictingTableIndex
                  ];


          const guests =
              await firstValueFrom(
                  this.guests$
              );


          const guestsAtCurrentTable =
              guests.filter(
                  guest =>
                      Number(
                          guest.tableNumber
                      ) ===
                      oldTableNumber
              );


          const guestsAtConflictingTable =
              guests.filter(
                  guest =>
                      Number(
                          guest.tableNumber
                      ) ===
                      newTableNumber
              );


          try {

            for (
                const guest
                of guestsAtCurrentTable
                ) {

              await this.guestsService
                  .saveGuest({
                    ...guest,

                    tableNumber:
                    newTableNumber
                  });
            }


            for (
                const guest
                of guestsAtConflictingTable
                ) {

              await this.guestsService
                  .saveGuest({
                    ...guest,

                    tableNumber:
                    oldTableNumber
                  });
            }

          } catch (error) {

            console.error(error);


            this.errorMessage =
                'Nu am putut inversa mesele. Verifică permisiunile Firestore.';

            return;
          }


          const swappedOtherTable:
              FloorElement = {

            ...conflictingTable,

            tableNumber:
            oldTableNumber,

            label:
                `Masa ${oldTableNumber}`
          };


          updated.tableNumber =
              newTableNumber;


          updated.capacity =
              newCapacity;


          updated.label =
              `Masa ${newTableNumber}`;


          const newElements = [
            ...this.floorElements
          ];


          newElements[
              currentIndex
              ] =
              updated;


          newElements[
              conflictingTableIndex
              ] =
              swappedOtherTable;


          this.floorElements =
              newElements;


          didSwap =
              true;

        } else {

          /*
           * Numar nou liber -> rename normal.
           */
          const guests =
              await firstValueFrom(
                  this.guests$
              );


          const guestsAtOldTable =
              oldTableNumber !== undefined

                  ? guests.filter(
                      guest =>
                          Number(
                              guest.tableNumber
                          ) ===
                          oldTableNumber
                  )

                  : [];


          try {

            for (
                const guest
                of guestsAtOldTable
                ) {

              await this.guestsService
                  .saveGuest({
                    ...guest,

                    tableNumber:
                    newTableNumber
                  });
            }

          } catch (error) {

            console.error(error);


            this.errorMessage =
                'Nu am putut modifica numărul mesei. Verifică permisiunile Firestore.';

            return;
          }


          updated.tableNumber =
              newTableNumber;


          updated.capacity =
              newCapacity;


          updated.label =
              `Masa ${newTableNumber}`;
        }
      }

    } else {

      // ==========================================================
      // OTHER ELEMENTS
      // ==========================================================

      updated.label =
          String(
              draft.label ?? ''
          ).trim()
          ||
          'Element';
    }


    // ============================================================
    // DIMENSIONS
    // ============================================================


    const minimumWidth =
        updated.type === 'table'
            ? 190
            : 60;


    const minimumHeight =
        updated.type === 'table'
            ? 150
            : 40;


    updated.width =
        Math.max(
            minimumWidth,

            Number(
                draft.width
            )
            ||
            minimumWidth
        );


    updated.height =
        Math.max(
            minimumHeight,

            Number(
                draft.height
            )
            ||
            minimumHeight
        );


    /*
     * Pastram pozitia curenta.
     */
    updated.x =
        current.x;


    updated.y =
        current.y;


    if (!didSwap) {

      this.floorElements =
          this.floorElements.map(
              element =>
                  element.id ===
                  current.id

                      ? updated

                      : element
          );

    } else {

      this.floorElements =
          this.floorElements.map(
              element =>
                  element.id ===
                  current.id

                      ? {
                        ...element,

                        capacity:
                        updated.capacity,

                        width:
                        updated.width,

                        height:
                        updated.height,

                        label:
                        updated.label
                      }

                      : element
          );
    }


    const savedElement =
        this.floorElements.find(
            element =>
                element.id ===
                current.id
        );


    if (savedElement) {

      this.selectedElementDraft = {
        ...savedElement
      };
    }


    this.saveFloorPlan();


    if (
        updated.type === 'table'
        &&
        oldTableNumber !==
        undefined
        &&
        oldTableNumber !==
        Number(
            draft.tableNumber
        )
    ) {

      this.successMessage =
          didSwap

              ? `Mesele ${oldTableNumber} și ${Number(draft.tableNumber)} au fost inversate.`

              : `${updated.label} a fost salvată.`;

    } else {

      this.successMessage =
          updated.type === 'table'

              ? `${updated.label} a fost salvată.`

              : 'Modificările au fost salvate.';
    }
  }


  // ============================================================
  // MOVE
  // ============================================================


  startElementDrag(
      event: MouseEvent,
      element: FloorElement
  ): void {

    if (
        event.button !== 0
    ) {

      return;
    }


    const target =
        event.target as HTMLElement;


    if (
        target.closest(
            '.resize-handle'
        )
        ||
        target.closest(
            'button'
        )
        ||
        target.closest(
            'input'
        )
        ||
        target.closest(
            '.guest-card'
        )
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

      elementId:
      element.id,

      startMouseX:
      event.clientX,

      startMouseY:
      event.clientY,

      startX:
      element.x,

      startY:
      element.y
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

      elementId:
      element.id,

      startMouseX:
      event.clientX,

      startMouseY:
      event.clientY,

      startWidth:
      element.width,

      startHeight:
      element.height
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

      this.moveElementWithMouse(
          event
      );
    }


    if (this.resizeState) {

      this.resizeElementWithMouse(
          event
      );
    }
  }


  @HostListener(
      'document:mouseup'
  )
  onDocumentMouseUp():
      void {

    const changed =
        !!this.dragState
        ||
        !!this.resizeState;


    this.dragState =
        null;


    this.resizeState =
        null;


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
                this.dragState
                    ?.elementId
        );


    if (!element) {

      return;
    }


    const deltaX =
        event.clientX
        -
        this.dragState.startMouseX;


    const deltaY =
        event.clientY
        -
        this.dragState.startMouseY;


    element.x =
        Math.max(
            0,

            Math.min(
                this.dragState.startX
                +
                deltaX,

                this.canvasWidth
                -
                element.width
            )
        );


    element.y =
        Math.max(
            0,

            Math.min(
                this.dragState.startY
                +
                deltaY,

                this.canvasHeight
                -
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
                this.resizeState
                    ?.elementId
        );


    if (!element) {

      return;
    }


    const deltaX =
        event.clientX
        -
        this.resizeState.startMouseX;


    const deltaY =
        event.clientY
        -
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


    element.width =
        Math.max(
            minimumWidth,

            Math.min(
                this.resizeState
                    .startWidth
                +
                deltaX,

                this.canvasWidth
                -
                element.x
            )
        );


    element.height =
        Math.max(
            minimumHeight,

            Math.min(
                this.resizeState
                    .startHeight
                +
                deltaY,

                this.canvasHeight
                -
                element.y
            )
        );
  }


  private syncDraftFromSelected():
      void {

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


  async deleteSelectedElement():
      Promise<void> {

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
        element.type === 'table'
        &&
        element.tableNumber !==
        undefined
    ) {

      const guests =
          await firstValueFrom(
              this.guests$
          );


      const assigned =
          guests.filter(
              guest =>
                  Number(
                      guest.tableNumber
                  )
                  ===
                  element.tableNumber
          );


      for (
          const guest
          of assigned
          ) {

        await this.guestsService
            .saveGuest({
              ...guest,

              tableNumber:
              undefined,

              tableOrder:
              undefined
            });
      }
    }


    this.floorElements =
        this.floorElements.filter(
            item =>
                item.id !==
                element.id
        );


    this.selectedElementId =
        null;


    this.selectedElementDraft =
        null;


    this.saveFloorPlan();


    this.successMessage =
        'Elementul a fost șters.';
  }


  // ============================================================
  // RESET
  // ============================================================


  async clearAllAssignments():
      Promise<void> {

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
            guest =>
                !!guest.tableNumber
        );


    for (
        const guest
        of assigned
        ) {

      await this.guestsService
          .saveGuest({
            ...guest,

            tableNumber:
            undefined,

            tableOrder:
            undefined
          });
    }


    this.successMessage =
        'Toate așezările au fost resetate.';
  }


  clearFloorPlan():
      void {

    const confirmed =
        window.confirm(
            'Sigur vrei să ștergi toate elementele din planul sălii?'
        );


    if (!confirmed) {

      return;
    }


    this.floorElements = [];


    this.selectedElementId =
        null;


    this.selectedElementDraft =
        null;


    this.saveFloorPlan();


    this.successMessage =
        'Planul sălii a fost golit.';
  }


  // ============================================================
  // LOCAL STORAGE
  // ============================================================


  private saveFloorPlan():
      void {

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


  private loadFloorPlan():
      void {

    try {

      const raw =
          localStorage.getItem(
              this.layoutStorageKey
          );


      if (!raw) {

        this.floorElements =
            [];

        return;
      }


      const parsed =
          JSON.parse(raw);


      if (
          !Array.isArray(parsed)
      ) {

        this.floorElements =
            [];

        return;
      }


      this.floorElements =
          parsed.map(
              element => {

                const item =
                    element as FloorElement;


                if (
                    item.type === 'table'
                ) {

                  item.width =
                      Math.max(
                          190,

                          Number(
                              item.width
                          )
                          ||
                          230
                      );


                  item.height =
                      Math.max(
                          150,

                          Number(
                              item.height
                          )
                          ||
                          220
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


      this.floorElements =
          [];
    }
  }


  // ============================================================
  // HELPERS
  // ============================================================


  private getNextTableNumber():
      number {

    const usedNumbers =
        this
            .getTables()
            .map(
                table =>
                    table.tableNumber
            )
            .filter(
                (
                    number
                ): number is number =>
                    typeof number ===
                    'number'
            );


    let number =
        1;


    while (
        usedNumbers.includes(
            number
        )
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

      x:
          35
          +
          (index % 6)
          *
          40,

      y:
          35
          +
          (index % 7)
          *
          40
    };
  }


  private createId():
      string {

    return (
        Date.now()
            .toString(36)
        +
        '-'
        +
        Math.random()
            .toString(36)
            .slice(
                2,
                9
            )
    );
  }
}
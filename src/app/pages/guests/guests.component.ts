import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WEDDING_GUESTS } from '../../data/wedding-data';
import {
  GuestAccommodationStatus,
  GuestAttendanceStatus,
  GuestInvitationStatus,
  GuestMenuType,
  GuestSide,
  WeddingGuest
} from '../../models/wedding-data.model';
import { FirebaseGuestsService } from '../../services/firebase-guests.service';
import { EditSafetyService } from '../../core/edit-safety/edit-safety.service';

type GuestView = 'overview' | 'details';

interface GuestGroupOverview {
  name: string;
  guests: WeddingGuest[];
  rows: number;
  people: number;
  confirmedPeople: number;
  pendingRows: number;
  accommodationPeople: number;
  unassignedPeople: number;

  children: number;
  childrenUnder5: number;
  children5To8: number;
  children8To12: number;
  children13To17: number;
  unspecifiedChildren: number;
}

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent {
  private readonly guestsService = inject(FirebaseGuestsService);
  private readonly editSafety = inject(EditSafetyService);

  guests$ = this.guestsService.getGuests();

  readonly adultMenuPrice = 130;
  readonly childUnder5Price = 0;
  readonly child5To8Price = 13;
  readonly child8To12Price = 38;
  readonly child13To17Price = 130;
  readonly unspecifiedChildPrice = 38;
  readonly menuCurrency = 'EUR';

  currentView: GuestView = 'overview';
  expandedGuestId: string | null = null;
  editingGuestId: string | null = null;

  searchTerm = '';

  sideFilter: GuestSide | 'all' = 'all';
  attendanceFilter: GuestAttendanceStatus | 'all' = 'all';
  invitationFilter: GuestInvitationStatus | 'all' = 'all';
  accommodationFilter: GuestAccommodationStatus | 'all' = 'all';

  groupFilter = 'all';

  isAddingGuest = false;
  savingGuestId: string | null = null;
  isSyncingGuests = false;

  message = '';
  errorMessage = '';

  readonly sideOptions: {
    value: GuestSide;
    label: string;
  }[] = [
    { value: 'Diana', label: 'Diana' },
    { value: 'Dan', label: 'Dan' },
    { value: 'Both', label: 'Amândoi' }
  ];

  readonly invitationOptions: {
    value: GuestInvitationStatus;
    label: string;
  }[] = [
    { value: 'unknown', label: 'Necunoscut' },
    { value: 'not-given', label: 'Nedată' },
    { value: 'given', label: 'Dată' }
  ];

  readonly attendanceOptions: {
    value: GuestAttendanceStatus;
    label: string;
  }[] = [
    { value: 'confirmed', label: 'Confirmat' },
    { value: 'pending', label: 'În așteptare' },
    { value: 'maybe', label: 'Poate' },
    { value: 'declined', label: 'Refuzat' }
  ];

  readonly accommodationOptions: {
    value: GuestAccommodationStatus;
    label: string;
  }[] = [
    { value: 'unknown', label: 'Necunoscut' },
    { value: 'needed', label: 'Are nevoie' },
    { value: 'booked', label: 'Rezervată' },
    { value: 'not-needed', label: 'Nu are nevoie' }
  ];

  readonly menuOptions: {
    value: GuestMenuType;
    label: string;
  }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'children', label: 'Copil' },
    { value: 'other', label: 'Altul' }
  ];

  newGuest: Omit<WeddingGuest, 'id'> =
      this.createEmptyGuest();

  setView(view: GuestView): void {
    this.currentView = view;

    if (view === 'overview') {
      this.editingGuestId = null;
    }
  }

  openGuestEditor(guestId: string): void {
    this.editingGuestId = guestId;
    this.currentView = 'details';

    queueMicrotask(() =>
        document
            .querySelector('.single-guest-editor')
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
    );
  }

  closeGuestEditor(): void {
    this.editingGuestId = null;
  }

  getEditingGuest(
      guests: WeddingGuest[]
  ): WeddingGuest | undefined {
    return guests.find(
        guest => guest.id === this.editingGuestId
    );
  }

  toggleGuest(guestId: string): void {
    this.expandedGuestId =
        this.expandedGuestId === guestId
            ? null
            : guestId;
  }

  getFilteredGuests(
      guests: WeddingGuest[]
  ): WeddingGuest[] {
    const term =
        this.searchTerm
            .trim()
            .toLocaleLowerCase('ro');

    return [...guests]
        .filter(guest => {
          const searchable = [
            guest.name,
            guest.phone,
            guest.email,
            guest.groupName,
            guest.notes,
            guest.allergies
          ]
              .join(' ')
              .toLocaleLowerCase('ro');

          return (
              (!term || searchable.includes(term)) &&
              (
                  this.sideFilter === 'all' ||
                  guest.side === this.sideFilter
              ) &&
              (
                  this.attendanceFilter === 'all' ||
                  guest.attendanceStatus ===
                  this.attendanceFilter
              ) &&
              (
                  this.invitationFilter === 'all' ||
                  guest.invitationStatus ===
                  this.invitationFilter
              ) &&
              (
                  this.accommodationFilter === 'all' ||
                  (
                      guest.accommodationStatus ??
                      'unknown'
                  ) === this.accommodationFilter
              ) &&
              (
                  this.groupFilter === 'all' ||
                  (guest.groupName ?? '') ===
                  this.groupFilter
              )
          );
        })
        .sort(
            (a, b) =>
                a.name.localeCompare(b.name, 'ro')
        );
  }

  getGroupedGuests(
      guests: WeddingGuest[]
  ): GuestGroupOverview[] {
    const map =
        new Map<string, WeddingGuest[]>();

    for (
        const guest of
        this.getFilteredGuests(guests)
        ) {
      const group =
          guest.groupName?.trim() ||
          'Fără categorie';

      map.set(
          group,
          [
            ...(map.get(group) ?? []),
            guest
          ]
      );
    }

    return [...map.entries()]
        .sort(([a], [b]) =>
            a === 'Fără categorie'
                ? 1
                : b === 'Fără categorie'
                    ? -1
                    : a.localeCompare(b, 'ro')
        )
        .map(([name, groupGuests]) => {
          const childrenUnder5 =
              groupGuests.reduce(
                  (sum, guest) =>
                      sum +
                      Number(
                          guest.childrenUnder5 || 0
                      ),
                  0
              );

          const children5To8 =
              groupGuests.reduce(
                  (sum, guest) =>
                      sum +
                      Number(
                          guest.children5To8 || 0
                      ),
                  0
              );

          const children8To12 =
              groupGuests.reduce(
                  (sum, guest) =>
                      sum +
                      Number(
                          guest.children8To12 || 0
                      ),
                  0
              );

          const children13To17 =
              groupGuests.reduce(
                  (sum, guest) =>
                      sum +
                      Number(
                          guest.children13To17 || 0
                      ),
                  0
              );

          const children =
              groupGuests.reduce(
                  (sum, guest) =>
                      sum +
                      Number(
                          guest.children || 0
                      ),
                  0
              );

          const categorizedChildren =
              childrenUnder5 +
              children5To8 +
              children8To12 +
              children13To17;

          return {
            name,
            guests: groupGuests,

            rows: groupGuests.length,

            people: groupGuests.reduce(
                (sum, guest) =>
                    sum + this.getPeople(guest),
                0
            ),

            confirmedPeople:
                this.getConfirmedPeople(
                    groupGuests
                ),

            pendingRows:
                this.getPendingRows(
                    groupGuests
                ),

            accommodationPeople:
                this.getAccommodationNeeded(
                    groupGuests
                ),

            unassignedPeople:
                this.getUnassignedPeople(
                    groupGuests
                ),

            children,
            childrenUnder5,
            children5To8,
            children8To12,
            children13To17,

            unspecifiedChildren:
                Math.max(
                    0,
                    children -
                    categorizedChildren
                )
          };
        });
  }

  getGroupIcon(groupName: string): string {
    const name =
        groupName.toLocaleLowerCase('ro');

    if (
        name.includes('părinti') ||
        name.includes('parinti')
    ) {
      return '👪';
    }

    if (name.includes('prieteni')) {
      return '♡';
    }

    if (name.includes('famil')) {
      return '⌂';
    }

    if (
        name.includes('colegi') ||
        name.includes('serviciu')
    ) {
      return '▣';
    }

    if (name.includes('copii')) {
      return '☆';
    }

    if (name === 'fără categorie') {
      return '•';
    }

    return (
        groupName
            .trim()
            .charAt(0)
            .toLocaleUpperCase('ro') ||
        '•'
    );
  }

  getGroups(
      guests: WeddingGuest[]
  ): string[] {
    return [
      ...new Set(
          guests
              .map(
                  guest =>
                      guest.groupName?.trim()
              )
              .filter(
                  (
                      value
                  ): value is string =>
                      !!value
              )
      )
    ].sort(
        (a, b) =>
            a.localeCompare(b, 'ro')
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sideFilter = 'all';
    this.attendanceFilter = 'all';
    this.invitationFilter = 'all';
    this.accommodationFilter = 'all';
    this.groupFilter = 'all';
  }

  async syncUpdatedGuestList():
      Promise<void> {
    if (
        !await this.editSafety
            .confirmAction(
                'Sincronizare invitați',
                'Câmpurile din Excel vor fi actualizate, iar datele completate în aplicație vor fi păstrate.',
                'Sincronizează'
            )
    ) {
      return;
    }

    this.isSyncingGuests = true;
    this.clearMessages();

    try {
      await this.guestsService
          .syncSpreadsheetGuests(
              WEDDING_GUESTS
          );

      this.message =
          `Lista a fost sincronizată: ${WEDDING_GUESTS.length} rânduri.`;
    } catch (error) {
      this.errorMessage =
          this.getErrorMessage(error);
    } finally {
      this.isSyncingGuests = false;
    }
  }

  async addGuest(): Promise<void> {
    if (!this.newGuest.name.trim()) {
      this.errorMessage =
          'Completează numele invitatului.';
      return;
    }

    this.syncChildrenTotal(
        this.newGuest
    );

    this.isAddingGuest = true;
    this.clearMessages();

    try {
      await this.guestsService
          .addGuest(this.newGuest);

      this.newGuest =
          this.createEmptyGuest();

      this.message =
          'Invitatul a fost adăugat.';
    } catch (error) {
      this.errorMessage =
          this.getErrorMessage(error);
    } finally {
      this.isAddingGuest = false;
    }
  }

  async saveGuest(
      guest: WeddingGuest
  ): Promise<void> {
    this.syncChildrenTotal(guest);

    this.savingGuestId = guest.id;
    this.clearMessages();

    try {
      await this.editSafety.run(
          `${guest.name}`,
          () =>
              this.guestsService
                  .saveGuest(guest),
          {
            action: 'update',
            entityType: 'Invitat',
            entityLabel: guest.name,
            details:
                'Datele invitatului au fost actualizate'
          }
      );

      this.message =
          `${guest.name} a fost salvat(ă).`;
    } catch (error) {
      this.errorMessage =
          this.getErrorMessage(error);
    } finally {
      this.savingGuestId = null;
    }
  }

  async deleteGuest(
      guest: WeddingGuest
  ): Promise<void> {
    if (
        !await this.editSafety
            .confirmDelete(
                guest.name,
                'Invitatul va fi șters din lista nunții.'
            )
    ) {
      return;
    }

    this.clearMessages();

    try {
      await this.editSafety.run(
          `Ștergere ${guest.name}`,
          () =>
              this.guestsService
                  .deleteGuest(guest.id),
          {
            action: 'delete',
            entityType: 'Invitat',
            entityLabel: guest.name
          }
      );

      this.message =
          'Invitatul a fost șters.';
    } catch (error) {
      this.errorMessage =
          this.getErrorMessage(error);
    }
  }

  queueGuestSave(
      guest: WeddingGuest
  ): void {
    this.syncChildrenTotal(guest);

    this.editSafety.schedule(
        `guest-${guest.id}`,
        guest.name || 'Invitat',
        () =>
            this.guestsService
                .saveGuest(guest),
        {
          action: 'update',
          entityType: 'Invitat',
          entityLabel:
              guest.name || 'Invitat',
          details: 'Salvare automată'
        }
    );
  }

  onChildCountChange(
      guest: WeddingGuest
  ): void {
    this.syncChildrenTotal(guest);
    this.queueGuestSave(guest);
  }

  onNewChildCountChange(): void {
    this.syncChildrenTotal(
        this.newGuest
    );
  }

  exportCsv(
      guests: WeddingGuest[]
  ): void {
    const rows =
        this.getFilteredGuests(guests)
            .map(guest => [
              guest.name,
              guest.adults,
              guest.children,
              guest.childrenUnder5 ?? 0,
              guest.children5To8 ?? 0,
              guest.children8To12 ?? 0,
              guest.children13To17 ?? 0,
              this.getSideLabel(
                  guest.side
              ),
              this.getInvitationLabel(
                  guest.invitationStatus
              ),
              this.getAttendanceLabel(
                  guest.attendanceStatus
              ),
              this.getAccommodationLabel(
                  guest.accommodationStatus ??
                  'unknown'
              ),
              this.getMenuLabel(
                  guest.menuType ??
                  'standard'
              ),
              guest.tableNumber ?? '',
              guest.phone ?? '',
              guest.email ?? '',
              guest.allergies ?? '',
              guest.transportNeeded
                  ? 'Da'
                  : 'Nu',
              guest.groupName ?? '',
              guest.notes ?? '',
              this.getGuestMenuTotal(
                  guest
              )
            ]);

    const header = [
      'Nume',
      'Adulți',
      'Copii total',
      'Copii sub 5',
      'Copii 5-8',
      'Copii 8-12',
      'Copii 13-17',
      'Partea',
      'Invitație',
      'Confirmare',
      'Cazare',
      'Meniu',
      'Masa',
      'Telefon',
      'Email',
      'Alergii',
      'Transport',
      'Grup',
      'Observații',
      'Cost estimat EUR'
    ];

    const csv =
        [header, ...rows]
            .map(row =>
                row
                    .map(value =>
                        `"${String(value)
                            .replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(',')
            )
            .join('\r\n');

    const blob =
        new Blob(
            ['\uFEFF' + csv],
            {
              type:
                  'text/csv;charset=utf-8'
            }
        );

    const url =
        URL.createObjectURL(blob);

    const anchor =
        document.createElement('a');

    anchor.href = url;
    anchor.download =
        'lista-invitati-filtrata.csv';

    anchor.click();

    URL.revokeObjectURL(url);
  }

  getPeople(
      guest: WeddingGuest
  ): number {
    return (
        Number(guest.adults || 0) +
        Number(guest.children || 0)
    );
  }

  getGivenInvitations(
      guests: WeddingGuest[]
  ): number {
    return guests.filter(
        guest =>
            guest.invitationStatus ===
            'given'
    ).length;
  }

  getConfirmedRows(
      guests: WeddingGuest[]
  ): number {
    return guests.filter(
        guest =>
            guest.attendanceStatus ===
            'confirmed'
    ).length;
  }

  getConfirmedPeople(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed'
        )
        .reduce(
            (sum, guest) =>
                sum +
                this.getPeople(guest),
            0
        );
  }

  getPendingRows(
      guests: WeddingGuest[]
  ): number {
    return guests.filter(
        guest =>
            guest.attendanceStatus ===
            'pending' ||
            guest.attendanceStatus ===
            'maybe'
    ).length;
  }

  getAccommodationNeeded(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.accommodationStatus ===
                'needed' ||
                guest.accommodationStatus ===
                'booked'
        )
        .reduce(
            (sum, guest) =>
                sum +
                this.getPeople(guest),
            0
        );
  }

  getUnassignedPeople(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed' &&
                !guest.tableNumber
        )
        .reduce(
            (sum, guest) =>
                sum +
                this.getPeople(guest),
            0
        );
  }

  getAdultMenuCount(
      guest: WeddingGuest
  ): number {
    return guest.attendanceStatus ===
    'declined'
        ? 0
        : Number(
        guest.adults
    ) || 0;
  }

  getChildMenuCount(
      guest: WeddingGuest
  ): number {
    return guest.attendanceStatus ===
    'declined'
        ? 0
        : Number(
        guest.children
    ) || 0;
  }

  getCalculatedMenus(
      guest: WeddingGuest
  ): number {
    return (
        this.getAdultMenuCount(guest) +
        this.getChildMenuCount(guest)
    );
  }

  getGuestMenuTotal(
      guest: WeddingGuest
  ): number {
    if (
        guest.attendanceStatus ===
        'declined'
    ) {
      return 0;
    }

    const categorized =
        this.getCategorizedChildren(
            guest
        );

    const unspecified =
        Math.max(
            0,
            Number(
                guest.children || 0
            ) - categorized
        );

    return (
        this.getAdultMenuCount(guest) *
        this.adultMenuPrice +

        Number(
            guest.childrenUnder5 || 0
        ) *
        this.childUnder5Price +

        Number(
            guest.children5To8 || 0
        ) *
        this.child5To8Price +

        Number(
            guest.children8To12 || 0
        ) *
        this.child8To12Price +

        Number(
            guest.children13To17 || 0
        ) *
        this.child13To17Price +

        unspecified *
        this.unspecifiedChildPrice
    );
  }

  getConfirmedMenus(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed'
        )
        .reduce(
            (sum, guest) =>
                sum +
                this.getCalculatedMenus(
                    guest
                ),
            0
        );
  }

  getConfirmedMenuCost(
      guests: WeddingGuest[]
  ): number {
    return guests
        .filter(
            guest =>
                guest.attendanceStatus ===
                'confirmed'
        )
        .reduce(
            (sum, guest) =>
                sum +
                this.getGuestMenuTotal(
                    guest
                ),
            0
        );
  }

  getUnspecifiedChildren(
      guests: WeddingGuest[]
  ): number {
    return guests.reduce(
        (sum, guest) =>
            sum +
            Math.max(
                0,
                Number(
                    guest.children || 0
                ) -
                this.getCategorizedChildren(
                    guest
                )
            ),
        0
    );
  }

  getUnspecifiedChildrenForGuest(
      guest: WeddingGuest
  ): number {
    return Math.max(
        0,
        Number(
            guest.children || 0
        ) -
        this.getCategorizedChildren(
            guest
        )
    );
  }

  getAdultLabel(count: number): string {
    return count === 1 ? 'adult' : 'adulți';
  }

  getChildLabel(count: number): string {
    return count === 1 ? 'copil' : 'copii';
  }

  getSideLabel(
      value: GuestSide
  ): string {
    return (
        this.sideOptions.find(
            option =>
                option.value === value
        )?.label ?? value
    );
  }

  getInvitationLabel(
      value: GuestInvitationStatus
  ): string {
    return (
        this.invitationOptions.find(
            option =>
                option.value === value
        )?.label ?? value
    );
  }

  getAttendanceLabel(
      value: GuestAttendanceStatus
  ): string {
    return (
        this.attendanceOptions.find(
            option =>
                option.value === value
        )?.label ?? value
    );
  }

  getAccommodationLabel(
      value: GuestAccommodationStatus
  ): string {
    return (
        this.accommodationOptions.find(
            option =>
                option.value === value
        )?.label ?? value
    );
  }

  getMenuLabel(
      value: GuestMenuType
  ): string {
    return (
        this.menuOptions.find(
            option =>
                option.value === value
        )?.label ?? value
    );
  }

  private getCategorizedChildren(
      guest: Partial<WeddingGuest>
  ): number {
    return (
        Number(
            guest.childrenUnder5 || 0
        ) +
        Number(
            guest.children5To8 || 0
        ) +
        Number(
            guest.children8To12 || 0
        ) +
        Number(
            guest.children13To17 || 0
        )
    );
  }

  private syncChildrenTotal(
      guest: Partial<WeddingGuest>
  ): void {
    const categorized =
        this.getCategorizedChildren(
            guest
        );

    if (categorized > 0) {
      guest.children =
          categorized;
    }
  }

  private createEmptyGuest():
      Omit<WeddingGuest, 'id'> {
    return {
      name: '',
      side: 'Both',
      invitationStatus:
          'unknown',
      attendanceStatus:
          'pending',
      adults: 1,
      children: 0,

      childrenUnder5: 0,
      children5To8: 0,
      children8To12: 0,
      children13To17: 0,

      groupName: '',
      tableNumber: undefined,

      phone: '',
      email: '',

      accommodationStatus:
          'unknown',

      menuType:
          'standard',

      allergies: '',

      transportNeeded: false,

      notes: '',

      isManual: true
    };
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }

  private getErrorMessage(
      error: unknown
  ): string {
    const message =
        error instanceof Error
            ? error.message
            : String(error);

    return message.includes(
        'permission'
    )
        ? 'Nu ai permisiunea necesară în Firestore. Verifică autentificarea și regulile.'
        : message;
  }
}



import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  getDocs
} from '@angular/fire/firestore';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

import {
  WeddingExpense,
  WeddingGuest,
  WeddingTask,
  WeddingVendor
} from '../models/wedding-data.model';


interface ExtendedWeddingGuest
    extends WeddingGuest {

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


interface WeddingDayTimelineExportItem {
  id: string;

  time: string;
  title: string;

  owner?: string;
  location?: string;
  phone?: string;
  notes?: string;

  status?: 'todo' | 'done';

  sortOrder?: number;

  source?: 'manual' | 'vendor';
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


interface SeatingFloorElement {

  id: string;

  type:
      | 'table'
      | 'rectangle'
      | 'square'
      | 'arrow'
      | 'text';

  label: string;

  x: number;
  y: number;

  width: number;
  height: number;

  tableNumber?: number;

  capacity?: number;
}


@Injectable({
  providedIn: 'root'
})
export class ExportBackupService {

  private readonly firestore =
      inject(Firestore);


  // ============================================================
  // FIRESTORE COLLECTIONS INCLUDED IN BACKUP
  // ============================================================

  readonly backupCollections = [

    'weddingGuests',

    'weddingVendors',

    'weddingExpenses',

    'weddingDrinks',

    'weddingDocuments',

    'weddingTasks',

    'weddingDayTimeline',

    'weddingAccommodations',

    'weddingPreparations',

    'weddingRings',

    'guestUpdates',

    'appAccess'

  ];


  // ============================================================
  // INVITAȚI
  // ============================================================

  async exportGuestsExcel():
      Promise<void> {

    const guests =
        await this.readCollection<ExtendedWeddingGuest>(
            'weddingGuests'
        );

    this.downloadWorkbook(
        [
          {
            name: 'Invitati',

            rows:
                this.guestRows(
                    guests
                ),

            widths: [
              24,
              10,
              14,
              14,
              9,
              9,
              10,
              16,
              18,
              18,
              18,
              22,
              18,
              18,
              32
            ]
          }
        ],

        `invitati-${this.fileDate()}.xlsx`
    );
  }


  // ============================================================
  // PROGRAM ZIUA NUNȚII
  // ============================================================

  // ============================================================
// PROGRAM ZIUA NUNȚII - PDF
// ============================================================

  async exportWeddingDayTimelinePdf(): Promise<void> {

    const timeline =
        await this.readCollection<WeddingDayTimelineExportItem>(
            'weddingDayTimeline'
        );

    const items =
        timeline
            .slice()
            .sort((a, b) => {

              const orderA =
                  Number(a.sortOrder);

              const orderB =
                  Number(b.sortOrder);

              if (
                  Number.isFinite(orderA) &&
                  Number.isFinite(orderB) &&
                  orderA !== orderB
              ) {
                return orderA - orderB;
              }

              return (
                  a.time ?? ''
              ).localeCompare(
                  b.time ?? '',
                  'ro'
              );
            });


    const pdf =
        new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });


    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const marginX = 16;

    const contentWidth =
        pageWidth - marginX * 2;


    // ==========================================================
    // HEADER
    // ==========================================================

    pdf.setTextColor(
        70,
        55,
        43
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(
        21
    );

    pdf.text(
        'Programul zilei nuntii',
        marginX,
        20
    );


    pdf.setFont(
        'helvetica',
        'normal'
    );

    pdf.setFontSize(
        10
    );

    pdf.setTextColor(
        135,
        112,
        88
    );

    pdf.text(
        'Diana & Dan - 5 Septembrie 2026',
        marginX,
        27
    );


    pdf.setFontSize(
        8
    );

    pdf.setTextColor(
        160,
        145,
        130
    );

    pdf.text(
        `Generat la ${new Date().toLocaleString('ro-RO')}`,
        marginX,
        33
    );


    // decorative line

    pdf.setDrawColor(
        199,
        170,
        136
    );

    pdf.setLineWidth(
        0.5
    );

    pdf.line(
        marginX,
        38,
        pageWidth - marginX,
        38
    );


    let y =
        48;


    // ==========================================================
    // EMPTY PROGRAM
    // ==========================================================

    if (
        items.length === 0
    ) {

      pdf.setFont(
          'helvetica',
          'normal'
      );

      pdf.setFontSize(
          11
      );

      pdf.setTextColor(
          100,
          90,
          80
      );

      pdf.text(
          'Nu exista momente adaugate in program.',
          marginX,
          y
      );

      pdf.save(
          `program-ziua-nuntii-${this.fileDate()}.pdf`
      );

      return;
    }


    // ==========================================================
    // TIMELINE ITEMS
    // ==========================================================

    for (
        const item
        of items
        ) {

      const time =
          item.time ||
          '--:--';


      const title =
          item.title ||
          'Moment';


      const metaParts: string[] =
          [];


      if (
          item.owner
      ) {

        metaParts.push(
            `Responsabil: ${item.owner}`
        );

      }


      if (
          item.location
      ) {

        metaParts.push(
            `Locatie: ${item.location}`
        );

      }


      if (
          item.phone
      ) {

        metaParts.push(
            `Telefon: ${item.phone}`
        );

      }


      const metaText =
          metaParts.join(
              '   |   '
          );


      const notes =
          item.notes?.trim() ||
          '';


      // ----------------------------------------------------------
      // Calculate required height
      // ----------------------------------------------------------

      pdf.setFontSize(
          9
      );

      const titleLines =
          pdf.splitTextToSize(
              title,
              contentWidth - 38
          );


      const metaLines =
          metaText
              ? pdf.splitTextToSize(
                  metaText,
                  contentWidth - 38
              )
              : [];


      const noteLines =
          notes
              ? pdf.splitTextToSize(
                  notes,
                  contentWidth - 38
              )
              : [];


      let cardHeight =
          18;


      cardHeight +=
          Math.max(
              0,
              titleLines.length - 1
          ) * 4;


      cardHeight +=
          metaLines.length *
          4;


      if (
          notes
      ) {

        cardHeight +=
            noteLines.length *
            4 +
            4;

      }


      cardHeight =
          Math.max(
              27,
              cardHeight
          );


      // ----------------------------------------------------------
      // New page if needed
      // ----------------------------------------------------------

      if (
          y +
          cardHeight >
          pageHeight - 18
      ) {

        pdf.addPage();

        y =
            20;

      }


      // ----------------------------------------------------------
      // Timeline line
      // ----------------------------------------------------------

      pdf.setDrawColor(
          214,
          195,
          171
      );

      pdf.setLineWidth(
          0.6
      );

      pdf.line(
          marginX + 14,
          y,
          marginX + 14,
          y + cardHeight
      );


      // ----------------------------------------------------------
      // Timeline dot
      // ----------------------------------------------------------

      pdf.setFillColor(
          185,
          155,
          114
      );

      pdf.circle(
          marginX + 14,
          y + 9,
          2.2,
          'F'
      );


      // ----------------------------------------------------------
      // Time
      // ----------------------------------------------------------

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(
          11
      );

      pdf.setTextColor(
          111,
          82,
          58
      );

      pdf.text(
          time,
          marginX,
          y + 10,
          {
            align: 'left'
          }
      );


      // ----------------------------------------------------------
      // Card
      // ----------------------------------------------------------

      const cardX =
          marginX + 23;

      const cardWidth =
          contentWidth - 23;


      pdf.setFillColor(
          252,
          248,
          241
      );

      pdf.setDrawColor(
          226,
          214,
          198
      );


      pdf.roundedRect(
          cardX,
          y,
          cardWidth,
          cardHeight,
          3,
          3,
          'FD'
      );


      let textY =
          y + 8;


      // ----------------------------------------------------------
      // Title
      // ----------------------------------------------------------

      pdf.setFont(
          'helvetica',
          'bold'
      );

      pdf.setFontSize(
          11
      );

      pdf.setTextColor(
          70,
          55,
          43
      );


      pdf.text(
          titleLines,
          cardX + 6,
          textY
      );


      textY +=
          titleLines.length *
          4.5;


      // ----------------------------------------------------------
      // Meta information
      // ----------------------------------------------------------

      if (
          metaLines.length
      ) {

        textY +=
            2;


        pdf.setFont(
            'helvetica',
            'normal'
        );

        pdf.setFontSize(
            8
        );

        pdf.setTextColor(
            132,
            105,
            80
        );


        pdf.text(
            metaLines,
            cardX + 6,
            textY
        );


        textY +=
            metaLines.length *
            4;

      }


      // ----------------------------------------------------------
      // Notes
      // ----------------------------------------------------------

      if (
          noteLines.length
      ) {

        textY +=
            3;


        pdf.setFont(
            'helvetica',
            'italic'
        );

        pdf.setFontSize(
            8
        );

        pdf.setTextColor(
            95,
            85,
            75
        );


        pdf.text(
            noteLines,
            cardX + 6,
            textY
        );

      }


      y +=
          cardHeight +
          5;
    }


    // ==========================================================
    // SAVE
    // ==========================================================

    pdf.save(
        `program-ziua-nuntii-${this.fileDate()}.pdf`
    );
  }


  // ============================================================
  // PLĂȚI
  //
  // Îl păstrăm deoarece este folosit de exportul complet.
  // Nu mai are card separat în UI.
  // ============================================================

  async exportPaymentsExcel():
      Promise<void> {

    const [
      expenses,
      vendors
    ] =
        await Promise.all([

          this.readCollection<WeddingExpense>(
              'weddingExpenses'
          ),

          this.readCollection<WeddingVendor>(
              'weddingVendors'
          )

        ]);

    this.downloadWorkbook(
        [
          {
            name:
                'Cheltuieli',

            rows:
                this.paymentRows(
                    expenses
                ),

            widths: [
              22,
              28,
              10,
              12,
              12,
              12,
              12,
              14,
              16,
              20,
              35
            ]
          },

          {
            name:
                'Furnizori',

            rows:
                this.vendorPaymentRows(
                    vendors
                ),

            widths: [
              25,
              20,
              16,
              12,
              12,
              12,
              12,
              16,
              20,
              30
            ]
          }
        ],

        `plati-${this.fileDate()}.xlsx`
    );
  }


  // ============================================================
  // PLAN MESE PDF
  // ============================================================

  async exportSeatingPdf():
      Promise<void> {

    const guests =
        await this.readCollection<ExtendedWeddingGuest>(
            'weddingGuests'
        );

    const rawLayout =
        localStorage.getItem(
            'wedding-seating-floor-plan-v1'
        );

    if (!rawLayout) {

      throw new Error(
          'no-seating-layout'
      );

    }

    const elements =
        JSON.parse(
            rawLayout
        ) as SeatingFloorElement[];

    if (
        !Array.isArray(elements) ||
        elements.length === 0
    ) {

      throw new Error(
          'no-seating-layout'
      );

    }


    const pdf =
        new jsPDF({

          orientation:
              'landscape',

          unit:
              'mm',

          format:
              'a3'

        });


    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();


    const canvasWidth =
        1500;

    const canvasHeight =
        920;


    const marginX =
        10;

    const top =
        19;

    const bottom =
        9;


    const usableWidth =
        pageWidth -
        marginX * 2;

    const usableHeight =
        pageHeight -
        top -
        bottom;


    const scale =
        Math.min(

            usableWidth /
            canvasWidth,

            usableHeight /
            canvasHeight

        );


    const planWidth =
        canvasWidth *
        scale;

    const planHeight =
        canvasHeight *
        scale;


    const offsetX =
        (
            pageWidth -
            planWidth
        ) / 2;

    const offsetY =
        top;


    // ==========================================================
    // TITLE
    // ==========================================================

    pdf.setTextColor(
        70,
        55,
        43
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(
        17
    );

    pdf.text(
        'Planul meselor',
        marginX,
        10
    );


    pdf.setFont(
        'helvetica',
        'normal'
    );

    pdf.setFontSize(
        8
    );

    pdf.setTextColor(
        130,
        110,
        90
    );

    pdf.text(
        `Generat la ${new Date().toLocaleString('ro-RO')}`,
        marginX,
        15
    );


    // ==========================================================
    // PLAN BACKGROUND
    // ==========================================================

    pdf.setFillColor(
        252,
        248,
        241
    );

    pdf.setDrawColor(
        226,
        214,
        198
    );

    pdf.roundedRect(
        offsetX,
        offsetY,
        planWidth,
        planHeight,
        2,
        2,
        'FD'
    );


    // ==========================================================
    // ELEMENTS
    // ==========================================================

    for (
        const element
        of elements
        ) {

      const x =
          offsetX +
          element.x *
          scale;

      const y =
          offsetY +
          element.y *
          scale;

      const width =
          element.width *
          scale;

      const height =
          element.height *
          scale;


      // --------------------------------------------------------
      // TABLE
      // --------------------------------------------------------

      if (
          element.type ===
          'table'
      ) {

        this.drawPdfTable(
            pdf,
            element,
            guests,
            x,
            y,
            width,
            height
        );

        continue;
      }


      // --------------------------------------------------------
      // RECTANGLE / SQUARE
      // --------------------------------------------------------

      if (
          element.type ===
          'rectangle' ||
          element.type ===
          'square'
      ) {

        pdf.setFillColor(
            220,
            232,
            242
        );

        pdf.setDrawColor(
            142,
            163,
            181
        );

        pdf.roundedRect(
            x,
            y,
            width,
            height,
            2,
            2,
            'FD'
        );


        pdf.setTextColor(
            51,
            72,
            86
        );

        pdf.setFont(
            'helvetica',
            'bold'
        );

        pdf.setFontSize(
            7
        );


        const label =
            this.pdfShortText(
                pdf,
                element.label,
                Math.max(
                    5,
                    width - 4
                )
            );


        pdf.text(
            label,
            x + width / 2,
            y + height / 2 + 1,
            {
              align:
                  'center'
            }
        );

        continue;
      }


      // --------------------------------------------------------
      // TEXT
      // --------------------------------------------------------

      if (
          element.type ===
          'text'
      ) {

        pdf.setFont(
            'helvetica',
            'bold'
        );

        pdf.setFontSize(
            8
        );

        pdf.setTextColor(
            90,
            73,
            57
        );


        pdf.text(

            this.pdfShortText(
                pdf,
                element.label,
                Math.max(
                    5,
                    width
                )
            ),

            x + width / 2,

            y + height / 2,

            {
              align:
                  'center'
            }
        );

        continue;
      }


      // --------------------------------------------------------
      // ARROW
      // --------------------------------------------------------

      if (
          element.type ===
          'arrow'
      ) {

        pdf.setDrawColor(
            120,
            146,
            164
        );

        pdf.setFillColor(
            120,
            146,
            164
        );

        pdf.setLineWidth(
            1
        );


        const arrowY =
            y +
            height *
            0.62;


        const startX =
            x +
            width *
            0.1;


        const endX =
            x +
            width *
            0.86;


        pdf.line(
            startX,
            arrowY,
            endX,
            arrowY
        );


        const headSize =
            Math.min(
                4,
                height * 0.18
            );


        pdf.triangle(
            endX,
            arrowY - headSize,
            endX,
            arrowY + headSize,
            endX + headSize * 1.5,
            arrowY,
            'F'
        );


        pdf.setTextColor(
            84,
            106,
            120
        );

        pdf.setFont(
            'helvetica',
            'bold'
        );

        pdf.setFontSize(
            6
        );


        pdf.text(

            this.pdfShortText(
                pdf,
                element.label,
                Math.max(
                    5,
                    width
                )
            ),

            x + width / 2,

            y + height * 0.3,

            {
              align:
                  'center'
            }
        );
      }
    }


    pdf.save(
        `plan-mese-${this.fileDate()}.pdf`
    );
  }


  // ============================================================
  // DRAW TABLE IN PDF
  // ============================================================

  private drawPdfTable(
      pdf: jsPDF,
      table: SeatingFloorElement,
      guests: ExtendedWeddingGuest[],
      x: number,
      y: number,
      width: number,
      height: number
  ): void {

    const tableNumber =
        Number(
            table.tableNumber
        );


    const capacity =
        Number(
            table.capacity
        ) || 0;


    const tableGuests =
        guests

            .filter(
                guest =>
                    guest.attendanceStatus !==
                    'declined' &&
                    guest.tableNumber ===
                    tableNumber
            )

            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        'ro'
                    )
            );


    const occupied =
        tableGuests.reduce(

            (
                sum,
                guest
            ) =>
                sum +
                this.number(
                    guest.adults
                ) +
                this.number(
                    guest.children
                ),

            0
        );


    pdf.setFillColor(
        255,
        255,
        255
    );

    pdf.setDrawColor(
        199,
        170,
        136
    );

    pdf.setLineWidth(
        0.35
    );

    pdf.setLineDashPattern(
        [
          1.4,
          1.2
        ],
        0
    );


    pdf.roundedRect(
        x,
        y,
        width,
        height,
        2.2,
        2.2,
        'FD'
    );


    pdf.setLineDashPattern(
        [],
        0
    );


    // ==========================================================
    // HEADER
    // ==========================================================

    pdf.setFillColor(
        185,
        155,
        114
    );


    const badgeSize =
        Math.min(
            7,
            height * 0.12
        );


    pdf.circle(
        x + 5,
        y + 5.5,
        badgeSize / 2,
        'F'
    );


    pdf.setTextColor(
        255,
        255,
        255
    );

    pdf.setFont(
        'helvetica',
        'bold'
    );

    pdf.setFontSize(
        6
    );


    pdf.text(
        String(
            tableNumber
        ),
        x + 5,
        y + 6.2,
        {
          align:
              'center'
        }
    );


    pdf.setTextColor(
        70,
        55,
        43
    );

    pdf.setFontSize(
        7
    );


    const titleWidth =
        Math.max(
            5,
            width - 20
        );


    pdf.text(

        this.pdfShortText(
            pdf,
            `Masa ${tableNumber}`,
            titleWidth
        ),

        x + 9,

        y + 5
    );


    pdf.setFontSize(
        6
    );


    pdf.text(
        `${occupied}/${capacity}`,
        x + width - 3,
        y + 5,
        {
          align:
              'right'
        }
    );


    pdf.setFont(
        'helvetica',
        'normal'
    );

    pdf.setTextColor(
        135,
        115,
        95
    );

    pdf.setFontSize(
        4.7
    );


    pdf.text(
        `${capacity - occupied} locuri libere`,
        x + width - 3,
        y + 8,
        {
          align:
              'right'
        }
    );


    // ==========================================================
    // GUESTS
    // ==========================================================

    const contentTop =
        y + 12;

    const contentBottom =
        y +
        height -
        3;

    const lineHeight =
        4.2;


    const maxLines =
        Math.max(

            0,

            Math.floor(
                (
                    contentBottom -
                    contentTop
                ) /
                lineHeight
            )

        );


    pdf.setFontSize(
        5
    );

    pdf.setTextColor(
        70,
        62,
        54
    );


    let lineIndex =
        0;


    for (
        const guest
        of tableGuests
        ) {

      if (
          lineIndex >=
          maxLines
      ) {
        break;
      }


      const people =
          this.number(
              guest.adults
          ) +
          this.number(
              guest.children
          );


      const text =
          `${guest.name} · ${people} pers.`;


      pdf.text(

          this.pdfShortText(
              pdf,
              text,
              Math.max(
                  5,
                  width - 6
              )
          ),

          x + 3,

          contentTop +
          lineIndex *
          lineHeight
      );


      lineIndex++;
    }


    const hidden =
        tableGuests.length -
        lineIndex;


    if (
        hidden > 0 &&
        maxLines > 0
    ) {

      const lastY =
          contentTop +
          (
              maxLines - 1
          ) *
          lineHeight;


      pdf.setFont(
          'helvetica',
          'bold'
      );


      pdf.text(
          `+ ${hidden} grupuri`,
          x + 3,
          lastY
      );


      pdf.setFont(
          'helvetica',
          'normal'
      );
    }
  }


  // ============================================================
  // SHORT TEXT FOR PDF
  // ============================================================

  private pdfShortText(
      pdf: jsPDF,
      text: string,
      maxWidth: number
  ): string {

    const clean =
        String(
            text ?? ''
        );


    if (
        pdf.getTextWidth(
            clean
        ) <= maxWidth
    ) {

      return clean;

    }


    let result =
        clean;


    while (
        result.length > 1 &&
        pdf.getTextWidth(
            `${result}...`
        ) > maxWidth
        ) {

      result =
          result.slice(
              0,
              -1
          );

    }


    return `${result}...`;
  }


  // ============================================================
  // CHECKLIST
  // ============================================================

  async exportChecklistExcel():
      Promise<void> {

    const tasks =
        await this.readCollection<WeddingTask>(
            'weddingTasks'
        );


    this.downloadWorkbook(
        [
          {
            name:
                'Checklist',

            rows:
                this.taskRows(
                    tasks
                ),

            widths: [
              32,
              20,
              14,
              14,
              16,
              40
            ]
          }
        ],

        `checklist-${this.fileDate()}.xlsx`
    );
  }


  // ============================================================
  // EXPORT COMPLET
  // ============================================================

  async exportAllExcel():
      Promise<void> {

    const [
      guests,
      expenses,
      vendors,
      tasks
    ] =
        await Promise.all([

          this.readCollection<ExtendedWeddingGuest>(
              'weddingGuests'
          ),

          this.readCollection<WeddingExpense>(
              'weddingExpenses'
          ),

          this.readCollection<WeddingVendor>(
              'weddingVendors'
          ),

          this.readCollection<WeddingTask>(
              'weddingTasks'
          ),

        ]);


    this.downloadWorkbook(
        [

          // -------------------------------------------------------
          // INVITAȚI
          // -------------------------------------------------------

          {
            name:
                'Invitati',

            rows:
                this.guestRows(
                    guests
                ),

            widths: [
              24,
              10,
              14,
              14,
              9,
              9,
              10,
              16,
              18,
              18,
              18,
              22,
              18,
              18,
              32
            ]
          },


          // -------------------------------------------------------
          // CHELTUIELI
          // -------------------------------------------------------

          {
            name:
                'Cheltuieli',

            rows:
                this.paymentRows(
                    expenses
                ),

            widths: [
              22,
              28,
              10,
              12,
              12,
              12,
              12,
              14,
              16,
              20,
              35
            ]
          },


          // -------------------------------------------------------
          // FURNIZORI
          // -------------------------------------------------------

          {
            name:
                'Furnizori',

            rows:
                this.vendorPaymentRows(
                    vendors
                ),

            widths: [
              25,
              20,
              16,
              12,
              12,
              12,
              12,
              16,
              20,
              30
            ]
          },


          // -------------------------------------------------------
          // PLAN MESE
          // -------------------------------------------------------

          {
            name:
                'Plan mese',

            rows:
                this.seatingRows(
                    guests
                ),

            widths: [
              12,
              28,
              10,
              10,
              10,
              13,
              18,
              22,
              30
            ]
          },


          // -------------------------------------------------------
          // SUMAR MESE
          // -------------------------------------------------------

          {
            name:
                'Sumar mese',

            rows:
                this.seatingSummaryRows(
                    guests
                ),

            widths: [
              14,
              18,
              18,
              18
            ]
          },


          // -------------------------------------------------------
          // CHECKLIST
          // -------------------------------------------------------

          {
            name:
                'Checklist',

            rows:
                this.taskRows(
                    tasks
                ),

            widths: [
              32,
              20,
              14,
              14,
              16,
              40
            ]
          }

        ],

        `wedding-planner-export-${this.fileDate()}.xlsx`
    );
  }


  // ============================================================
  // FIRESTORE BACKUP
  // ============================================================

  async exportFirestoreBackup():
      Promise<{
        collections: number;
        documents: number;
      }> {

    const data:
        Record<string, unknown[]> =
        {};


    let documents =
        0;


    for (
        const collectionName
        of this.backupCollections
        ) {

      const rows =
          await this.readRawCollection(
              collectionName
          );


      data[collectionName] =
          rows.map(
              row =>
                  this.toJsonSafe(
                      row
                  )
          );


      documents +=
          rows.length;

    }


    const backup:
        BackupFile = {

      metadata: {

        app:
            'Diana & Dan Wedding Planner',

        exportedAt:
            new Date().toISOString(),

        formatVersion:
            1,

        collections:
        this.backupCollections
      },

      data

    };


    this.downloadBlob(

        JSON.stringify(
            backup,
            null,
            2
        ),

        `firestore-backup-${this.fileDate(true)}.json`,

        'application/json;charset=utf-8'
    );


    return {

      collections:
      this.backupCollections.length,

      documents

    };
  }


  // ============================================================
  // READ FIRESTORE
  // ============================================================

  private async readCollection<
      T extends { id: string }
  >(
      collectionName: string
  ): Promise<T[]> {

    const snapshot =
        await getDocs(

            collection(
                this.firestore,
                collectionName
            )

        );


    return snapshot.docs.map(

        document => ({

          id:
          document.id,

          ...document.data()

        })

    ) as T[];
  }


  private async readRawCollection(
      collectionName: string
  ): Promise<Record<string, unknown>[]> {

    const snapshot =
        await getDocs(

            collection(
                this.firestore,
                collectionName
            )

        );


    return snapshot.docs.map(

        document => ({

          id:
          document.id,

          ...document.data()

        })

    );
  }


  // ============================================================
  // PROGRAM ZIUA NUNȚII -> EXCEL ROWS
  // ============================================================

  private weddingDayTimelineRows(
      timeline: WeddingDayTimelineExportItem[]
  ): Record<string, unknown>[] {

    return timeline

        .slice()

        .sort(
            (
                a,
                b
            ) => {

              const orderA =
                  Number(
                      a.sortOrder
                  );

              const orderB =
                  Number(
                      b.sortOrder
                  );


              if (
                  Number.isFinite(orderA) &&
                  Number.isFinite(orderB) &&
                  orderA !== orderB
              ) {

                return orderA - orderB;

              }


              return (
                  a.time ?? ''
              ).localeCompare(
                  b.time ?? '',
                  'ro'
              );
            }
        )

        .map(
            item => ({

              'Ora':
                  item.time ?? '',

              'Moment':
                  item.title ?? '',

              'Responsabil':
                  item.owner ?? '',

              'Locație':
                  item.location ?? '',

              'Telefon':
                  item.phone ?? '',

              'Status':
                  item.status === 'done'
                      ? 'Finalizat'
                      : 'De făcut',

              'Sursă':
                  item.source === 'vendor'
                      ? 'Furnizor'
                      : 'Manual',

              'Observații':
                  item.notes ?? ''

            })
        );
  }


  // ============================================================
  // INVITAȚI -> EXCEL ROWS
  // ============================================================

  private guestRows(
      guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {

    return guests

        .slice()

        .sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    'ro'
                )
        )

        .map(
            guest => ({

              'Nume':
              guest.name,

              'Partea':
                  this.sideLabel(
                      guest.side
                  ),

              'Invitație':
                  this.invitationLabel(
                      guest.invitationStatus
                  ),

              'Confirmare':
                  this.attendanceLabel(
                      guest.attendanceStatus
                  ),

              'Adulți':
                  this.number(
                      guest.adults
                  ),

              'Copii':
                  this.number(
                      guest.children
                  ),

              'Masa':
                  guest.tableNumber ?? '',

              'Telefon':
                  guest.phone ?? '',

              'Email':
                  guest.email ?? '',

              'Grup / familie':

                  guest.groupName ??
                  guest.familyGroup ??
                  guest.group ??
                  '',

              'Tip meniu':
                  guest.menuType ?? '',

              'Alergii':

                  guest.allergies ??
                  guest.dietaryRequirements ??
                  '',

              'Cazare':

                  this.booleanText(

                      guest.needsAccommodation ??
                      guest.accommodation

                  ),

              'Transport':

                  guest.transport ??
                  guest.transportation ??
                  '',

              'Observații':
                  guest.notes ?? ''

            })
        );
  }


  // ============================================================
  // PAYMENTS -> EXCEL ROWS
  // ============================================================

  private paymentRows(
      expenses: WeddingExpense[]
  ): Record<string, unknown>[] {

    return expenses

        .slice()

        .sort(
            (a, b) =>
                (
                    a.dueDate ??
                    '9999'
                ).localeCompare(
                    b.dueDate ??
                    '9999'
                )
        )

        .map(
            expense => ({

              'Categorie':
              expense.category,

              'Cheltuială':
              expense.name,

              'Monedă':
                  expense.currency ?? '',

              'Cantitate':
                  expense.quantity ?? '',

              'Preț unitar':
                  expense.unitPrice ?? '',

              'Total':
                  expense.total ?? '',

              'Avans plătit':
                  expense.advancePaid ?? '',

              'Rest':
                  expense.remainingPayment ?? '',

              'Scadență':
                  expense.dueDate ?? '',

              'Status':
              expense.status,

              'Observații':
                  expense.notes ?? ''

            })
        );
  }


  // ============================================================
  // VENDORS -> EXCEL ROWS
  // ============================================================

  private vendorPaymentRows(
      vendors: WeddingVendor[]
  ): Record<string, unknown>[] {

    return vendors

        .slice()

        .sort(
            (a, b) =>
                (
                    a.paymentDeadline ??
                    '9999'
                ).localeCompare(
                    b.paymentDeadline ??
                    '9999'
                )
        )

        .map(
            vendor => ({

              'Furnizor':
              vendor.name,

              'Categorie':
              vendor.category,

              'Status':
              vendor.status,

              'Monedă':
                  vendor.currency ?? '',

              'Total':
                  vendor.totalPrice ?? '',

              'Avans plătit':
                  vendor.advancePaid ?? '',

              'Rest':
                  vendor.remainingPayment ?? '',

              'Scadență':
                  vendor.paymentDeadline ?? '',

              'Contact':

                  vendor.contactPerson ??
                  vendor.phone ??
                  '',

              'Observații':
                  vendor.notes ?? ''

            })
        );
  }


  // ============================================================
  // SEATING -> EXCEL ROWS
  // ============================================================

  private seatingRows(
      guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {

    return guests

        .filter(
            guest =>
                guest.attendanceStatus !==
                'declined'
        )

        .slice()

        .sort(
            (
                a,
                b
            ) => {

              const tableA =
                  a.tableNumber ??
                  999;

              const tableB =
                  b.tableNumber ??
                  999;


              return (
                      tableA -
                      tableB
                  ) ||
                  a.name.localeCompare(
                      b.name,
                      'ro'
                  );
            }
        )

        .map(
            guest => ({

              'Masa':
                  guest.tableNumber ??
                  'Fără masă',

              'Nume / familie':
              guest.name,

              'Adulți':
                  this.number(
                      guest.adults
                  ),

              'Copii':
                  this.number(
                      guest.children
                  ),

              'Total persoane':

                  this.number(
                      guest.adults
                  ) +

                  this.number(
                      guest.children
                  ),

              'Confirmare':

                  this.attendanceLabel(
                      guest.attendanceStatus
                  ),

              'Partea':

                  this.sideLabel(
                      guest.side
                  ),

              'Tip meniu / alergii':

                  [
                    guest.menuType,

                    guest.allergies ??
                    guest.dietaryRequirements
                  ]

                      .filter(Boolean)

                      .join(
                          ' · '
                      ),

              'Observații':
                  guest.notes ?? ''

            })
        );
  }


  // ============================================================
  // SEATING SUMMARY
  // ============================================================

  private seatingSummaryRows(
      guests: ExtendedWeddingGuest[]
  ): Record<string, unknown>[] {

    const capacities:
        Record<number, number> = {

      1: 16,

      2: 16,

      3: 16,

      4: 16,

      5: 16,

      6: 24,

      7: 16,

      8: 24
    };


    const rows:
        Record<string, unknown>[] =

        Object.entries(
            capacities
        ).map(

            (
                [
                  table,
                  capacity
                ]
            ) => {

              const tableNumber =
                  Number(
                      table
                  );


              const people =
                  guests

                      .filter(
                          guest =>
                              guest.tableNumber ===
                              tableNumber &&
                              guest.attendanceStatus !==
                              'declined'
                      )

                      .reduce(

                          (
                              sum,
                              guest
                          ) =>
                              sum +
                              this.number(
                                  guest.adults
                              ) +
                              this.number(
                                  guest.children
                              ),

                          0

                      );


              return {

                'Masa':
                tableNumber,

                'Persoane așezate':
                people,

                'Capacitate':
                capacity,

                'Locuri libere':
                    capacity -
                    people

              };
            }
        );


    const unassigned =
        guests

            .filter(
                guest =>
                    guest.tableNumber == null &&
                    guest.attendanceStatus !==
                    'declined'
            )

            .reduce(

                (
                    sum,
                    guest
                ) =>
                    sum +
                    this.number(
                        guest.adults
                    ) +
                    this.number(
                        guest.children
                    ),

                0

            );


    rows.push({

      'Masa':
          'Fără masă',

      'Persoane așezate':
      unassigned,

      'Capacitate':
          '',

      'Locuri libere':
          ''

    });


    return rows;
  }


  // ============================================================
  // TASKS -> EXCEL ROWS
  // ============================================================

  private taskRows(
      tasks: WeddingTask[]
  ): Record<string, unknown>[] {

    return tasks

        .slice()

        .sort(
            (a, b) =>
                (
                    a.dueDate ??
                    '9999'
                ).localeCompare(
                    b.dueDate ??
                    '9999'
                )
        )

        .map(
            task => ({

              'Task':
              task.title,

              'Categorie':
              task.category,

              'Status':
              task.status,

              'Prioritate':
              task.priority,

              'Termen':
                  task.dueDate ?? '',

              'Observații':
                  task.notes ?? ''

            })
        );
  }


  // ============================================================
  // CREATE EXCEL WORKBOOK
  // ============================================================

  private downloadWorkbook(
      sheets: WorkbookSheet[],
      fileName: string
  ): void {

    const workbook =
        XLSX.utils.book_new();


    sheets.forEach(
        sheetDefinition => {

          const rows =
              sheetDefinition.rows.length

                  ? sheetDefinition.rows

                  : [
                    {
                      'Informație':
                          'Nu există date în această secțiune.'
                    }
                  ];


          const sheet =
              XLSX.utils.json_to_sheet(
                  rows
              );


          sheet['!cols'] =
              sheetDefinition.widths.map(
                  width => ({
                    wch:
                    width
                  })
              );


          const range =
              XLSX.utils.decode_range(
                  sheet['!ref'] ??
                  'A1:A1'
              );


          sheet['!autofilter'] = {

            ref:
                XLSX.utils.encode_range({

                  s: {
                    r: 0,
                    c: 0
                  },

                  e: {

                    r:
                        Math.max(
                            0,
                            range.e.r
                        ),

                    c:
                    range.e.c
                  }
                })
          };


          XLSX.utils.book_append_sheet(

              workbook,

              sheet,

              sheetDefinition.name.slice(
                  0,
                  31
              )
          );
        }
    );


    XLSX.writeFile(
        workbook,
        fileName,
        {
          compression:
              true
        }
    );
  }


  // ============================================================
  // JSON SAFE
  // ============================================================

  private toJsonSafe(
      value: unknown
  ): unknown {

    if (
        value == null ||
        typeof value !==
        'object'
    ) {

      return value;

    }


    if (
        'toDate' in value &&
        typeof value.toDate ===
        'function'
    ) {

      return {

        __type:
            'timestamp',

        value:
            value
                .toDate()
                .toISOString()

      };
    }


    if (
        Array.isArray(
            value
        )
    ) {

      return value.map(
          item =>
              this.toJsonSafe(
                  item
              )
      );

    }


    return Object.fromEntries(

        Object.entries(
            value
        ).map(

            (
                [
                  key,
                  child
                ]
            ) => [

              key,

              this.toJsonSafe(
                  child
              )

            ]
        )
    );
  }


  // ============================================================
  // DOWNLOAD BLOB
  // ============================================================

  private downloadBlob(
      content: string,
      fileName: string,
      mimeType: string
  ): void {

    const blob =
        new Blob(
            [
              content
            ],
            {
              type:
              mimeType
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const anchor =
        document.createElement(
            'a'
        );


    anchor.href =
        url;

    anchor.download =
        fileName;

    anchor.click();


    URL.revokeObjectURL(
        url
    );
  }


  // ============================================================
  // NUMBER
  // ============================================================

  private number(
      value: unknown
  ): number {

    return (
        Number(
            value
        ) || 0
    );
  }


  // ============================================================
  // SIDE LABEL
  // ============================================================

  private sideLabel(
      value: WeddingGuest['side']
  ): string {

    return value ===
    'Both'

        ? 'Amândoi'

        : value;
  }


  // ============================================================
  // INVITATION LABEL
  // ============================================================

  private invitationLabel(
      value:
      WeddingGuest['invitationStatus']
  ): string {

    const labels:
        Record<
            WeddingGuest['invitationStatus'],
            string
        > = {

      given:
          'Dată',

      'not-given':
          'Nedată',

      unknown:
          'Necunoscut'
    };


    return labels[
        value
        ];
  }


  // ============================================================
  // ATTENDANCE LABEL
  // ============================================================

  private attendanceLabel(
      value:
      WeddingGuest['attendanceStatus']
  ): string {

    const labels:
        Record<
            WeddingGuest['attendanceStatus'],
            string
        > = {

      confirmed:
          'Confirmat',

      pending:
          'În așteptare',

      maybe:
          'Poate',

      declined:
          'Refuzat'
    };


    return labels[
        value
        ];
  }


  // ============================================================
  // BOOLEAN LABEL
  // ============================================================

  private booleanText(
      value: unknown
  ): string {

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

        ? String(
            value
        )

        : '';
  }


  // ============================================================
  // FILE DATE
  // ============================================================

  private fileDate(
      includeTime = false
  ): string {

    const now =
        new Date();


    const date =
        [

          now.getFullYear(),

          String(
              now.getMonth() + 1
          ).padStart(
              2,
              '0'
          ),

          String(
              now.getDate()
          ).padStart(
              2,
              '0'
          )

        ].join(
            '-'
        );


    if (
        !includeTime
    ) {

      return date;

    }


    return `${date}-${String(
        now.getHours()
    ).padStart(
        2,
        '0'
    )}${String(
        now.getMinutes()
    ).padStart(
        2,
        '0'
    )}`;
  }
}
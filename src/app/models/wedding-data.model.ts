export type Currency = 'RON' | 'EUR';

export type WeddingVendorStatus =
    | 'contracted'
    | 'pending'
    | 'to-confirm'
    | 'to-contact'
    | 'done';

export type WeddingExpenseStatus =
    | 'estimate'
    | 'partial'
    | 'paid'
    | 'unpaid'
    | 'unknown';

export type WeddingDocumentType =
    | 'excel'
    | 'contract'
    | 'invoice'
    | 'offer'
    | 'image'
    | 'pdf'
    | 'docx'
    | 'other';

export type WeddingDocumentStatus =
    | 'available'
    | 'missing'
    | 'uploaded'
    | 'pending';

export type GuestSide = 'Diana' | 'Dan' | 'Both';

export type GuestInvitationStatus =
    | 'unknown'
    | 'given'
    | 'not-given';

export type GuestAttendanceStatus =
    | 'pending'
    | 'confirmed'
    | 'declined'
    | 'maybe';

export type WeddingTaskStatus =
    | 'todo'
    | 'in-progress'
    | 'done';

export type WeddingTaskPriority =
    | 'low'
    | 'medium'
    | 'high';

export interface WeddingVendor {
  id: string;
  name: string;
  category: string;

  contactPerson?: string;
  phone?: string;
  email?: string;

  totalPrice?: number;
  currency?: Currency;
  advancePaid?: number;
  remainingPayment?: number;

  paymentDeadline?: string;
  eventTime?: string;
  location?: string;
  notes?: string;

  status: WeddingVendorStatus;

  // Pentru cazuri ca invitatiile: 80 buc, 18 lei/buc
  isPaid?: boolean;
  quantity?: number | string;
  unitPrice?: number;
  unitLabel?: string;
}

export interface WeddingExpense {
  id: string;
  category: string;
  name: string;

  quantity?: number | string;
  unitPrice?: number;
  total?: number;
  currency?: Currency;

  advancePaid?: number;
  remainingPayment?: number;
  dueDate?: string;

  source?: 'Excel' | 'Contract' | 'Contract + Excel' | 'Manual';
  notes?: string;

  status: WeddingExpenseStatus;

  // Pentru sub-elemente incluse deja intr-un total mare, ex: detaliile florilor
  includeInTotals?: boolean;
}

export interface WeddingDocument {
  id: string;
  title: string;

  vendorId?: string;
  vendorName?: string;

  type: WeddingDocumentType;
  fileName?: string;
  notes?: string;
  status: WeddingDocumentStatus;

  // Pentru Firebase, mai tarziu
  storagePath?: string;
  downloadUrl?: string;
  uploadedAt?: string;
}

export interface WeddingGuest {
  id: string;
  name: string;

  side: GuestSide;
  invitationStatus: GuestInvitationStatus;
  attendanceStatus: GuestAttendanceStatus;

  adults: number;
  children: number;

  tableNumber?: number;
  phone?: string;
  notes?: string;
}

export interface WeddingTask {
  id: string;
  title: string;
  category: string;

  dueDate?: string;
  status: WeddingTaskStatus;
  priority: WeddingTaskPriority;

  notes?: string;
}

export interface WeddingDrinkItem {
  id: string;
  name: string;

  pricePerLiter?: number;
  quantity?: number;
  total?: number;

  packageVolume?: number;
  bottles?: number;

  notes?: string;
}

export type AccommodationStatus =
    | 'to-book'
    | 'booked'
    | 'advance-paid'
    | 'paid'
    | 'cancelled'
    | 'unknown';

export interface WeddingAccommodation {
  id: string;
  name: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  rooms?: number;
  guests?: number;
  pricePerRoom?: number;
  totalPrice?: number;
  currency?: Currency;
  advancePaid?: number;
  remainingPayment?: number;
  contactPerson?: string;
  phone?: string;
  notes?: string;
  status: AccommodationStatus;
}

export type WeddingPreparationStatus =
    | 'to-buy'
    | 'booked'
    | 'advance-paid'
    | 'paid'
    | 'done'
    | 'unknown';

export interface WeddingPreparationItem {
  id: string;
  name: string;
  category: 'Mireasa' | 'Mire' | 'Beauty' | 'Accesorii' | 'Other';
  provider?: string;
  appointmentTime?: string;
  appointmentDate?: string;
  totalPrice?: number;
  currency?: Currency;
  advancePaid?: number;
  remainingPayment?: number;
  notes?: string;
  status: WeddingPreparationStatus;
}

export type WeddingRingStatus =
    | 'to-choose'
    | 'ordered'
    | 'advance-paid'
    | 'paid'
    | 'received'
    | 'unknown';

export interface WeddingRingItem {
  id: string;
  name: string;
  shop?: string;
  material?: string;
  sizeDiana?: string;
  sizeDan?: string;
  totalPrice?: number;
  currency?: Currency;
  advancePaid?: number;
  remainingPayment?: number;
  orderDate?: string;
  pickupDate?: string;
  notes?: string;
  status: WeddingRingStatus;
}
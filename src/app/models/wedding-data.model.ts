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

export type WeddingPaymentMoment =
    | 'before-wedding'
    | 'wedding-day'
    | 'after-wedding';

export type WeddingPaymentDeadlineType =
    | 'exact'
    | 'relative'
    | 'unspecified';

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

export type GuestSide =
    | 'Diana'
    | 'Dan'
    | 'Both';

export type GuestInvitationStatus =
    | 'unknown'
    | 'given'
    | 'not-given';

export type GuestAttendanceStatus =
    | 'pending'
    | 'confirmed'
    | 'declined'
    | 'maybe';


export type GuestAccommodationStatus =
    | 'unknown'
    | 'needed'
    | 'not-needed'
    | 'booked';

export type GuestMenuType =
    | 'standard'
    | 'vegetarian'
    | 'vegan'
    | 'children'
    | 'other';

export type WeddingTaskStatus =
    | 'todo'
    | 'in-progress'
    | 'done';

export type WeddingTaskPriority =
    | 'low'
    | 'medium'
    | 'high'
    | 'very high';

export type WeddingTaskKind = 'task' | 'checklist';

export type WeddingTimelineStage =
    | 'now'
    | 'one-month'
    | 'three-weeks'
    | 'one-week'
    | 'one-day'
    | 'wedding-day'
    | 'after-wedding';

export interface WeddingTaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

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
  deadlineType?: WeddingPaymentDeadlineType;
  relativeDeadline?: string;
  paymentMoment?: WeddingPaymentMoment;
  payAfterWedding?: boolean;

  vendorId?: string;
  vendorName?: string;

  source?: 'Excel' | 'Contract' | 'Contract + Excel' | 'Manual';
  notes?: string;

  status: WeddingExpenseStatus;

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
  childrenUnder5?: number;
  children5To8?: number;
  children8To12?: number;
  children13To17?: number;

  groupName?: string;
  tableNumber?: number;
  phone?: string;
  email?: string;

  accommodationStatus?: GuestAccommodationStatus;
  menuType?: GuestMenuType;
  allergies?: string;
  transportNeeded?: boolean;

  notes?: string;
  isManual?: boolean;
}

export interface WeddingTask {
  id: string;
  title: string;
  category: string;

  dueDate?: string;
  status: WeddingTaskStatus;
  priority: WeddingTaskPriority;
  kind?: WeddingTaskKind;

  vendorId?: string;
  vendorName?: string;
  assignee?: string;
  timingLabel?: string;
  timelineStage?: WeddingTimelineStage;
  checklist?: WeddingTaskChecklistItem[];

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
export type Currency = 'RON' | 'EUR';

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
  status: 'contracted' | 'pending' | 'to-contact' | 'done';
}

export interface WeddingDocument {
  id: string;
  title: string;
  vendorId?: string;
  vendorName?: string;
  type: 'contract' | 'offer' | 'invoice' | 'image' | 'other';
  fileName?: string;
  notes?: string;
}

export interface WeddingGuest {
  id: string;
  name: string;
  side: 'Diana' | 'Dan' | 'Both';
  status: 'confirmed' | 'pending' | 'declined' | 'maybe';
  adults: number;
  children: number;
  table?: number;
  notes?: string;
}

export interface WeddingTask {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

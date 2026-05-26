export type Currency = 'RON' | 'EUR';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'unknown';
export type GuestStatus = 'neconfirmat' | 'vine' | 'nu vine' | 'poate';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface Vendor {
  id: string;
  category: string;
  name: string;
  service: string;
  total?: Money;
  advance?: Money;
  remaining?: Money;
  dueDate?: string;
  status: PaymentStatus;
  notes?: string;
}

export interface Guest {
  id: number;
  name: string;
  status: GuestStatus;
  persons?: number;
  children?: number;
  tableNumber?: number;
  invitationSent?: boolean;
  notes?: string;
}

export interface TaskItem {
  id: number;
  title: string;
  owner?: 'Diana' | 'Dan' | 'Amandoi';
  dueDate?: string;
  done: boolean;
  priority: 'mare' | 'medie' | 'mica';
}

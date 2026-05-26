import { WeddingDocument, WeddingGuest, WeddingTask, WeddingVendor } from '../models/wedding-data.model';

export const WEDDING_VENDORS: WeddingVendor[] = [
  {
    id: 'wild-garden',
    name: 'Wild Garden',
    category: 'Locatie',
    totalPrice: 4165,
    currency: 'EUR',
    eventTime: '16:00',
    location: 'Drumul Sfantul Ioan 238, Cluj-Napoca',
    notes: 'Receptia incepe la ora 16:00.',
    status: 'contracted'
  },
  {
    id: 'photo-booth',
    name: 'K Boom Photo Booth',
    category: 'Photo Booth',
    totalPrice: 2590,
    currency: 'RON',
    advancePaid: 250,
    remainingPayment: 2340,
    paymentDeadline: 'Max. 48h dupa eveniment',
    eventTime: '16:00 - 00:00',
    location: 'Wild Garden Cluj',
    notes: 'Oglinda foto, gheata carbonica, magneti, guestbook, asistent.',
    status: 'contracted'
  },
  {
    id: 'kids-corner',
    name: 'Kids Corner - Colex Nice Cleaning',
    category: 'Kids Corner',
    totalPrice: 1100,
    currency: 'RON',
    eventTime: 'Animator 18:00 - 20:00',
    location: 'Wild Garden Cluj',
    notes: 'Pachet nr. 3: castel gonflabil, kids corner colorat, masina cu baloane de sapun.',
    status: 'contracted'
  },
  {
    id: 'cake-man',
    name: 'Mr. Cake',
    category: 'Tort & Candy Bar',
    totalPrice: 9140,
    currency: 'RON',
    advancePaid: 2285,
    remainingPayment: 6855,
    paymentDeadline: 'Max. 3 zile dupa eveniment',
    location: 'Wild Garden Cluj',
    notes: 'Marturii (mix prajituri), candy bar, tort natural, tort servire, transport frigorific.',
    status: 'contracted'
  },
  {
    id: 'bamboo-flower',
    name: 'Bamboo Flower',
    category: 'Flori',
    advancePaid: 500,
    currency: 'RON',
    paymentDeadline: 'Restul de stabilit / platit in jurul evenimentului',
    location: 'Cluj-Napoca',
    notes: 'Aranjamente florale pentru 05.09.2026.',
    status: 'contracted'
  },
  {
    id: 'invitatii',
    name: 'Invitatii nunta',
    category: 'Invitatii',
    notes: 'Model simplu, elegant, cu Diana si Dan / banda florala.',
    status: 'contracted'
  }
];

export const WEDDING_DOCUMENTS: WeddingDocument[] = [
  {
    id: 'doc-photo-booth',
    title: 'Contract servicii photo booth',
    vendorId: 'photo-booth',
    vendorName: 'K Boom Photo Booth',
    type: 'contract',
    fileName: 'Contract servicii photo booth.docx'
  },
  {
    id: 'doc-kids-corner',
    title: 'Contract inchiriere kids corner',
    vendorId: 'kids-corner',
    vendorName: 'Colex Nice Cleaning',
    type: 'contract',
    fileName: 'Contract inchiriere - Kids corner - Diana Radu.docx'
  },
  {
    id: 'doc-cake',
    title: 'Contract The Cake Man',
    vendorId: 'cake-man',
    vendorName: 'The Cake Man',
    type: 'contract',
    fileName: 'Contract-prestari-servicii-Radu-Diana-Elena-05.09.2026.pdf'
  },
  {
    id: 'doc-flowers',
    title: 'Contract flori',
    vendorId: 'bamboo-flower',
    vendorName: 'Bamboo Flower',
    type: 'contract',
    fileName: 'contract flori.jpeg'
  }
];

export const WEDDING_GUESTS: WeddingGuest[] = [
  {
    id: 'guest-1',
    name: 'Exemplu invitat',
    side: 'Both',
    status: 'pending',
    adults: 2,
    children: 0,
    notes: 'De completat lista reala.'
  }
];

export const WEDDING_TASKS: WeddingTask[] = [
  {
    id: 'task-1',
    title: 'Centralizeaza toate contractele',
    category: 'Documente',
    status: 'in-progress',
    priority: 'high',
    notes: 'Photo booth, kids corner, flori, tort, locatie.'
  },
  {
    id: 'task-2',
    title: 'Verifica resturile de plata',
    category: 'Plati',
    status: 'todo',
    priority: 'high'
  },
  {
    id: 'task-3',
    title: 'Finalizeaza modelul de invitatie',
    category: 'Invitatii',
    status: 'todo',
    priority: 'medium'
  }
];

import { Guest, TaskItem, Vendor } from '../models/wedding.models';

export const EVENT = {
  couple: 'Diana si Dan',
  date: '2026-09-05',
  ceremony: 'Biserica Sfantii Arhangheli Mihail si Gavril, Apahida',
  ceremonyTime: '12:00',
  reception: 'Wild Garden, Cluj-Napoca',
  receptionTime: '16:00',
  rsvpDeadline: '2026-08-05'
};

export const VENDORS: Vendor[] = [
  {
    id: 'venue',
    category: 'Sala',
    name: 'Wild Garden',
    service: 'Inchiriere sala + meniuri',
    total: { amount: 3500, currency: 'EUR' },
    advance: { amount: 1000, currency: 'EUR' },
    remaining: { amount: 2500, currency: 'EUR' },
    status: 'partial',
    notes: 'Verifica TVA, meniuri si termen plata finala.'
  },
  {
    id: 'cake-man',
    category: 'Candy bar / tort',
    name: 'The Cake Man SRL',
    service: 'Mix prajituri, fruit bar, candy bar, tort natural, tort servire, transport frigorific',
    total: { amount: 9140, currency: 'RON' },
    advance: { amount: 2285, currency: 'RON' },
    remaining: { amount: 6855, currency: 'RON' },
    dueDate: 'max. 3 zile dupa eveniment',
    status: 'partial'
  },
  {
    id: 'photo-booth',
    category: 'Photo booth',
    name: 'K BOOM PRO EVENTS SRL',
    service: 'Mirror Photo Booth 8h + magneti + guestbook + gheata carbonica',
    total: { amount: 2590, currency: 'RON' },
    advance: { amount: 250, currency: 'RON' },
    remaining: { amount: 2340, currency: 'RON' },
    dueDate: 'max. 48h dupa eveniment',
    status: 'partial'
  },
  {
    id: 'kids-corner',
    category: 'Kids corner',
    name: 'Colex Nice Cleaning SRL',
    service: 'Castel gonflabil, kids corner colorat, masina baloane de sapun, animator 2h',
    total: { amount: 1100, currency: 'RON' },
    status: 'unpaid',
    notes: 'Livrare recuzita 14:00-15:00, animatie 18:00-20:00, preluare a doua zi 10:00-11:00.'
  },
  {
    id: 'flowers',
    category: 'Flori / decor',
    name: 'Bamboo Flower SRL',
    service: 'Buchet mireasa, buchete nase, lumanari, aranjamente mese, arcada, masina',
    total: { amount: 4725, currency: 'RON' },
    advance: { amount: 500, currency: 'RON' },
    status: 'partial',
    notes: 'Restul apare ca de stabilit in contractul scanat.'
  },
  {
    id: 'dj',
    category: 'Muzica',
    name: 'DJ Antenna',
    service: 'Muzica eveniment',
    total: { amount: 2000, currency: 'EUR' },
    advance: { amount: 1000, currency: 'EUR' },
    remaining: { amount: 1000, currency: 'EUR' },
    status: 'partial'
  },
  {
    id: 'invitations',
    category: 'Invitatii',
    name: 'Daisler / invitatii',
    service: 'Invitatii de nunta',
    total: { amount: 1500, currency: 'RON' },
    status: 'unknown',
    notes: 'In Excel apar 80 buc x 18 lei.'
  }
];

export const GUESTS: Guest[] = [
  { id: 1, name: 'Mami si Tati', status: 'neconfirmat' },
  { id: 2, name: 'Mama si tata Dan', status: 'neconfirmat' },
  { id: 3, name: 'Bunica Apahida 1p', status: 'neconfirmat', persons: 1 },
  { id: 4, name: 'Horincar George si Adelina', status: 'neconfirmat', invitationSent: true },
  { id: 5, name: 'Horincar Ioan Marius si Ana', status: 'vine', invitationSent: true },
  { id: 6, name: 'Horincar Andrei si Viorica', status: 'nu vine', invitationSent: true },
  { id: 7, name: 'Horincar Fabian si prietena', status: 'poate', invitationSent: true },
  { id: 8, name: 'Cristina si Adi Madarasan', status: 'neconfirmat' },
  { id: 9, name: 'Oana si Adi Cretu', status: 'neconfirmat' },
  { id: 10, name: 'Rusu Felicia 1p', status: 'neconfirmat', persons: 1 },
  { id: 11, name: 'Norbi 1p', status: 'neconfirmat', persons: 1 },
  { id: 12, name: 'Razvan Tarnovan 1p', status: 'neconfirmat', persons: 1 }
];

export const TASKS: TaskItem[] = [
  { id: 1, title: 'Clarifica restul de plata pentru flori', owner: 'Diana', priority: 'mare', done: false },
  { id: 2, title: 'Confirma cu Wild Garden ce se plateste inainte si ce dupa nunta', owner: 'Amandoi', priority: 'mare', done: false },
  { id: 3, title: 'Trimite/actualizeaza lista de invitati si statusurile', owner: 'Diana', dueDate: '2026-08-05', priority: 'mare', done: false },
  { id: 4, title: 'Verifica meniul pentru asistentul de la photo booth', owner: 'Dan', priority: 'medie', done: false },
  { id: 5, title: 'Confirma intervalul pentru kids corner si animator', owner: 'Diana', priority: 'medie', done: false }
];

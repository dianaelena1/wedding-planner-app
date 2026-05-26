import { WeddingAccommodation, WeddingDocument, WeddingDrinkItem, WeddingExpense, WeddingGuest, WeddingPreparationItem, WeddingRingItem, WeddingTask, WeddingVendor } from '../models/wedding-data.model';

export const WEDDING_VENDORS: WeddingVendor[] = [
  {
    "id": "wild-garden",
    "name": "Wild Garden",
    "category": "Locatie",
    "totalPrice": 3500,
    "currency": "EUR",
    "advancePaid": 3500,
    "remainingPayment": 0,
    "paymentDeadline": "Achitat integral",
    "eventTime": "Receptie de la 16:00",
    "location": "Drumul Sfantul Ioan 238, Cluj-Napoca",
    "notes": "Inchiriere sala achitata integral. Initial in Excel era notat: 3500 EUR + TVA, avans 1000 EUR + TVA, rest 2500 EUR + TVA.",
    "status": "contracted",
    "isPaid": true
  },
  {
    "id": "photo-booth",
    "name": "K Boom Photo Booth",
    "category": "Photo Booth + efecte speciale",
    "totalPrice": 2590,
    "currency": "RON",
    "advancePaid": 250,
    "remainingPayment": 2340,
    "paymentDeadline": "Max. 48h dupa eveniment",
    "eventTime": "16:00 - 00:00 / 8 ore",
    "location": "Wild Garden Cluj",
    "notes": "Contractul include oglinda foto, gheata carbonica, magneti, guestbook, asistent si stick USB.",
    "status": "contracted"
  },
  {
    "id": "kids-corner",
    "name": "Kids Corner - Colex Nice Cleaning",
    "category": "Kids Corner",
    "totalPrice": 1100,
    "currency": "RON",
    "advancePaid": 0,
    "remainingPayment": 1100,
    "paymentDeadline": "De confirmat modalitatea de plata",
    "eventTime": "Livrare 14:00-15:00, animator 18:00-20:00, preluare a doua zi 10:00-11:00",
    "location": "Wild Garden Cluj",
    "notes": "Pachet nr. 3: castel gonflabil, kids corner colorat, masina cu baloane de sapun, animator 2h.",
    "status": "contracted"
  },
  {
    "id": "cake-man",
    "name": "The Cake Man",
    "category": "Tort & Candy Bar",
    "totalPrice": 9140,
    "currency": "RON",
    "advancePaid": 2285,
    "remainingPayment": 6855,
    "paymentDeadline": "Max. 3 zile dupa eveniment",
    "eventTime": "Eveniment 05.09.2026, de la 16:00",
    "location": "Wild Garden Cluj",
    "notes": "Marturii (Mix prajituri), candy bar, tort natural 2 etaje, tort servire, transport frigorific.",
    "status": "contracted"
  },
  {
    "id": "bamboo-flower",
    "name": "Bamboo Flower Manastur",
    "category": "Flori / Decor",
    "totalPrice": 4725,
    "currency": "RON",
    "advancePaid": 500,
    "remainingPayment": 4225,
    "paymentDeadline": "07-08 septembrie 2026 / de confirmat suma finala",
    "eventTime": "05.09.2026",
    "location": "Cluj-Napoca",
    "notes": "Excel: buchet mireasa, buchete nase, lumanari, aranjamente mese, masina si arcada. Contractul noteaza avans 500 lei si rest de stabilit.",
    "status": "contracted"
  },
  {
    "id": "dj-antenna",
    "name": "DJ Antenna",
    "category": "Muzica",
    "totalPrice": 2500,
    "currency": "EUR",
    "advancePaid": 1000,
    "remainingPayment": 1000,
    "notes": "Din Excel: avans 1000 EUR, pret 2000 EUR, rest 1000 EUR.",
    "status": "contracted"
  },
  {
    "id": "camelia-bara",
    "name": "Camelia Bara",
    "category": "Muzica",
    "totalPrice": 1000,
    "currency": "EUR",
    "advancePaid": 0,
    "remainingPayment": 1000,
    "notes": "Din Excel: pret 1000 EUR.",
    "status": "contracted"
  },
  {
    "id": "video-denis",
    "name": "Video - Denis MSG",
    "category": "Video",
    "totalPrice": 1000,
    "currency": "EUR",
    "advancePaid": 0,
    "remainingPayment": 1000,
    "eventTime": "Petrecere 8h+",
    "notes": "Cere din nou contractul.",
    "status": "to-confirm"
  },

  {
    "id": "sergiu-nicola-photo",
    "name": "Sergiu Nicola Photo",
    "category": "Foto",
    "totalPrice": 1000,
    "currency": "EUR",
    "advancePaid": 200,
    "remainingPayment": 800,
    "paymentDeadline": "Restul se plateste numerar la debutul sau la finalul evenimentului",
    "eventTime": "Toata ziua evenimentului pana la momentul tortului",
    "location": "Cluj-Napoca / Wild Garden",
    "notes": "Contract foto: pret total 1000 EUR, avans platit 200 EUR, rest 800 EUR. Include documentarea pregatirilor, ceremoniei religioase si petrecerii, minimum 600 fotografii finale predate digital.",
    "status": "contracted"
  },
  {
    "id": "invitatii",
    "name": "Invitatii de nunta",
    "category": "Invitatii",
    "totalPrice": 1500,
    "currency": "RON",
    "advancePaid": 1500,
    "remainingPayment": 0,
    "quantity": 80,
    "unitPrice": 18,
    "unitLabel": "lei/buc",
    "notes": "80 bucati, 18 lei/bucata. Total achitat integral.",
    "status": "contracted",
    "isPaid": true
  },
  {
    "id": "prosecco-van",
    "name": "Prosecco Van",
    "category": "Sala / Servicii extra",
    "totalPrice": 400,
    "currency": "EUR",
    "advancePaid": 0,
    "remainingPayment": 400,
    "notes": "Din Excel: Prosecco Van 400 EUR.",
    "status": "pending"
  },
  {
    "id": "cafea-bogdan",
    "name": "Cafea Bogdan",
    "category": "Aditional",
    "totalPrice": 2000,
    "currency": "RON",
    "advancePaid": 0,
    "remainingPayment": 2000,
    "notes": "Din Excel: Cafea Bogdan 2000.",
    "status": "pending"
  }
];

export const WEDDING_EXPENSES: WeddingExpense[] = [
  {
    "id": "exp-sala-inchiriere",
    "category": "Sala",
    "name": "Inchiriere sala",
    "quantity": 1,
    "total": 3500,
    "currency": "EUR",
    "advancePaid": 1000,
    "remainingPayment": 2500,
    "source": "Excel",
    "notes": "Excel mentioneaza TVA la avans/rest.",
    "status": "partial"
  },
  {
    "id": "exp-meniuri",
    "category": "Sala",
    "name": "Meniuri Clasic",
    "currency": "RON",
    "source": "Excel",
    "notes": "Pretul meniurilor nu este completat in Excel.",
    "status": "unknown"
  },
  {
    "id": "exp-live-cooking",
    "category": "Sala",
    "name": "Live cooking",
    "currency": "RON",
    "total": 0,
    "source": "Excel",
    "notes": "Momentan necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-prosecco-van",
    "category": "Sala",
    "name": "Prosecco Van",
    "quantity": 1,
    "total": 400,
    "currency": "EUR",
    "source": "Excel",
    "status": "unpaid"
  },

  {
    "id": "exp-sergiu-nicola-photo",
    "category": "Foto",
    "name": "Sergiu Nicola Photo - servicii foto nunta",
    "quantity": "ziua evenimentului",
    "total": 1000,
    "currency": "EUR",
    "advancePaid": 200,
    "remainingPayment": 800,
    "dueDate": "In ziua evenimentului, la debut sau la final",
    "source": "Contract",
    "notes": "Avans platit 200 EUR. Rest de plata 800 EUR. Serviciile foto acopera ziua evenimentului pana la momentul tortului.",
    "status": "partial"
  },
  {
    "id": "exp-photo-booth-contract",
    "category": "Photo booth",
    "name": "K Boom - oglinda foto + gheata carbonica",
    "quantity": "8h",
    "total": 2590,
    "currency": "RON",
    "advancePaid": 250,
    "remainingPayment": 2340,
    "dueDate": "Max. 48h dupa eveniment",
    "source": "Contract",
    "notes": "Contractul grupeaza oglinda foto + gheata carbonica in totalul de 2590 RON.",
    "status": "partial"
  },
  {
    "id": "exp-video-denis",
    "category": "Video",
    "name": "Video Denis MSG - petrecere",
    "quantity": "8h+",
    "total": 1000,
    "currency": "RON",
    "source": "Excel",
    "notes": "Moneda trebuie confirmata.",
    "status": "estimate"
  },
  {
    "id": "exp-dj-antenna",
    "category": "Muzica",
    "name": "DJ Antenna",
    "total": 2000,
    "currency": "EUR",
    "advancePaid": 1000,
    "remainingPayment": 1000,
    "source": "Excel",
    "status": "partial"
  },
  {
    "id": "exp-camelia-bara",
    "category": "Muzica",
    "name": "Camelia Bara",
    "total": 1000,
    "currency": "EUR",
    "remainingPayment": 1000,
    "source": "Excel",
    "status": "unpaid"
  },
  {
    "id": "exp-trupa-dans",
    "category": "Muzica",
    "name": "Trupa dans",
    "currency": "RON",
    "source": "Excel",
    "notes": "Necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-rochie",
    "category": "Diverse",
    "name": "Rochia de mireasa",
    "currency": "RON",
    "source": "Excel",
    "notes": "Necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-par",
    "category": "Diverse",
    "name": "Aranjat mireasa par - Lavinia S.",
    "quantity": "08:30",
    "currency": "RON",
    "source": "Excel",
    "notes": "Pret necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-machiaj",
    "category": "Diverse",
    "name": "Aranjat mireasa machiaj - Flavia S.",
    "quantity": "07:30",
    "currency": "RON",
    "source": "Excel",
    "notes": "Pret necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-taxa-biserica",
    "category": "Diverse",
    "name": "Taxa biserica",
    "currency": "RON",
    "source": "Excel",
    "notes": "Necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-verighete",
    "category": "Diverse",
    "name": "Verighete",
    "currency": "RON",
    "source": "Excel",
    "notes": "Necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-invitatii",
    "category": "Invitatii",
    "name": "Invitatii de nunta",
    "quantity": 80,
    "unitPrice": 18,
    "total": 1500,
    "currency": "RON",
    "advancePaid": 1500,
    "remainingPayment": 0,
    "source": "Excel",
    "notes": "80 bucati, 18 lei/bucata. Total achitat integral.",
    "status": "paid"
  },
  {
    "id": "exp-cake-man",
    "category": "Tort & Candy Bar",
    "name": "The Cake Man - prajituri, fruit bar, candy bar, torturi",
    "total": 9140,
    "currency": "RON",
    "advancePaid": 2285,
    "remainingPayment": 6855,
    "dueDate": "Max. 3 zile dupa eveniment",
    "source": "Contract",
    "status": "partial"
  },
  {
    "id": "exp-kids-corner",
    "category": "Kids Corner",
    "name": "Kids corner pachet nr. 3",
    "quantity": "1 zi + animator 2h",
    "total": 1100,
    "currency": "RON",
    "remainingPayment": 1100,
    "source": "Contract",
    "status": "unpaid"
  },
  {
    "id": "exp-flori-total",
    "category": "Flori",
    "name": "Bamboo Flower - decor floral total",
    "total": 4725,
    "currency": "RON",
    "advancePaid": 300,
    "remainingPayment": 4225,
    "dueDate": "07-08 septembrie 2026 / de confirmat",
    "source": "Contract + Excel",
    "notes": "Contract: avans 300 lei; Excel detaliaza totalul estimat 4725 lei.",
    "status": "partial"
  },
  {
    "id": "exp-buchet-mireasa",
    "category": "Flori",
    "name": "Buchet mireasa",
    "quantity": 1,
    "unitPrice": 335,
    "total": 335,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-buchete-nase",
    "category": "Flori",
    "name": "Buchete nase",
    "quantity": 2,
    "unitPrice": 200,
    "total": 400,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-lumanari",
    "category": "Flori",
    "name": "Lumanarile",
    "quantity": 2,
    "unitPrice": 120,
    "total": 240,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-aranjament-mese",
    "category": "Flori",
    "name": "Aranjament mese",
    "quantity": 20,
    "unitPrice": 130,
    "total": 2600,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-masina",
    "category": "Flori",
    "name": "Aranjament oglinzi masina",
    "quantity": 1,
    "unitPrice": 100,
    "total": 100,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-arcada",
    "category": "Flori",
    "name": "Aranjat arcada",
    "quantity": 1,
    "unitPrice": 1050,
    "total": 1050,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid",
    "includeInTotals": false
  },
  {
    "id": "exp-whisky",
    "category": "Bauturi",
    "name": "Whisky Jack Daniels",
    "quantity": 30,
    "unitPrice": 93,
    "total": 2790,
    "currency": "RON",
    "source": "Excel",
    "notes": "30 sticle / 1L.",
    "status": "unpaid"
  },
  {
    "id": "exp-cazare-vivo",
    "category": "Cazari",
    "name": "Vivo - 1 noapte",
    "quantity": "1 noapte",
    "currency": "RON",
    "source": "Excel",
    "notes": "Pret necompletat.",
    "status": "unknown"
  },
  {
    "id": "exp-cafea-bogdan",
    "category": "Aditional",
    "name": "Cafea Bogdan",
    "total": 2000,
    "currency": "RON",
    "source": "Excel",
    "status": "unpaid"
  },
  {
    "id": "exp-staroste",
    "category": "Aditional",
    "name": "Staroste / coordonator",
    "currency": "RON",
    "source": "Excel",
    "notes": "De decis si completat.",
    "status": "unknown"
  }
];

export const WEDDING_DOCUMENTS: WeddingDocument[] = [
  {
    "id": "doc-sergiu-nicola-photo",
    "title": "Contract Sergiu Nicola Photo",
    "vendorId": "sergiu-nicola-photo",
    "vendorName": "Sergiu Nicola Photo",
    "type": "contract",
    "fileName": "Sergiu Nicola Photo.pdf",
    "notes": "Contract foto: total 1000 EUR, avans 200 EUR, rest 800 EUR.",
    "status": "available"
  },
  {
    "id": "doc-excel",
    "title": "Cheltuieli legate de nunta",
    "type": "excel",
    "fileName": "Cheltuieli legate de nunta.xlsm",
    "notes": "Excelul central cu cheltuieli, invitati si mese.",
    "status": "available"
  },
  {
    "id": "doc-photo-booth",
    "title": "Contract servicii photo booth",
    "vendorId": "photo-booth",
    "vendorName": "K Boom Photo Booth",
    "type": "contract",
    "fileName": "Contract servicii photo booth.docx",
    "notes": "Total 2590 RON, avans 250 RON, rest in max. 48h dupa eveniment.",
    "status": "available"
  },
  {
    "id": "doc-kids-corner",
    "title": "Contract inchiriere kids corner",
    "vendorId": "kids-corner",
    "vendorName": "Colex Nice Cleaning",
    "type": "contract",
    "fileName": "Contract inchiriere - Kids corner - Diana Radu.docx",
    "notes": "Pachet nr. 3, 1100 lei, animator 18:00-20:00.",
    "status": "available"
  },
  {
    "id": "doc-cake",
    "title": "Contract The Cake Man",
    "vendorId": "cake-man",
    "vendorName": "The Cake Man",
    "type": "contract",
    "fileName": "Contract-prestari-servicii-Radu-Diana-Elena-05.09.2026.pdf",
    "notes": "Total 9140 lei, avans 2285 lei, rest 6855 lei.",
    "status": "available"
  },
  {
    "id": "doc-flowers",
    "title": "Contract flori Bamboo Flower",
    "vendorId": "bamboo-flower",
    "vendorName": "Bamboo Flower",
    "type": "image",
    "fileName": "contract flori.jpeg",
    "notes": "Avans 500 lei, rest de stabilit / de confirmat.",
    "status": "available"
  },
  {
    "id": "doc-invitatie-1",
    "title": "Model invitatie simplu",
    "vendorName": "Invitatii",
    "type": "image",
    "fileName": "invitatie-model-floral.png",
    "notes": "Varianta simpla cu flori.",
    "status": "available"
  },
  {
    "id": "doc-invitatie-2",
    "title": "Model invitatie cu Diana si Dan",
    "vendorName": "Invitatii",
    "type": "image",
    "fileName": "invitatie-model-cu-cuplu.png",
    "notes": "Varianta cu desenul mirilor.",
    "status": "available"
  }
];

export const WEDDING_GUESTS: WeddingGuest[] = [
  {
    "id": "guest-001",
    "name": "Mami si Tati",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-002",
    "name": "Mama si tata Dan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-003",
    "name": "Bunica Apahida 1p",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-004",
    "name": "Horincar George si Adelina",
    "side": "Both",
    "invitationStatus": "given",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0,
    "notes": "Invitatia este data, dar confirmarea nu este marcata in Excel."
  },
  {
    "id": "guest-005",
    "name": "Horincar Ioan Marius si Ana",
    "side": "Both",
    "invitationStatus": "given",
    "attendanceStatus": "confirmed",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-006",
    "name": "Horincar Andrei si Viorica",
    "side": "Both",
    "invitationStatus": "given",
    "attendanceStatus": "declined",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-007",
    "name": "Horincar Fabian si prietena",
    "side": "Both",
    "invitationStatus": "given",
    "attendanceStatus": "maybe",
    "adults": 2,
    "children": 0,
    "notes": "Marcat cu ? in Excel."
  },
  {
    "id": "guest-008",
    "name": "Handaric Vasile si Nasa Elena",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-009",
    "name": "Handaric Livia si Razvan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-010",
    "name": "Oica Dumitru si Ina",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-011",
    "name": "Oica Daniel si Iulia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-012",
    "name": "Oica Gabriel si Otilia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-013",
    "name": "Bizo Mircia si Dina",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-014",
    "name": "Weisenbacher Vasile si sotia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-015",
    "name": "Pop Craciun Ilie si Elvira",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-016",
    "name": "Toma Viorel si Antonela",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-017",
    "name": "Zaharia Aurel si Elena",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-018",
    "name": "Melisa si Lore",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-019",
    "name": "Cristina si Dani",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-020",
    "name": "Carmen si Dan Borodi",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-021",
    "name": "Crina si Ovidiu Liberg",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-022",
    "name": "Mada Blaga si Andrei",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-023",
    "name": "Alina si Ionut Palalogos",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-024",
    "name": "Vasi Dan 1p",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-025",
    "name": "Cristina si Adi Madarasan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-026",
    "name": "Oana si Adi Cretu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-027",
    "name": "Andreea Spania si tanti Maria",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-028",
    "name": "Rusu Felicia 1p",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-029",
    "name": "Pacurar Florin si sotia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-030",
    "name": "Emanuel Marian si Ana Maria",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-031",
    "name": "Petrut Campean",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-032",
    "name": "Violeta cu Emil",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-033",
    "name": "Dan Corlanu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-034",
    "name": "Gabi Trestian",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-035",
    "name": "Paul Trestian",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-036",
    "name": "Vali Puscas",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-037",
    "name": "Simion + Horia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-038",
    "name": "Meliora Ciceo",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-039",
    "name": "Sabita si sotul",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-040",
    "name": "Georgiana si sotul",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-041",
    "name": "Tilu Vaidasigan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-042",
    "name": "Purcel Adi",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-043",
    "name": "Cristi",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-044",
    "name": "Ionut",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-045",
    "name": "Goleatu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-046",
    "name": "Andrei Coruha",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-047",
    "name": "Aurel Coruha",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-048",
    "name": "Sanda Pacurar",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-049",
    "name": "Marcel si sotia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-050",
    "name": "Alexandra + DH",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-051",
    "name": "Iulia Pacurar si sotul",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-052",
    "name": "Monica cu Ica",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-053",
    "name": "Bebe Costansiu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-054",
    "name": "Vilia Leita",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-055",
    "name": "Fanicu Pacurar",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-056",
    "name": "Mariana Sirgu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-057",
    "name": "Cristi Tusa",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-058",
    "name": "Marius Muresan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-059",
    "name": "Daniel Gilau",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-060",
    "name": "Daniel",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-061",
    "name": "Daniela",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-062",
    "name": "Razvan Deac si Timea",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-063",
    "name": "Mihai Deac si Brandusa",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-064",
    "name": "Andreea Chiscari si Dan",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-065",
    "name": "Tiberia si Rasmus",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-066",
    "name": "Andreea si Cristi Gostilian",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-067",
    "name": "Gabi si Ioana",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-068",
    "name": "Dan Ratiu si Roxana",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-069",
    "name": "Alexandra Holom si Cristi",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-070",
    "name": "Alex si Gianina Luchian",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-071",
    "name": "Dumitru si sotia",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-072",
    "name": "Profesoara Astilean si sotul",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-073",
    "name": "Claudiu si Andreea Domuta",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-074",
    "name": "Rodica si Rene",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 2,
    "children": 0
  },
  {
    "id": "guest-075",
    "name": "Norbi 1p",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-076",
    "name": "Razvan Tarnovan 1p",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  },
  {
    "id": "guest-077",
    "name": "Orsi cu Flaviu",
    "side": "Both",
    "invitationStatus": "unknown",
    "attendanceStatus": "pending",
    "adults": 1,
    "children": 0
  }
];

export const WEDDING_TASKS: WeddingTask[] = [
  {
    "id": "task-001",
    "title": "Confirma suma finala la Bamboo Flower",
    "category": "Flori",
    "status": "todo",
    "priority": "high",
    "notes": "Contractul are avans 500 lei si rest de stabilit; Excelul are total 4725 lei. Confirma suma finala si ce include exact."
  },
  {
    "id": "task-002",
    "title": "Confirma TVA si restul la Wild Garden",
    "category": "Sala",
    "status": "todo",
    "priority": "high",
    "notes": "Excel: 3500 EUR total, 1000 EUR + TVA avans, 2500 EUR + TVA rest. Trebuie confirmat daca mai sunt plati inainte de nunta."
  },
  {
    "id": "task-003",
    "title": "Completeaza pretul meniurilor",
    "category": "Sala",
    "status": "todo",
    "priority": "high",
    "notes": "In Excel meniurile sunt necompletate."
  },
  {
    "id": "task-004",
    "title": "Completeaza preturile la bauturi",
    "category": "Bauturi",
    "status": "todo",
    "priority": "medium",
    "notes": "Momentan doar whisky are pret. Restul au cantitati, dar preturi 0/necompletate."
  },
  {
    "id": "task-005",
    "title": "Confirma moneda pentru Video Denis MSG",
    "category": "Video",
    "status": "todo",
    "priority": "medium",
    "notes": "In Excel apare 1000, dar moneda nu e clara."
  },
  {
    "id": "task-006",
    "title": "Verifica plata K Boom dupa eveniment",
    "category": "Photo booth",
    "dueDate": "2026-09-07",
    "status": "todo",
    "priority": "high",
    "notes": "Rest 2340 RON in maximum 48h dupa eveniment."
  },
  {
    "id": "task-007",
    "title": "Verifica plata The Cake Man dupa eveniment",
    "category": "Tort & Candy Bar",
    "dueDate": "2026-09-08",
    "status": "todo",
    "priority": "high",
    "notes": "Rest 6855 RON in maximum 3 zile dupa eveniment."
  },
  {
    "id": "task-008",
    "title": "Curata lista de invitati si completeaza statusurile",
    "category": "Invitati",
    "status": "in-progress",
    "priority": "high",
    "notes": "Lista importata din Excel are multe statusuri goale. Completeaza vine/nu vine/poate si numarul de persoane."
  },
  {
    "id": "task-009",
    "title": "Decide staroste / coordonator",
    "category": "Aditional",
    "status": "todo",
    "priority": "medium",
    "notes": "Excel contine Staroste? Coordonator? fara pret."
  },
  {
    "id": "task-010",
    "title": "Finalizeaza modelul de invitatie",
    "category": "Invitatii",
    "status": "in-progress",
    "priority": "medium",
    "notes": "Ai doua variante vizuale salvate ca referinta."
  }
];

export const WEDDING_DRINKS: WeddingDrinkItem[] = [
  {
    "id": "drink-whisky",
    "name": "Whisky Jack Daniels",
    "pricePerLiter": 93,
    "quantity": 30,
    "total": 2790,
    "packageVolume": 1,
    "bottles": 30
  },
  {
    "id": "drink-coniac",
    "name": "Coniac / vin ars de Jidvei",
    "quantity": 13,
    "packageVolume": 0.7,
    "bottles": 18.57,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-bere",
    "name": "Bere Becks",
    "quantity": 99,
    "packageVolume": 0.33,
    "bottles": 300,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-lichior",
    "name": "Lichior Cherry Dance",
    "quantity": 7,
    "packageVolume": 0.7,
    "bottles": 10,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-bere-fara-alcool",
    "name": "Bere fara alcool",
    "quantity": 30,
    "packageVolume": 0.33,
    "bottles": 90.91,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-coca-cola",
    "name": "Coca Cola 2L",
    "quantity": 90,
    "packageVolume": 2,
    "bottles": 45,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-suc-portocale",
    "name": "Suc natural de portocale 2L",
    "quantity": 90,
    "packageVolume": 2,
    "bottles": 45,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-apa-plata",
    "name": "Apa plata",
    "quantity": 105,
    "packageVolume": 2,
    "bottles": 52.5,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-apa-minerala",
    "name": "Apa minerala 1.5L",
    "quantity": 79,
    "packageVolume": 1.5,
    "bottles": 52.67,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-coca-lite",
    "name": "Coca Cola Lite 2L",
    "quantity": 30,
    "packageVolume": 2,
    "bottles": 15,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-sampanie",
    "name": "Sampanie",
    "quantity": 6,
    "packageVolume": 0.7,
    "bottles": 8.57,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-sampania-mirilor",
    "name": "Sampania mirilor",
    "quantity": 0.7,
    "packageVolume": 0.7,
    "bottles": 1,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-vin-alb",
    "name": "Vin alb",
    "quantity": 45,
    "packageVolume": 10,
    "bottles": 4.5,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-vin-rosu",
    "name": "Vin rosu",
    "quantity": 23,
    "packageVolume": 10,
    "bottles": 2.3,
    "notes": "Pret necompletat."
  },
  {
    "id": "drink-tuica",
    "name": "Tuica",
    "quantity": 9,
    "packageVolume": 1,
    "bottles": 9,
    "notes": "Pret necompletat."
  },
];

export const WEDDING_ACCOMMODATIONS: WeddingAccommodation[] = [
  {
    "id": "cazare-vivo",
    "name": "Vivo - 1 noapte",
    "location": "Cluj-Napoca",
    "checkIn": "2026-09-05",
    "checkOut": "2026-09-06",
    "nights": 1,
    "rooms": 0,
    "guests": 0,
    "currency": "RON",
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "Din Excel apare cazare Vivo - 1 noapte, dar pretul si numarul de camere nu sunt completate.",
    "status": "unknown"
  },
  {
    "id": "cazare-familie-diana",
    "name": "Cazare familie Diana",
    "location": "De stabilit",
    "checkIn": "2026-09-05",
    "checkOut": "2026-09-06",
    "nights": 1,
    "rooms": 0,
    "guests": 0,
    "currency": "RON",
    "notes": "De completat daca trebuie camere pentru rudele Dianei.",
    "status": "to-book"
  },
  {
    "id": "cazare-familie-dan",
    "name": "Cazare familie Dan",
    "location": "De stabilit",
    "checkIn": "2026-09-05",
    "checkOut": "2026-09-06",
    "nights": 1,
    "rooms": 0,
    "guests": 0,
    "currency": "RON",
    "notes": "De completat daca trebuie camere pentru rudele lui Dan.",
    "status": "to-book"
  }
];
export const WEDDING_PREPARATIONS: WeddingPreparationItem[] = [
  {
    "id": "rochie-mireasa",
    "name": "Rochia de mireasa",
    "category": "Mireasa",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "De completat pretul rochiei.",
    "status": "unknown"
  },
  {
    "id": "aranjat-par-mireasa",
    "name": "Aranjat mireasa par",
    "category": "Beauty",
    "provider": "Lavinia S.",
    "appointmentTime": "08:30",
    "appointmentDate": "2026-09-05",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "Programare par mireasa la 08:30.",
    "status": "booked"
  },
  {
    "id": "machiaj-mireasa",
    "name": "Aranjat mireasa machiaj",
    "category": "Beauty",
    "provider": "Flavia S.",
    "appointmentTime": "07:30",
    "appointmentDate": "2026-09-05",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "Programare machiaj mireasa la 07:30.",
    "status": "booked"
  },
  {
    "id": "pantofi-mireasa",
    "name": "Pantofi mireasa",
    "category": "Mireasa",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "De completat modelul si pretul.",
    "status": "unknown"
  },
  {
    "id": "costum-mire",
    "name": "Costumul pentru mire",
    "category": "Mire",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "De completat magazinul, modelul si pretul.",
    "status": "unknown"
  }
];

export const WEDDING_RINGS: WeddingRingItem[] = [
  {
    "id": "verighete",
    "name": "Verighete",
    "shop": "De stabilit",
    "material": "De stabilit",
    "sizeDiana": "",
    "sizeDan": "",
    "currency": "RON",
    "totalPrice": 0,
    "advancePaid": 0,
    "remainingPayment": 0,
    "notes": "De ales modelul, materialul, magazinul si marimile.",
    "status": "to-choose"
  }
];

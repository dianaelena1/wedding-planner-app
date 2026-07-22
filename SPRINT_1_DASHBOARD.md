# Sprint 1 – Dashboard: plăți și task-uri

Modificări incluse:

- plățile rămase sunt separate pe Dashboard în:
  - înainte de nuntă;
  - în ziua nunții;
  - după nuntă;
- fiecare plată afișează suma rămasă și termenul;
- task-urile sunt prezentate separat ca:
  - întârziate;
  - urgente;
  - scadente în următoarele 7 zile;
- modelul `WeddingExpense` acceptă opțional câmpul `paymentMoment`:
  - `before-wedding`;
  - `wedding-day`;
  - `after-wedding`.

Până când acest câmp este adăugat în formularul de plăți, Dashboard-ul clasifică automat plățile folosind data scadentă și formulările din notițe, de exemplu „după eveniment”.

După dezarhivare:

```bash
npm install
ng serve
```

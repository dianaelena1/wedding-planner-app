# Sprint 2 — Modelul de plăți

## Ce s-a adăugat

- momentul plății: înainte de nuntă, în ziua nunții sau după nuntă;
- termen de plată exact, relativ sau nespecificat;
- furnizor asociat, selectat din lista de furnizori din Firestore;
- statusul plății și observațiile sunt vizibile și editabile în același formular;
- opțiune explicită „Se plătește după eveniment”;
- tabelul plăților afișează furnizorul, momentul și termenul;
- Dashboard-ul folosește noile câmpuri pentru gruparea plăților.

## Compatibilitate

Înregistrările vechi rămân compatibile. La editare, aplicația deduce automat tipul termenului și momentul plății din câmpurile existente.

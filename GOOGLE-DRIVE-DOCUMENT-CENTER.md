# Document Center cu Google Drive

Modulul Documente nu mai folosește Firebase Storage.

## Cum adaugi un document
1. Încarcă fișierul în Google Drive.
2. Apasă Share / Distribuie.
3. Setează accesul dorit (recomandat: Restricted și acces doar pentru conturile voastre).
4. Apasă Copy link / Copiază linkul.
5. În aplicație: Documente → Adaugă document → lipește linkul.

În Firestore se salvează numai metadatele și linkul, în colecția `weddingDocuments`.
Ștergerea din aplicație nu șterge fișierul din Google Drive.

## Compatibilitate
Înregistrările vechi care aveau `downloadUrl` din Firebase Storage rămân vizibile. Le poți edita și înlocui linkul cu unul Google Drive.

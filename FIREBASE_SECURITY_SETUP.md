# Stabilizare și reguli Firebase

Această versiune blochează accesul la date pentru orice cont care nu este înscris explicit în colecția `appAccess`.

## 1. Află UID-urile conturilor

Pornește aplicația și autentifică-te. UID-ul apare în cardul de autentificare din bara laterală.

Pentru Dan, autentifică-te o dată cu contul lui și copiază UID-ul afișat.

## 2. Creează lista de acces

În Firebase Console:

1. Firestore Database → Data.
2. Creează colecția `appAccess`.
3. Creează câte un document pentru fiecare persoană autorizată.
4. **Document ID trebuie să fie exact UID-ul Firebase Authentication.**
5. Câmpurile pot fi:
   - `email` — string;
   - `name` — string;
   - `createdAt` — timestamp.

Regulile verifică existența documentului, nu valorile câmpurilor.

## 3. Publică regulile

### Din Firebase Console

Copiază conținutul din:

- `firestore.rules` în Firestore Database → Rules;
- `storage.rules` în Storage → Rules.

Apasă `Publish` în ambele locuri.

### Din terminal

Dacă Firebase CLI este configurat pentru proiect:

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run firebase:deploy:rules
```

## 4. Testează

- Diana poate citi, adăuga, edita și șterge.
- Dan poate face aceleași operații după adăugarea UID-ului lui.
- Un alt cont Google trebuie să primească `Missing or insufficient permissions`.
- Uploadul acceptă documente și imagini de maximum 20 MB.
- Orice colecție Firestore neprevăzută este blocată implicit.

## Recuperare dacă te-ai blocat

În Firebase Console → Firestore Database → Rules, publică temporar:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Creează documentele `appAccess/{uid}`, apoi republică `firestore.rules` din proiect.

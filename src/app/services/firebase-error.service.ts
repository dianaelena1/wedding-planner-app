import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';

@Injectable({ providedIn: 'root' })
export class FirebaseErrorService {
  private readonly auth = inject(Auth);

  getMessage(error: unknown): string {
    const code = this.getCode(error);

    switch (code) {
      case 'permission-denied':
      case 'storage/unauthorized': {
        const uid = this.auth.currentUser?.uid;
        const uidHint = uid ? ` UID-ul contului este: ${uid}.` : '';
        return `Nu ai permisiune pentru această operație. Verifică regulile Firebase și documentul appAccess.${uidHint}`;
      }
      case 'unauthenticated':
      case 'auth/user-token-expired':
      case 'auth/id-token-expired':
        return 'Sesiunea a expirat. Deloghează-te și autentifică-te din nou.';
      case 'unavailable':
      case 'storage/retry-limit-exceeded':
        return 'Firebase nu este disponibil momentan. Verifică internetul și încearcă din nou.';
      case 'storage/quota-exceeded':
        return 'Spațiul Firebase Storage disponibil a fost depășit.';
      case 'storage/object-not-found':
        return 'Fișierul nu mai există în Firebase Storage.';
      case 'auth/popup-closed-by-user':
        return 'Fereastra de autentificare a fost închisă înainte de finalizare.';
      case 'auth/popup-blocked':
        return 'Browserul a blocat fereastra de autentificare. Permite ferestrele pop-up și încearcă din nou.';
      case 'already-exists':
        return 'Înregistrarea există deja.';
      case 'failed-precondition':
        return 'Operația nu poate fi finalizată în starea curentă. Reîncarcă pagina și încearcă din nou.';
      default:
        return error instanceof Error && error.message
          ? error.message
          : 'A apărut o eroare neașteptată. Încearcă din nou.';
    }
  }

  private getCode(error: unknown): string | undefined {
    if (error instanceof FirebaseError) {
      return error.code;
    }

    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      return typeof code === 'string' ? code.replace(/^firestore\//, '') : undefined;
    }

    return undefined;
  }
}

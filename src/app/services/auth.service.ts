import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, authState, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  readonly user$: Observable<User | null> = authState(this.auth);

  loginWithGoogle(): Promise<unknown> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}

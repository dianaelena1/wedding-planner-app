import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  signInWithPopup,
  signOut
} from '@angular/fire/auth';

import {
  Observable,
  map,
  shareReplay
} from 'rxjs';

export type AppRole =
    | 'admin'
    | 'viewer'
    | 'guest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);

  private readonly adminEmail =
      'diana.elenaa1@gmail.com';

  readonly user$: Observable<User | null> =
      authState(this.auth).pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true
          })
      );

  readonly role$: Observable<AppRole> =
      this.user$.pipe(
          map(user => this.resolveRole(user)),
          shareReplay({
            bufferSize: 1,
            refCount: true
          })
      );

  readonly isAdmin$: Observable<boolean> =
      this.role$.pipe(
          map(role => role === 'admin')
      );

  readonly isViewer$: Observable<boolean> =
      this.role$.pipe(
          map(role => role === 'viewer')
      );

  loginWithGoogle(): Promise<unknown> {
    const provider =
        new GoogleAuthProvider();

    return signInWithPopup(
        this.auth,
        provider
    );
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  private resolveRole(
      user: User | null
  ): AppRole {
    if (!user) {
      return 'guest';
    }

    const email =
        user.email
            ?.trim()
            .toLowerCase();

    if (
        email ===
        this.adminEmail.toLowerCase()
    ) {
      return 'admin';
    }

    return 'viewer';
  }
}
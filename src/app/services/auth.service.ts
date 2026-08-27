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
  Firestore,
  doc,
  docData
} from '@angular/fire/firestore';
import {
  Observable,
  catchError,
  map,
  of,
  shareReplay,
  switchMap
} from 'rxjs';

export type AppRole =
  | 'admin'
  | 'viewer'
  | 'guest';

interface AppAccessDocument {
  role?: 'admin' | 'viewer';
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  readonly user$: Observable<User | null> =
    authState(this.auth).pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true
      })
    );

  readonly role$: Observable<AppRole> =
    this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of<AppRole>('guest');
        }

        return (
          docData(
            doc(
              this.firestore,
              `appAccess/${user.uid}`
            )
          ) as Observable<AppAccessDocument | undefined>
        ).pipe(
          map(access => {
            if (access?.role === 'admin') {
              return 'admin' as AppRole;
            }

            if (access?.role === 'viewer') {
              return 'viewer' as AppRole;
            }

            return 'guest' as AppRole;
          }),
          catchError(error => {
            console.error(
              'Nu am putut citi rolul utilizatorului.',
              error
            );

            return of<AppRole>('guest');
          })
        );
      }),
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

  readonly isAuthenticated$: Observable<boolean> =
    this.user$.pipe(
      map(user => Boolean(user))
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
}

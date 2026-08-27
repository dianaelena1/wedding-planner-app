import { AsyncPipe } from '@angular/common';
import {
  Component,
  inject
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './services/auth.service';
import { FirebaseErrorService } from './services/firebase-error.service';
import { EditSafetyComponent } from './core/edit-safety/edit-safety.component';

interface NavigationItem {
  label: string;
  route: string;
  icon?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    EditSafetyComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly authService =
    inject(AuthService);

  private readonly firebaseErrorService =
    inject(FirebaseErrorService);

  private readonly router =
    inject(Router);

  readonly user$ =
    this.authService.user$;

  readonly role$ =
    this.authService.role$;

  readonly navigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard'
    },
    {
      label: 'Task-uri',
      route: '/tasks',
      adminOnly: true
    },
    {
      label: 'Furnizori',
      route: '/vendors',
      adminOnly: true
    },
    {
      label: 'Documente',
      route: '/documents',
      adminOnly: true
    },
    {
      label: 'Plăți',
      route: '/payments',
      adminOnly: true
    },
    {
      label: 'Invitați',
      route: '/guests'
    },
    {
      label: 'Așezare mese',
      route: '/seating',
      adminOnly: true
    },
    {
      label: 'Ziua nunții',
      icon: '💍',
      route: '/ziua-nuntii'
    },
    {
      label: 'Export & Backup',
      route: '/export-backup',
      adminOnly: true
    }
  ];

  menuOpen = false;

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.closeMenu();

        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      });
  }

  toggleMenu(): void {
    this.menuOpen =
      !this.menuOpen;

    document.body.classList.toggle(
      'mobile-menu-open',
      this.menuOpen
    );
  }

  closeMenu(): void {
    this.menuOpen = false;

    document.body.classList.remove(
      'mobile-menu-open'
    );
  }

  login(): void {
    this.authService
      .loginWithGoogle()
      .catch(error => {
        console.error(error);

        alert(
          this.firebaseErrorService
            .getMessage(error)
        );
      });
  }

  logout(): void {
    this.authService
      .logout()
      .catch(error => {
        console.error(error);
      });
  }
}

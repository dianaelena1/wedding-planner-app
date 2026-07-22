import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly firebaseErrorService =
    inject(FirebaseErrorService);
  private readonly router = inject(Router);

  readonly user$ = this.authService.user$;

  readonly mainNavigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: '⌂',
      route: '/dashboard'
    },
    {
      label: 'Alerte',
      icon: '!',
      route: '/alerts'
    },
    {
      label: 'Calendar',
      icon: '□',
      route: '/calendar'
    },
    {
      label: 'Furnizori',
      icon: '✦',
      route: '/vendors'
    },
    {
      label: 'Plăți',
      icon: '€',
      route: '/payments'
    },
    {
      label: 'Invitați',
      icon: '♙',
      route: '/guests'
    },
    {
      label: 'Așezare mese',
      icon: '◫',
      route: '/seating'
    },
    {
      label: 'Task-uri',
      icon: '✓',
      route: '/tasks'
    }
  ];

  readonly secondaryNavigation: NavigationItem[] = [
    {
      label: 'Documente',
      icon: '▤',
      route: '/documents'
    },
    {
      label: 'Cazări',
      icon: '⌂',
      route: '/cazari'
    },
    {
      label: 'Pregătiri',
      icon: '◇',
      route: '/pregatiri'
    },
    {
      label: 'Verighete',
      icon: '○',
      route: '/verighete'
    },
    {
      label: 'Export & Backup',
      icon: '⇩',
      route: '/export-backup'
    }
  ];

  readonly mobileNavigation: NavigationItem[] = [
    {
      label: 'Acasă',
      icon: '⌂',
      route: '/dashboard'
    },
    {
      label: 'Invitați',
      icon: '♙',
      route: '/guests'
    },
    {
      label: 'Ziua nunții',
      icon: '♥',
      route: '/ziua-nuntii'
    },
    {
      label: 'Mese',
      icon: '◫',
      route: '/seating'
    },
    {
      label: 'Task-uri',
      icon: '✓',
      route: '/tasks'
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
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle(
      'mobile-menu-open',
      this.menuOpen
    );
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.classList.remove('mobile-menu-open');
  }

  login(): void {
    this.authService.loginWithGoogle().catch(error => {
      console.error(error);
      alert(this.firebaseErrorService.getMessage(error));
    });
  }

  logout(): void {
    this.authService
      .logout()
      .catch(error => console.error(error));
  }
}

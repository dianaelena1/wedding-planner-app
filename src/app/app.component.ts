import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private authService = inject(AuthService);
  user$ = this.authService.user$;

  login(): void {
    this.authService.loginWithGoogle().catch((error) => {
      console.error(error);
      alert('Nu s-a putut face autentificarea cu Google. Verifica Firebase Authentication.');
    });
  }

  logout(): void {
    this.authService.logout().catch((error) => console.error(error));
  }
}

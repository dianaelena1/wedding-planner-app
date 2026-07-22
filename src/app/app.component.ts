import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FirebaseErrorService } from './services/firebase-error.service';
import { EditSafetyComponent } from './core/edit-safety/edit-safety.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, EditSafetyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private authService = inject(AuthService);
  private firebaseErrorService = inject(FirebaseErrorService);
  user$ = this.authService.user$;

  login(): void {
    this.authService.loginWithGoogle().catch((error) => {
      console.error(error);
      alert(this.firebaseErrorService.getMessage(error));
    });
  }

  logout(): void {
    this.authService.logout().catch((error) => console.error(error));
  }
}

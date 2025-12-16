import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public authService = inject(AuthService);
  private router = inject(Router);
  protected readonly title = signal('trabajo-final-apps');

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    }
}

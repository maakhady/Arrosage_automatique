import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Ajoutez cette import
import { faUser, faBell, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menuVisible = false;
  faUser = faUser;
  faBell = faBell;
  faSignOutAlt = faSignOutAlt;
  faUserCircle = faUserCircle;

  constructor(
    private authService: AuthService,
    private router: Router  // Ajoutez cette injection
  ) {}

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible;
  }

  onLogoutAll() {
    this.authService.logoutAll().subscribe({
      next: ({ success }) => {
        if (success) {
          this.router.navigate(['/login']);
        }
      },
      error: (err: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue lors de la déconnexion.';
  
        switch (err.status) {
          case 0:
            errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.';
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            this.router.navigate(['/login']);
            break;
        }
  
        alert(errorMessage);
      }
    });
  }
  


  navigateToProfile(): void {
    this.router.navigate(['/components/user-profile']);
  }
}

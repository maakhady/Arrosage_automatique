import { Component } from '@angular/core';
import { faUser, faBell, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from './../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterModule], // Ajouter FontAwesomeModule ici
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menuVisible = false;
  faUser = faUser;
  faBell = faBell;
  faSignOutAlt = faSignOutAlt;
  faUserCircle = faUserCircle;

  constructor(private authService: AuthService) {}

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible;
  }

  onLogout() {
    this.authService.logout().subscribe(response => {
      if (response.success) {
        console.log('Déconnexion réussie');
      } else {
        console.error('Échec de la déconnexion');
      }
    });
  }
}
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
  template: `
    <div class="header">
      <h1>Naatangué</h1>
      <nav class="navbar">
        <ul>
          <li>
            <a href="#notifications">
              <fa-icon [icon]="faBell"></fa-icon> <!-- Icône de notifications -->
            </a>
          </li>
          <li (click)="toggleMenu($event)">
            <a href="javascript:void(0)">
              <fa-icon [icon]="faUser"></fa-icon> <!-- Icône d'utilisateur -->
            </a>
            <div class="dropdown" *ngIf="menuVisible">
              <ul class="dropdown-links">
                <li>
                  <a [routerLink]="['/user-profile']">
                    <fa-icon [icon]="faUserCircle"></fa-icon> <!-- Icône de profil -->
                    <span>Voir le profil</span>
                  </a>
                </li>
                <li>
                  <a href="#logout" (click)="onLogout()">
                    <fa-icon [icon]="faSignOutAlt"></fa-icon> <!-- Icône de déconnexion -->
                    <span>Déconnexion</span>
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
      .header {
    background: #50A24C; /* Couleur de fond */
    padding: 16px 24px; /* Ajustez le padding si nécessaire */
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px; /* Hauteur fixe */
    margin: 0; /* Assurez-vous qu'il n'y a pas de marge */
    position: fixed; /* Fixer l'en-tête en haut */
    top: 0; /* Positionner en haut */
    left: 0; /* S'assurer qu'il est aligné à gauche */
    right: 0; /* S'assurer qu'il est aligné à droite */
    z-index: 1000; /* Assurez-vous qu'il est au-dessus des autres éléments */
  }
  
  .header h1 {
    margin: 0; /* Supprimer la marge de h1 */
    font-size: 24px; /* Ajuster la taille de la police */
    font-weight: bold;
  }
  
    .navbar ul {
      list-style: none;
      display: flex;
      margin: 0;
      padding: 0;
      margin-left: auto;
    }
  
    .navbar li {
      margin-left: 20px; /* Ajuster l'espacement entre les éléments */
      position: relative;
    }
  
    .navbar a {
      text-decoration: none;
      color: white;
      font-size: 24px;
      display: flex;
      align-items: center;
    }
  
    .navbar a:hover {
      color: #e0e0e0;
    }
  
    .dropdown {
      position: absolute;
      top: 100%; /* Positionner le menu déroulant */
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      width: 180px;
    }
  
    .dropdown-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  
    .dropdown-links li {
      padding: 8px 12px;
      text-align: left;
    }
  
    .dropdown-links li a {
      color: #333;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
  
    .dropdown-links li a:hover {
      background-color: #f0f0f0;
      color: #50A24C;
    }
  `]
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
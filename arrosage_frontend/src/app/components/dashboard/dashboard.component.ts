import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherCardComponent } from '../weather-card/weather-card.component';
import { MenuComponent } from '../menu/menu.component';
// import { WaterTankComponent } from '../water-tank/water-tank.component';
import { ZonesComponent } from '../zones/zones.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faBell, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
// import { HistoriquesComponent } from '../historiques/historiques.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WeatherCardComponent,
    MenuComponent,
    // WaterTankComponent,
    ZonesComponent,
    FontAwesomeModule,
    HeaderComponent,
    // HistoriquesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  template: `
    <div class="dashboard">
        <app-header></app-header>

      <div class="cards-wrapper">
        <div class="cards-container">
          <app-weather-card
            class="card-item"
            title="Humidité du sol"
            [value]="78"
            unit=" %"
            valueColor="#10b981"
            icon="fa-cloud-rain"
            iconColor="#60a5fa"
            iconSize="2x"
          ></app-weather-card>

          <app-weather-card
            class="card-item"
            title="Luminosité"
            [value]="820"
            unit=" lux"
            valueColor="#f97316"
            icon="fa-sun"
            iconColor="#fbbf24"
            iconSize="2x"
          ></app-weather-card>

          <app-weather-card
            class="card-item"
            title="Température"
            [value]="38"
            unit=" °C"
            valueColor="#ef4444"
            [showHumidity]="true"
            [humidityValue]="40"
            icon="fa-thermometer-half"
            iconColor="#ef4444"
            iconSize="2x"
          ></app-weather-card>
        </div>
      </div>

      <div class="content">
        <div class="sidebar">
          <app-menu></app-menu>
          <!-- <app-water-tank></app-water-tank> -->
          <app-zones></app-zones>
        </div>
        <div class="main">
          <!-- <app-zones></app-zones> -->

          <app-historiques></app-historiques>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f1f5f9;
    }

    .header {
      background: #50A24C;
      padding: 16px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0;
      font-size: 20px;
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
      margin-left: 15px;
      position: relative; /* Position pour le menu déroulant */
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
      top: 100%; /* Positionner le menu en dessous */
      right: 0; /* Aligner à droite */
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000; /* Assure que le menu est au-dessus des autres éléments */
      width: 180px; /* Largeur fixe pour le menu */
    }

    .dropdown-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 5px; /* Espace entre les liens */
    }

    .dropdown-links li {
      padding: 8px 12px; /* Réduire le padding */
      text-align: left; /* Aligner le texte à gauche */
    }

    .dropdown-links li a {
      color: #333;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px; /* Espace entre l'icône et le texte */
      font-size: 14px; /* Réduire la taille de la police */
    }

    .dropdown-links li a:hover {
      background-color: #f0f0f0; /* Couleur de fond au survol */
      color: #50A24C; /* Couleur du texte au survol */
    }

    .cards-wrapper {
      padding: 24px;
      background: #f8fafc;
    }

    .cards-container {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      width: 100%;
    }

    .card-item {
      flex: 1;
      min-width: 0;
    }

    .content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
      padding: 24px;
    }

    @media (max-width: 1024px) {
      .cards-container {
        flex-direction: column;
      }

      .content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  menuVisible = false;
  faUser = faUser;
  faBell = faBell;
  faSignOutAlt = faSignOutAlt;
  faUserCircle = faUserCircle;
  router: any;

  constructor(private authService: AuthService) {}

  toggleMenu(event: Event) {
    event.stopPropagation(); // Empêcher la propagation du clic
    this.menuVisible = !this.menuVisible;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    if (this.menuVisible) {
      this.menuVisible = false;
    }
  }

  onLogout() {
    this.authService.logoutAll().subscribe(response => {
      if (response.success) {
        // Rediriger l'utilisateur vers la page de connexion ou une autre page
        console.log('Déconnexion réussie');
        // Vous pouvez utiliser le Router d'Angular pour rediriger l'utilisateur
        this.router.navigate(['/']);
      } else {
        console.error('Échec de la déconnexion');
      }
    });
  }
}

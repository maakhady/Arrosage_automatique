import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherCardComponent } from '../weather-card/weather-card.component';
import { MenuComponent } from '../menu/menu.component';
import { WaterTankComponent } from '../water-tank/water-tank.component';
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
    WaterTankComponent,
    ZonesComponent,
    FontAwesomeModule,
    HeaderComponent,
    // HistoriquesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
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
    this.authService.logout().subscribe(response => {
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
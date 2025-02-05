import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-dashboard-utilisateur',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FontAwesomeModule],
  templateUrl: './dashboard-utilisateur.component.html',
  styleUrls: ['./dashboard-utilisateur.component.css']
})
export class DashboardUtilisateurComponent {

  reservoirVolume = 50;
  faUsers = faUser;

  // Ajout de la liste des arrosages
  arrosages = [
    { date: '01/02/2025', heure: '08:30', duree: '10 min', type: 'Automatique' },
    { date: '02/02/2025', heure: '09:00', duree: '15 min', type: 'Manuel' },
    { date: '03/02/2025', heure: '07:45', duree: '12 min', type: 'Automatique' }
  ];
}

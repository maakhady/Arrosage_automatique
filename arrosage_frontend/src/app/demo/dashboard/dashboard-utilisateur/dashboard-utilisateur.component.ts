import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-utilisateur',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-utilisateur.component.html',
  styleUrls: ['./dashboard-utilisateur.component.css']
})
export class DashboardUtilisateurComponent {
  reservoirVolume = 50;

  // Ajout de la liste des arrosages
  arrosages = [
    { date: '01/02/2025', heure: '08:30', duree: '10 min', type: 'Automatique' },
    { date: '02/02/2025', heure: '09:00', duree: '15 min', type: 'Manuel' },
    { date: '03/02/2025', heure: '07:45', duree: '12 min', type: 'Automatique' }
  ];
}

import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../services/capteur.service'; // Importez votre service WebSocket

@Component({
  selector: 'app-dashboard-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule
  ],
  providers: [AuthService],
  templateUrl: './dashboard-utilisateur.component.html',
  styleUrls: ['./dashboard-utilisateur.component.css']
})
export class DashboardUtilisateurComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  niveau_eau: number | null = null;
  isWatering = false;
  showModal = false;
  faTimes = faTimes;
  isEditing = false;
  editingIndex: number | null = null;
  humidite: number | null = null;
  luminosite: number | null = null;

  arrosages = [
    { date: '01/02/2025', heure: '08:30', duree: '10 min', type: 'Automatique', nom: 'John', prenom: 'Doe' },
    { date: '02/02/2025', heure: '09:00', duree: '15 min', type: 'Manuel', nom: 'Jane', prenom: 'Doe' },
    { date: '03/02/2025', heure: '07:45', duree: '12 min', type: 'Automatique', nom: 'John', prenom: 'Doe' }
  ];

  scheduledTimes = [
    { name: 'John', firstName: 'Doe', date: '02/02/2025', hour: '06:00', preference: 'none', threshold: 0, duration: 30, type: 'Automatique' },
    { name: 'Jane', firstName: 'Doe', date: '03/02/2025', hour: '07:00', preference: 'none', threshold: 0, duration: 45, type: 'Manuel' }
  ];

  newSchedule = {
    hour: '',
    preference: 'none',
    threshold: 0,
    duration: 1,
    type: 'automatique'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocketService // Injectez votre service WebSocket
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/']);
      }
    });

    // Abonnez-vous aux données WebSocket
    this.webSocketService.socket$.subscribe((data) => {
      this.humidite = data.humidite;
      this.luminosite = data.lumiere;
      this.niveau_eau = data.niveau_eau;
    });
  }

  startWatering() {
    this.isWatering = true;
    this.decreaseVolume();
  }

  stopWatering() {
    this.isWatering = false;
    this.resetVolume();
  }

  decreaseVolume() {
    if (!isPlatformBrowser(this.platformId)) return;

    const interval = setInterval(() => {
      if (this.niveau_eau !== null && this.niveau_eau > 0 && this.isWatering) {
        this.niveau_eau -= 1;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  resetVolume() {
    this.niveau_eau = 500; // Réinitialiser à 50%
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.resetNewSchedule();
  }

  saveSchedule() {
    if (this.isEditing && this.editingIndex !== null) {
      this.scheduledTimes[this.editingIndex] = {
        ...this.newSchedule,
        name: 'John', // Remplacer par le nom de l'utilisateur connecté
        firstName: 'Doe', // Remplacer par le prénom de l'utilisateur connecté
        date: new Date().toLocaleDateString() // Date actuelle
      };
      this.isEditing = false;
      this.editingIndex = null;
    } else {
      this.scheduledTimes.push({
        ...this.newSchedule,
        name: 'John', // Remplacer par le nom de l'utilisateur connecté
        firstName: 'Doe', // Remplacer par le prénom de l'utilisateur connecté
        date: new Date().toLocaleDateString() // Date actuelle
      });
    }

    console.log('Horaires programmés enregistrés:', this.scheduledTimes);
    this.closeModal();
  }

  editSchedule(index: number) {
    this.newSchedule = { ...this.scheduledTimes[index] };
    this.isEditing = true;
    this.editingIndex = index;
    this.openModal();
  }

  deleteSchedule(index: number) {
    this.scheduledTimes.splice(index, 1);
  }

  resetNewSchedule() {
    this.newSchedule = {
      hour: '',
      preference: 'none',
      threshold: 0,
      duration: 1,
      type: 'automatique'
    };
  }

  navigateToHistorique(): void {
    this.router.navigate(['/demo/dashboard/historique']);
  }
  navigateToPlante(): void {
    this.router.navigate(['/components/gestion-plantes']);
  }
  navigateToUsers(): void {
    this.router.navigate(['/user-list']);
  }
}

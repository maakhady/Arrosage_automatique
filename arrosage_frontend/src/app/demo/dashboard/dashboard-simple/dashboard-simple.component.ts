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
  selector: 'app-dashboard-simple',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule
  ],
  providers: [AuthService],
  templateUrl: './dashboard-simple.component.html',
  styleUrls: ['./dashboard-simple.component.css']
})
export class DashboardSimpleComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  niveau_eau: number | null = null;
  isWatering = false;
  showModal = false;
  faTimes = faTimes;
  public isEditing = false; // Rendre public
  editingIndex: number | null = null;
  humidite: number | null = null; // Ajoutez cette propriété
  luminosite: number | null = null; // Ajoutez cette propriété

  // Vos données existantes
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

  // Méthode pour démarrer l'arrosage
  startWatering() {
    this.isWatering = true; // Activer l'état d'arrosage
    this.decreaseVolume(); // Démarrer la diminution du volume
  }

  // Méthode pour arrêter l'arrosage
  stopWatering() {
    this.isWatering = false; // Désactiver l'état d'arrosage
    this.resetVolume(); // Réinitialiser le volume
  }

  // Diminuer le volume du réservoir
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

  // Réinitialiser le volume du réservoir
  resetVolume() {
    this.niveau_eau = 500; // Réinitialiser à 50%
  }

  // Ouvrir le modal de programmation
  openModal() {
    this.showModal = true;
  }

  // Fermer le modal de programmation
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.resetNewSchedule();
  }

  // Ajouter ou modifier un horaire
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

  // Modifier un horaire
  editSchedule(index: number) {
    this.newSchedule = { ...this.scheduledTimes[index] };
    this.isEditing = true;
    this.editingIndex = index;
    this.openModal();
  }

  // Supprimer un horaire
  deleteSchedule(index: number) {
    this.scheduledTimes.splice(index, 1);
  }

  // Réinitialiser le programme d'arrosage
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

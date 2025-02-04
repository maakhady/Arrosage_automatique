import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-utilisateur',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard-utilisateur.component.html',
  styleUrls: ['./dashboard-utilisateur.component.css']
})
export class DashboardUtilisateurComponent implements OnInit {
  reservoirVolume = 50; // Volume initial du réservoir
  isWatering = false; // État de l'arrosage
  showModal = false; // État du modal
  faTimes = faTimes; // Icone FontAwesome
  isEditing: boolean = false; // Indicateur de mode édition
  arrosageForm!: FormGroup;
  // plantes: any[] = [];
  editingIndex: number | null = null; // Index de la programmation en cours de modification

  form: FormGroup;
  plantes = [
    { _id: '1', nom: 'Piments' },
    { _id: '2', nom: 'Oignons' },
    { _id: '3', nom: 'Poivrons' },
    { _id: '4', nom: 'Salades' },

    // Ajoutez d'autres plantes ici
  ];

  // Liste des arrosages
  arrosages = [
    { date: '01/02/2025', heure: '08:30', duree: '10 min', type: 'Automatique', nom: 'John', prenom: 'Doe' },
    { date: '02/02/2025', heure: '09:00', duree: '15 min', type: 'Manuel', nom: 'Jane', prenom: 'Doe' },
    { date: '03/02/2025', heure: '07:45', duree: '12 min', type: 'Automatique', nom: 'John', prenom: 'Doe' }
  ];

  // Horaires programmés
  scheduledTimes = [
    { name: 'John', firstName: 'Doe', date: '02/02/2025', hour: '06:00', preference: 'none', threshold: 0, duration: 30, type: 'Automatique' },
    { name: 'Jane', firstName: 'Doe', date: '03/02/2025', hour: '07:00', preference: 'none', threshold: 0, duration: 45, type: 'Manuel' }
  ];

  // Nouveau programme d'arrosage
  newSchedule = {
    hour: '',
    preference: 'none',
    threshold: 0,
    duration: 1,
    type: 'automatique'
  };

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      plante: [this.plantes[0]._id], // Définit la première plante comme valeur par défaut
    });
  }

  ngOnInit(): void {
    // this.loadPlantes();
  }


  createForm() {
    this.arrosageForm = this.fb.group({
        type: ['manuel', Validators.required],
        plante: ['', Validators.required],
        heureDebutHeures: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
        heureDebutMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
        heureDebutSecondes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
        heureFinHeures: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
        heureFinMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
        heureFinSecondes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
        volumeEau: [0, [Validators.required, Validators.min(0)]],
        actif: [true]
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
    const interval = setInterval(() => {
      if (this.reservoirVolume > 0 && this.isWatering) {
        this.reservoirVolume -= 1; // Diminuer le volume de 1% chaque seconde
      } else {
        clearInterval(interval); // Arrêter l'intervalle
      }
    }, 1000); // Mettre à jour toutes les secondes
  }

  // Réinitialiser le volume du réservoir
  resetVolume() {
    this.reservoirVolume = 500; // Réinitialiser à 50%
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
    this.arrosageForm.reset();
    this.resetNewSchedule();
  }

  // Ajouter ou modifier un horaire
  saveSchedule() {
    if (this.arrosageForm.valid) {
        const formData = this.arrosageForm.value;
        const arrosageData = {
            type: formData.type,
            plante: formData.plante,
            heureDebut: {
                heures: formData.heureDebutHeures,
                minutes: formData.heureDebutMinutes,
                secondes: formData.heureDebutSecondes
            },
            heureFin: {
                heures: formData.heureFinHeures,
                minutes: formData.heureFinMinutes,
                secondes: formData.heureFinSecondes
            },
            volumeEau: formData.volumeEau,
            actif: formData.actif
        };

       
        this.closeModal();
    }
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
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ArrosageService, Arrosage, ArrosageResponse } from '../../../services/arrosage.service';
import { PlanteService, Plante } from '../../../services/plante.service';
import Swal from 'sweetalert2';

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
  editingIndex: number | null = null; // Index de la programmation en cours de modification
  arrosages: Arrosage[] = []; // Liste des arrosages
  plantes: Plante[] = [];
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 4; // Nombre d'items par page
  successMessage: string = '';
  successTimeout: any;
  hoveredPlantTimer: any = null;
  remainingTime: string = '';

  // Weather data
  temperature: number = 0;
  humidity: number = 0;
  isRaining: boolean = false;
  weatherErrorMessage: string = '';

  // Notification data
  nextWateringTime: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private arrosageService: ArrosageService,
    private planteService: PlanteService,
    private http: HttpClient
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadArrosages();
    this.loadPlantes();
    this.loadWeatherData();
    this.requestNotificationPermission();

    this.arrosageForm = this.fb.group({
      type: ['', Validators.required],
      plante: ['', Validators.required],
      heureDebutHeures: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      heureDebutMinutes: ['', [Validators.required, Validators.min(0), Validators.max(59)]],
      heureDebutSecondes: ['', [Validators.required, Validators.min(0), Validators.max(59)]],
      heureFinHeures: ['', [Validators.required, Validators.min(0), Validators.max(23)]],
      heureFinMinutes: ['', [Validators.required, Validators.min(0), Validators.max(59)]],
      heureFinSecondes: ['', [Validators.required, Validators.min(0), Validators.max(59)]],
      volumeEau: ['', [Validators.required, Validators.min(0)]],
      humiditeSolRequise: [null],
      luminositeRequise: [null]
    });

    this.arrosageForm.get('plante')?.valueChanges.subscribe(planteId => {
      this.onPlanteChange(planteId);
    });
  }

  // Demander la permission de notification
  requestNotificationPermission(): void {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    }
  }

  // Planifier les notifications d'arrosage
  scheduleWateringNotifications(): void {
    const now = new Date();
    this.arrosages.forEach(arrosage => {
      const startTime = new Date();
      startTime.setHours(arrosage.heureDebut.heures, arrosage.heureDebut.minutes, arrosage.heureDebut.secondes);

      if (startTime > now) {
        const timeDiff = startTime.getTime() - now.getTime();
        setTimeout(() => {
          this.showNotification(`Arrosage de ${arrosage.plante.nom} commence à ${arrosage.heureDebut.heures}:${arrosage.heureDebut.minutes}:${arrosage.heureDebut.secondes}`);
        }, timeDiff);
      }
    });
  }

  // Afficher une notification
  showNotification(message: string): void {
    if ('Notification' in window) {
      new Notification(message);
    }
  }

  // Charger les arrosages depuis le service
  loadArrosages(): void {
    this.arrosageService.getTousArrosages().subscribe(
      (data: ArrosageResponse) => {
        if (data.success && Array.isArray(data.arrosages)) {
          this.arrosages = data.arrosages; // Récupérer les arrosages du bon emplacement
          this.scheduleWateringNotifications(); // Planifier les notifications après le chargement des arrosages
        } else {
          this.arrosages = []; // Réinitialiser si la réponse n'est pas valide
        }
        console.log('Arrosages:', this.arrosages); // Pour débogage
      },
      (error) => {
        console.error('Erreur lors du chargement des arrosages:', error);
      }
    );
  }

  // Charger les plantes depuis le service
  loadPlantes(): void {
    this.planteService.getToutesPlantes().subscribe(
      (data) => {
        this.plantes = Array.isArray(data) ? data : []; // Vérifiez que data est un tableau
      },
      (error) => {
        console.error('Erreur lors du chargement des plantes:', error);
      }
    );
  }

  // Charger les données météorologiques
  loadWeatherData(): void {
    const apiKey = '8ad1844cf41ab86fbbafb1bf4dc6886c'; // Remplacez par votre clé API météo
    const city = 'Dakar'; // Remplacez par votre ville ou localisation
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    this.http.get(url).subscribe((data: any) => {
      this.temperature = data.main.temp;
      this.humidity = data.main.humidity;
      this.isRaining = data.weather.some((weather: any) => weather.main.toLowerCase().includes('rain'));
    }, (error: HttpErrorResponse) => {
      console.error('Erreur lors du chargement des données météorologiques:', error);
      this.weatherErrorMessage = 'Erreur lors du chargement des données météorologiques. Veuillez vérifier votre clé API et les paramètres de la requête.';
    });
  }

  // Créer le formulaire réactif
  createForm(): void {
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
      actif: [true],
      humiditeSolRequise: [null],
      luminositeRequise: [null]
    });
  }

  // Méthode pour gérer le changement de plante
  onPlanteChange(planteId: string): void {
    const selectedPlante = this.plantes.find(plante => plante._id === planteId);
    if (selectedPlante) {
      this.arrosageForm.patchValue({
        humiditeSolRequise: selectedPlante.humiditeSol,
        luminositeRequise: selectedPlante.luminosite,
        volumeEau: selectedPlante.volumeEau
      });
    }
  }

  // Méthode pour démarrer l'arrosage
  startWatering(): void {
    this.isWatering = true;
    this.decreaseVolume();
  }

  // Méthode pour arrêter l'arrosage
  stopWatering(): void {
    Swal.fire({
      title: 'Confirmer',
      text: 'Êtes-vous sûr de vouloir arrêter l\'arrosage ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, arrêter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isWatering = false;
        Swal.fire({
          title: 'Arrêté !',
          text: 'L\'arrosage a été arrêté avec succès.',
          icon: 'success',
          timer: 2000, // Affiche le message pendant 2 secondes
          timerProgressBar: true
        });
      }
    });
  }

  // Diminuer le volume du réservoir
  decreaseVolume(): void {
    const interval = setInterval(() => {
      if (this.reservoirVolume > 0 && this.isWatering) {
        this.reservoirVolume -= 1;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  // Réinitialiser le volume du réservoir
  resetVolume(): void {
    this.reservoirVolume = 50;
  }

  // Ouvrir le modal de programmation
  openModal(): void {
    this.showModal = true;
  }

  // Fermer le modal de programmation
  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.arrosageForm.reset();
  }

  get totalPages(): number {
    return Math.ceil(this.arrosages.length / this.itemsPerPage);
  }

  // Ajouter ou modifier un arrosage
  saveSchedule(): void {
    if (this.arrosageForm.valid) {
      const formData = this.arrosageForm.value;
      const arrosageData: Arrosage = {
        plante: formData.plante,
        utilisateur: this.authService.currentUser?._id || '',
        type: formData.type,
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
        actif: formData.actif,
        date_creation: new Date(),
        date_modification: new Date(),
        parametresArrosage: formData.type === 'automatique' ? {
          humiditeSolRequise: formData.humiditeSolRequise,
          luminositeRequise: formData.luminositeRequise,
          volumeEau: formData.volumeEau
        } : undefined
      };

      const planteNom = this.plantes.find(p => p._id === formData.plante)?.nom || 'plante inconnue';
      const heureDebut = `${formData.heureDebutHeures}:${formData.heureDebutMinutes}:${formData.heureDebutSecondes}`;
      const duree = this.calculateDuration(formData);

      const successMessage = `Programme d'arrosage pour ${planteNom} à partir de ${heureDebut} pendant ${duree}.`;

      if (this.isEditing && this.editingIndex !== null) {
        const arrosageId = this.arrosages[this.editingIndex]._id;
        if (arrosageId) {
          this.arrosageService.updateArrosage(arrosageId, arrosageData).subscribe(
            () => {
              this.loadArrosages();
              this.closeModal();
              Swal.fire({
                title: 'Succès',
                text: successMessage,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true
              });
            },
            (error) => {
              console.error('Erreur lors de la mise à jour de l\'arrosage:', error);
              Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de la mise à jour de l\'arrosage.',
                icon: 'error',
                timer: 2000,
                timerProgressBar: true
              });
            }
          );
        }
      } else {
        this.arrosageService.addArrosage(arrosageData).subscribe(
          () => {
            this.loadArrosages();
            this.closeModal();
            Swal.fire({
              title: 'Succès',
              text: successMessage,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true
            });
          },
          (error) => {
            console.error('Erreur lors de l\'ajout de l\'arrosage:', error);
            Swal.fire({
              title: 'Erreur',
              text: 'Erreur lors de l\'ajout de l\'arrosage.',
              icon: 'error',
              timer: 2000,
              timerProgressBar: true
            });
          }
        );
      }
    }
  }

  // Calculer la durée de l'arrosage
  calculateDuration(formData: any): string {
    const debut = new Date();
    debut.setHours(formData.heureDebutHeures, formData.heureDebutMinutes, formData.heureDebutSecondes);
    const fin = new Date();
    fin.setHours(formData.heureFinHeures, formData.heureFinMinutes, formData.heureFinSecondes);
    const diff = fin.getTime() - debut.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // Modifier un arrosage
  editSchedule(index: number): void {
    const arrosage = this.arrosages[index];
    this.arrosageForm.patchValue({
      type: arrosage.type,
      plante: arrosage.plante._id,
      heureDebutHeures: arrosage.heureDebut.heures,
      heureDebutMinutes: arrosage.heureDebut.minutes,
      heureDebutSecondes: arrosage.heureDebut.secondes,
      heureFinHeures: arrosage.heureFin.heures,
      heureFinMinutes: arrosage.heureFin.minutes,
      heureFinSecondes: arrosage.heureFin.secondes,
      volumeEau: arrosage.volumeEau,
      actif: arrosage.actif,
      humiditeSolRequise: arrosage.parametresArrosage?.humiditeSolRequise,
      luminositeRequise: arrosage.parametresArrosage?.luminositeRequise
    });
    this.isEditing = true;
    this.editingIndex = index;
    this.openModal();
  }

  // Supprimer un arrosage
  deleteSchedule(index: number): void {
    Swal.fire({
      title: 'Confirmer',
      text: 'Êtes-vous sûr de vouloir supprimer cet arrosage ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Logique pour supprimer l'arrosage
        this.arrosages.splice(index, 1); // Exemple de suppression
        Swal.fire({
          title: 'Supprimé !',
          text: 'L\'arrosage a été supprimé avec succès.',
          icon: 'success',
          timer: 2000, // Affiche le message pendant 2 secondes
          timerProgressBar: true
        });
      }
    });
  }

  // Méthode pour obtenir les arrosages paginés
  get paginatedArrosages(): Arrosage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.arrosages.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Méthodes pour changer de page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Méthode pour démarrer la minuterie
  startTimer(heureFin: any): void {
    const fin = new Date();
    fin.setHours(heureFin.heures, heureFin.minutes, heureFin.secondes);

    this.hoveredPlantTimer = setInterval(() => {
      const now = new Date();
      const diff = fin.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(this.hoveredPlantTimer);
        this.remainingTime = 'Arrosage terminé';
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        this.remainingTime = `${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }

  // Méthode pour arrêter la minuterie
  stopTimer(): void {
    if (this.hoveredPlantTimer) {
      clearInterval(this.hoveredPlantTimer);
      this.remainingTime = '';
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../services/capteur.service';
import { ArrosageService } from '../../../services/arrosage.service';
import { Arrosage } from '../../../models/arrosage.model';

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
  providers: [AuthService, ArrosageService],
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
  arrosageForm!: FormGroup;
  editingIndex: number | null = null;
  humidite: number | null = null;
  luminosite: number | null = null;

  // Nouvelles propriétés pour la pagination et les arrosages
  paginatedArrosages: Arrosage[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  timer: any;
  allArrosages: Arrosage[] = [];

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
    private webSocketService: WebSocketService,
    private arrosageService: ArrosageService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadArrosages();
    this.loadPlantes();
    this.loadWeatherData();
    this.requestNotificationPermission();

    this.arrosageForm.get('plante')?.valueChanges.subscribe(planteId => {
      this.onPlanteChange(planteId);
    });
  }

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

  scheduleWateringNotifications(): void {
    const now = new Date();
    if (Array.isArray(this.arrosages)) {
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
  }

  showNotification(message: string): void {
    if ('Notification' in window) {
      new Notification(message);
    }
  }

  loadArrosages(): void {
    this.arrosageService.getMesArrosages().subscribe(
      (data: ArrosageResponse) => {
        if (data.success && Array.isArray(data.arrosages)) {
          this.arrosages = data.arrosages;
          this.scheduleWateringNotifications();
        } else {
          this.arrosages = [];
        }
        console.log('Arrosages:', this.arrosages);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Unauthorized access - perhaps you need to log in?');
          Swal.fire({
            title: 'Erreur',
            text: 'Accès non autorisé - veuillez vous connecter.',
            icon: 'error',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } else {
          console.error('Erreur lors du chargement des arrosages:', error);
        }
      }
    );
  }

  loadPlantes(): void {
    this.planteService.getToutesPlantes().subscribe(
      (data) => {
        this.plantes = Array.isArray(data) ? data : [];
      },
      (error) => {
        console.error('Erreur lors du chargement des plantes:', error);
      }
    );
  }

  loadWeatherData(): void {
    const apiKey = '8ad1844cf41ab86fbbafb1bf4dc6886c';
    const city = 'Dakar';
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

  createForm(): void {
    this.arrosageForm = this.fb.group({
      type: ['automatique', Validators.required], // Définir "automatique" par défaut
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

  startWatering(): void {
    this.isWatering = true;
    this.decreaseVolume();
  }

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
          timer: 2000,
          timerProgressBar: true
        });
      }
    });

    this.webSocketService.socket$.subscribe((data) => {
      this.humidite = data.humidite;
      this.luminosite = data.lumiere;
      this.niveau_eau = data.niveau_eau;
    });

    // Charger les arrosages au démarrage
    this.loadArrosages();
  }

  // Méthodes existantes
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
    this.niveau_eau = 500;
  }


  getVolumeEau(arrosage: Arrosage): number {
    if (arrosage.volumeEau) return arrosage.volumeEau;
    if (arrosage.parametresArrosage?.volumeEau) return arrosage.parametresArrosage.volumeEau;
    return 0;
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.arrosageForm.reset();
  }

  // Nouvelles méthodes pour la gestion des arrosages
  loadArrosages() {
    this.arrosageService.getMesArrosages().subscribe({
      next: (arrosages) => {
        this.allArrosages = arrosages; // Stockez tous les arrosages
        this.updatePagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des arrosages:', error);
      }
    });
  }


  updatePagination() {
    this.totalPages = Math.ceil(this.allArrosages.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedArrosages = this.allArrosages.slice(start, end);
  }


  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  startTimer(heureFin: any) {
    this.stopTimer();
    this.timer = setInterval(() => {
      const now = new Date();
      const end = new Date(heureFin);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  saveSchedule() {
    const [hours, minutes] = this.newSchedule.hour.split(':').map(Number);
    const endHours = hours + Math.floor(this.newSchedule.duration / 60);
    const endMinutes = minutes + (this.newSchedule.duration % 60);

    const newArrosage: Arrosage = {
      type: this.newSchedule.type,
      heureDebut: {
        heures: hours,
        minutes: minutes,
        secondes: 0  // Ajout des secondes
      },
      heureFin: {
        heures: endHours,
        minutes: endMinutes,
        secondes: 0  // Ajout des secondes
      },
      volumeEau: this.newSchedule.duration,
      plante: {
        _id: '679adb05afe9042fc3bb9cb8',  // ID de la plante par défaut
        nom: "Plante par défaut",
        categorie: "Défaut"
      },
      utilisateur: this.authService.getCurrentUser()?.id || '',
      actif: true
    };

    if (this.isEditing && this.editingIndex !== null) {
      const arrosage = this.paginatedArrosages[this.editingIndex];
      if (arrosage._id) {
        this.arrosageService.modifierArrosage(arrosage._id, newArrosage).subscribe({
          next: () => {
            this.loadArrosages();
            this.closeModal();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
          }
        });
      }
    } else {
      this.arrosageService.creerArrosage(newArrosage).subscribe({
        next: () => {
          this.loadArrosages();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }
  editSchedule(arrosage: Arrosage) {
    if (arrosage._id) {
      this.arrosageService.modifierArrosage(arrosage._id, arrosage).subscribe({
        next: (updatedArrosage) => {
          this.loadArrosages();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
        }
      });
    }
  }



  deleteSchedule(arrosage: Arrosage) {
    if (arrosage._id) {
      this.arrosageService.supprimerArrosage(arrosage._id).subscribe({
        next: () => {
          this.loadArrosages();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }


  // Dans votre composant
formatTime(time: { heures: number; minutes: number; secondes: number }): string {
  const heures = time.heures.toString().padStart(2, '0');
  const minutes = time.minutes.toString().padStart(2, '0');
  const secondes = time.secondes.toString().padStart(2, '0');
  return `${heures}:${minutes}:${secondes}`;
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  navigateToPlante(): void {
    this.router.navigate(['/components/gestion-plantes']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/user-list']);
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
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
  reservoirVolume = 50;
  isWatering = false;
  showModal = false;
  faTimes = faTimes;
  isEditing = false;
  arrosageForm!: FormGroup;
  editingIndex: number | null = null;
  arrosages: Arrosage[] = [];
  plantes: Plante[] = [];
  currentPage = 1;
  itemsPerPage = 4;
  successMessage = '';
  successTimeout: any;
  hoveredPlantTimer: any = null;
  remainingTime = '';
  temperature = 0;
  humidity = 0;
  isRaining = false;
  weatherErrorMessage = '';
  nextWateringTime = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private arrosageService: ArrosageService,
    private planteService: PlanteService,
    private http: HttpClient,
    private router: Router
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
  }

  decreaseVolume(): void {
    const interval = setInterval(() => {
      if (this.reservoirVolume > 0 && this.isWatering) {
        this.reservoirVolume -= 1;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  resetVolume(): void {
    this.reservoirVolume = 50;
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.arrosageForm.reset();
  }

  get totalPages(): number {
    return Math.ceil(this.arrosages.length / this.itemsPerPage);
  }

  saveSchedule(): void {
    if (this.arrosageForm.valid) {
      const formData = this.arrosageForm.value;
      const currentUser = this.authService.getCurrentUser();

      const arrosageData: Arrosage = {
        plante: this.plantes.find(p => p._id === formData.plante)!,
        utilisateur: { _id: currentUser?._id || '', nom: currentUser?.nom || '', prenom: currentUser?.prenom || '' },
        type: 'automatique',
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
        parametresArrosage: {
          humiditeSolRequise: formData.humiditeSolRequise,
          luminositeRequise: formData.luminositeRequise,
          volumeEau: formData.volumeEau
        }
      };

      if (this.isEditing && this.editingIndex !== null) {
        const arrosageId = this.arrosages[this.editingIndex]._id;
        if (arrosageId) {
          this.arrosageService.modifierArrosage(arrosageId, arrosageData).subscribe(
            () => {
              this.loadArrosages();
              this.closeModal();
              Swal.fire({
                title: 'Succès',
                text: 'Programme d\'arrosage mis à jour avec succès.',
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
        this.arrosageService.creerArrosage(arrosageData).subscribe(
          () => {
            this.loadArrosages();
            this.closeModal();
            Swal.fire({
              title: 'Succès',
              text: 'Programme d\'arrosage créé avec succès.',
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
        const arrosageId = this.arrosages[index]._id;
        if (arrosageId) {
          this.arrosageService.supprimerArrosage(arrosageId).subscribe(
            () => {
              this.loadArrosages();
              Swal.fire({
                title: 'Supprimé !',
                text: 'L\'arrosage a été supprimé avec succès.',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true
              });
            },
            (error) => {
              console.error('Erreur lors de la suppression de l\'arrosage:', error);
              Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de la suppression de l\'arrosage.',
                icon: 'error',
                timer: 2000,
                timerProgressBar: true
              });
            }
          );
        }
      }
    });
  }

  get paginatedArrosages(): Arrosage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return Array.isArray(this.arrosages) ? this.arrosages.slice(startIndex, startIndex + this.itemsPerPage) : [];
  }

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

  stopTimer(): void {
    if (this.hoveredPlantTimer) {
      clearInterval(this.hoveredPlantTimer);
      this.remainingTime = '';
    }
  }

  showTooltip(event: MouseEvent, weatherInfo: string) {
    const tooltip = document.getElementById('weatherTooltip');
    if (tooltip) {
      tooltip.innerHTML = `<p>${weatherInfo}</p>`;
      tooltip.style.left = `${event.pageX + 10}px`;
      tooltip.style.top = `${event.pageY + 10}px`;
      tooltip.classList.add('visible');
    }
  }

  hideTooltip() {
    const tooltip = document.getElementById('weatherTooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  navigateToUsers() {
    this.router.navigate(['/user-list']);
  }

  navigateToPlante() {
    this.router.navigate(['/components/gestion-plantes']);
  }

  navigateToHistorique() {
    this.router.navigate(['/historique']);
  }
}

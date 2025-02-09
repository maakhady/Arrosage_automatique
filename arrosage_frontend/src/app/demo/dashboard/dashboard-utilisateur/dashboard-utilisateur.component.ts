import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../services/capteur.service';
import { ArrosageService } from '../../../services/arrosage.service';
import { MeteoService } from '../../../services/meteo.service';
import { PlanteService } from '../../../services/plante.service';
import { PompeService } from '../../../services/pompe.service';
import { Arrosage, Plante} from '../../../models/arrosage.model';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-dashboard-utilisateur',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule
  ],
  providers: [AuthService, ArrosageService, PlanteService],
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

  // Propriétés pour la pagination et les arrosages
  paginatedArrosages: Arrosage[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  timer: any;
  allArrosages: Arrosage[] = [];
  plantes: any[] = [];
  arrosageForm!: FormGroup;
  currentArrosageId: string | null = null;
  meteoData: any = null;


  constructor(
    private authService: AuthService,
    private pompeService: PompeService,
    private router: Router,
    private webSocketService: WebSocketService,
    private arrosageService: ArrosageService,
    private planteService: PlanteService,
    private fb: FormBuilder,
    private meteoService: MeteoService

  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.arrosageForm = this.fb.group({
      plante: ['', Validators.required],
      heureDebutHeures: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      heureDebutMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      heureFinHeures: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      heureFinMinutes: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      humiditeSolRequise: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      luminositeRequise: [0, [Validators.required, Validators.min(0)]],
      volumeEau: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigate(['/']);
      }
    });

    this.webSocketService.socket$.subscribe((data) => {
      this.humidite = data.humidite;
      this.luminosite = data.lumiere;
      this.niveau_eau = data.niveau_eau;
    });

    this.loadArrosages();
    this.loadPlantes();
    this.loadMeteo();
  }

  loadMeteo() {
    this.meteoService.getMeteo().subscribe({
      next: (data) => {
        this.meteoData = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la météo:', error);
      }
    });
  }


  loadPlantes(): void {
    this.planteService.getToutesPlantes().subscribe(plantes => {
      this.plantes = plantes;
    });
  }

  startWatering() {
    this.pompeService.demarrerPompe().subscribe({
      next: (response) => {
        console.log('Pompe démarrée:', response);
        this.isWatering = true;
        Swal.fire({
          title: 'Succès!',
          text: 'Arrosage démarré avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Erreur pompe:', error);
        Swal.fire({
          title: 'Erreur!',
          text: 'Erreur lors du démarrage de l\'arrosage',
          icon: 'error'
        });
      }
    });
  }


  stopWatering() {
    this.pompeService.arreterPompe().subscribe({
      next: (response) => {
        console.log('Pompe arrêtée:', response);
        this.isWatering = false;
        Swal.fire({
          title: 'Succès!',
          text: 'Arrosage arrêté avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Erreur pompe:', error);
        Swal.fire({
          title: 'Erreur!',
          text: 'Erreur lors de l\'arrêt de l\'arrosage',
          icon: 'error'
        });
      }
    });
  }



  getVolumeEau(arrosage: Arrosage): number {
    if (arrosage.volumeEau) return arrosage.volumeEau;
    if (arrosage.parametresArrosage?.volumeEau) return arrosage.parametresArrosage.volumeEau;
    return 0;
  }

  openModal() {
    this.initializeForm();
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditing = false;
    this.editingIndex = null;
    this.arrosageForm.reset();
    this.currentArrosageId = null;
  }

  loadArrosages() {
    this.arrosageService.getMesArrosages().subscribe({
      next: (arrosages) => {
        this.allArrosages = arrosages;
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

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
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
    if (this.arrosageForm.valid) {
      const formValue = this.arrosageForm.value;

      const newArrosage: Arrosage = {
        _id: this.currentArrosageId || undefined,  // Ajout de l'ID pour la modification
        type: 'automatique',
        heureDebut: {
          heures: formValue.heureDebutHeures,
          minutes: formValue.heureDebutMinutes,
          secondes: 0
        },
        heureFin: {
          heures: formValue.heureFinHeures,
          minutes: formValue.heureFinMinutes,
          secondes: 0
        },
        volumeEau: formValue.volumeEau,
        plante: {
          _id: formValue.plante,
          nom: this.plantes.find(p => p._id === formValue.plante)?.nom || 'N/A',
          categorie: 'N/A'
        },
        parametresArrosage: {
          humiditeSolRequise: formValue.humiditeSolRequise,
          luminositeRequise: formValue.luminositeRequise,
          volumeEau: formValue.volumeEau  // S'assurer que le volume d'eau est bien présent
        },
        utilisateur: this.authService.getCurrentUser()?.id || '',
        actif: true
      };

      // Log pour vérifier l'objet avant envoi
      console.log('Arrosage à sauvegarder:', newArrosage);

      if (this.isEditing && this.currentArrosageId) {
        this.arrosageService.modifierArrosage(this.currentArrosageId, newArrosage).subscribe({
          next: () => {
            this.loadArrosages();
            this.closeModal();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
          }
        });
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
}

  editSchedule(arrosage: Arrosage) {
    this.isEditing = true;
    this.currentArrosageId = arrosage._id || null;
    this.showModal = true;

    // Log pour déboguer
    console.log('Arrosage à modifier:', arrosage);
    console.log('Volume d\'eau:', arrosage.volumeEau);
    console.log('Paramètres arrosage:', arrosage.parametresArrosage);

    this.arrosageForm.patchValue({
      plante: arrosage.plante._id,
      heureDebutHeures: arrosage.heureDebut.heures,
      heureDebutMinutes: arrosage.heureDebut.minutes,
      heureFinHeures: arrosage.heureFin.heures,
      heureFinMinutes: arrosage.heureFin.minutes,
      humiditeSolRequise: arrosage.parametresArrosage?.humiditeSolRequise || 0,
      luminositeRequise: arrosage.parametresArrosage?.luminositeRequise || 0,
      volumeEau: arrosage.parametresArrosage?.volumeEau || arrosage.volumeEau || 0  // Modification ici
    });

    // Log pour vérifier les valeurs du formulaire après patch
    console.log('Valeurs du formulaire après patch:', this.arrosageForm.value);
}

deleteSchedule(arrosage: Arrosage) {
  Swal.fire({
    title: 'Êtes-vous sûr?',
    text: "Voulez-vous vraiment supprimer ce programme d'arrosage ?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, supprimer!',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      if (arrosage._id) {
        this.arrosageService.supprimerArrosage(arrosage._id).subscribe({
          next: () => {
            Swal.fire(
              'Supprimé!',
              'Le programme a été supprimé avec succès.',
              'success'
            );
            this.loadArrosages();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          }
        });
      }
    }
  });
}

  formatTime(time: { heures: number; minutes: number; secondes: number }): string {
    const heures = time.heures.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    const secondes = time.secondes.toString().padStart(2, '0');
    return `${heures}:${minutes}:${secondes}`;
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

  ngOnDestroy() {
    this.stopTimer();
  }
}

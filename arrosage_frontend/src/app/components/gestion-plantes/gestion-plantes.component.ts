import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlanteService, Plante } from './../../services/plante.service';
import { HeaderComponent } from '../header/header.component';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-gestion-plantes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent],
  templateUrl: './gestion-plantes.component.html',
  styleUrls: ['./gestion-plantes.component.css']
})
export class GestionPlantesComponent implements OnInit {
  @ViewChild('planteModal') planteModal!: ElementRef;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef;
  @ViewChild('viewPlantModal') viewPlantModal!: ElementRef;
  @ViewChild('planteForm') planteForm!: NgForm;

  plantes: Plante[] = [];
  filteredPlantes: Plante[] = [];
  selectedPlantes: Plante[] = [];
  currentPlante: Plante = this.getEmptyPlante();
  planteToDelete: Plante | null = null;
  isEditing = false;
  searchQuery = '';
  anySelected = false;
  error: string = '';
  successMessage: string = '';
  successTimeout: any;

  itemsPerPage = 5;
  currentPage = 1;
  totalPages = 1;
  paginatedPlantes: Plante[] = [];

  constructor(private planteService: PlanteService) {}

  ngOnInit(): void {
    this.chargerPlantes();
  }

  private chargerPlantes() {
    this.planteService.getToutesPlantes().subscribe({
      next: (plantes) => {
        this.plantes = plantes.map(p => ({ ...p, selected: false }));
        this.filterPlantes();
      },
      error: (error) => {
        this.error = error.message;
        console.error('Erreur lors du chargement des plantes:', error);
      }
    });
  }

  private getEmptyPlante(): Plante {
    return {
      nom: '',
      categorie: '',
      humiditeSol: 0,
      volumeEau: 0,
      luminosite: 0,
      selected: false
    };
  }

  openPlantModal(plante?: Plante) {
    if (plante) {
      this.currentPlante = { ...plante };
      this.isEditing = true;
    } else {
      this.currentPlante = this.getEmptyPlante();
      this.isEditing = false;
    }
    const modal = new bootstrap.Modal(this.planteModal.nativeElement);
    modal.show();
  }

  confirmDeletePlante(plante: Plante): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer la plante ${plante.nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Non, annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePlantes(plante);
      }
    });
  }

  confirmDeleteSelectedPlantes(): void {
    this.selectedPlantes = this.plantes.filter(plante => plante.selected);

    // Vérifie si des plantes sont sélectionnées
    if (this.selectedPlantes.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune plante sélectionnée',
        text: 'Veuillez sélectionner au moins une plante à supprimer.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    const planteNames = this.selectedPlantes.map(plante => plante.nom).join(', ');

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer les plantes suivantes : ${planteNames} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Non, annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deletePlantes();
      }
    });
  }

  deletePlantes(planteToDelete?: any) {
    if (planteToDelete) {
      // Suppression d'une seule plante via l'icône de suppression
      this.planteService.supprimerPlante(planteToDelete._id).subscribe({
        next: () => {
          this.chargerPlantes();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Plante supprimée avec succès',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          bootstrap.Modal.getInstance(this.confirmDeleteModal.nativeElement).hide();
        },
        error: (error) => {
          this.error = error.message;
          console.error('Erreur lors de la suppression:', error);
        }
      });
    } else {
      // Suppression de plusieurs plantes sélectionnées
      const selectedIds = this.selectedPlantes.map(plante => plante._id as string);
      if (selectedIds.length > 0) {
        this.planteService.supprimerPlusieursPlantes(selectedIds).subscribe({
          next: () => {
            this.chargerPlantes();
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Plantes supprimées avec succès',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            bootstrap.Modal.getInstance(this.confirmDeleteModal.nativeElement).hide();
          },
          error: (error) => {
            this.error = error.message;
            console.error('Erreur lors de la suppression multiple:', error);
          }
        });
      }
    }
  }

  onSubmit() {
    if (!this.planteForm.valid) {
      this.error = 'Tous les champs sont requis';
      return;
    }

    if (this.isEditing && this.currentPlante._id) {
      this.planteService.modifierPlante(this.currentPlante._id, this.currentPlante).subscribe({
        next: () => {
          this.chargerPlantes();
          this.resetForm();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Plante modifiée avec succès',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          bootstrap.Modal.getInstance(this.planteModal.nativeElement).hide();
        },
        error: (error) => {
          this.error = error.message;
          console.error('Erreur lors de la modification:', error);
        }
      });
    } else {
      this.planteService.creerPlante(this.currentPlante).subscribe({
        next: () => {
          this.chargerPlantes();
          this.resetForm();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Nouvelle plante ajoutée avec succès',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          bootstrap.Modal.getInstance(this.planteModal.nativeElement).hide();
        },
        error: (error) => {
          this.error = error.message;
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }

  filterPlantes() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPlantes = this.plantes.filter(plante =>
      plante.nom.toLowerCase().includes(query) ||
      plante.categorie.toLowerCase().includes(query)
    );
    this.totalPages = Math.ceil(this.filteredPlantes.length / this.itemsPerPage);
    this.updatePaginatedPlantes();
  }

  private updatePaginatedPlantes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPlantes = this.filteredPlantes.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedPlantes();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedPlantes();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedPlantes();
    }
  }

  selectAllPlantes(event: any) {
    const checked = event.target.checked;
    this.filteredPlantes.forEach(plante => plante.selected = checked);
    this.updateButtonState();
  }

  updateButtonState() {
    this.anySelected = this.plantes.some(plante => plante.selected);
  }

  viewPlante(plante: Plante) {
    this.currentPlante = plante;
    const modal = new bootstrap.Modal(this.viewPlantModal.nativeElement);
    modal.show();
  }

  editPlante(plante: Plante) {
    this.openPlantModal(plante);
  }

  private clearSuccessMessageAfterDelay() {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
    this.successTimeout = setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private resetForm() {
    this.currentPlante = this.getEmptyPlante();
    this.isEditing = false;
    this.planteForm.resetForm();
  }

  backToDashboard(): void {
    window.history.back();
  }
}
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PlanteService, Plante } from './../../services/plante.service';
import {HeaderComponent} from '../header/header.component';

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

  confirmDeletePlante(plante: Plante) {
    this.planteToDelete = plante;
    this.selectedPlantes = [];
    const modal = new bootstrap.Modal(this.confirmDeleteModal.nativeElement);
    modal.show();
  }

  confirmDeleteSelectedPlantes() {
    this.planteToDelete = null;
    this.selectedPlantes = this.plantes.filter(plante => plante.selected);
    const modal = new bootstrap.Modal(this.confirmDeleteModal.nativeElement);
    modal.show();
  }

  deletePlante() {
    if (this.planteToDelete && this.planteToDelete._id) {
      this.planteService.supprimerPlante(this.planteToDelete._id).subscribe({
        next: () => {
          this.chargerPlantes();
          this.successMessage = 'Plante supprimée avec succès';
          this.clearSuccessMessageAfterDelay();
          bootstrap.Modal.getInstance(this.confirmDeleteModal.nativeElement).hide();
        },
        error: (error) => {
          this.error = error.message;
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  deletePlantes() {
    const selectedIds = this.selectedPlantes.map(plante => plante._id as string);
    if (selectedIds.length > 0) {
      this.planteService.supprimerPlusieursPlantes(selectedIds).subscribe({
        next: () => {
          this.chargerPlantes();
          this.successMessage = 'Plantes supprimées avec succès';
          this.clearSuccessMessageAfterDelay();
          bootstrap.Modal.getInstance(this.confirmDeleteModal.nativeElement).hide();
        },
        error: (error) => {
          this.error = error.message;
          console.error('Erreur lors de la suppression multiple:', error);
        }
      });
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
          this.successMessage = 'Plante modifiée avec succès';
          bootstrap.Modal.getInstance(this.planteModal.nativeElement).hide();
          this.clearSuccessMessageAfterDelay();
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
          this.successMessage = 'Nouvelle plante ajoutée avec succès';
          bootstrap.Modal.getInstance(this.planteModal.nativeElement).hide();
          this.clearSuccessMessageAfterDelay();
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
}
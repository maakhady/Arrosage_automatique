import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService, Utilisateur } from '../services/utilisateur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assign-rfid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-rfid.component.html',
  styleUrls: ['./assign-rfid.component.css']
})
export class AssignRfidComponent {
  @Input() user: Utilisateur | null = null;
  @Output() close = new EventEmitter<void>();
  rfid: string = '';

  constructor(private utilisateurService: UtilisateurService) {}

  onSubmit() {
    if (this.user && this.user._id && this.rfid) {
      this.utilisateurService.assignerCarteRFID(this.user._id, this.rfid).subscribe(
        () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Carte RFID assignée avec succès',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de l\'assignation de la carte RFID',
          });
          console.error('Erreur lors de l\'assignation de la carte RFID', error);
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de l\'utilisateur ou RFID non défini',
      });
      console.error('ID de l\'utilisateur ou RFID non défini');
    }
  }

  openModal() {
    Swal.fire({
      title: 'Assigner une carte RFID',
      input: 'text',
      inputLabel: 'ID de la carte RFID',
      inputPlaceholder: 'Scanner la carte...',
      showCancelButton: true,
      confirmButtonText: 'Assigner',
      preConfirm: (rfid) => {
        this.rfid = rfid;
        return this.onSubmit();
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}
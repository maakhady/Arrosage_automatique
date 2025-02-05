import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService, Utilisateur } from '../services/utilisateur.service';

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
          console.log('Carte RFID assignée avec succès');
          this.closeModal();
        },
        (error) => {
          console.error('Erreur lors de l\'assignation de la carte RFID', error);
        }
      );
    } else {
      console.error('ID de l\'utilisateur ou RFID non défini');
    }
  }

  closeModal() {
    this.close.emit();
  }
}

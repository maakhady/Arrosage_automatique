import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService, Role } from '../services/utilisateur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent {
  user = {
    prenom: '',
    nom: '',
    email: '',
    role: 'utilisateur' as Role,
  };

  prenomError = false;
  nomError = false;
  emailError = false;

  @Output() close = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<void>(); // Nouvel événement pour notifier l'ajout d'un utilisateur

  constructor(private utilisateurService: UtilisateurService) {}

  onSubmit() {
    const userToRegister = {
      prenom: this.user.prenom,
      nom: this.user.nom,
      email: this.user.email,
      role: this.user.role,
    };

    this.utilisateurService.creerUtilisateur(userToRegister).subscribe(
      response => {
        console.log('Utilisateur enregistré avec succès', response);
        this.userAdded.emit(); // Émettre l'événement pour notifier l'ajout

        // Réinitialiser le formulaire
        this.user = {
          prenom: '',
          nom: '',
          email: '',
          role: 'utilisateur' as Role,
        };

        // Afficher le modal de succès
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Utilisateur enregistré avec succès.',
          timer: 2000, // Durée de 2 secondes
          timerProgressBar: true,
          showConfirmButton: false
        });

        this.closeModal();
      },
      error => {
        console.error('Erreur lors de l\'enregistrement', error);
        let message = 'Une erreur est survenue lors de l\'enregistrement.';

        if (error.status === 400 && error.error.message === 'Un utilisateur existe déjà avec ces informations') {
          message = 'Un utilisateur existe déjà avec ces informations.';
        }

        // Afficher le modal d'erreur
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: message,
          timer: 2000, // Durée de 2 secondes
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    );
  }

  validatePrenom() {
    this.prenomError = this.user.prenom.trim().length === 0;
  }

  validateNom() {
    this.nomError = this.user.nom.trim().length === 0;
  }

  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !emailPattern.test(this.user.email);
  }

  closeModal() {
    this.close.emit();
  }
}

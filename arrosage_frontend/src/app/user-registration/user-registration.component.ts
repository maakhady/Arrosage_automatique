import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService, Role } from '../services/utilisateur.service';

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
    secretCode: '',
    confirmSecretCode: '',
    password: '',
    confirmPassword: ''
  };

  prenomError = false;
  nomError = false;
  emailError = false;
  secretCodeError = false;
  secretCodeMismatch = false;
  passwordError = false;
  passwordMismatch = false;

  @Output() close = new EventEmitter<void>();

  constructor(private utilisateurService: UtilisateurService) {}

  onSubmit() {
    if (this.user.secretCode !== this.user.confirmSecretCode) {
      this.secretCodeMismatch = true;
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    const userToRegister = {
      prenom: this.user.prenom,
      nom: this.user.nom,
      email: this.user.email,
      role: this.user.role,
      code: this.user.secretCode,
      password: this.user.password
    };

    console.log('User to register:', userToRegister); // Ajoutez ce log

    this.utilisateurService.creerUtilisateur(userToRegister).subscribe(
      response => {
        console.log('Utilisateur enregistré avec succès', response);
        this.closeModal();
      },
      error => {
        console.error('Erreur lors de l\'enregistrement', error);
        // Gérez l'affichage des erreurs côté utilisateur
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

  validateSecretCode() {
    const secretCodePattern = /^\d{4}$/;
    this.secretCodeError = !secretCodePattern.test(this.user.secretCode);
    this.secretCodeMismatch = this.user.secretCode !== this.user.confirmSecretCode;
  }

  validatePassword() {
    // Validation plus stricte
    const hasMinLength = this.user.password.length >= 6;
    const hasNumber = /\d/.test(this.user.password);
    const hasSpecialChar = /[!@#$%^&*]/.test(this.user.password);
    
    this.passwordError = !hasMinLength || !hasNumber || !hasSpecialChar;
    this.passwordMismatch = this.user.password !== this.user.confirmPassword;
  }

  closeModal() {
    this.close.emit();
  }
}

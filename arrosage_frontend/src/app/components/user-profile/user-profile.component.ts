import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UtilisateurService } from '../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

export type Role = 'super-admin' | 'utilisateur';

export interface Utilisateur {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  role: Role;
  code?: string;
  cardId?: string;
  actif?: boolean;
  date_creation?: Date;
  date_modification?: Date;
  selected?: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [HeaderComponent, FormsModule, ReactiveFormsModule, CommonModule]
})
export class UserProfileComponent implements OnInit {
  userForm!: FormGroup;
  loading = true;
  error: string | null = null;
  formError = false;
  successMessage: string | null = null;
  originalUser: Utilisateur | null = null;

  constructor(
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchUser();
  }

  fetchUser(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'Aucun utilisateur connecté.';
      this.loading = false;
      return;
    }

    this.originalUser = { ...user, role: user.role as Role };
    this.initForm(this.originalUser);
    this.loading = false;
  }

  initForm(user: Utilisateur): void {
    this.userForm = this.fb.group({
      matricule: [{ value: user.matricule, disabled: true }, Validators.required],
      nom: [user.nom, Validators.required],
      prenom: [user.prenom, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      role: [{ value: user.role, disabled: true }, Validators.required],
      code: [user.code, [Validators.pattern(/^\d{4}$/)]],
    });

    this.userForm.valueChanges.subscribe(() => {
      this.formError = false;
    });
  }

  confirmUpdate(): Promise<boolean> {
    return Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Voulez-vous vraiment modifier les informations de l\'utilisateur ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Non, annuler'
    }).then((result) => result.isConfirmed);
  }

  updateUser(): void {
    if (this.userForm.invalid) {
      this.formError = true;
      this.showErrorMessage('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.confirmUpdate().then((confirmed) => {
      if (confirmed && this.originalUser) {
        const formValues = this.userForm.getRawValue();
        const updatedUser: Utilisateur = {
          ...this.originalUser,
          ...formValues,
          date_modification: new Date()
        };

        if (!updatedUser.id) {
          this.showErrorMessage('ID utilisateur manquant');
          return;
        }

        this.utilisateurService.modifierUtilisateur(updatedUser.id, updatedUser).subscribe({
          next: () => {
            this.originalUser = updatedUser;
            this.showSuccessMessage('Utilisateur mis à jour avec succès.');
          },
          error: () => {
            this.showErrorMessage('Erreur lors de la mise à jour de l\'utilisateur. Veuillez réessayer.');
          }
        });
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.hideMessageAfterDelay();
  }

  showErrorMessage(message: string): void {
    this.error = message;
    this.hideMessageAfterDelay();
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 3000);
  }

  onHomeClick(): void {
    this.router.navigate(['/demo/dashboard/dashboard-utilisateur']);
  }
}

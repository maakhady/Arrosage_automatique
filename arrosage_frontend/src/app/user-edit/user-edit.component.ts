import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilisateurService, Utilisateur } from '../services/utilisateur.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, OnChanges {
  @Input() user: Utilisateur | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<Utilisateur>();

  editForm: FormGroup;
  selectedUser: Utilisateur | null = null;

  constructor(private fb: FormBuilder, private utilisateurService: UtilisateurService) {
    this.editForm = this.fb.group({
      matricule: ['', Validators.required],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      actif: [false]
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.selectedUser = this.user;
      this.editForm.patchValue(this.user);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.selectedUser = changes['user'].currentValue;
      if (this.selectedUser) {
        this.editForm.patchValue(this.selectedUser);
      }
    }
  }

  onSubmit() {
    if (this.editForm.valid) {
      const updatedUser = this.editForm.value;
      const modal = document.getElementById('editModal');
      if (this.selectedUser && this.selectedUser._id) {
        this.utilisateurService.modifierUtilisateur(this.selectedUser._id, updatedUser).subscribe(
          () => {
            this.userUpdated.emit(updatedUser);
            Swal.fire('Succès!', 'L\'utilisateur a été mis à jour.', 'success');
            if (modal) {
              new bootstrap.Modal(modal).hide();
            }
          },
          (error: any) => {
            console.error('Error updating user', error);
            const errorMessage = error.error?.message || 'Une erreur est survenue lors de la mise à jour.';
            const errorDetails = error.error?.erreurs?.join(', ') || '';
            Swal.fire('Erreur!', `${errorMessage} ${errorDetails}`, 'error');
          }
        );
      }
    }
  }
  closeModal() {
    this.close.emit();
  }
}
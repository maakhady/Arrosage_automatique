import { Component, Input, EventEmitter, Output } from '@angular/core';
import { UserService } from '../user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  phoneError = false;

  constructor(private userService: UserService) {}

  // Méthode pour soumettre le formulaire de modification
  onSubmit() {
    this.userService.updateUser(this.user).subscribe(response => {
      console.log('User updated successfully', response);
      this.closeModal();
    });
  }

  // Méthode pour valider le numéro de téléphone
  validatePhone() {
    const phonePattern = /^\+221\d{9}$/; // Pattern pour le numéro de téléphone du Sénégal
    this.phoneError = !phonePattern.test(this.user.phone);
  }

  // Méthode pour fermer la modal
  closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.close.emit();
  }
}

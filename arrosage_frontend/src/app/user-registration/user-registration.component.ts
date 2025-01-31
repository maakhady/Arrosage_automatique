import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    role: 'utilisateur',
    secretCode: '',
    confirmSecretCode: '',
    phone: ''
  };
  firstNameError = false;
  lastNameError = false;
  emailError = false;
  addressError = false;
  secretCodeError = false;
  secretCodeMismatch = false;
  phoneError = false;
  @Output() close = new EventEmitter<void>();

  onSubmit() {
    if (this.user.secretCode !== this.user.confirmSecretCode) {
      this.secretCodeMismatch = true;
      return;
    }
    console.log('User registered successfully', this.user);
    this.closeModal();
  }

  validateFirstName() {
    this.firstNameError = !this.user.firstName;
  }

  validateLastName() {
    this.lastNameError = !this.user.lastName;
  }

  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailError = !this.user.email || !emailPattern.test(this.user.email);
  }

  validateAddress() {
    this.addressError = !this.user.address;
  }

  validateSecretCode() {
    this.secretCodeError = this.user.secretCode.length !== 4 || !/^\d+$/.test(this.user.secretCode);
    this.secretCodeMismatch = this.user.secretCode !== this.user.confirmSecretCode;
  }

  validatePhone() {
    const phonePattern = /^\+221\d{9}$/; // Pattern pour le numéro de téléphone du Sénégal
    this.phoneError = !phonePattern.test(this.user.phone);
  }

  closeModal() {
    this.close.emit();
  }
}

import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from './../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isLogin = true;
  showPassword = false;
  isLoading = false;
  attempts = 0;
  showPopup = false;
  remainingAttempts = 3;
  errorMessage: string | null = null;
  showRfidMessage = false; // Nouvelle variable pour contrôler l'affichage du message RFID

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.authForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });
  }

  ngOnInit(): void {
    this.focusInput('digit1');
  }

  onInputChange(event: Event, digit: string, inputElement: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Afficher le message RFID lorsque l'utilisateur commence à saisir
    this.showRfidMessage = true;

    if (value.length === 1) {
      const nextDigit = parseInt(digit.charAt(digit.length - 1)) + 1;
      const nextControl = this.authForm.get(`digit${nextDigit}`);
      if (nextControl) {
        const nextInputElement = inputElement.nextElementSibling as HTMLInputElement;
        if (nextInputElement) {
          nextInputElement.focus();
        }
      }
    }

    if (this.authForm.valid) {
      this.onSubmit();
    }
  }

  filterInput(event: KeyboardEvent, digit: string, inputElement: HTMLInputElement): void {
    if (!/^[0-9]$/.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault();
    }

    // Gérer la suppression
    if (event.key === 'Backspace') {
      const prevDigit = parseInt(digit.charAt(digit.length - 1)) - 1;
      if (prevDigit > 0) {
        const prevControl = this.authForm.get(`digit${prevDigit}`);
        if (prevControl) {
          const prevInputElement = inputElement.previousElementSibling as HTMLInputElement;
          if (prevInputElement) {
            prevInputElement.focus();
          }
        }
      }
    }
  }

  showTemporaryValue(inputElement: HTMLInputElement): void {
    const value = inputElement.value;
    inputElement.type = 'text';
    setTimeout(() => {
      inputElement.type = 'password';
    }, 1000);
  }

  focusInput(digit: string): void {
    const inputElement = document.querySelector(`[formControlName="${digit}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      console.error('Formulaire invalide');
      this.focusInput('digit1');
      return;
    }

    const secretCode = `${this.authForm.get('digit1')?.value}${this.authForm.get('digit2')?.value}${this.authForm.get('digit3')?.value}${this.authForm.get('digit4')?.value}`;
    console.log('Code secret soumis :', secretCode);

    this.isLoading = true;
    this.authService.loginAvecCode(secretCode).subscribe({
      next: (response: AuthResponse) => {
        console.log('Réponse dans le composant :', response);
        if (response.success) {
          this.router.navigate(['/../demo/dashboard/dashboard-utilisateur']);
        } else {
          this.handleFailedLogin();
        }
      },
      error: (error: any) => {
        console.error('Erreur de connexion:', error);
        this.handleFailedLogin();
      },
      complete: () => {
        this.isLoading = false;
        console.log('Requête terminée');
      }
    });
  }

  private handleFailedLogin(): void {
    this.attempts++;
    this.remainingAttempts = 3 - this.attempts;

    if (this.attempts >= 3) {
      this.showPopup = true;
    }

    this.authForm.reset();
    this.errorMessage = 'Code secret incorrect. Veuillez réessayer.';
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);

    this.focusInput('digit1');
    this.showRfidMessage = false; // Réinitialiser l'affichage du message RFID
  }

  closePopup(): void {
    this.showPopup = false;
  }

  toggleMode(event: Event): void {
    event.preventDefault();
    this.isLogin = !this.isLogin;
    this.authForm.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleAuthMode(): void {
    this.isLogin = !this.isLogin;
    this.authForm.reset();
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from './../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isLogin = true;
  showPassword = false;
  isLoading = false;
  attempts = 0;
  showPopup = false;
  remainingAttempts = 3;
  temporaryDisplay: string | null = null;
  errorMessage: string | null = null;

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
    // Focus sur le premier input au chargement
    this.focusInput('digit1');
  }

  onInputChange(event: Event, digit: string, inputElement: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Afficher la valeur temporairement pendant 1 seconde
    this.temporaryDisplay = value;
    setTimeout(() => {
      this.temporaryDisplay = null;
    }, 1000);

    // Passer à l'input suivant si un chiffre est saisi
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

    // Valider le formulaire lorsque tous les inputs sont remplis
    if (this.authForm.valid) {
      this.onSubmit();
    }
  }

  focusInput(digit: string): void {
    const control = this.authForm.get(digit);
    if (control) {
      const inputElement = document.getElementById(digit) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      console.error('Formulaire invalide');
      return;
    }

    const secretCode = `${this.authForm.get('digit1')?.value}${this.authForm.get('digit2')?.value}${this.authForm.get('digit3')?.value}${this.authForm.get('digit4')?.value}`;
    console.log('Code secret soumis :', secretCode);

    this.isLoading = true;
    this.authService.loginAvecCode(secretCode).subscribe({
      next: (response: AuthResponse) => {
        console.log('Réponse dans le composant :', response);
        if (response.success) {
          this.router.navigate(['/demo/dashboard/dashboard-utilisateur']);
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

    // Réinitialiser les champs en cas d'erreur
    this.authForm.reset();
    this.errorMessage = 'Code secret incorrect. Veuillez réessayer.';
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000); // Effacer le message d'erreur après 3 secondes

    // Placer le curseur dans le premier champ après réinitialisation
    this.focusInput('digit1');
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
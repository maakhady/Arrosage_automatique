import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class AuthComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  authForm: FormGroup;
  isLoading = false;
  attempts = 0;
  showPopup = false;
  remainingAttempts = 3;
  errorMessage: string | null = null;
  showRfidMessage = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialisation du formulaire avec validation
    this.authForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });

    // Vérifier si déjà connecté
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.redirectBasedOnRole();
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.focusInput('digit1');
    }
  }

  onInputChange(event: Event, digit: string, inputElement: HTMLInputElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const input = event.target as HTMLInputElement;
    const value = input.value;
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
    if (!isPlatformBrowser(this.platformId)) return;

    if (!/^[0-9]$/.test(event.key) && event.key !== 'Backspace') {
      event.preventDefault();
    }

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

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.focusInput('digit1');
      return;
    }

    const code = Object.keys(this.authForm.controls)
      .map(key => this.authForm.get(key)?.value)
      .join('');

    this.isLoading = true;
    this.authService.loginWithCode(code).subscribe({
      next: (response) => {
        if (response.success) {
          this.redirectBasedOnRole();
        } else {
          this.handleFailedLogin();
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        if (error.status === 403) {
          // Afficher le message de blocage avec SweetAlert2
          Swal.fire({
            icon: 'error',
            title: 'Compte bloqué',
            text: error.error.message || 'Votre compte est désactivé. Veuillez contacter l\'administrateur.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          }).then(() => {
            this.authForm.reset();
            this.focusInput('digit1');
          });
        } else {
          this.handleFailedLogin();
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(): void {
    const userRole = this.authService.getCurrentUser()?.role;
    switch (userRole) {
      case 'super-admin':
        this.router.navigate(['/demo/dashboard/dashboard-utilisateur']);
        break;
      case 'utilisateur':
        this.router.navigate(['/demo/dashboard/dashboard-simple']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  private handleFailedLogin(): void {
    this.attempts++;
    this.remainingAttempts = 3 - this.attempts;

    if (this.attempts >= 3) {
      this.showPopup = true;
    }

    this.authForm.reset();
    this.errorMessage = `Code incorrect. ${this.remainingAttempts} tentative${this.remainingAttempts > 1 ? 's' : ''} restante${this.remainingAttempts > 1 ? 's' : ''}.`;

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.errorMessage = null;
      }, 3000);
      this.focusInput('digit1');
    }

    this.showRfidMessage = false;
  }

  focusInput(digit: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const inputElement = document.querySelector(`[formControlName="${digit}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    });
  }

  closePopup(): void {
    this.showPopup = false;
    this.attempts = 0;
    this.remainingAttempts = 3;
    this.authForm.reset();
    this.focusInput('digit1');
  }

  showTemporaryValue(inputElement: HTMLInputElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const originalType = inputElement.type;
    inputElement.type = 'text';
    setTimeout(() => {
      inputElement.type = originalType;
    }, 1000);
  }
}

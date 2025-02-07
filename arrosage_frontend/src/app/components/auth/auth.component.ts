import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthResponse } from './../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule]
})
export class AuthComponent implements OnInit, OnDestroy, AfterViewInit {
  authForm: FormGroup;
  isLogin = true;
  showPassword = false;
  isLoading = false;
  attempts = 0;
  showPopup = false;
  remainingAttempts = 3;
  errorMessage: string | null = null;
  showRfidMessage = false;
  timer: number = 0; // Timer en secondes
  timerInterval: any; // Intervalle pour le timer
  isLocked: boolean = false; // État de verrouillage des champs
  lockDuration: number = 20; // Durée du verrouillage en secondes

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.authForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]]
    });
  }

  ngOnInit(): void {
    this.checkLockState(); // Vérifier l'état de verrouillage au chargement
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (!this.isLocked) {
        this.focusInput('digit1');
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval); // Nettoyer l'intervalle
    }
  }

  // Vérifier l'état de verrouillage au chargement
  checkLockState(): void {
    const lockUntil = localStorage.getItem('lockUntil');
    if (lockUntil) {
      const now = new Date().getTime();
      const lockTime = parseInt(lockUntil, 10);

      if (now < lockTime) {
        this.isLocked = true;
        this.startTimer(Math.floor((lockTime - now) / 1000)); // Démarrer le timer avec le temps restant
        this.updateInputStyles();
      } else {
        localStorage.removeItem('lockUntil'); // Supprimer le verrouillage expiré
      }
    }
  }

  // Démarrer le timer
   // Démarrer le timer
   startTimer(duration: number): void {
    this.timer = duration;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.isLocked = false;
        localStorage.removeItem('lockUntil'); // Supprimer le verrouillage
        this.updateInputStyles();
        this.onDelayEnd(); // Appeler la méthode pour afficher le curseur
      }
    }, 1000);
  }

  // Verrouiller les champs pendant 20 secondes
  lockInputs(): void {
    const lockUntil = new Date().getTime() + this.lockDuration * 1000;

    localStorage.setItem('lockUntil', lockUntil.toString()); // Stocker dans localStorage
    this.isLocked = true;
    this.startTimer(this.lockDuration);
    this.updateInputStyles();
  }
  

  // Formater le timer en minutes:secondes
  formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  // Ajouter un zéro devant les nombres < 10
  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  onInputChange(event: Event, digit: string, inputElement: HTMLInputElement): void {
    if (this.isLocked) return; // Ignorer si les champs sont verrouillés

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
    if (this.isLocked) return; // Ignorer si les champs sont verrouillés

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

  showTemporaryValue(inputElement: HTMLInputElement): void {
    if (this.isLocked) return; // Ignorer si les champs sont verrouillés

    const value = inputElement.value;
    inputElement.type = 'text';
    setTimeout(() => {
      inputElement.type = 'password';
    }, 1000);
  }

  focusInput(digit: string): void {
    if (this.isLocked) return; // Ne pas focaliser si les champs sont verrouillés

    const inputElement = document.querySelector(`[formControlName="${digit}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  focusFirstInput(): void {
    const firstInputElement = document.querySelector('input[formControlName]') as HTMLInputElement;
    if (firstInputElement) {
      firstInputElement.focus();
    }
  }

  // Méthode à appeler lorsque le délai se termine
  onDelayEnd(): void {
    this.focusFirstInput();
  }

  updateInputStyles(): void {
    const inputElements = this.el.nativeElement.querySelectorAll('.form-control');
    inputElements.forEach((inputElement: HTMLInputElement) => {
      if (this.isLocked) {
        this.renderer.addClass(inputElement, 'input-disabled');
        inputElement.disabled = true; // désactiver les champs
      } else {
        this.renderer.removeClass(inputElement, 'input-disabled');
        inputElement.disabled = false; // réactiver les champs
      }
    });
  }

  onSubmit(): void {
    if (this.authForm.invalid || this.isLocked) {
      console.error('Formulaire invalide ou champs verrouillés');
      if (!this.isLocked) {
        this.focusInput('digit1');
      }
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
      this.lockInputs(); // Verrouiller les champs pendant 20 secondes
    }

    this.authForm.reset();
    this.errorMessage = 'Code secret incorrect. Veuillez réessayer.';
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);

    if (!this.isLocked) {
      this.focusInput('digit1');
    }
    this.showRfidMessage = false;
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
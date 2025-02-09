import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService, AuthResponse } from './../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
})
export class AuthComponent implements OnInit, OnDestroy, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  authForm: FormGroup;
  isLoading = false;
  attempts = 0;
  showPopup = false;
  remainingAttempts = 3;
  errorMessage: string | null = null;
  showRfidMessage = false;
  timer: number = 0;
  timerInterval: any;
  isLocked: boolean = false;
  lockDuration: number = 20;
  private ws: WebSocket;

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

    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.redirectBasedOnRole();
      }
    });

    this.ws = new WebSocket('ws://localhost:3004');
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.focusInput('digit1');

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'rfid-scan') {
          this.loginWithRfid(data.cardID);
        }
      };

      this.checkLockState();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isLocked && isPlatformBrowser(this.platformId)) {
      this.focusInput('digit1');
    }
  }

  ngOnDestroy(): void {
    this.ws.close();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  checkLockState(): void {
    const lockUntil = localStorage.getItem('lockUntil');
    if (lockUntil) {
      const now = new Date().getTime();
      const lockTime = parseInt(lockUntil, 10);

      if (now < lockTime) {
        this.isLocked = true;
        this.startTimer(Math.floor((lockTime - now) / 1000));
        this.updateInputStyles();
      } else {
        localStorage.removeItem('lockUntil');
      }
    }
  }


  onDelayEnd(): void {
    this.focusInput('digit1');
  }
  

  startTimer(duration: number): void {
    this.timer = duration;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.isLocked = false;
        localStorage.removeItem('lockUntil');
        this.updateInputStyles();
        this.onDelayEnd();
      }
    }, 1000);
  }

  lockInputs(): void {
    const lockUntil = new Date().getTime() + this.lockDuration * 1000;
    localStorage.setItem('lockUntil', lockUntil.toString());
    this.isLocked = true;
    this.startTimer(this.lockDuration);
    this.updateInputStyles();
  }

  formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  onInputChange(event: Event, digit: string, inputElement: HTMLInputElement): void {
    if (this.isLocked) return;

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
    if (this.isLocked) return;

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

  onSubmit(): void {
    if (this.authForm.invalid || this.isLocked) {
      if (!this.isLocked) {
        this.focusInput('digit1');
      }
      return;
    }

    const code = Object.keys(this.authForm.controls)
      .map(key => this.authForm.get(key)?.value)
      .join('');

    this.isLoading = true;
    this.authService.loginWithCode(code).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessAlert();
          this.redirectBasedOnRole();
        } else {
          this.handleFailedLogin();
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.handleFailedLogin();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private loginWithRfid(cardID: string): void {
    this.isLoading = true;
    this.authService.loginWithRFID(cardID).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessAlert();
          this.redirectBasedOnRole();
        } else {
          this.handleFailedLogin();
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.handleFailedLogin();
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
      this.lockInputs();
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

  private showSuccessAlert(): void {
    Swal.fire({
      icon: 'success',
      title: 'Connexion réussie',
      text: 'Vous êtes maintenant connecté.',
      timer: 2000,
      showConfirmButton: false
    });
  }

  focusInput(digit: string): void {
    if (this.isLocked) return;

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


  updateInputStyles(): void {
    const inputElements = this.el.nativeElement.querySelectorAll('.form-control');
    inputElements.forEach((inputElement: HTMLInputElement) => {
      if (this.isLocked) {
        this.renderer.addClass(inputElement, 'input-disabled');
        inputElement.disabled = true;
      } else {
        this.renderer.removeClass(inputElement, 'input-disabled');
        inputElement.disabled = false;
      }
    });
  }

  focusFirstInput(): void {
    const firstInputElement = document.querySelector('input[formControlName]') as HTMLInputElement;
    if (firstInputElement) {
      firstInputElement.focus();
    }
  }
}

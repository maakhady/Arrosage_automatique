import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './../../services/auth.service';
import { RfidWebsocketService, RFIDMessage } from '../../services/rfid-websocket.service';
import { WebsocketService } from './../../services/websocket.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
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
  private rfidSubscription?: Subscription;
  private keypadSubscription?: Subscription;

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2,
    private el: ElementRef,
    private rfidWebsocketService: RfidWebsocketService,
    private websocketService: WebsocketService
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
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.focusInput('digit1');

      // RFID subscription
      this.rfidSubscription = this.rfidWebsocketService.getRfidScans()
      .subscribe((data: RFIDMessage) => {
        if (data.value) {
          this.loginWithRfid(data.value);
        }
      });
      // Keypad subscription
      this.keypadSubscription = this.websocketService.getMessages().subscribe({
        next: (msg: any) => {
          if (msg.type === 'keypad' && /^[0-9]$/.test(msg.value) && !this.isLocked) {
            this.fillNextInput(msg.value);
          }
        },
        error: (err) => console.error('Erreur WebSocket Keypad:', err)
      });

      this.checkLockState();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isLocked && isPlatformBrowser(this.platformId)) {
      this.focusInput('digit1');
    }
  }

  ngOnDestroy(): void {
    if (this.rfidSubscription) {
      this.rfidSubscription.unsubscribe();
    }
    if (this.keypadSubscription) {
      this.keypadSubscription.unsubscribe();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  fillNextInput(value: string): void {
    for (let i = 1; i <= 4; i++) {
      const controlName = `digit${i}`;
      if (!this.authForm.get(controlName)?.value) {
        this.authForm.get(controlName)?.setValue(value);
        if (i < 4) {
          this.focusInput(`digit${i + 1}`);
        }
        break;
      }
    }

    if (this.authForm.valid) {
      this.onSubmit();
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
    if (this.authForm.invalid || this.isLocked) {
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
          this.showSuccessAlert();
          this.redirectBasedOnRole();
        } else {
          this.handleFailedLogin();
        }
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        if (error.status === 403) {
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

  private loginWithRfid(cardID: string): void {
    if (this.isLocked) return;

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
        if (error.status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Compte bloqué',
            text: error.error.message || 'Votre compte est désactivé. Veuillez contacter l\'administrateur.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
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

    inputElement.type = 'text';
    setTimeout(() => {
      inputElement.type = 'password';
    }, 1500);
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
}

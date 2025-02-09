import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Interfaces
export interface User {
  _id: any;
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string;
  role: string;
  code?: string;
  date_creation: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  utilisateur: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private loggedInSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAuthState();
    }
  }

  // Routes publiques
  loginWithCode(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/code`, { code })
      .pipe(tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }));
  }

  loginWithRFID(cardId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/rfid`, { cardId })
      .pipe(tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }));
  }

  loginWithEmail(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/email`, { email, password })
      .pipe(tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }));
  }

  // Routes protégées
  verifierAuth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifier`, {
      headers: this.getAuthHeaders()
    });
  }

  verifierRFID(cardId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verifier-rfid`,
      { cardId },
      { headers: this.getAuthHeaders() }
    );
  }

  logout(): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.clearAuthState()),
      catchError((error) => {
        console.error('Erreur lors de la déconnexion:', error);

        // Handle specific error cases
        if (error.status === 0) {
          console.error('Network error: The backend server is unreachable.');
        } else {
          console.error('Server error:', error.message);
        }

        // On nettoie quand même l'état local
        this.clearAuthState();

        // On retourne un succès même en cas d'erreur serveur
        return of({ success: true, message: 'Déconnexion locale effectuée' });
      })
    );
  }

  // Service
  logoutAll(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/logout-all`, {}, {
      headers,
      withCredentials: true // Ajoutez ceci si vous utilisez des cookies
    }).pipe(
      tap(() => this.clearAuthState()),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la déconnexion totale:', error);
        let errorMessage = 'Une erreur est survenue lors de la déconnexion.';
        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion.';
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
        alert(errorMessage);
        return of({ success: false, message: errorMessage });
      })
    );
  }

  // Méthodes utilitaires publiques
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isSuperAdmin(): boolean {
    return this.getCurrentUser()?.role === 'super-admin';
  }

  // Méthodes privées de gestion du stockage
  private getStorageItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(key, value);
      } catch {
        console.error('Erreur lors de l\'accès au localStorage');
      }
    }
  }

  private removeStorageItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(key);
      } catch {
        console.error('Erreur lors de l\'accès au localStorage');
      }
    }
  }

  // Méthodes privées de gestion de l'état
  private loadAuthState(): void {
    const token = this.getStorageItem('token');
    const userStr = this.getStorageItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
        this.loggedInSubject.next(true);
      } catch {
        this.clearAuthState();
      }
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setStorageItem('token', response.token);
    this.setStorageItem('user', JSON.stringify(response.utilisateur));

    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.utilisateur);
    this.loggedInSubject.next(true);
  }

  private clearAuthState(): void {
    this.removeStorageItem('token');
    this.removeStorageItem('user');

    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}

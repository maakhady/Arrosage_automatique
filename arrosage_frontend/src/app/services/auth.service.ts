import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  _id: any;
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email?: string;
  role: string;
  date_creation: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  utilisateur?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `http://localhost:3000/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Récupérer le token et l'utilisateur du localStorage au démarrage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      this.tokenSubject.next(storedToken);
      console.log('Token récupéré depuis le localStorage :', storedToken);
    }
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      console.log('Utilisateur récupéré depuis le localStorage :', JSON.parse(storedUser));
    }
  }

  private updateAuthState(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      this.tokenSubject.next(response.token);
      console.log('Token généré et stocké :', response.token);
    }
    if (response.utilisateur) {
      localStorage.setItem('user', JSON.stringify(response.utilisateur));
      this.currentUserSubject.next(response.utilisateur);
      console.log('Utilisateur stocké :', response.utilisateur);
    }
  }

  loginAvecCode(code: string): Observable<AuthResponse> {
    console.log('Tentative de connexion avec code :', code);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/code`, { code }).pipe(
      tap(
        (response) => {
          if (response.success) {
            this.updateAuthState(response);
            console.log('Connexion réussie avec code :', response);
          } else {
            console.error('Échec de la connexion avec code :', response.message);
          }
        },
        (error) => {
          console.error('Erreur lors de la connexion :', error);
        }
      )
    );
  }

  loginAvecRFID(cardId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/rfid`, { cardId }).pipe(
      tap((response) => {
        if (response.success) {
          this.updateAuthState(response);
          console.log('Connexion réussie avec RFID :', response);
        } else {
          console.error('Échec de la connexion avec RFID :', response.message);
        }
      })
    );
  }

  loginAvecEmail(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/email`, { email, password }).pipe(
      tap((response) => {
        if (response.success) {
          this.updateAuthState(response);
          console.log('Connexion réussie avec email :', response);
        } else {
          console.error('Échec de la connexion avec email :', response.message);
        }
      })
    );
  }

  verifierRFID(cardId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verifier-rfid`, { cardId }).pipe(
      tap((response) => {
        console.log('Réponse de vérification RFID :', response);
      })
    );
  }

  verifierAuth(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/verify`).pipe(
      tap((response) => {
        if (!response.success) {
          console.log('Utilisateur non authentifié, déconnexion automatique');
          this.clearAuthState();
        }
      })
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap((response) => {
        if (response.success) {
          this.clearAuthState();
          console.log('Déconnexion réussie :', response);
        } else {
          console.error('Échec de la déconnexion :', response.message);
        }
      })
    );
  }

  logoutAll(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout-all`, {}).pipe(
      tap((response) => {
        if (response.success) {
          this.clearAuthState();
          console.log('Déconnexion de tous les appareils réussie :', response);
        } else {
          console.error('Échec de la déconnexion de tous les appareils :', response.message);
        }
      })
    );
  }

  private clearAuthState(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    console.log('État d\'authentification effacé');
  }

  verifierToken(): boolean {
    const token = this.tokenSubject.value;
    if (!token) {
      return false;
    }

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const expirationDate = new Date(tokenPayload.exp * 1000);
    const now = new Date();

    if (expirationDate < now) {
      console.log('Token expiré, déconnexion automatique');
      this.clearAuthState();
      return false;
    }

    return true;
  }

  // Getters utiles
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  get userRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }
}
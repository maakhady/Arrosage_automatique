// src/app/services/pompe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class PompeService {
  private flaskUrl = 'http://192.168.1.26:5000/api/arrosage';

  constructor(private http: HttpClient,
    private authService: AuthService  // Injectez le service d'authentification

  ) {}

  getHeaders(): HttpHeaders {
    // Récupérer le token d'authentification
    const token = this.authService.getToken(); // ou la méthode que vous utilisez pour obtenir le token
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  demarrerPompe(): Observable<any> {
    console.log('Headers envoyés:', this.getHeaders());
    return this.http.post<any>(`${this.flaskUrl}/manuel/global`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  arreterPompe(): Observable<any> {
    return this.http.post<any>(`${this.flaskUrl}/stop`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur détaillée:', error);
    if (error.status === 401) {
      return throwError(() => new Error('Authentification requise. Veuillez vous reconnecter.'));
    }
    return throwError(() => new Error(error.error?.message || 'Erreur de communication avec la pompe'));
  }
}

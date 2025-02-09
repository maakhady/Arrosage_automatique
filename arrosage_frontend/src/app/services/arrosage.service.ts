import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Arrosage } from '../models/arrosage.model';

@Injectable({
  providedIn: 'root'
})
export class ArrosageService {
  private apiUrl = 'http://localhost:3000/api/arrosage';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getMesArrosages(): Observable<Arrosage[]> {
    return this.http.get<any>(`${this.apiUrl}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.arrosages),
      catchError(this.handleError)
    );
  }

  creerArrosage(arrosage: Arrosage): Observable<Arrosage> {
    return this.http.post<any>(`${this.apiUrl}`, arrosage, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.arrosage),
      catchError(this.handleError)
    );
  }

  getArrosageParId(id: string): Observable<Arrosage> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.arrosage),
      catchError(this.handleError)
    );
  }

  modifierArrosage(id: string, updates: Partial<Arrosage>): Observable<Arrosage> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.arrosage),
      catchError(this.handleError)
    );
  }

  supprimerArrosage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  toggleArrosage(id: string): Observable<Arrosage> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.arrosage),
      catchError(this.handleError)
    );
  }

  arrosageManuelPlante(planteId: string, volumeEau: number): Observable<Arrosage> {
    return this.http.post<any>(`${this.apiUrl}/manuel/plante/${planteId}`,
      { volumeEau },
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.arrosage),
      catchError(this.handleError)
    );
  }

  arreterArrosage(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stop`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  arrosageManuelGlobal(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/manuel/global`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    let errorMessage = 'Une erreur est survenue';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur';
    }

    return throwError(() => new Error(errorMessage));
  }
}

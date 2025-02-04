import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Assurez-vous que le chemin est correct

export interface Plante {
  _id?: string;
  nom: string;
  categorie: string;
  humiditeSol: number;
  volumeEau: number;
  luminosite: number;
  date_modification?: Date;
  selected: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  plante?: T;
  plantes?: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanteService {
  private apiUrl = 'http://localhost:3000/api/plantes'; // URL modifiée pour être au singulier

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Méthode pour obtenir les en-têtes avec le token
  private getHeaders(): HttpHeaders {
    const token = this.authService.token; // Récupérez le token depuis le service d'authentification
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Créer une nouvelle plante
  creerPlante(plante: Plante): Observable<ApiResponse<Plante>> {
    return this.http.post<ApiResponse<Plante>>(`${this.apiUrl}`, plante, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer toutes les plantes
  getToutesPlantes(): Observable<Plante[]> {
    return this.http.get<ApiResponse<Plante>>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      map(response => response.plantes || []),
      catchError(this.handleError)
    );
  }

  // Récupérer une plante par ID
  getPlanteParId(id: string): Observable<Plante> {
    return this.http.get<ApiResponse<Plante>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (!response.plante) {
          throw new Error('Plante non trouvée');
        }
        return response.plante;
      }),
      catchError(this.handleError)
    );
  }

  // Modifier une plante
  modifierPlante(id: string, updates: Partial<Plante>): Observable<ApiResponse<Plante>> {
    return this.http.put<ApiResponse<Plante>>(`${this.apiUrl}/${id}`, updates, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer une plante
  supprimerPlante(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer plusieurs plantes
  supprimerPlusieursPlantes(ids: string[]): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}`, {
      body: { ids },
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Rechercher des plantes par catégorie
  rechercherParCategorie(categorie: string): Observable<Plante[]> {
    return this.http.get<ApiResponse<Plante>>(`${this.apiUrl}/categorie/${categorie}`, { headers: this.getHeaders() }).pipe(
      map(response => response.plantes || []),
      catchError(this.handleError)
    );
  }

  // Gestionnaire d'erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Requête invalide';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
        }
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
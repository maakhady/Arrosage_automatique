import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Utilisateur {
  _id: string;
  nom: string;
  prenom: string;
}

export interface Plante {
  _id: string;
  nom: string;
  categorie: string;
}

export interface Arrosage {
  _id?: string;
  plante: Plante; // Changement pour inclure l'objet Plante
  utilisateur: Utilisateur; // Changement pour inclure l'objet Utilisateur
  type: string;
  heureDebut: {
    heures: number;
    minutes: number;
    secondes: number;
  };
  heureFin: {
    heures: number;
    minutes: number;
    secondes: number;
  };
  volumeEau: number;
  actif: boolean;
  date_creation: Date;
  date_modification: Date;
  parametresArrosage?: {
    humiditeSolRequise: number;
    luminositeRequise: number;
    volumeEau: number;
  };
}

export interface ArrosageResponse {
  success: boolean;
  count: number;
  arrosages: Arrosage[];
}

@Injectable({
  providedIn: 'root'
})
export class ArrosageService {
  private apiUrl = 'http://localhost:3000/api/arrosage'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token; // Récupérez le token depuis le service d'authentification
    
    if (!token) {
      console.error('Token manquant');
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTousArrosages(): Observable<ArrosageResponse> {
    return this.http.get<ArrosageResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Méthode pour récupérer un arrosage par ID
  getArrosageById(id: string): Observable<Arrosage> {
    return this.http.get<Arrosage>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  addArrosage(arrosage: Arrosage): Observable<Arrosage> {
    return this.http.post<Arrosage>(this.apiUrl, arrosage, { headers: this.getHeaders() });
  }

  updateArrosage(id: string, arrosage: Arrosage): Observable<Arrosage> {
    return this.http.put<Arrosage>(`${this.apiUrl}/${id}`, arrosage, { headers: this.getHeaders() });
  }

  deleteArrosage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
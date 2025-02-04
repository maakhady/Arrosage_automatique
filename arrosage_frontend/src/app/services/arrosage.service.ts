import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Arrosage {
  plante: string;
  utilisateur: string;
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
}

@Injectable({
  providedIn: 'root'
})
export class ArrosageService {
  private apiUrl = 'http://localhost:3000/api/arrosages'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  getTousArrosages(): Observable<Arrosage[]> {
    return this.http.get<Arrosage[]>(this.apiUrl);
  }

  addArrosage(arrosage: Arrosage): Observable<Arrosage> {
    return this.http.post<Arrosage>(this.apiUrl, arrosage);
  }

  updateArrosage(id: string, arrosage: Arrosage): Observable<Arrosage> {
    return this.http.put<Arrosage>(`${this.apiUrl}/${id}`, arrosage);
  }

  deleteArrosage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
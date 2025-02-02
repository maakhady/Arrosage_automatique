import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Arrosage } from '../models/arrosage.model'; // Assurez-vous d'avoir un modèle Arrosage défini

@Injectable({
  providedIn: 'root'
})
export class ArrosageService {
  private apiUrl = 'http://localhost:3000/api/arrosage'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Créer un nouvel arrosage
  creerArrosage(arrosage: Arrosage): Observable<Arrosage> {
    return this.http.post<Arrosage>(`${this.apiUrl}`, arrosage);
  }

  // Obtenir tous les arrosages de l'utilisateur
  getMesArrosages(): Observable<Arrosage[]> {
    return this.http.get<Arrosage[]>(`${this.apiUrl}/mes-arrosages`);
  }

  // Obtenir un arrosage spécifique par ID
  getArrosageParId(id: string): Observable<Arrosage> {
    return this.http.get<Arrosage>(`${this.apiUrl}/${id}`);
  }

  // Modifier un arrosage
  modifierArrosage(id: string, updates: Partial<Arrosage>): Observable<Arrosage> {
    return this.http.put<Arrosage>(`${this.apiUrl}/${id}`, updates);
  }

  // Supprimer un arrosage
  supprimerArrosage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Activer/Désactiver un arrosage
  toggleArrosage(id: string): Observable<Arrosage> {
    return this.http.patch<Arrosage>(`${this.apiUrl}/${id}/toggle`, {});
  }

  // Arrosage manuel d'une plante spécifique
  arrosageManuelPlante(planteId: string, volumeEau: number): Observable<Arrosage> {
    return this.http.post<Arrosage>(`${this.apiUrl}/manuel/${planteId}`, { volumeEau });
  }

  // Arrêt d'urgence de l'arrosage
  arreterArrosage(): Observable<any> {
    return this.http.post(`${this.apiUrl}/arret-urgence`, {});
  }

  // Arrosage manuel de toutes les plantes
  arrosageManuelGlobal(): Observable<any> {
    return this.http.post(`${this.apiUrl}/manuel-global`, {});
  }
}
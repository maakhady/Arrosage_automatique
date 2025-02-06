import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Importez AuthService
// import { UtilisateurResponse } from '../models/utilisateur.model';

export type Role = 'super-admin' | 'utilisateur';

export interface Utilisateur {
  _id: string; // Ajoutez cette ligne
  matricule: string;
  prenom: string;
  nom: string;
  email: string;
  role: Role;
  actif?: boolean;
  selected?: boolean;
  date_creation: Date;
  date_modification: Date;
}


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:3000/api/utilisateurs'; // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();     return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer un nouvel utilisateur
  creerUtilisateur(utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.post(this.apiUrl, utilisateur, { headers: this.getHeaders() });
  }

  // Récupérer tous les utilisateurs
  getTousUtilisateurs(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Récupérer un utilisateur par ID
  getUtilisateurParId(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Modifier un utilisateur
  modifierUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur, { headers: this.getHeaders() });
  }

  // Supprimer un utilisateur
  supprimerUtilisateur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Supprimer plusieurs utilisateurs
  supprimerUtilisateurs(ids: string[]): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getHeaders(), body: { ids } });
  }

  // Assigner une carte RFID à un utilisateur
  assignerCarteRFID(id: string, cardId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/rfid`, { cardId }, { headers: this.getHeaders() });
  }

  // Importer des utilisateurs à partir d'un fichier CSV
  importerUtilisateursCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-csv`, formData, { headers: this.getHeaders() });
  }

  // Activer/désactiver un utilisateur
  toggleActivationUtilisateur(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-activation`, {}, { headers: this.getHeaders() });
  }
}

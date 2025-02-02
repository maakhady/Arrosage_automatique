import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type Role = 'super-admin' | 'utilisateur';

export interface Utilisateur {
  _id?: string;
  matricule: string;
  prenom: string;
  nom: string;
  email?: string;
  password?: string;
  role: Role;
  code?: string;
  cardId?: string;
  actif?: boolean;
  date_creation?: Date;
  date_modification?: Date;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = `http://localhost:3000/api/utilisateurs`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Méthode pour obtenir les en-têtes avec le token
  private getHeaders(): HttpHeaders {
    const token = this.authService.token; // Récupérez le token depuis le service d'authentification
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Créer un nouvel utilisateur
  creerUtilisateur(utilisateur: Utilisateur): Observable<any> {
    return this.http.post(`${this.apiUrl}`, utilisateur, { headers: this.getHeaders() });
  }

  // Récupérer tous les utilisateurs
  getTousUtilisateurs(): Observable<{ success: boolean; utilisateurs: Utilisateur[] }> {
    return this.http.get<{ success: boolean; utilisateurs: Utilisateur[] }>(
      `${this.apiUrl}`,
      { headers: this.getHeaders() }
    );
  }

  // Récupérer un utilisateur par ID
  getUtilisateurParId(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Modifier un utilisateur
  modifierUtilisateur(id: string, utilisateur: Partial<Utilisateur>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur, { headers: this.getHeaders() });
  }

  // Supprimer un ou plusieurs utilisateurs
  supprimerUtilisateur(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}`, { body: { ids }, headers: this.getHeaders() });
  }

  // Assigner une carte RFID à un utilisateur
  assignerCarteRFID(id: string, cardId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/assigner-carte`, { cardId }, { headers: this.getHeaders() });
  }

  // Importer des utilisateurs via un fichier CSV
  importerUtilisateursCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Récupérer le token depuis le localStorage ou votre service d'authentification
    const token = localStorage.getItem('token'); // ou autre méthode selon votre implémentation

    // Créer les headers avec le token d'authentification
    const headers = new HttpHeaders()
        .delete('Content-Type')  // Important pour FormData
        .set('Authorization', `Bearer ${token}`); // Ajouter le token

    return this.http.post(`${this.apiUrl}/import-csv`, formData, { headers });
}

  // Activer/Désactiver un utilisateur
  toggleActivationUtilisateur(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/toggle-activation`, {}, { headers: this.getHeaders() });
  }
}
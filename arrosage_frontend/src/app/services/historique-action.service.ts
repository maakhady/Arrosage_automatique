import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueActionService {
  private apiUrl = '/api/historique-actions'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Enregistrer une action
  enregistrerAction(utilisateurId: string, action: string, details: string, metadata: any = {}): Observable<any> {
    const body = { utilisateurId, action, details, metadata };
    return this.http.post(`${this.apiUrl}/enregistrer`, body);
  }

  // Récupérer l'historique des actions d'un utilisateur
  getHistoriqueUtilisateur(utilisateurId: string, page: number = 1, limit: number = 10, action?: string, sortBy: string = 'date', sortOrder: 'asc' | 'desc' = 'desc', startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (action) {
      params = params.set('action', action);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get(`${this.apiUrl}/utilisateur/${utilisateurId}`, { params });
  }
}
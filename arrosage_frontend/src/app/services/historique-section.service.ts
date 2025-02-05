import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface HistoriqueArrosage {
  _id: string;
  plante: {
    _id: string;
    nom: string;
    categorie: string;
  };
  utilisateur: string;
  id_arrosage: {
    _id: string;
    type: string;
    parametreUtilise: any;
  };
  type: 'automatique' | 'manuel';
  heureDebut: Date;
  heureFin: Date;
  volumeEau: number;
  parametresArrosage: {
    humiditeSolRequise: number;
    luminositeRequise: number;
  };
  actif: boolean;
  date: Date;
}

export interface PaginationResponse<T> {
  success: boolean;
  historiques: T[];
  totalPages: number;
  currentPage: number;
  totalHistoriques: number;
}

export interface StatistiquesResponse {
  success: boolean;
  statistiques: Array<{
    plante: string;
    nomPlante: string;
    categoriePlante: string;
    mois: number;
    annee: number;
    nombreArrosages: number;
    volumeTotalEau: number;
    arrosagesAutomatiques: number;
    arrosagesManuels: number;
    humiditeMoyenne: number;
    luminositeMoyenne: number;
  }>;
}

export interface StatistiquesPeriodeResponse {
  success: boolean;
  resume: {
    periode: 'semaine' | 'mois';
    dateDebut: string;  // Changé en string
    dateFin: string;    // Changé en string
    totalArrosages: number;
    totalEau: number;
  };
  statistiques: Array<any>;
  statsParPlante: Array<{
    plante: string;
    nomPlante: string;
    categoriePlante: string;
    totalArrosages: number;
    totalEau: number;
    arrosagesAutomatiques: number;
    arrosagesManuels: number;
    humiditeMoyenne: number;
    luminositeMoyenne: number;
    donneesDates: Array<{
      date: string;
      volumeEau: number;
      nombreArrosages: number;
    }>;
  }>;
  totaux: {
    totalPlantes: number;
    totalArrosages: number;
    totalEau: number;
    totalAutomatiques: number;
    totalManuels: number;
    moyenneHumidite: number;
    moyenneLuminosite: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueSectionService {
  private apiUrl = 'http://localhost:3000/api/historique';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Récupère l'historique complet des arrosages avec pagination
   */
  getHistoriqueComplet(
    page: number = 1,
    limit: number = 10,
    dateDebut?: string,
    dateFin?: string
  ): Observable<PaginationResponse<HistoriqueArrosage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<PaginationResponse<HistoriqueArrosage>>(
      this.apiUrl,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Récupère l'historique d'une plante spécifique
   */
  getHistoriquePlante(
    planteId: string,
    page: number = 1,
    limit: number = 10,
    dateDebut?: string,
    dateFin?: string
  ): Observable<PaginationResponse<HistoriqueArrosage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<PaginationResponse<HistoriqueArrosage>>(
      `${this.apiUrl}/plante/${planteId}`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Récupère les statistiques générales
   */
  getStatistiques(
    dateDebut?: string,
    dateFin?: string
  ): Observable<StatistiquesResponse> {
    let params = new HttpParams();

    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);

    return this.http.get<StatistiquesResponse>(
      `${this.apiUrl}/statistiques`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Récupère les statistiques par période (semaine ou mois)
   */
  getStatistiquesPeriode(
    periode: 'semaine' | 'mois'
  ): Observable<StatistiquesPeriodeResponse> {
    return this.http.get<StatistiquesPeriodeResponse>(
      `${this.apiUrl}/statistiques/${periode}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Supprime un historique
   */
  supprimerHistorique(historiqueId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${historiqueId}`,
      { headers: this.getHeaders() }
    );
  }
}

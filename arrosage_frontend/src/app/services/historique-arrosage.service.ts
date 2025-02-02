import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoriqueArrosage {
  _id?: string;
  plante: string;
  utilisateur: string;
  type: string;
  volumeEau: number;
  humiditeSol?: number;
  luminosite?: number;
  parametreUtilise?: any;
  id_arrosage: string;
  date?: Date;
}

export interface StatistiquesArrosage {
  nomPlante: string;
  categoriePlante: string;
  mois: number;
  annee: number;
  nombreArrosages: number;
  volumeTotalEau: number;
  humiditeMoyenne: number;
  luminositeMoyenne: number;
}

@Injectable({
  providedIn: 'root',
})
export class HistoriqueArrosageService {
  private apiUrl = 'http://localhost:3000/api/historique'; // URL de l'API modifiée pour être relative

  constructor(private http: HttpClient) {}

  creerHistorique(idArrosage: string): Observable<HistoriqueArrosage> {
    return this.http.post<HistoriqueArrosage>(`${this.apiUrl}`, { id_arrosage: idArrosage });
  }

  getHistoriqueComplet(
    page: number = 1,
    limit: number = 10,
    dateDebut?: string,
    dateFin?: string
  ): Observable<{
    historiques: HistoriqueArrosage[];
    totalPages: number;
    currentPage: number;
    totalHistoriques: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<{
      historiques: HistoriqueArrosage[];
      totalPages: number;
      currentPage: number;
      totalHistoriques: number;
    }>(`${this.apiUrl}/complet`, { params });
  }

  getHistoriquePlante(
    planteId: string,
    page: number = 1,
    limit: number = 10,
    dateDebut?: string,
    dateFin?: string
  ): Observable<{
    historiques: HistoriqueArrosage[];
    totalPages: number;
    currentPage: number;
    totalHistoriques: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<{
      historiques: HistoriqueArrosage[];
      totalPages: number;
      currentPage: number;
      totalHistoriques: number;
    }>(`${this.apiUrl}/plante/${planteId}`, { params });
  }

  getStatistiques(dateDebut?: string, dateFin?: string): Observable<{
    statistiques: StatistiquesArrosage[];
    totaux: {
      nombreTotalArrosages: number;
      volumeTotalEau: number;
      humiditeMoyenneGlobale: number;
      luminositeMoyenneGlobale: number;
    };
  }> {
    let params = new HttpParams();
    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }

    return this.http.get<{
      statistiques: StatistiquesArrosage[];
      totaux: {
        nombreTotalArrosages: number;
        volumeTotalEau: number;
        humiditeMoyenneGlobale: number;
        luminositeMoyenneGlobale: number;
      };
    }>(`${this.apiUrl}/statistiques`, { params });
  }

  getStatistiquesPeriode(periode: 'semaine' | 'mois'): Observable<{
    resume: {
      periode: string;
      dateDebut: Date;
      dateFin: Date;
      nombreJours: number;
      moyenneArrosagesParJour: number;
    };
    statistiques: any[];
    statsParPlante: { [key: string]: any };
    totaux: {
      volumeEauTotal: number;
      humiditeSolMoyenne: number;
      luminositeMoyenne: number;
      nombreTotalArrosages: number;
    };
  }> {
    return this.http.get<{
      resume: {
        periode: string;
        dateDebut: Date;
        dateFin: Date;
        nombreJours: number;
        moyenneArrosagesParJour: number;
      };
      statistiques: any[];
      statsParPlante: { [key: string]: any };
      totaux: {
        volumeEauTotal: number;
        humiditeSolMoyenne: number;
        luminositeMoyenne: number;
        nombreTotalArrosages: number;
      };
    }>(`${this.apiUrl}/statistiques/${periode}`);
  }

  supprimerHistorique(historiqueId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${historiqueId}`
    );
  }
}
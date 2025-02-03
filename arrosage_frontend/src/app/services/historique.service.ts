import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoriqueEntry {
 _id: string;
 plante: string;
 utilisateur: string;
 date: Date;
 type: 'manuel' | 'automatique';
 volumeEau: number;
 parametresArrosage: {
   humiditeSolRequise: number;
   luminositeRequise: number;
 };
}


export interface StatsPlanteEntry {
  plante: string;
  donneesDates: DonneesDate[];
}

export interface DonneesDate {
  date: string;
  nombreArrosages: number;
  volumeEau: number;
}


export interface StatistiquesResponse {
 success: boolean;
 resume: {
   periode: string;
   dateDebut: Date;
   dateFin: Date;
   totalArrosages: number;
   totalEau: number;
 };
 statistiques: any[];
 statsParPlante: any[];
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
export class HistoriqueService {
 private apiUrl = 'http://localhost:3000/api/historique';

 constructor(private http: HttpClient) {}

 getHistoriqueComplet(
   page: number = 1,
   limit: number = 10,
   dateDebut?: Date,
   dateFin?: Date
 ): Observable<{
   historiques: HistoriqueEntry[],
   totalPages: number,
   currentPage: number,
   totalHistoriques: number
 }> {
   let params = new HttpParams()
     .set('page', page.toString())
     .set('limit', limit.toString());

   if (dateDebut) params = params.set('dateDebut', dateDebut.toISOString());
   if (dateFin) params = params.set('dateFin', dateFin.toISOString());

   return this.http.get<any>(this.apiUrl, { params });
 }

 getHistoriquePlante(
   planteId: string,
   page: number = 1,
   limit: number = 10,
   dateDebut?: Date,
   dateFin?: Date
 ): Observable<{
   historiques: HistoriqueEntry[],
   totalPages: number,
   currentPage: number,
   totalHistoriques: number
 }> {
   let params = new HttpParams()
     .set('page', page.toString())
     .set('limit', limit.toString());

   if (dateDebut) params = params.set('dateDebut', dateDebut.toISOString());
   if (dateFin) params = params.set('dateFin', dateFin.toISOString());

   return this.http.get<any>(`${this.apiUrl}/plante/${planteId}`, { params });
 }

 getStatistiques(
   dateDebut?: Date,
   dateFin?: Date
 ): Observable<StatistiquesResponse> {
   let params = new HttpParams();

   if (dateDebut) params = params.set('dateDebut', dateDebut.toISOString());
   if (dateFin) params = params.set('dateFin', dateFin.toISOString());

   return this.http.get<StatistiquesResponse>(`${this.apiUrl}/statistiques`, { params });
 }

 getStatistiquesPeriode(
   periode: 'semaine' | 'mois'
 ): Observable<StatistiquesResponse> {
   return this.http.get<StatistiquesResponse>(`${this.apiUrl}/statistiques/${periode}`);
 }

 supprimerHistorique(historiqueId: string): Observable<any> {
   return this.http.delete(`${this.apiUrl}/${historiqueId}`);
 }
}

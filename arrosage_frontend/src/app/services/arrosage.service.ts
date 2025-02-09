import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Utilisateur {
  _id: string;
  nom: string;
  prenom: string;
}

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

export interface Arrosage {
  _id?: string;
  plante: Plante;
  utilisateur: Utilisateur;
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
  recurrence?: string; // quotidien, hebdomadaire, etc.
  priorite?: number; // 1 (haute priorité), 2 (moyenne), 3 (basse)
  parametresArrosage?: {
    humiditeSolRequise: number;
    luminositeRequise: number;
    volumeEau: number;
  };
  temperature?: number; // Ajout de la température
  humidity?: number; // Ajout de l'humidité
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
  private apiUrl = 'http://localhost:3000/api/arrosage';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('Token manquant');
    }
  
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError('Something went wrong; please try again later.');
  }

  creerArrosage(arrosage: Arrosage): Observable<Arrosage> {
    return this.http.post<Arrosage>(`${this.apiUrl}`, arrosage, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getMesArrosages(): Observable<ArrosageResponse> {
    return this.http.get<ArrosageResponse>(`${this.apiUrl}/mes-arrosages`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getArrosageParId(id: string): Observable<Arrosage> {
    return this.http.get<Arrosage>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  modifierArrosage(id: string, updates: Partial<Arrosage>): Observable<Arrosage> {
    return this.http.put<Arrosage>(`${this.apiUrl}/${id}`, updates, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  supprimerArrosage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  toggleArrosage(id: string): Observable<Arrosage> {
    return this.http.patch<Arrosage>(`${this.apiUrl}/${id}/toggle`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  arrosageManuelPlante(planteId: string, volumeEau: number): Observable<Arrosage> {
    return this.http.post<Arrosage>(`${this.apiUrl}/manuel/${planteId}`, { volumeEau }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  arreterArrosage(): Observable<any> {
    return this.http.post(`${this.apiUrl}/arret-urgence`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  arrosageManuelGlobal(): Observable<any> {
    return this.http.post(`${this.apiUrl}/manuel-global`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getWeatherData(city: string, apiKey: string): Observable<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    return this.http.get(url)
      .pipe(catchError(this.handleError));
  }

  // ajuster la fréquence d'arrosage en fonction de la température
  adjustFrequencyBasedOnTemperature(arrosage: Arrosage, temperature: number): Arrosage {
    if (temperature > 30) {
      // Augmenter la fréquence d'arrosage
      arrosage.volumeEau += 10; // Exemple d'ajustement
    }
    return arrosage;
  }


  checkWeatherAndAdjust(arrosage: Arrosage, city: string, apiKey: string): Observable<Arrosage> {
    return this.getWeatherData(city, apiKey).pipe(
      map((weatherData: any) => {
        const isRaining = weatherData.weather.some((weather: any) =>
          weather.main.toLowerCase().includes('rain')
        );
        if (isRaining) {
          arrosage.actif = false; // Désactiver l'arrosage si la pluie est prévue
        }
        return arrosage;
      }),
      catchError(this.handleError)
    );
  }
  
  
}
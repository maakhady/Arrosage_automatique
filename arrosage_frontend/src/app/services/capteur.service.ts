import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public socket$: WebSocketSubject<any>; // Rendre publique

  constructor() {
    this.socket$ = webSocket('ws://localhost:3000');

    this.socket$.subscribe(
      (data) => {
        console.log('Données capteurs reçues:', data);
        // Traitez les données selon vos besoins
      },
      (err) => {
        console.error('Erreur WebSocket:', err);
      },
      () => {
        console.log('Connexion WebSocket fermée');
      }
    );
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }
}

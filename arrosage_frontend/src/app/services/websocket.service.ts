import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject, catchError, retry, switchMap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private socket$!: WebSocketSubject<any>;
  private readonly WS_URL = 'ws://localhost:8000';
  private connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket$ = webSocket({
      url: this.WS_URL,
      deserializer: msg => JSON.parse(msg.data),
      serializer: msg => JSON.stringify(msg),
      openObserver: {
        next: () => {
          console.log('WebSocket connecté.');
          this.connectionStatus$.next(true);
        },
      },
      closeObserver: {
        next: () => {
          console.warn('WebSocket déconnecté, tentative de reconnexion...');
          this.connectionStatus$.next(false);
          this.reconnect();
        },
      }
    });
  }

  // Tente de se reconnecter après une déconnexion
  private reconnect(): void {
    timer(3000)
      .pipe(switchMap(() => {
        console.log('Tentative de reconnexion au WebSocket...');
        return new Observable(observer => {
          this.connect();
          observer.complete();
        });
      }))
      .subscribe();
  }

  // Écouter les messages reçus
  getMessages(): Observable<any> {
    return this.socket$.pipe(
      retry({ count: 3, delay: 2000 }), // Réessaye 3 fois en cas d'erreur
      catchError(err => {
        console.error('Erreur WebSocket:', err);
        return [];
      })
    );
  }

  // Envoyer un message (avec vérification si la connexion est ouverte)
  sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.warn('Impossible d\'envoyer un message : WebSocket non connecté.');
    }
  }

  // Vérifier si la connexion WebSocket est active
  isConnected(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // Fermer proprement la connexion WebSocket
  close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  ngOnDestroy(): void {
    this.close();
  }
}

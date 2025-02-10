import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject, catchError, retry, switchMap, timer, EMPTY } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private socket$?: WebSocketSubject<any>;
  private readonly WS_URL = 'ws://localhost:8001'; // Changé à 8002 selon la config backend
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.connect();
    }
  }

  private connect(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.WS_URL,
        deserializer: msg => {
          try {
            console.log('Message WebSocket reçu:', msg.data);
            return typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
          } catch (err) {
            console.error('Erreur parsing WebSocket:', err);
            return msg.data;
          }
        },
        openObserver: {
          next: () => {
            console.log('WebSocket Keypad connecté');
            this.connectionStatus$.next(true);
          }
        }
      });

      // Souscription pour debug
      this.socket$.subscribe({
        next: (message) => console.log('Message traité:', message),
        error: (error) => console.error('Erreur WebSocket:', error),
        complete: () => console.log('WebSocket fermé')
      });
    }
  }

  private reconnect(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    timer(3000)
      .pipe(
        switchMap(() => {
          console.log('Tentative de reconnexion au WebSocket...');
          return new Observable(observer => {
            this.connect();
            observer.complete();
          });
        })
      )
      .subscribe();
  }

  getMessages(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }

    return this.socket$!.pipe(
      retry({ count: 3, delay: 2000 }),
      catchError(err => {
        console.error('Erreur WebSocket:', err);
        return EMPTY;
      })
    );
  }

  sendMessage(message: any): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    } else {
      console.warn('Impossible d\'envoyer un message : WebSocket non connecté.');
      this.connect(); // Tente de se reconnecter automatiquement
    }
  }

  isConnected(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.connectionStatus$.next(false);
    }
  }

  ngOnDestroy(): void {
    this.close();
    this.connectionStatus$.complete();
  }
}

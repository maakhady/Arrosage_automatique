// src/app/services/rfid-websocket.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface RFIDMessage {
  type: 'card' | 'keypad' | 'error';
  cardID?: string;
  key?: string;
  source?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RfidWebsocketService {
  private platformId = inject(PLATFORM_ID);
  private socket!: WebSocket;
  private rfidSubject = new Subject<RFIDMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectionTimeout: any;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    try {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.close();
      }

      this.socket = new WebSocket('ws://localhost:3004');

      this.socket.onopen = () => {
        console.log('Connexion WebSocket RFID établie');
        this.reconnectAttempts = 0;
        if (this.reconnectionTimeout) {
          clearTimeout(this.reconnectionTimeout);
        }
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const data: RFIDMessage = JSON.parse(event.data);
          this.rfidSubject.next(data);
          console.log('Message RFID reçu:', data);
        } catch (error) {
          console.error('Erreur parsing WebSocket message:', error);
          this.rfidSubject.next({
            type: 'error',
            message: 'Erreur de parsing du message'
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket RFID:', error);
        this.rfidSubject.next({
          type: 'error',
          source: 'websocket',
          message: 'Erreur de connexion WebSocket'
        });
      };

      this.socket.onclose = (event) => {
        console.log('Connexion WebSocket RFID fermée', event.code, event.reason);
        this.handleReconnection();
      };

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du WebSocket:', error);
      this.rfidSubject.next({
        type: 'error',
        source: 'initialization',
        message: 'Erreur d\'initialisation du WebSocket'
      });
    }
  }

  private handleReconnection() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      this.reconnectionTimeout = setTimeout(() => this.initializeWebSocket(), 5000);
    } else {
      console.error('Nombre maximum de tentatives de reconnexion atteint');
      this.rfidSubject.next({
        type: 'error',
        source: 'reconnection',
        message: 'Échec de la reconnexion après plusieurs tentatives'
      });
    }
  }

  getAllMessages(): Observable<RFIDMessage> {
    return this.rfidSubject.asObservable();
  }

  getCardScans(): Observable<RFIDMessage> {
    return this.rfidSubject.asObservable()
      .pipe(filter(msg => msg.type === 'card'));
  }

  getKeypadInputs(): Observable<RFIDMessage> {
    return this.rfidSubject.asObservable()
      .pipe(filter(msg => msg.type === 'keypad'));
  }

  getErrors(): Observable<RFIDMessage> {
    return this.rfidSubject.asObservable()
      .pipe(filter(msg => msg.type === 'error'));
  }

  closeConnection() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.reconnectionTimeout) {
        clearTimeout(this.reconnectionTimeout);
      }
      if (this.socket) {
        this.socket.close();
      }
    }
  }
}

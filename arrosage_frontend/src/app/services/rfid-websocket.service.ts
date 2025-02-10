import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface RFIDMessage {
  type: 'rfid';
  value?: string;
  message?: string;
}
@Injectable({
  providedIn: 'root'
})
export class RfidWebsocketService {
  private platformId = inject(PLATFORM_ID);
  private socket!: WebSocket;
  private rfidSubject = new Subject<RFIDMessage>();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    this.socket = new WebSocket('ws://localhost:3004');

    this.socket.onopen = () => console.log('Connexion WebSocket RFID établie');

    this.socket.onmessage = (event: MessageEvent) => {
      const data: RFIDMessage = JSON.parse(event.data);
      this.rfidSubject.next(data);
    };
  }

  getRfidScans(): Observable<RFIDMessage> {
    return this.rfidSubject.asObservable()
      .pipe(filter(msg => msg.type === 'rfid'));
  }

  closeConnection() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

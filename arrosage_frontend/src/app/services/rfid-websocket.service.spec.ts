import { TestBed } from '@angular/core/testing';

import { RfidWebsocketService } from './rfid-websocket.service';

describe('RfidWebsocketService', () => {
  let service: RfidWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfidWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

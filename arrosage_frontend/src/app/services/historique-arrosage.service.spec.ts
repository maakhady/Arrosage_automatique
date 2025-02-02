import { TestBed } from '@angular/core/testing';

import { HistoriqueArrosageService } from './historique-arrosage.service';

describe('HistoriqueArrosageService', () => {
  let service: HistoriqueArrosageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueArrosageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

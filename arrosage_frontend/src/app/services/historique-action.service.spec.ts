import { TestBed } from '@angular/core/testing';

import { HistoriqueActionService } from './historique-action.service';

describe('HistoriqueActionService', () => {
  let service: HistoriqueActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

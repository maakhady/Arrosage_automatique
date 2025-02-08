import { TestBed } from '@angular/core/testing';

import { CapteurService } from './capteur.service';

describe('CapteurService', () => {
  let service: CapteurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapteurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

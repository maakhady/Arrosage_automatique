import { TestBed } from '@angular/core/testing';

import { ArrosageService } from './arrosage.service';

describe('ArrosageService', () => {
  let service: ArrosageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArrosageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

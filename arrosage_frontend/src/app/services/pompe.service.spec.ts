import { TestBed } from '@angular/core/testing';

import { PompeService } from './pompe.service';

describe('PompeService', () => {
  let service: PompeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PompeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

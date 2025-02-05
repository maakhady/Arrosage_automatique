import { TestBed } from '@angular/core/testing';

import { HistoriqueSectionService } from './historique-section.service';

describe('HistoriqueSectionService', () => {
  let service: HistoriqueSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueElementComponent } from './historique-element.component';

describe('HistoriqueElementComponent', () => {
  let component: HistoriqueElementComponent;
  let fixture: ComponentFixture<HistoriqueElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

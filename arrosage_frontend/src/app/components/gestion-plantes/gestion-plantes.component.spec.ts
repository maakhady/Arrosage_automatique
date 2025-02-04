import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPlantesComponent } from './gestion-plantes.component';

describe('GestionPlantesComponent', () => {
  let component: GestionPlantesComponent;
  let fixture: ComponentFixture<GestionPlantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPlantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPlantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

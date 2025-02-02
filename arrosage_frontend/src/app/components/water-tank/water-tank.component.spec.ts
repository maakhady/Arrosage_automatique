import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterTankComponent } from './water-tank.component';

describe('WaterTankComponent', () => {
  let component: WaterTankComponent;
  let fixture: ComponentFixture<WaterTankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterTankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

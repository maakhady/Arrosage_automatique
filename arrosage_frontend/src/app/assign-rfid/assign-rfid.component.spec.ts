import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRfidComponent } from './assign-rfid.component';

describe('AssignRfidComponent', () => {
  let component: AssignRfidComponent;
  let fixture: ComponentFixture<AssignRfidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRfidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRfidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

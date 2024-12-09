import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentInfoComponent } from './shipment-info.component';

describe('ShipmentInfoComponent', () => {
  let component: ShipmentInfoComponent;
  let fixture: ComponentFixture<ShipmentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

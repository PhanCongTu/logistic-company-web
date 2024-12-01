import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportingShipmentComponent } from './transporting-shipment.component';

describe('TransportingShipmentComponent', () => {
  let component: TransportingShipmentComponent;
  let fixture: ComponentFixture<TransportingShipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportingShipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportingShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

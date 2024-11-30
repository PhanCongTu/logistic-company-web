import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryShippmentComponent } from './delivery-shippment.component';

describe('DeliveryShippmentComponent', () => {
  let component: DeliveryShippmentComponent;
  let fixture: ComponentFixture<DeliveryShippmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryShippmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryShippmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

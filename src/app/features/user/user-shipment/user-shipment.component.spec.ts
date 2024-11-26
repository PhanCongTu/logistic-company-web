import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserShipmentComponent } from './user-shipment.component';

describe('UserShipmentComponent', () => {
  let component: UserShipmentComponent;
  let fixture: ComponentFixture<UserShipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserShipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

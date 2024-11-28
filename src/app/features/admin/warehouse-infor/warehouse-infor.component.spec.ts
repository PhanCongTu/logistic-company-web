import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseInforComponent } from './warehouse-infor.component';

describe('WarehouseInforComponent', () => {
  let component: WarehouseInforComponent;
  let fixture: ComponentFixture<WarehouseInforComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseInforComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseInforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

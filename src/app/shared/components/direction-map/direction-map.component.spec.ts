import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectionMapComponent } from './direction-map.component';

describe('DirectionMapComponent', () => {
  let component: DirectionMapComponent;
  let fixture: ComponentFixture<DirectionMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectionMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

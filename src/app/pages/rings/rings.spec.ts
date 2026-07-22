import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rings } from './rings.component';

describe('Rings', () => {
  let component: Rings;
  let fixture: ComponentFixture<Rings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

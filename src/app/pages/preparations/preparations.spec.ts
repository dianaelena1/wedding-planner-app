import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Preparations } from './preparations.component';

describe('Preparations', () => {
  let component: Preparations;
  let fixture: ComponentFixture<Preparations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Preparations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Preparations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenses } from './view-expenses';

describe('ViewExpenses', () => {
  let component: ViewExpenses;
  let fixture: ComponentFixture<ViewExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExpenses],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewExpenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

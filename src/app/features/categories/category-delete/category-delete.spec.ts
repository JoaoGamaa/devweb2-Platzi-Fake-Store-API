import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { CategoryDelete } from './category-delete';

describe('CategoryDelete', () => {
  let component: CategoryDelete;
  let fixture: ComponentFixture<CategoryDelete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDelete],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryDelete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

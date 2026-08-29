import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ListedViewComponent } from './listed-view.component';

describe('ListedViewComponent', () => {
  let component: ListedViewComponent;
  let fixture: ComponentFixture<ListedViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListedViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListedViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

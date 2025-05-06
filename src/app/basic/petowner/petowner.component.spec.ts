import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetownerComponent } from './petowner.component';

describe('PetownerComponent', () => {
  let component: PetownerComponent;
  let fixture: ComponentFixture<PetownerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetownerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetownerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

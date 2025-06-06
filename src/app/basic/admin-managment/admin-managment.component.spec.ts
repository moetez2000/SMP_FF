import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManagmentComponent } from './admin-managment.component';

describe('AdminManagmentComponent', () => {
  let component: AdminManagmentComponent;
  let fixture: ComponentFixture<AdminManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

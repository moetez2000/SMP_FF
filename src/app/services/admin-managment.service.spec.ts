import { TestBed } from '@angular/core/testing';

import { AdminManagmentService } from './admin-managment.service';

describe('AdminManagmentService', () => {
  let service: AdminManagmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminManagmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

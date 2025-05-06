import { TestBed } from '@angular/core/testing';

import { PetsitterService } from './petsitter.service';

describe('PetsitterService', () => {
  let service: PetsitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetsitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

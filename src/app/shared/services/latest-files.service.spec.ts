import { TestBed } from '@angular/core/testing';

import { LatestFilesService } from './latest-files.service';

describe('LatestFilesService', () => {
  let service: LatestFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LatestFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

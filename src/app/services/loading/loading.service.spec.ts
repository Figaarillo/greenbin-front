import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { LoadingService } from './loading.service'

describe('LoadingService', () => {
  let service: LoadingService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(LoadingService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

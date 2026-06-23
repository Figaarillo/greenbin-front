import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ResponsableService } from './responsable.service'

describe('ResponsableService', () => {
  let service: ResponsableService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(ResponsableService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

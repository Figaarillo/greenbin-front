import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { ResponsablesService } from './responsables.service'

describe('ResponsablesService', () => {
  let service: ResponsablesService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(ResponsablesService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

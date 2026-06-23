import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { SesionService } from './sesion.service'

describe('SesionService', () => {
  let service: SesionService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(SesionService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

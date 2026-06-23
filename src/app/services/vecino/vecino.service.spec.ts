import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { VecinoService } from './vecino.service'

describe('VecinoService', () => {
  let service: VecinoService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(VecinoService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

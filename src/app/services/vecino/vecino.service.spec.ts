import { TestBed } from '@angular/core/testing'

import { VecinoService } from './vecino.service'

describe('VecinoService', () => {
  let service: VecinoService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(VecinoService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

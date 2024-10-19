import { TestBed } from '@angular/core/testing'

import { PuntoVerdeService } from './punto-verde.service'

describe('PuntoVerdeService', () => {
  let service: PuntoVerdeService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PuntoVerdeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

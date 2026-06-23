import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { PuntoVerdeService } from './punto-verde.service'

describe('PuntoVerdeService', () => {
  let service: PuntoVerdeService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(PuntoVerdeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

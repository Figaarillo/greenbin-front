import { TestBed } from '@angular/core/testing'

import { EntidadService } from './entidad.service'

describe('EntidadService', () => {
  let service: EntidadService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(EntidadService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

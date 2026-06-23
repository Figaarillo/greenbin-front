import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { EntidadService } from './entidad.service'

describe('EntidadService', () => {
  let service: EntidadService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(EntidadService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

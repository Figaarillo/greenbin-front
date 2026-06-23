import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { LocalAdheridoService } from './local-adherido.service'

describe('LocalAdheridoService', () => {
  let service: LocalAdheridoService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(LocalAdheridoService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

import { TestBed } from '@angular/core/testing'

import { LocalAdheridoService } from './local-adherido.service'

describe('LocalAdheridoService', () => {
  let service: LocalAdheridoService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(LocalAdheridoService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

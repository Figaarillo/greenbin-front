import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { WasteDeliveryService } from './waste-delivery.service'

describe('WasteDeliveryService', () => {
  let service: WasteDeliveryService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(WasteDeliveryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

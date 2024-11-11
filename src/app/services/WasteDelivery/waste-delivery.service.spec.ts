import { TestBed } from '@angular/core/testing'

import { WasteDeliveryService } from './waste-delivery.service'

describe('WasteDeliveryService', () => {
  let service: WasteDeliveryService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(WasteDeliveryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

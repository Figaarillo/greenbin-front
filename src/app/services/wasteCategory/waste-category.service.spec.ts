import { TestBed } from '@angular/core/testing'

import { WasteCategoryService } from './waste-category.service'

describe('WasteCategoryService', () => {
  let service: WasteCategoryService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(WasteCategoryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

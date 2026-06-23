import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { WasteCategoryService } from './waste-category.service'

describe('WasteCategoryService', () => {
  let service: WasteCategoryService

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    service = TestBed.inject(WasteCategoryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})

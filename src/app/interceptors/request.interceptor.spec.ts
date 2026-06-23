import { TestBed } from '@angular/core/testing'
import { HttpInterceptorFn } from '@angular/common/http'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { requestInterceptor } from './request.interceptor'

describe('requestInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => requestInterceptor(req, next))

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
  })

  it('should be created', () => {
    expect(interceptor).toBeTruthy()
  })
})

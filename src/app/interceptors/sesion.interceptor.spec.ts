import { TestBed } from '@angular/core/testing'
import { HttpInterceptorFn } from '@angular/common/http'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { sesionInterceptor } from './sesion.interceptor'

describe('sesionInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => sesionInterceptor(req, next))

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
  })

  it('should be created', () => {
    expect(interceptor).toBeTruthy()
  })
})

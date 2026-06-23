import { TestBed } from '@angular/core/testing'
import { CanActivateFn } from '@angular/router'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { authGuardGuard } from './auth-guard.guard'

describe('authGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuardGuard(...guardParameters))

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
  })

  it('should be created', () => {
    expect(executeGuard).toBeTruthy()
  })
})

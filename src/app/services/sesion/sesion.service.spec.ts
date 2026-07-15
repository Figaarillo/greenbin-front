import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { SesionService } from './sesion.service'
import { API_BASE_URL } from '../../config/api.config'
import { LoginResponse } from '../interfaces/login-response'

describe('SesionService', () => {
  let service: SesionService
  let httpMock: HttpTestingController

  const apiBase = 'http://test'

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: apiBase }
      ]
    })

    service = TestBed.inject(SesionService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  describe('setLoginData', () => {
    it('persists accessToken, refreshToken, userId and role', () => {
      const login: LoginResponse = { id: 'user-1', accessToken: 'access-1', refreshToken: 'refresh-1' }

      service.setLoginData(login, 'reward-partner')

      expect(service.getAccessToken()).toBe('access-1')
      expect(service.getRefreshToken()).toBe('refresh-1')
      expect(service.getUserId()).toBe('user-1')
      expect(service.getRole()).toBe('reward-partner')
    })
  })

  describe('sendRefreshToken', () => {
    it('builds the URL as ${apiUrl}/${type}/auth/refresh-token with the literal type received', () => {
      // Pin: `type` here is the URL segment used by ROLE_CONFIG.module (e.g. 'reward-partner'),
      // NOT the raw JWT role enum ('rewardPartner') — they diverge on purpose.
      service.sendRefreshToken('reward-partner').subscribe()

      const req = httpMock.expectOne(`${apiBase}/api/reward-partner/auth/refresh-token`)
      expect(req.request.method).toBe('GET')
      req.flush({ data: { accessToken: 'new-access' } })
    })
  })
})

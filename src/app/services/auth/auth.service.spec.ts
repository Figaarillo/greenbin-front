import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpErrorResponse } from '@angular/common/http'
import { AuthService } from './auth.service'
import { API_BASE_URL } from '../../config/api.config'
import { Login } from '../interfaces/login'
import { UnifiedLoginResponse } from '../interfaces/login-response'

describe('AuthService', () => {
  let service: AuthService
  let httpMock: HttpTestingController

  const apiBase = 'http://test'

  const loginPayload: Login = {
    username: undefined,
    email: 'vecino@test.com',
    password: 'secret',
    recaptchaToken: 'token'
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: apiBase }]
    })

    service = TestBed.inject(AuthService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('POSTs to /api/auth/login with the login payload', () => {
    service.login(loginPayload).subscribe()

    const req = httpMock.expectOne(`${apiBase}/api/auth/login`)
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(loginPayload)

    req.flush({ data: { id: '1', accessToken: 'a', refreshToken: 'r', role: 'neighbor' } })
  })

  it('emits the response as-is, without transforming it', () => {
    const mockResponse: { data: UnifiedLoginResponse } = {
      data: { id: '1', accessToken: 'a', refreshToken: 'r', role: 'entity' }
    }

    let received: { data: UnifiedLoginResponse } | undefined
    service.login(loginPayload).subscribe(res => (received = res))

    const req = httpMock.expectOne(`${apiBase}/api/auth/login`)
    req.flush(mockResponse)

    expect(received).toEqual(mockResponse)
  })

  it('propagates a 401 error without catching it internally', () => {
    let receivedError: HttpErrorResponse | undefined

    service.login(loginPayload).subscribe({
      next: () => fail('expected an error, not a success'),
      error: (err: HttpErrorResponse) => (receivedError = err)
    })

    const req = httpMock.expectOne(`${apiBase}/api/auth/login`)
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' })

    expect(receivedError).toBeDefined()
    expect(receivedError?.status).toBe(401)
  })
})

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideRouter, Router } from '@angular/router'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'
import Swal from 'sweetalert2'
import { LoginComponent } from './login.component'
import { AuthService } from '../../services/auth/auth.service'
import { VecinoService } from '../../services/vecino/vecino.service'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { EntidadService } from '../../services/entidad/entidad.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { StorageService } from '../../services/storage/storage.service'
import { API_BASE_URL, RECAPTCHA_SITE_KEY } from '../../config/api.config'
import { Role } from '../../services/interfaces/role'
import { UnifiedLoginResponse } from '../../services/interfaces/login-response'

function loginResponse(role: Role): { data: UnifiedLoginResponse } {
  return { data: { id: 'user-1', accessToken: 'access-1', refreshToken: 'refresh-1', role } }
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>
  let component: LoginComponent
  let router: Router
  let authService: AuthService
  let vecinoService: VecinoService
  let localAdheridoService: LocalAdheridoService
  let responsableService: ResponsableService
  let entidadService: EntidadService
  let sesionService: SesionService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: API_BASE_URL, useValue: 'http://test' },
        { provide: RECAPTCHA_SITE_KEY, useValue: 'test-key' }
      ]
    })

    fixture = TestBed.createComponent(LoginComponent)
    component = fixture.componentInstance

    router = TestBed.inject(Router)
    authService = TestBed.inject(AuthService)
    vecinoService = TestBed.inject(VecinoService)
    localAdheridoService = TestBed.inject(LocalAdheridoService)
    responsableService = TestBed.inject(ResponsableService)
    entidadService = TestBed.inject(EntidadService)
    sesionService = TestBed.inject(SesionService)

    spyOn(router, 'navigateByUrl')
    spyOn(Swal, 'fire')

    fixture.detectChanges()

    component.form.setValue({ username: 'user@test.com', password: 'secret' })
    component.recaptchaToken = 'captcha-token'
  })

  describe('successful login per role', () => {
    it('neighbor: fetches the profile and navigates to /vecino', () => {
      spyOn(authService, 'login').and.returnValue(of(loginResponse('neighbor')))
      spyOn(vecinoService, 'get').and.returnValue(
        of({ data: { username: 'juanp', firstname: 'Juan', lastname: 'Perez', dni: '123', points: 10 } } as any)
      )

      component.onSubmit()

      expect(sesionService.getRole()).toBe('neighbor')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/vecino')
    })

    it('rewardPartner: persists role as "reward-partner" (dash-case, NOT the raw JWT enum) and navigates to /local', () => {
      spyOn(authService, 'login').and.returnValue(of(loginResponse('rewardPartner')))
      spyOn(localAdheridoService, 'get').and.returnValue(
        of({ data: { name: 'Kiosco El Sol', username: 'kiosco', dni: '', points: 0 } })
      )

      component.onSubmit()

      expect(sesionService.getRole()).toBe('reward-partner')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/local')
    })

    it('responsible: fetches the profile and navigates to /responsable', () => {
      spyOn(authService, 'login').and.returnValue(of(loginResponse('responsible')))
      spyOn(responsableService, 'get').and.returnValue(
        of({ data: { username: 'resp', firstname: 'Resp', lastname: 'Onsable', dni: '456', points: 0 } } as any)
      )

      component.onSubmit()

      expect(sesionService.getRole()).toBe('responsible')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/responsable')
    })

    it('entity: stores the profile under "entidadInfo" (not "usuarioInfo") and skips profile-field setters', () => {
      spyOn(authService, 'login').and.returnValue(of(loginResponse('entity')))
      spyOn(entidadService, 'get').and.returnValue(of({ data: { id: 'e1', name: 'Municipio X' } } as any))
      const setItemSpy = spyOn(TestBed.inject(StorageService), 'setItem').and.callThrough()
      const setUsernameSpy = spyOn(sesionService, 'setUsername')

      component.onSubmit()

      expect(setItemSpy).toHaveBeenCalledWith('entidadInfo', jasmine.any(String))
      expect(setItemSpy).not.toHaveBeenCalledWith('usuarioInfo', jasmine.any(String))
      expect(setUsernameSpy).not.toHaveBeenCalled()
      expect(router.navigateByUrl).toHaveBeenCalledWith('/entidad')
    })

    it('admin: skips the profile fetch entirely (prevents the 403 on GET /api/responsible/:id) and navigates to /superadmin/dashboard', () => {
      spyOn(authService, 'login').and.returnValue(of(loginResponse('admin')))
      const responsableGetSpy = spyOn(responsableService, 'get')

      component.onSubmit()

      expect(responsableGetSpy).not.toHaveBeenCalled()
      expect(sesionService.getRole()).toBe('responsible')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/superadmin/dashboard')
    })
  })

  describe('failures', () => {
    it('shows the generic invalid-credentials error and does not navigate when authService.login() fails', () => {
      spyOn(authService, 'login').and.returnValue(throwError(() => new Error('unauthorized')))

      component.onSubmit()

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ text: 'Credenciales inválidas' }))
      expect(router.navigateByUrl).not.toHaveBeenCalled()
    })

    it('shows a profile-fetch error and does not navigate, for each of the 4 profile-fetching roles', () => {
      const loginSpy = spyOn(authService, 'login')
      const profileSpies = {
        neighbor: spyOn(vecinoService, 'get'),
        rewardPartner: spyOn(localAdheridoService, 'get'),
        responsible: spyOn(responsableService, 'get'),
        entity: spyOn(entidadService, 'get')
      } as const

      for (const role of Object.keys(profileSpies) as (keyof typeof profileSpies)[]) {
        loginSpy.and.returnValue(of(loginResponse(role)))
        profileSpies[role].and.returnValue(throwError(() => new Error('boom')))

        component.onSubmit()

        expect(Swal.fire).toHaveBeenCalledWith(
          jasmine.objectContaining({ text: 'No se pudo obtener la información del usuario' })
        )
        expect(router.navigateByUrl).not.toHaveBeenCalled()
      }
    })
  })

  describe('"No tengo una cuenta"', () => {
    it('opens the register role selector', () => {
      expect(component.registerSelector).toBeDefined()
      const openSpy = spyOn(component.registerSelector!, 'open')

      const link = fixture.debugElement.query(By.css('.register-link'))
      link.nativeElement.click()

      expect(openSpy).toHaveBeenCalled()
    })
  })
})

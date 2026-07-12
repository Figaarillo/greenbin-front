import { inject, PLATFORM_ID, Type } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { CanActivateFn, Router } from '@angular/router'
import { SesionService } from '../services/sesion/sesion.service'
import { ResponsablesService } from '../services/responsables/responsables.service'
import { VecinoService } from '../services/vecino/vecino.service'
import { LocalAdheridoService } from '../services/local-adherido/local-adherido.service'
import { EntidadService } from '../services/entidad/entidad.service'
import { SuperadminService } from '../services/superadmin/superadmin.service'

/**
 * Durante el SSR no existe localStorage, así que el servidor no puede saber si
 * el usuario está autenticado. Si el guard decidiera acá, siempre redirigiría a
 * la home (sin token) y el cliente lo corregiría recién tras hidratar: ese es el
 * parpadeo "pantalla de login → pantalla real" en cada refresh. Solución: en el
 * servidor dejamos pasar y delegamos la decisión real al cliente, único que ve
 * el token en localStorage.
 */
const isServer = (): boolean => !isPlatformBrowser(inject(PLATFORM_ID))

interface RoleValidator {
  // Los services tipan la respuesta como Promise<Object>, así que la dejamos
  // laxa para que las 5 clases matcheen estructuralmente sin fricción.
  roleValidator(): Promise<any>
}

/** Fabrica un guard de rol: valida contra el backend y redirige si no es válido. */
const roleGuard = (service: Type<RoleValidator>, redirectTo: string): CanActivateFn => {
  return async () => {
    if (isServer()) return true

    const router = inject(Router)
    const validator = inject(service)

    try {
      const resp = await validator.roleValidator()
      if (resp?.data?.isValid) return true
    } catch {
      /* rol inválido → cae al redirect */
    }

    router.navigateByUrl(redirectTo)
    return false
  }
}

export const isLogged: CanActivateFn = () => {
  if (isServer()) return true

  const sesion = inject(SesionService)
  if (sesion.getAccessToken() && sesion.getRefreshToken()) return true

  inject(Router).navigateByUrl('')
  return false
}

export const authGuardGuard = roleGuard(ResponsablesService, '/login')
export const vecinoGuard = roleGuard(VecinoService, '/login')
export const localGuard = roleGuard(LocalAdheridoService, '/login')
export const entityGuard = roleGuard(EntidadService, '')
export const superadminGuard = roleGuard(SuperadminService, '/superadmin/login')

import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { ResponsablesService } from '../services/responsables/responsables.service'
import { VecinoService } from '../services/vecino/vecino.service'
import { LocalAdheridoService } from '../services/local-adherido/local-adherido.service'

export const authGuardGuard: CanActivateFn = (route, state) => {
  const responServices = inject(ResponsablesService)
  const neighborServices = inject(VecinoService)
  const localServices = inject(LocalAdheridoService)
  const router = inject(Router)
  if (responServices.roleValidator('token')) {
    return true
  } else if (neighborServices.roleValidator('token')) {
    return true
  } else if (localServices.roleValidator('token')) {
    return true
  } else {
    console.log('entra')
    router.navigateByUrl('/login')
    return false
  }
}
